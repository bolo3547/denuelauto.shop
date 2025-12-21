'use client';

/**
 * AI Button Component
 * Floating button to open AI panel, shows usage status
 */

import React from 'react';
import { Star, Lock } from 'lucide-react';

interface AiButtonProps {
  onClick: () => void;
  usage?: {
    percentage: number;
    remaining: number;
    limit: number;
  };
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline' | 'icon';
}

export default function AiButton({
  onClick,
  usage,
  disabled = false,
  size = 'md',
  variant = 'floating'
}: AiButtonProps) {
  const isLimitReached = usage && usage.limit !== -1 && usage.remaining === 0;
  const showWarning = usage && usage.limit !== -1 && usage.percentage >= 80;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} 
          fixed bottom-6 right-6 
          rounded-full shadow-lg 
          flex items-center justify-center
          transition-all transform hover:scale-110
          ${disabled || isLimitReached
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }
          z-40
        `}
        title={isLimitReached ? 'AI limit reached' : 'Open Denuel AI'}
      >
        {isLimitReached ? (
          <Lock className={`${iconSizes[size]} text-white`} />
        ) : (
          <Star className={`${iconSizes[size]} text-white`} />
        )}
        
        {/* Warning indicator */}
        {showWarning && !isLimitReached && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </span>
        )}

        {/* Usage tooltip */}
        {usage && usage.limit !== -1 && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {usage.remaining} requests left
          </span>
        )}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        disabled={disabled || isLimitReached}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          rounded-lg text-sm font-medium
          transition-colors
          ${disabled || isLimitReached
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }
        `}
      >
        {isLimitReached ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
        {isLimitReached ? 'AI Limit Reached' : 'Ask AI'}
        {usage && usage.limit !== -1 && !isLimitReached && (
          <span className="text-xs opacity-75">({usage.remaining})</span>
        )}
      </button>
    );
  }

  // Icon variant
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLimitReached}
      className={`
        p-2 rounded-lg transition-colors
        ${disabled || isLimitReached
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20'
        }
      `}
      title={isLimitReached ? 'AI limit reached' : 'Ask AI'}
    >
      {isLimitReached ? (
        <Lock className={iconSizes[size]} />
      ) : (
        <Star className={iconSizes[size]} />
      )}
    </button>
  );
}
