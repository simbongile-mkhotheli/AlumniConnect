import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface EditorLayoutProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  errorTitle?: string;
  onRetry?: () => void;
  overlayClassName?: string;
  headerExtras?: React.ReactNode;
  bodyClassName?: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  title,
  onClose,
  children,
  loading,
  error,
  errorTitle = 'Failed to load data',
  onRetry,
  overlayClassName = 'qa-editor-overlay',
  headerExtras,
  bodyClassName,
}) => {
  return (
    <div className={`${overlayClassName} active`}>
      <div className="qa-manager">
        <div className="qa-header">
          <h2 className="qa-title">{title}</h2>
          {headerExtras}
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={`qa-body ${bodyClassName || ''}`.trim()}>
          {loading && !error && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <LoadingSpinner size="small" />
              <span>Loading...</span>
            </div>
          )}
          {!loading && error && (
            <ErrorMessage
              error={error}
              title={errorTitle}
              showRetry={!!onRetry}
              onRetry={onRetry}
              variant="card"
            />
          )}
          {!loading && !error && children}
        </div>
      </div>
    </div>
  );
};
