import { Task, Activity, Priority, Status } from './types';

// In-memory data storage representing a persistent repository
let tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Setup repository and workflows',
    description: 'Initialize npm workspaces, tsconfig, Prettier, and ESLint configurations.',
    priority: 'high',
    status: 'done',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Design API routing and controllers',
    description: 'Implement Express routers, Zod schema validations, and custom error handlers.',
    priority: 'high',
    status: 'done',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Develop dashboard analytics view',
    description:
      'Create frontend cards showing task counts, completion rate, and priority distributions.',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Draft pipeline documentation',
    description:
      'Explain dependency caching, CodeQL scanning, Trivy checks, and workflow summaries in README.',
    priority: 'low',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Fix edge case with keyboard listeners',
    description:
      'Ensure text input nodes block globally bound shortcut listeners to prevent accidental triggers.',
    priority: 'low',
    status: 'backlog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let activities: Activity[] = [
  {
    id: 'act-1',
    taskId: 'task-1',
    taskTitle: 'Setup repository and workflows',
    action: 'create',
    details: 'Task created.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'act-2',
    taskId: 'task-2',
    taskTitle: 'Design API routing and controllers',
    action: 'create',
    details: 'Task created.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'act-3',
    taskId: 'task-3',
    taskTitle: 'Develop dashboard analytics view',
    action: 'create',
    details: 'Task created.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'act-4',
    taskId: 'task-1',
    taskTitle: 'Setup repository and workflows',
    action: 'update',
    details: 'Status updated from todo to done.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2.8).toISOString(),
  },
  {
    id: 'act-5',
    taskId: 'task-2',
    taskTitle: 'Design API routing and controllers',
    action: 'update',
    details: 'Status updated from todo to done.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 1.8).toISOString(),
  },
];

const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const db = {
  // Activity logs
  getActivities(): Activity[] {
    return [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  logActivity(
    action: Activity['action'],
    details: string,
    taskId?: string,
    taskTitle?: string
  ): void {
    const activity: Activity = {
      id: generateId('act'),
      taskId,
      taskTitle,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    activities.unshift(activity);
    // Keep last 100 activities
    if (activities.length > 100) {
      activities = activities.slice(0, 100);
    }
  },

  // Task methods
  getTasks(filters?: { search?: string; status?: Status; priority?: Priority }): Task[] {
    let filteredTasks = [...tasks];

    if (filters) {
      const { search, status, priority } = filters;
      if (search) {
        const query = search.toLowerCase();
        filteredTasks = filteredTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        );
      }
      if (status) {
        filteredTasks = filteredTasks.filter((t) => t.status === status);
      }
      if (priority) {
        filteredTasks = filteredTasks.filter((t) => t.priority === priority);
      }
    }

    return filteredTasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getTaskById(id: string): Task | undefined {
    return tasks.find((t) => t.id === id);
  },

  createTask(data: {
    title: string;
    description: string;
    priority: Priority;
    status: Status;
  }): Task {
    const now = Date.now() + tasks.length;

    const task: Task = {
      id: generateId('task'),
      ...data,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    tasks.push(task);
    this.logActivity('create', 'Task created.', task.id, task.title);
    return task;
  },

  updateTask(
    id: string,
    data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
  ): Task | undefined {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const original = tasks[index];
    const updated: Task = {
      ...original,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;

    // Build details for logs
    const changes: string[] = [];
    if (data.status && data.status !== original.status) {
      changes.push(`status updated from ${original.status} to ${data.status}`);
    }
    if (data.priority && data.priority !== original.priority) {
      changes.push(`priority updated from ${original.priority} to ${data.priority}`);
    }
    if (data.title && data.title !== original.title) {
      changes.push(`title updated`);
    }
    if (data.description && data.description !== original.description) {
      changes.push(`description updated`);
    }

    const details = changes.length > 0 ? changes.join(', ') : 'Task details updated.';
    this.logActivity('update', details, updated.id, updated.title);

    return updated;
  },

  deleteTask(id: string): boolean {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const task = tasks[index];
    tasks.splice(index, 1);
    this.logActivity('delete', `Task '${task.title}' deleted.`, task.id, task.title);
    return true;
  },

  bulkUpdateStatus(ids: string[], status: Status): Task[] {
    const updatedTasks: Task[] = [];
    tasks = tasks.map((t) => {
      if (ids.includes(t.id)) {
        const updated = {
          ...t,
          status,
          updatedAt: new Date().toISOString(),
        };
        updatedTasks.push(updated);
        return updated;
      }
      return t;
    });

    if (updatedTasks.length > 0) {
      this.logActivity(
        'bulk_update',
        `Bulk updated status to '${status}' for ${updatedTasks.length} tasks.`
      );
    }

    return updatedTasks;
  },

  bulkDelete(ids: string[]): boolean {
    const initialCount = tasks.length;
    tasks = tasks.filter((t) => !ids.includes(t.id));
    const deletedCount = initialCount - tasks.length;

    if (deletedCount > 0) {
      this.logActivity('bulk_delete', `Bulk deleted ${deletedCount} tasks.`);
      return true;
    }

    return false;
  },

  reset(): void {
    // Helper to reset data for clean tests
    tasks = [];
    activities = [];
  },
};
