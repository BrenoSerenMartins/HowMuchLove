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
        <div className="mx-auto w-full max-w-5xl space-y-12 text-center relative group">
            {/* Heartbeat Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-glow-pulse pointer-events-none z-0" />

            <div className="relative z-10 space-y-12">
                <h2 className="text-fluid-h2 font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    A nossa história <br/>
                    <span className="text-primary italic font-cursive text-4xl lowercase tracking-normal px-2 opacity-80">começou há:</span>
                </h2>

                <div className="py-4 transform scale-[1.1] md:scale-[1.25] lg:scale-[1.4] transition-transform duration-1000 filter drop-shadow-[0_0_30px_rgba(255,45,85,0.3)]">
                    <DurationCounter startDate={validStartDate} density="dashboard" />
                </div>

                <div className="mx-auto flex w-fit items-center justify-center gap-8 py-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-3 text-slate-400">
                        <CalendarDays className="w-4 h-4 text-primary/40" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] font-mono">
                            Desde {formatDateLabel(storyData.startDate)}
                        </span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-primary/40" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono text-primary/80">
                            {planName} Tier
                        </span>
                    </div>
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
