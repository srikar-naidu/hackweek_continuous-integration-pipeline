import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, Priority, Status } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    priority: Priority,
    status: Status
  ) => Promise<void>;
  task?: Task | null; // If task is provided, we are editing
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
    }
    setValidationError(null);
  }, [task, isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters long');
      return;
    }
    if (title.trim().length > 100) {
      setValidationError('Title cannot exceed 100 characters');
      return;
    }
    if (description.length > 500) {
      setValidationError('Description cannot exceed 500 characters');
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      await onSubmit(title.trim(), description.trim(), priority, status);
      onClose();
    } catch (err) {
      const error = err as Error;
      setValidationError(error.message || 'An error occurred while saving the task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content shadow-lg" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && <div className="validation-error-banner">{validationError}</div>}

          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim().length >= 3) {
                  setValidationError(null);
                }
              }}
              placeholder="e.g., Integrate unit tests"
              className="form-input"
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">
              Description
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise description of the task..."
              className="form-textarea"
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group col-half">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="form-select"
                disabled={submitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group col-half">
              <label htmlFor="task-status" className="form-label">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="form-select"
                disabled={submitting}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
