import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Activity, Status, Priority } from '../types';
import { api } from '../utils/api';

export interface TaskFilters {
  search: string;
  status: Status | 'all';
  priority: Priority | 'all';
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
  });

  const fetchActivities = useCallback(async () => {
    try {
      const logs = await api.getActivities();
      setActivities(logs);
    } catch (_err) {
      // Fail silently for activity log to not disrupt main UX
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchStatus = filters.status === 'all' ? undefined : filters.status;
      const searchPriority = filters.priority === 'all' ? undefined : filters.priority;
      const data = await api.getTasks({
        search: filters.search,
        status: searchStatus,
        priority: searchPriority,
      });
      setTasks(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Task fetching failed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
    fetchActivities();
  }, [fetchTasks, fetchActivities]);

  // Handle single selection toggle
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 1. Optimistic Create Task
  const createTask = useCallback(
    async (title: string, description: string, priority: Priority, status: Status) => {
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task = {
        id: tempId,
        title,
        description,
        priority,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to list optimistically
      setTasks((prev) => [tempTask, ...prev]);
      setError(null);

      try {
        const savedTask = await api.createTask({ title, description, priority, status });
        // Replace temp task with real task
        setTasks((prev) => prev.map((t) => (t.id === tempId ? savedTask : t)));
        fetchActivities();
        return savedTask;
      } catch (err) {
        const error = err as Error;
        // Rollback
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        setError(error.message || 'Failed to create task');
        throw err;
      }
    },
    [fetchActivities]
  );

  // 2. Optimistic Update Task
  const updateTask = useCallback(
    async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const originalTasks = [...tasks];

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      setError(null);

      try {
        const updatedTask = await api.updateTask(id, data);

        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));

        fetchActivities();

        return updatedTask;
      } catch (err) {
        const error = err as Error;

        setTasks(originalTasks);

        setError(error.message || 'Failed to update task');

        throw err;
      }
    },
    [tasks, fetchActivities]
  );

  // 3. Optimistic Delete Task
  const deleteTask = useCallback(
    async (id: string) => {
      let originalTasks: Task[] = [];
      setTasks((prev) => {
        originalTasks = prev;
        return prev.filter((t) => t.id !== id);
      });
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setError(null);

      try {
        await api.deleteTask(id);
        fetchActivities();
      } catch (err) {
        const error = err as Error;
        // Rollback
        setTasks(originalTasks);
        setError(error.message || 'Failed to delete task');
        throw err;
      }
    },
    [fetchActivities]
  );

  // 4. Optimistic Bulk Status Update
  const bulkUpdateStatus = useCallback(
    async (status: Status) => {
      if (selectedIds.length === 0) return;

      const targets = [...selectedIds];
      let originalTasks: Task[] = [];

      setTasks((prev) => {
        originalTasks = prev;
        return prev.map((t) => {
          if (targets.includes(t.id)) {
            return { ...t, status, updatedAt: new Date().toISOString() };
          }
          return t;
        });
      });
      setSelectedIds([]);
      setError(null);

      try {
        const updatedTasks = await api.bulkUpdateStatus(targets, status);
        setTasks((prev) =>
          prev.map((t) => {
            const match = updatedTasks.find((u) => u.id === t.id);
            return match ? match : t;
          })
        );
        fetchActivities();
      } catch (err) {
        const error = err as Error;
        setTasks(originalTasks);
        setSelectedIds(targets); // Restore selection on fail
        setError(error.message || 'Failed bulk status update');
        throw err;
      }
    },
    [selectedIds, fetchActivities]
  );

  // 5. Optimistic Bulk Delete
  const bulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    const targets = [...selectedIds];
    let originalTasks: Task[] = [];

    setTasks((prev) => {
      originalTasks = prev;
      return prev.filter((t) => !targets.includes(t.id));
    });
    setSelectedIds([]);
    setError(null);

    try {
      await api.bulkDelete(targets);
      fetchActivities();
    } catch (err) {
      const error = err as Error;
      setTasks(originalTasks);
      setSelectedIds(targets); // Restore selection on fail
      setError(error.message || 'Failed bulk deletion');
      throw err;
    }
  }, [selectedIds, fetchActivities]);

  // Derived dashboard stats
  const dashboardStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const backlog = tasks.filter((t) => t.status === 'backlog').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;

    const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
    const mediumPriority = tasks.filter(
      (t) => t.priority === 'medium' && t.status !== 'done'
    ).length;
    const lowPriority = tasks.filter((t) => t.priority === 'low' && t.status !== 'done').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      backlog,
      todo,
      inProgress,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
    };
  }, [tasks]);

  return {
    tasks,
    activities,
    loading,
    error,
    selectedIds,
    filters,
    setFilters,
    toggleSelect,
    clearSelection,
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateStatus,
    bulkDelete,
    dashboardStats,
    refetch: fetchTasks,
    refetchActivities: fetchActivities,
  };
}
