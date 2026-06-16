import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LoveStoryData } from '@/types';
import DurationCounter from './DurationCounter';
import {
  getLayoutContainerClasses,
  getLayoutPanelClasses,
  type LayoutPosition,
  type PreviewDensity,
} from './story-layout';

const formatDateLabel = (value: Date | null): string => {
  if (!value) return 'Sem data definida';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
};

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
  plan?: any;
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
  plan
}) => {
  const planName = typeof plan === 'string' 
    ? plan 
    : Array.isArray(plan) 
      ? plan[0]?.name 
      : plan?.name || 'Story';

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
        <div className={`mx-auto text-center space-y-10 ${storyDensity === 'compact' ? 'max-w-2xl' : storyDensity === 'dense' ? 'max-w-3xl' : 'max-w-5xl'}`}>
          <div className="space-y-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
             <h2 className="text-[clamp(1.5rem,4vw,3.5rem)] font-black text-white uppercase tracking-tighter leading-none">
                A nossa história <br/>
                <span className="text-primary italic font-cursive text-[clamp(1.25rem,3.5vw,2.5rem)] lowercase tracking-normal px-2 opacity-90">começou há:</span>
             </h2>
          </div>

          <div className="py-4">
            <DurationCounter startDate={date} density={storyDensity} />
          </div>

          <div className="mx-auto flex w-fit items-center justify-center gap-4 md:gap-6 rounded-full border border-white/10 bg-black/20 px-6 md:px-8 py-2 md:py-3 backdrop-blur-md opacity-80">
            <div className="flex items-center gap-2 md:gap-3">
                <CalendarDays className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary/60" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest font-mono text-slate-300">
                    Desde {formatDateLabel(date)}
                </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary/60" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest font-mono text-primary">
                    {planName} Tier
                </span>
            </div>
          </div>
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
