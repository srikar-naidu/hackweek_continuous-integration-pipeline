import React from 'react';
import { X, Clock, Plus, Edit3, Trash, RefreshCw } from 'lucide-react';
import { Activity } from '../types';

interface ActivityLogProps {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getActionIcon = (action: Activity['action']) => {
    switch (action) {
      case 'create':
        return <Plus className="text-success" size={14} />;
      case 'update':
        return <Edit3 className="text-info" size={14} />;
      case 'delete':
        return <Trash className="text-danger" size={14} />;
      default:
        return <RefreshCw className="text-warning" size={14} />;
    }
  };

  const getActionLabelClass = (action: Activity['action']) => {
    switch (action) {
      case 'create':
        return 'act-create';
      case 'update':
        return 'act-update';
      case 'delete':
        return 'act-delete';
      default:
        return 'act-bulk';
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="activity-drawer-backdrop" onClick={onClose}>
      <div className="activity-drawer shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">
            <Clock size={18} style={{ marginRight: '8px' }} />
            Activity Timeline
          </h3>
          <button onClick={onClose} className="btn-close-drawer" aria-label="Close activity log">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {activities.length === 0 ? (
            <div className="empty-activities">No recent activity recorded</div>
          ) : (
            <div className="activity-timeline">
              {activities.map((act) => (
                <div key={act.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className={`timeline-icon-box ${getActionLabelClass(act.action)}`}>
                      {getActionIcon(act.action)}
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header-row">
                      <span className={`badge-action ${getActionLabelClass(act.action)}`}>
                        {act.action.replace('_', ' ')}
                      </span>
                      <span className="timeline-time">{formatTime(act.timestamp)}</span>
                    </div>
                    {act.taskTitle && <h5 className="timeline-task-title">{act.taskTitle}</h5>}
                    <p className="timeline-details">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
