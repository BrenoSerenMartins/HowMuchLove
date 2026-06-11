import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useAuth } from '@/app/hooks/useAuth';
import { uiCopy } from '@/shared/lib/ui-copy';

interface UpgradeToUnlockProps {
  children: React.ReactNode;
  isFeatureAllowed: boolean;
  message: string;
}

const UpgradeToUnlock: React.FC<UpgradeToUnlockProps> = ({ children, isFeatureAllowed, message }) => {
  const { navigate } = useNavigate();
  const { user } = useAuth();

  if (isFeatureAllowed) {
    return <>{children}</>;
  }

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      navigate('/settings#pricing-section');
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group w-full min-w-0">
      <div className="w-full min-w-0 opacity-30 pointer-events-none grayscale blur-[1px] transition-all duration-500 group-hover:opacity-20">
        {children}
      </div>
      
      <motion.div 
        onClick={handleUpgradeClick}
        className="absolute inset-0 flex items-center justify-end pr-4 z-10 cursor-pointer"
        title={message || uiCopy.editor.upgradeTitle}
      >
        <motion.div 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 45, 85, 0.2)' }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 transition-colors group-hover:border-primary/30"
        >
          <div className="flex flex-col items-end mr-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1">Premium</span>
            <span className="text-[10px] font-bold text-white/90 leading-none">Desbloquear</span>
          </div>
          <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,45,85,0.3)]">
            <Lock className="w-4 h-4" />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Decorative Sparkle for locked features */}
      <div className="absolute top-2 right-2 pointer-events-none">
        <Sparkles className="w-3 h-3 text-primary/20 group-hover:text-primary transition-colors duration-500" />
      </div>
    </div>
  );
};

export default UpgradeToUnlock;
