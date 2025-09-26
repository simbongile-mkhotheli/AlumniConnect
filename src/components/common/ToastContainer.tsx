import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import '../../css/toast.css';

// Simple icon mapping (could be swapped later for SVGs)
const ICONS: Record<string, string> = {
  success: '✅',
  error: '⛔',
  info: 'ℹ️',
  warning: '⚠️'
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast-item toast-${t.type}`}
          role="status"
        >
          <div className="toast-content">
            <span className="toast-icon" aria-hidden="true">{ICONS[t.type] || '🔔'}</span>
            <div className="toast-text">
              <div className="toast-message">{t.message}</div>
              {t.description && <div className="toast-description">{t.description}</div>}
            </div>
            {t.actionLabel && (
              <button
                className="toast-action"
                onClick={() => { t.onAction?.(); removeToast(t.id); }}
              >
                {t.actionLabel}
              </button>
            )}
            {t.dismissible && (
              <button
                className="toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            )}
          </div>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
};
