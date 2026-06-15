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
import DurationCounter from '@/shared/ui/story-view/DurationCounter';
import { uiCopy } from '@/shared/lib/ui-copy';

const formatDateLabel = (value: string | null): string => {
  if (!value) return 'Sem data definida';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'Sem data definida';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const DashboardStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:bg-white/[0.04] group">
    <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-primary transition-colors">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm font-bold text-white/90 leading-tight">
      {value}
    </p>
  </div>
);

const DashboardSummary: React.FC<{
  storyData: LoveStoryData;
  onEdit: () => void;
  onPreview?: () => void;
  onlyHero?: boolean;
  onlyStats?: boolean;
}> = ({ storyData, onEdit, onPreview, onlyHero = false, onlyStats = false }) => {
  const startDate = storyData.startDate ? new Date(storyData.startDate) : null;
  const validStartDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const isActiveStory = Boolean(validStartDate);
  const planName = typeof storyData.plan === 'string'
    ? storyData.plan
    : Array.isArray(storyData.plan)
      ? storyData.plan[0]?.name || 'Gratis'
      : storyData.plan?.name || 'Gratis';

  if (onlyHero) {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-16 text-center">
            <div className="space-y-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em] font-mono">The Living Legacy</span>
                <h2 className="text-fluid-h2 font-black text-white tracking-tighter uppercase leading-none">
                    A nossa história <br/>
                    <span className="text-slate-500 font-cursive lowercase italic tracking-normal px-2">começou há:</span>
                </h2>
            </div>
            
            <div className="py-8 transform scale-[1.1] md:scale-[1.25] lg:scale-[1.4] transition-transform duration-1000">
                <DurationCounter startDate={validStartDate} density="dashboard" />
            </div>

            <div className="mx-auto flex w-fit items-center justify-center gap-6 rounded-full border border-white/5 bg-white/[0.03] px-8 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <CalendarDays className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-300">
                        Desde {formatDateLabel(storyData.startDate)}
                    </span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                    <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono text-primary">
                        {planName} Tier
                    </span>
                </div>
            </div>
        </div>
    );
  }

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
