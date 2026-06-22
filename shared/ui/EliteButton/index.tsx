import React from 'react';
import './styles.css';
import { LucideIcon } from 'lucide-react';

export interface EliteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant: 'primary' (filled) or 'secondary' (outlined) */
  variant?: 'primary' | 'secondary';
  /** Shortcut: pass an icon directly instead of wrapping children */
  icon?: LucideIcon;
  /** Shortcut: pass a title string instead of wrapping children */
  title?: string;
  /** Makes the button stretch to fill its container */
  fullWidth?: boolean;
  /** Inline max-width constraint, e.g. '300px' or 'clamp(200px,50vw,400px)' */
  maxWidth?: string;
  /** Size preset: 'sm' | 'md' (default) | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Custom content — takes priority over icon+title shortcut */
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: '!py-[clamp(0.5rem,1.5dvh,0.75rem)] !px-[clamp(1rem,2.5vw,1.25rem)] !text-[clamp(8px,1.2vw,9px)] !gap-2',
  md: '', // uses base class defaults (already clamp-adaptive)
  lg: '!py-[clamp(1.25rem,3dvh,1.75rem)] !px-[clamp(2rem,5vw,3rem)] !text-[clamp(11px,1.8vw,13px)] !gap-4',
};

const EliteButton: React.FC<EliteButtonProps> = ({
  variant = 'primary',
  icon: Icon,
  title,
  children,
  className = '',
  fullWidth = false,
  maxWidth,
  size = 'md',
  style,
  ...props
}) => {
  const baseClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass = sizeClasses[size];

  // Merge maxWidth into inline style if provided
  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(maxWidth ? { maxWidth } : {}),
  };

  // If children are provided, they take priority (backwards compatible)
  // Otherwise, render icon + title shortcut
  const content = children ?? (
    <>
      {Icon && <Icon className="w-[clamp(0.875rem,2vw,1.125rem)] h-[clamp(0.875rem,2vw,1.125rem)]" />}
      {title && <span>{title}</span>}
    </>
  );

  return (
    <button
      className={`${baseClass} ${widthClass} ${sizeClass} ${className}`}
      style={mergedStyle}
      {...props}
    >
      {content}
    </button>
  );
};

export default EliteButton;
