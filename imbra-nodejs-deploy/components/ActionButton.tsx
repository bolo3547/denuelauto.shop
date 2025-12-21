import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  confirm?: { message: string } | boolean;
  confirmFn?: () => Promise<boolean> | boolean;
  preventDoubleClick?: boolean;
  analytics?: (eventName: string, payload?: Record<string, any>) => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const base = 'inline-flex items-center justify-center rounded-md font-medium transition-all';
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-50 focus:ring-2 focus:ring-slate-200',
};
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  {
    variant = 'primary',
    size = 'md',
    loading: loadingProp = false,
    onClick,
    confirm,
    confirmFn,
    preventDoubleClick = true,
    analytics,
    iconLeft,
    iconRight,
    disabled,
    children,
    className,
    ...rest
  },
  ref
) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = loadingProp || internalLoading;

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    if (confirm) {
      let ok = true;
      if (confirmFn) {
        ok = await Promise.resolve(confirmFn());
      } else if (typeof confirm === 'object') {
        ok = window.confirm(confirm.message);
      } else {
        ok = window.confirm('Are you sure?');
      }
      if (!ok) return;
    }

    analytics?.('button_clicked', { label: typeof children === 'string' ? children : undefined });

    if (preventDoubleClick) {
      setInternalLoading(true);
    }
    try {
      const r = onClick?.(e as any);
      if (r && typeof (r as any).then === 'function') await r;
    } catch (err) {
      console.error('ActionButton click error:', err);
    } finally {
      if (preventDoubleClick) setInternalLoading(false);
    }
  }

  return (
    <button
      ref={ref}
      type={(rest as any).type || 'button'}
      className={clsx(base, variantClasses[variant], sizeClasses[size], className, {
        'opacity-70 cursor-not-allowed': disabled || loading,
      })}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : 'false'}
      aria-disabled={disabled || loading ? 'true' : 'false'}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" fill="none" />
            <path d="M 12 2 A 10 10 0 0 1 22 12" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
          <span>{children ?? 'Loading...'}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {iconLeft && <span>{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span>{iconRight}</span>}
        </span>
      )}
    </button>
  );
});

export default ActionButton;
