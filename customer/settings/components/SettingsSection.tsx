import React from 'react';
import { motion } from 'framer-motion';

interface SettingsSectionProps {
  id: string;
  title: string;
  number: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ id, title, number, description, children }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col min-h-0 space-y-[clamp(1.5rem,4vh,3rem)]"
    >
      <header className="space-y-4 shrink-0">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono">{number}</span>
            <div className="h-[1px] flex-grow bg-primary/10" />
        </div>
        <div className="space-y-2">
            <h3 className="text-[clamp(1.75rem,4vw,3rem)] font-black text-white tracking-tighter uppercase">{title}</h3>
            {description && (
                <p className="text-[clamp(12px,1.3vw,15px)] font-medium text-slate-500 leading-relaxed max-w-2xl">{description}</p>
            )}
        </div>
      </header>

      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </motion.section>
  );
};

export default SettingsSection;
