import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';

interface StoryFloatingControlsProps {
  isPreview: boolean;
  videoId: string | null;
  hasEntered: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  showUpgradeCta: boolean;
  upgradeHref?: string;
}

const StoryFloatingControls: React.FC<StoryFloatingControlsProps> = ({
  isPreview,
  videoId,
  hasEntered,
  isMuted,
  onToggleMute,
  showUpgradeCta,
  upgradeHref = '/#/settings#pricing-section',
}) => {
  const muteVisible = Boolean(videoId && hasEntered);
  const upgradeVisible = Boolean(showUpgradeCta);
  const floatingTransition = {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 pointer-events-none`}>
      <motion.button
        type="button"
        onClick={onToggleMute}
        aria-hidden={!muteVisible}
        tabIndex={muteVisible ? 0 : -1}
        initial={false}
        animate={muteVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={floatingTransition}
        whileTap={muteVisible ? { scale: 0.97 } : undefined}
        className={`${isPreview ? 'absolute' : 'fixed'} bottom-8 right-8 p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white shadow-2xl transition-colors duration-300 active:scale-95 pointer-events-auto ${muteVisible ? 'opacity-100' : 'pointer-events-none'}`}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </motion.button>

      <motion.a
        href={upgradeHref}
        aria-hidden={!upgradeVisible}
        tabIndex={upgradeVisible ? 0 : -1}
        initial={false}
        animate={upgradeVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={floatingTransition}
        whileTap={upgradeVisible ? { scale: 0.99 } : undefined}
        className={`${isPreview ? 'absolute' : 'fixed'} bottom-8 left-8 btn-secondary !bg-black/60 !backdrop-blur-xl transition-colors duration-300 pointer-events-auto ${upgradeVisible ? 'opacity-100' : 'pointer-events-none'}`}
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Remover Marca D'água
      </motion.a>
    </div>
  );
};

export default StoryFloatingControls;
