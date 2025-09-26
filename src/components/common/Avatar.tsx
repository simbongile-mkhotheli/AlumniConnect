import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number; // pixel size (width = height)
  fallbackText?: string; // typically initials
  className?: string;
  loadingStrategy?: 'lazy' | 'eager';
  rounded?: boolean;
}

// Simple utility to derive initials from a name
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 120,
  fallbackText,
  className = '',
  loadingStrategy = 'lazy',
  rounded = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const initials = fallbackText || getInitials(alt || 'U');

  const dimensionStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  const showFallback = error || !src;

  return (
    <div
      className={`ac-avatar-wrapper ${rounded ? 'rounded' : ''} ${className}`.trim()}
      style={dimensionStyle}
      aria-label={alt}
      data-loaded={loaded}
    >
      {!showFallback && (
        <img
          src={src as string}
            alt={alt}
          width={size}
          height={size}
          loading={loadingStrategy}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`ac-avatar-img ${loaded ? 'visible' : 'hidden'}`}
        />
      )}
      {(!loaded || showFallback) && (
        <div className={`ac-avatar-fallback ${loaded && !showFallback ? 'fade-out' : 'visible'}`}> 
          <span className="ac-avatar-initials" aria-hidden="true">{initials || 'U'}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
