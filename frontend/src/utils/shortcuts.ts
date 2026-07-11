export interface KeyCombo {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

export interface ShortcutDefinition {
  combo: KeyCombo;
  action: () => void;
  description: string;
}

export function setupKeyboardShortcuts(shortcuts: ShortcutDefinition[]): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Allow Escape to close modals even if focused on an input element
    if (isInput && e.key !== 'Escape') {
      return;
    }

    for (const shortcut of shortcuts) {
      const { combo, action } = shortcut;
      const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();
      const ctrlMatch = (combo.ctrlKey ?? false) === e.ctrlKey;
      const metaMatch = (combo.metaKey ?? false) === e.metaKey;
      const shiftMatch = (combo.shiftKey ?? false) === e.shiftKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault();
        action();
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}
