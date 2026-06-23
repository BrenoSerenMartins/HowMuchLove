import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface EliteModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when backdrop or close button is clicked */
  onClose?: () => void;
  /** Modal title — string or custom JSX */
  title?: string | React.ReactNode;
  /** Subtitle text below the title */
  subtitle?: string;
  /** Icon element displayed above the title */
  icon?: React.ReactNode;
  /** Modal body content */
  children: React.ReactNode;
  /** Max-width class override, e.g. 'max-w-lg' or 'max-w-[600px]' */
  maxWidthClass?: string;
  /** Color theme for ambient orbs: 'primary' | 'amber' | 'red' */
  orbColor?: 'primary' | 'amber' | 'red';
  /** Whether to hide the close (X) button — default true */
  hideCloseButton?: boolean;
  /** Extra classes on the modal card itself */
  className?: string;
  /** Disable closing on backdrop click */
  disableBackdropClose?: boolean;
  /** Footer content rendered below the body (e.g. action buttons) */
  footer?: React.ReactNode;
}

const EliteModal: React.FC<EliteModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidthClass = 'max-w-[clamp(280px,90vw,380px)]',
  orbColor = 'primary',
  hideCloseButton = true,
  className = '',
  disableBackdropClose = false,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && !disableBackdropClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disableBackdropClose]);

  if (!isOpen) return null;

  const orbColorClass = {
    primary: 'bg-primary/10',
    amber: 'bg-amber-500/[0.03]',
    red: 'bg-red-500/10'
  };

  const handleBackdropClick = () => {
    if (!disableBackdropClose && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/92 backdrop-blur-xl flex justify-center items-center z-[9999] p-[clamp(1rem,5dvh,4rem)] animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.04] rounded-[clamp(1.5rem,4dvh,2.5rem)] shadow-2xl relative overflow-hidden flex flex-col min-h-0 w-full ${maxWidthClass} text-center ring-1 ring-white/[0.02] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Orbs */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none ${orbColorClass[orbColor]}`} />
        <div className={`absolute bottom-0 left-0 w-24 h-24 blur-[30px] rounded-full -ml-10 -mb-10 pointer-events-none ${orbColor === 'red' ? 'bg-red-500/5' : 'bg-amber-500/[0.03]'}`} />

        <div className="relative z-10 flex flex-col flex-grow min-h-0 overflow-y-auto hide-scrollbar p-[clamp(1.5rem,4dvh,3rem)]">
          {(title || icon) && (
            <header className="mb-[clamp(1.5rem,4dvh,2.5rem)] flex-shrink-0">
              {icon && (
                <div className={`inline-flex items-center justify-center w-[clamp(3.5rem,8vw,4.5rem)] h-[clamp(3.5rem,8vw,4.5rem)] rounded-3xl mb-[clamp(1rem,3dvh,1.5rem)] border ${orbColor === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                  {icon}
                </div>
              )}
              {title && (
                <h2 className="text-[clamp(1.25rem,3dvh,2rem)] font-black text-white uppercase tracking-tighter leading-none mb-3">
                    {title}
                </h2>
              )}
              {subtitle && (
                <>
                  <div className={`h-px w-8 mx-auto mb-4 ${orbColor === 'red' ? 'bg-red-500/30' : 'bg-primary/30'}`} />
                  <p className="text-[clamp(9px,1.5dvh,12px)] font-medium text-slate-400 leading-relaxed uppercase tracking-[0.1em] font-mono">
                      {subtitle}
                  </p>
                </>
              )}
            </header>
          )}

          <div className="flex-grow flex flex-col min-h-0">
            {children}
          </div>

          {footer && (
            <div className="mt-[clamp(1.5rem,4dvh,2.5rem)] flex-shrink-0">
              {footer}
            </div>
          )}
        </div>

        {onClose && !hideCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-[clamp(1rem,3dvh,2rem)] right-[clamp(1rem,3dvh,2rem)] text-slate-600 hover:text-white transition-colors z-20 group"
          >
            <X className="w-[clamp(1.25rem,3dvh,1.75rem)] h-[clamp(1.25rem,3dvh,1.75rem)] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EliteModal;
