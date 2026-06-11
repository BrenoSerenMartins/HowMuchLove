import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Smartphone, Monitor, Globe } from 'lucide-react';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PublicStory from '../ui/story-view/PublicStory';
import { uiCopy } from '@/shared/lib/ui-copy';

interface StoryPreviewProps {
  storyData: LoveStoryData | null;
  plan?: Partial<PlanFeatures> | null;
}

type ViewMode = 'mobile' | 'desktop';

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData, plan }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');

  if (!storyData) {
    return (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center rounded-[2.5rem] border border-white/10 bg-[#050505] text-white">
        <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">{uiCopy.dashboard.previewPlaceholder}</p>
        </div>
      </div>
    );
  }

  const previewData = { ...storyData, plan: plan || storyData.plan };

  return (
    <div className="flex flex-col items-center w-full gap-8 relative z-10">
      {/* --- Device Switcher Capsule --- */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
        {(['mobile', 'desktop'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`relative flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 group ${
              viewMode === mode ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {viewMode === mode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(255,45,85,0.4)]"
              />
            )}
            <span className="relative z-10">
              {mode === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            </span>
            <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">
              {mode === 'mobile' ? 'Celular' : 'Desktop'}
            </span>
          </button>
        ))}
      </div>

      {/* --- Simulator Frame --- */}
      <motion.div
        initial={false}
        animate={{
          width: viewMode === 'mobile' ? '360px' : '100%',
          height: viewMode === 'mobile' ? '700px' : '600px',
        }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
        className="relative bg-black rounded-[3rem] border-[12px] border-[#151515] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10 overflow-hidden flex flex-col group transition-all duration-500"
      >
        {/* Device Detail: Speaker/Dynamic Island Area */}
        {viewMode === 'mobile' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#151515] rounded-b-2xl z-[70] flex items-center justify-center pt-1 shadow-inner">
             <div className="w-10 h-1 bg-white/5 rounded-full" />
          </div>
        )}

        {/* Device Detail: Browser Top Bar (Desktop Mode) */}
        {viewMode === 'desktop' && (
            <div className="bg-[#151515] px-6 py-3 flex items-center justify-between border-b border-white/5 relative z-[70]">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-1.5 flex items-center gap-2 flex-grow max-w-md mx-auto">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium truncate tracking-tight">howmuchlove.com.br/story/{storyData.id || '...'}</span>
                </div>
                <div className="w-16" /> {/* Spacer */}
            </div>
        )}

        {/* The Actual Immersive Page Content */}
        <div className="flex-grow overflow-hidden relative">
          <PublicStory 
            storyData={previewData} 
            isPreview={true}
            hasEntered={true}
            isMuted={true}
          />
        </div>

        {/* Live Pulse Indicator */}
        <div className="absolute bottom-6 right-6 z-[70] flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Live Sim</span>
        </div>
      </motion.div>

      {/* Interaction Hint */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500"
      >
        Você pode interagir e rolar o simulador
      </motion.p>
    </div>
  );
};

export default StoryPreview;
