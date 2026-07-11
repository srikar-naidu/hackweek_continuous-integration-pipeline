import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Keyboard, Download, Search, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from './hooks/useTasks';
import { Dashboard } from './components/Dashboard';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { BulkActions } from './components/BulkActions';
import { ActivityLog } from './components/ActivityLog';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { setupKeyboardShortcuts } from './utils/shortcuts';
import { Task, Status, Priority } from './types';
import { api } from './utils/api';

export const App: React.FC = () => {
  const {
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
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeEditTask, setActiveEditTask] = useState<Task | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync error state from useTasks
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  // Setup Keyboard Shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        combo: { key: 'n' },
        action: () => handleOpenCreateModal(),
        description: 'Create new Task',
      },
      {
        combo: { key: '/' },
        action: () => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        },
        description: 'Focus search',
      },
      {
        combo: { key: '?' },
        action: () => setIsShortcutsOpen((prev) => !prev),
        description: 'Toggle shortcuts help',
      },
      {
        combo: { key: 'Escape' },
        action: () => {
          setIsModalOpen(false);
          setIsActivityOpen(false);
          setIsShortcutsOpen(false);
          setActiveEditTask(null);
        },
        description: 'Close modals',
      },
    ];

    const cleanup = setupKeyboardShortcuts(shortcuts);
    return cleanup;
  }, []);

  const handleOpenCreateModal = () => {
    setActiveEditTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setActiveEditTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (
    title: string,
    description: string,
    priority: Priority,
    status: Status
  ) => {
    try {
      if (activeEditTask) {
        await updateTask(activeEditTask.id, { title, description, priority, status });
      } else {
        await createTask(title, description, priority, status);
      }
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to save task');
      throw err; // propagates to modal for display
    }
  };

  const handleTaskStatusChange = async (id: string, status: Status) => {
    try {
      await updateTask(id, { status });
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to update status');
    }
  };

  const handleTaskDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        const error = err as Error;
        setErrorMessage(error.message || 'Failed to delete task');
      }
    }
  };

  const handleBulkStatusChange = async (status: Status) => {
    try {
      await bulkUpdateStatus(status);
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to update selected tasks');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected tasks?`)) {
      try {
        await bulkDelete();
      } catch (err) {
        const error = err as Error;
        setErrorMessage(error.message || 'Failed to delete selected tasks');
      }
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const url = api.exportUrl(format);
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      className="app-container"
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Brand Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">✓</div>
          <h1 className="brand-name">Srikar's CI Pipeline</h1>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setIsActivityOpen(true)}
            className="btn-secondary"
            title="View activity log"
          >
            <Clock size={16} style={{ marginRight: '6px' }} />
            Activity Log
          </button>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="btn-secondary"
            title="View keyboard shortcuts (?)"
          >
            <Keyboard size={16} style={{ marginRight: '6px' }} />
            Shortcuts
          </button>

          <button
            onClick={() => handleExport('json')}
            className="btn-secondary"
            title="Export tasks to JSON"
          >
            <Download size={16} style={{ marginRight: '6px' }} />
            Export JSON
          </button>
        </div>
      </header>

      {/* Error Toast Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className="error-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="btn-dismiss-toast">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Metrics */}
      <Dashboard stats={dashboardStats} />

      {/* Filters Toolbar */}
      <div className="toolbar-section">
        <div className="search-filter-controls">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-svg" />
            <input
              type="text"
              ref={searchInputRef}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search tasks (Press '/' to focus)..."
              className="search-input-field"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value as Status | 'all' }))
            }
            className="select-filter-field"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value as Priority | 'all' }))
            }
            className="select-filter-field"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="toolbar-buttons">
          <button onClick={handleOpenCreateModal} className="btn-primary">
            <Plus size={16} style={{ marginRight: '6px' }} />
            New Task
          </button>
        </div>
      </div>

      {/* Loading Skeleton / Kanban Board */}
      <AnimatePresence mode="wait">
        {loading && tasks.length === 0 ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}
          >
            Loading your workflow...
          </motion.div>
        ) : (
          <motion.div 
            key="board"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <TaskBoard
              tasks={tasks}
              selectedIds={selectedIds}
              onSelectToggle={toggleSelect}
              onEdit={handleOpenEditModal}
              onDelete={handleTaskDelete}
              onStatusChange={handleTaskStatusChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Actions Menu */}
      <BulkActions
        selectedCount={selectedIds.length}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveEditTask(null);
        }}
        onSubmit={handleModalSubmit}
        task={activeEditTask}
      />

      {/* Activity Logs Slide-out Drawer */}
      <ActivityLog
        activities={activities}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* Keyboard Shortcuts Overlay Modal */}
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </motion.div>
  );
};

export default App;
