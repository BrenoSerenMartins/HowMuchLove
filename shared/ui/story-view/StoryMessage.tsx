import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import type { PreviewDensity } from './story-layout';

interface StoryMessageProps {
  message: string;
  isPreview: boolean;
  storyDensity: PreviewDensity;
}

const StoryMessage: React.FC<StoryMessageProps> = ({ message, isPreview, storyDensity }) => {
  return (
    <section className={`relative z-10 flex flex-col items-center justify-center w-full px-6 ${isPreview ? (storyDensity === 'compact' ? 'py-[clamp(2rem,5vw,3rem)]' : storyDensity === 'dense' ? 'py-[clamp(3rem,6vw,5rem)]' : 'py-[clamp(6rem,10vw,9rem)]') : 'py-[clamp(6rem,10vw,10rem)]'}`}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`card-elite w-full text-center relative overflow-hidden bg-black/20 ring-1 ring-white/10 shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl ${isPreview ? (storyDensity === 'compact' ? 'max-w-full p-[clamp(1rem,3vw,1.25rem)]' : storyDensity === 'dense' ? 'max-w-[clamp(22rem,78vw,60rem)] p-[clamp(1.15rem,2.8vw,2rem)]' : 'max-w-[clamp(26rem,84vw,72rem)] p-[clamp(1.5rem,3vw,4rem)]') : 'max-w-[clamp(26rem,84vw,72rem)] p-[clamp(1.5rem,3vw,4rem)]'}`}
      >
        <div className="relative z-10">
          <Quote className={`text-primary/35 mx-auto ${isPreview && storyDensity === 'compact' ? 'w-[clamp(0.9rem,2.8vw,1.1rem)] h-[clamp(0.9rem,2.8vw,1.1rem)] mb-[clamp(0.75rem,1.8vw,1rem)]' : isPreview && storyDensity === 'dense' ? 'w-[clamp(1.1rem,2vw,1.65rem)] h-[clamp(1.1rem,2vw,1.65rem)] mb-[clamp(0.85rem,1.8vw,1.2rem)]' : 'w-[clamp(1.25rem,2.2vw,2.25rem)] h-[clamp(1.25rem,2.2vw,2.25rem)] mb-[clamp(0.9rem,2vw,1.75rem)]'}`} />
          <p className={`font-cursive text-white leading-[1.1] text-balance break-words ${isPreview && storyDensity === 'compact' ? 'text-[clamp(0.95rem,3.2vw,1.35rem)] mb-[clamp(0.6rem,1.8vw,0.9rem)]' : isPreview && storyDensity === 'dense' ? 'text-[clamp(1.05rem,2.4vw,1.75rem)] mb-[clamp(0.75rem,1.8vw,1rem)]' : 'text-[clamp(1.15rem,2.8vw,3.25rem)] mb-[clamp(0.85rem,2vw,1.4rem)]'}`}>
            {message}
          </p>
          <div className="flex items-center justify-center">
            <Sparkles className={`${isPreview && storyDensity === 'compact' ? 'w-[clamp(0.45rem,1vw,0.65rem)] h-[clamp(0.45rem,1vw,0.65rem)]' : isPreview && storyDensity === 'dense' ? 'w-[clamp(0.5rem,1vw,0.75rem)] h-[clamp(0.5rem,1vw,0.75rem)]' : 'w-[clamp(0.55rem,1.2vw,0.9rem)] h-[clamp(0.55rem,1.2vw,0.9rem)]'} text-primary/90`} />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default StoryMessage;
