import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Status } from '../types';

interface BulkActionsProps {
  selectedCount: number;
  onBulkStatusChange: (status: Status) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-banner shadow-lg animate-slide-up">
      <div className="bulk-actions-container">
        <div className="bulk-actions-info">
          <span className="selected-badge">{selectedCount}</span>
          <span className="selected-text">tasks selected</span>
        </div>

        <div className="bulk-actions-controls">
          <div className="bulk-status-selector">
            <span className="control-label">Move to:</span>
            <button onClick={() => onBulkStatusChange('backlog')} className="btn-bulk-action">
              Backlog
            </button>
            <button onClick={() => onBulkStatusChange('todo')} className="btn-bulk-action">
              Todo
            </button>
            <button onClick={() => onBulkStatusChange('in_progress')} className="btn-bulk-action">
              In Progress
            </button>
            <button onClick={() => onBulkStatusChange('done')} className="btn-bulk-action">
              Done
            </button>
          </div>

          <div className="divider-vertical"></div>

          <button onClick={onBulkDelete} className="btn-bulk-delete" title="Delete selected tasks">
            <Trash2 size={16} style={{ marginRight: '6px' }} />
            Delete Selected
          </button>

          <button
            onClick={onClearSelection}
            className="btn-clear-selection"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
