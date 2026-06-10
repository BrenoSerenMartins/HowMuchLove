import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MonitorSmartphone } from 'lucide-react';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PublicStory from '../ui/story-view/PublicStory';
import { uiCopy } from '@/shared/lib/ui-copy';

interface StoryPreviewProps {
  storyData: LoveStoryData | null;
  plan?: Partial<PlanFeatures> | null;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData, plan }) => {
  if (!storyData) {
    return (
      <div className="flex h-full min-h-full w-full items-center justify-center rounded-[2.5rem] border border-white/10 bg-[#050505] text-white">
        <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">{uiCopy.dashboard.previewPlaceholder}</p>
        </div>
      </div>
    );
  }

  // Ensure plan rules are applied in the preview
  const previewData = { ...storyData, plan: plan || storyData.plan };

  return (
    <div className="relative h-full min-h-full w-full overflow-hidden rounded-[2.5rem] bg-[#050505] text-white flex flex-col group">
      {/* Simulation Header */}
      <div className="absolute top-6 left-6 right-6 z-[60] flex justify-between items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <MonitorSmartphone className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Live Sim</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* The Actual Immersive Page */}
      <div className="flex-grow overflow-hidden relative">
        <PublicStory 
          storyData={previewData} 
          isPreview={true}
          hasEntered={true} // In preview, we bypass the entry gate for better UX
          isMuted={true}
        />
      </div>

      {/* Interaction Overlay Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Interaja com a Prévia</p>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
