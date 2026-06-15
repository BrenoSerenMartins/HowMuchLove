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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-24"
    >
      <header className="space-y-4">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono">{number}</span>
            <div className="h-[1px] flex-grow bg-white/5" />
        </div>
        <div className="space-y-2">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h3>
            {description && (
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">{description}</p>
            )}
        </div>
      </header>

      <div className="relative">
        {children}
      </div>
    </motion.section>
  );
};

export default SettingsSection;
