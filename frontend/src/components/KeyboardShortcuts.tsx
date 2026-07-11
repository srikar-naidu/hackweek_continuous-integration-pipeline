import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const list = [
    { key: 'N', desc: 'Open creation modal to add a new task' },
    { key: '/', desc: 'Focus the search query input' },
    { key: 'Esc', desc: 'Close any open modal or activity drawer' },
    { key: '?', desc: 'Toggle this keyboard shortcut helper' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content shortcuts-modal shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Keyboard size={18} style={{ marginRight: '8px' }} />
            Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close shortcuts help">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="shortcuts-list">
            {list.map((shortcut, i) => (
              <div key={i} className="shortcut-row">
                <kbd className="shortcut-key">{shortcut.key}</kbd>
                <span className="shortcut-desc">{shortcut.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
