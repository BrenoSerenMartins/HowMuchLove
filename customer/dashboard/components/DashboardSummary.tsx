import React from 'react';
import {
  CalendarDays,
  Camera,
  Lock,
  LayoutGrid,
  Music4,
  PencilLine,
  Sparkles,
  Star,
} from 'lucide-react';
import type { LoveStoryData } from '@/types';
import { uiCopy } from '@/shared/lib/ui-copy';

const DashboardSummary: React.FC<{
  storyData: LoveStoryData;
  onEdit: () => void;
  onPreview?: () => void;
}> = ({ onEdit, onPreview }) => {
  return (
    <div className="space-y-10">
      {/* DIRECT STUDIO ACTIONS - NO HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <button 
            onClick={onEdit} 
            className="flex-grow py-5 px-10 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all hover:bg-white/10 hover:border-primary/30 flex items-center justify-center gap-3 group"
          >
            <PencilLine className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            {uiCopy.dashboard.editStory}
          </button>

          <button 
            onClick={onPreview} 
            className="flex-grow py-5 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_20px_40px_-10px_rgba(255,45,85,0.4)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Star className="w-4 h-4 fill-white" />
            Ver Prévia Real
          </button>
      </div>
    </div>
  );
};

export default DashboardSummary;
