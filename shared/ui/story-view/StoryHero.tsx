import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { LoveStoryData } from '@/types';
import DurationCounter from './DurationCounter';
import {
  getLayoutContainerClasses,
  getLayoutPanelClasses,
  type LayoutPosition,
  type PreviewDensity,
} from './story-layout';

interface StoryHeroProps {
  images: LoveStoryData['images'];
  backgroundImageUrl: string;
  activeHeroImageUrl: string;
  topImageIndex: number;
  date: Date | null;
  layoutPosition: LayoutPosition;
  storyDensity: PreviewDensity;
  heroOrientation: 'landscape' | 'portrait';
  isDesktopPublicHero: boolean;
  heroHeightClass: string;
  heroDesktopStyle?: CSSProperties;
  showEmptyState: boolean;
}

const StoryHero: React.FC<StoryHeroProps> = ({
  images,
  backgroundImageUrl,
  activeHeroImageUrl,
  topImageIndex,
  date,
  layoutPosition,
  storyDensity,
  heroOrientation,
  isDesktopPublicHero,
  heroHeightClass,
  heroDesktopStyle,
  showEmptyState,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={heroDesktopStyle}
      className={`relative w-full ${heroHeightClass} flex flex-col rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden ${getLayoutContainerClasses(layoutPosition)} ring-1 ring-white/10`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={images?.[topImageIndex]?.id || 'bg'}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {isDesktopPublicHero && heroOrientation === 'portrait' ? (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="h-full w-[clamp(34rem,40vw,46rem)] shrink-0 overflow-hidden">
                <img
                  src={activeHeroImageUrl || backgroundImageUrl}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeHeroImageUrl || backgroundImageUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className={`relative z-20 ${getLayoutPanelClasses(layoutPosition, storyDensity)}`}
      >
        <div className={`mx-auto text-center ${storyDensity === 'compact' ? 'max-w-2xl' : storyDensity === 'dense' ? 'max-w-3xl' : 'max-w-4xl'}`}>
          <DurationCounter startDate={date} density={storyDensity} />
        </div>
      </motion.div>

      {showEmptyState && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <p className="text-white/30 text-lg font-black uppercase tracking-widest font-mono">Iniciando História...</p>
        </div>
      )}
    </motion.section>
  );
};

export default StoryHero;
