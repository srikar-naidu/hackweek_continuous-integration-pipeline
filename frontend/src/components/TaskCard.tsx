import React from 'react';
import { Edit2, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { Task, Status } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isSelected,
  onSelectToggle,
}) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'badge-priority-high';
      case 'medium':
        return 'badge-priority-medium';
      default:
        return 'badge-priority-low';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNextStatus = () => {
    const statusFlow: Status[] = ['backlog', 'todo', 'in_progress', 'done'];
    const currentIndex = statusFlow.indexOf(task.status);
    if (currentIndex < statusFlow.length - 1) {
      onStatusChange(task.id, statusFlow[currentIndex + 1]);
    }
  };

  const handlePrevStatus = () => {
    const statusFlow: Status[] = ['backlog', 'todo', 'in_progress', 'done'];
    const currentIndex = statusFlow.indexOf(task.status);
    if (currentIndex > 0) {
      onStatusChange(task.id, statusFlow[currentIndex - 1]);
    }
  };

  return (
    <div className={`task-card ${isSelected ? 'task-card-selected' : ''}`}>
      <div className="task-card-main">
        {/* Selection Checkbox */}
        <div className="task-card-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(task.id)}
            aria-label={`Select task: ${task.title}`}
          />
        </div>

        {/* Task Details */}
        <div className="task-card-details">
          <div className="task-card-header">
            <span className={`badge-priority ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
            <span className="task-card-date">
              <Calendar size={12} style={{ marginRight: '4px' }} />
              {formatDate(task.updatedAt)}
            </span>
          </div>

          <h4 className="task-card-title">{task.title}</h4>
          {task.description && <p className="task-card-desc">{task.description}</p>}

          <div className="task-card-actions">
            {/* Status Navigation */}
            <div className="status-flow-controls">
              {task.status !== 'backlog' && (
                <button
                  onClick={handlePrevStatus}
                  className="btn-status-nav"
                  title="Move to previous status"
                >
                  ←
                </button>
              )}
              <span className="status-current">{getStatusLabel(task.status)}</span>
              {task.status !== 'done' && (
                <button
                  onClick={handleNextStatus}
                  className="btn-status-nav"
                  title="Move to next status"
                >
                  <ArrowRight size={12} />
                </button>
              )}
            </div>

            {/* Utility Actions */}
            <div className="utility-actions">
              <button
                onClick={() => onEdit(task)}
                className="btn-icon-action"
                title="Edit task"
                aria-label="Edit task"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="btn-icon-action text-danger"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
