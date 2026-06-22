import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import './styles.css';
import { LucideIcon } from 'lucide-react';

export interface EliteInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input — auto-styles border red */
  error?: string;
  /** Lucide icon rendered inside the input (right side) */
  icon?: LucideIcon;
  /** Extra classes on the outermost wrapper div */
  containerClassName?: string;
  /** Inline max-width constraint, e.g. '400px' or 'clamp(200px,60vw,500px)' */
  maxWidth?: string;
  /** Size preset: 'sm' | 'md' (default) | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Hint text shown below the input (muted, non-error) */
  hint?: string;
  /** Set to true to render a textarea instead of an input */
  multiline?: boolean;
  /** Number of rows when multiline=true */
  rows?: number;
  /** Custom content to render below the input (e.g. toggles, helpers) */
  children?: React.ReactNode;
}

const sizeMap = {
  sm: {
    input: '!py-[clamp(0.5rem,1.5dvh,0.75rem)] !px-[clamp(0.75rem,2vw,1rem)] !text-[clamp(11px,1.3vw,13px)]',
    icon: 'w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)]',
    iconRight: 'right-[clamp(0.5rem,1.5vw,0.75rem)]',
    paddingRight: 'pr-[clamp(2rem,5vw,2.5rem)]',
  },
  md: {
    input: '', // uses base class defaults
    icon: 'w-[clamp(0.875rem,2vw,1rem)] h-[clamp(0.875rem,2vw,1rem)]',
    iconRight: 'right-[clamp(0.75rem,2vw,1rem)]',
    paddingRight: 'pr-[clamp(2.5rem,6vw,3rem)]',
  },
  lg: {
    input: '!py-[clamp(1.25rem,3dvh,1.75rem)] !px-[clamp(1.5rem,4vw,2rem)] !text-[clamp(15px,2vw,18px)]',
    icon: 'w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)]',
    iconRight: 'right-[clamp(1rem,2.5vw,1.25rem)]',
    paddingRight: 'pr-[clamp(3rem,7vw,3.5rem)]',
  },
};

const EliteInput: React.FC<EliteInputProps> = ({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  maxWidth,
  size = 'md',
  hint,
  multiline = false,
  rows = 4,
  children,
  id,
  ...props
}) => {
  const inputId = id || props.name;
  const s = sizeMap[size];

  const containerStyle: React.CSSProperties = maxWidth ? { maxWidth } : {};

  const inputClasses = `input-elite ${s.input} ${Icon ? s.paddingRight : ''} ${error ? '!border-red-500/50' : ''} ${className}`;

  return (
    <div className={containerClassName} style={containerStyle}>
      {label && (
        <label htmlFor={inputId} className="block text-[clamp(9px,1.2vw,10px)] font-black uppercase tracking-widest text-slate-500 mb-[clamp(0.5rem,1.5dvh,0.75rem)] ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {multiline ? (
          <textarea
            id={inputId}
            className={`${inputClasses} resize-none`}
            rows={rows}
            aria-invalid={!!error}
            {...(props as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={inputClasses}
            aria-invalid={!!error}
            {...props}
          />
        )}
        {Icon && (
          <Icon className={`absolute ${s.iconRight} ${multiline ? 'top-[clamp(1rem,2.5dvh,1.25rem)]' : 'top-1/2 -translate-y-1/2'} ${s.icon} text-slate-600 transition-colors pointer-events-none ${error ? 'text-red-400' : 'group-focus-within:text-primary'}`} />
        )}
      </div>
      {error && (
        <p className="text-red-400 text-[clamp(9px,1.2vw,10px)] font-bold uppercase tracking-widest mt-[clamp(0.25rem,1dvh,0.5rem)] ml-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-slate-600 text-[clamp(9px,1.2vw,10px)] font-medium mt-[clamp(0.25rem,1dvh,0.5rem)] ml-1">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
};

export default EliteInput;
