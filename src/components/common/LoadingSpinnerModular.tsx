import React from 'react';
import { classNames } from '../../utils/cssModules';
import styles from './LoadingSpinner.module.css';

type SpinnerSize = 'small' | 'medium' | 'large' | 'extraLarge';
type SpinnerColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'white' | 'dark' | 'gradient' | 'gradientSuccess';
type SpinnerVariant = 'spin' | 'bounce' | 'pulse' | 'dots' | 'ring' | 'bars' | 'grow';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  variant?: SpinnerVariant;
  text?: string;
  className?: string;
  fullScreen?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingSpinnerModular: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  variant = 'spin',
  text,
  className = '',
  fullScreen = false,
  showProgress = false,
  progress = 0,
}) => {
  const spinnerClasses = classNames(
    styles,
    'spinner',
    className,
    {
      [size]: true,
      [color]: true,
      [variant]: true,
    }
  );

  const renderSpinnerContent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={classNames(styles, 'dotsContainer', size)}>
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={classNames(styles, 'dot', color)}
                style={{ animationDelay: `${(i - 1) * 0.15}s` }}
              />
            ))}
          </div>
        );
      
      case 'ring':
        return (
          <div className={classNames(styles, 'ring', size, color)}>
            <div className={styles.ringInner} />
          </div>
        );
      
      case 'bars':
        return (
          <div className={classNames(styles, 'barsContainer', size)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={classNames(styles, 'bar', color)}
                style={{ animationDelay: `${(i - 1) * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div
            className={classNames(styles, 'spinnerIcon', size, color)}
            role="status"
            aria-label="Loading"
          >
            <span className={styles.srOnly}>Loading...</span>
          </div>
        );
    }
  };

  const spinner = (
    <div className={spinnerClasses}>
      {renderSpinnerContent()}
      {showProgress && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={classNames(styles, 'progressFill', color)}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className={styles.progressText}>{Math.round(progress)}%</span>
        </div>
      )}
      {text && <span className={styles.spinnerText}>{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export const CardSkeletonModular: React.FC<CardSkeletonProps> = ({
  className = '',
  lines = 3,
}) => {
  const containerClasses = classNames(styles, 'cardSkeleton', className);

  return (
    <div className={containerClasses}>
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonLineTitle}></div>
        <div className={styles.skeletonLines}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={classNames(
                styles,
                'skeletonLine',
                {
                  skeletonLineFull: index !== lines - 1,
                  skeletonLineHalf: index === lines - 1,
                }
              )}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

export const LoadingOverlayModular: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text,
  className = '',
}) => {
  const containerClasses = classNames(styles, 'loadingOverlay', className);

  return (
    <div className={containerClasses}>
      {children}
      {isLoading && (
        <div className={styles.overlay}>
          <LoadingSpinnerModular text={text} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinnerModular;