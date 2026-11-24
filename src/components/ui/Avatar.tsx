import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  isViewed?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  hasStory = false,
  isViewed = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const ringStyles = hasStory
    ? isViewed
      ? 'p-[2px] bg-slate-600 rounded-full'
      : 'p-[2px] bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan rounded-full animate-pulse-slow'
    : '';

  const initials = alt ? alt.trim().slice(0, 2).toUpperCase() : 'VY';

  return (
    <div className={`relative inline-block ${ringStyles} ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className={`${sizes[size]} rounded-full object-cover bg-vyro-card border border-vyro-border`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-vyro-primary via-vyro-accent to-vyro-cyan flex items-center justify-center font-bold text-white uppercase select-none shadow-glow-purple/30`}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
