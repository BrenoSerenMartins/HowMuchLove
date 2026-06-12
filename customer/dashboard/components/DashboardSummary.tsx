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
}> = ({ storyData, onEdit }) => {
  const startDate = storyData.startDate ? new Date(storyData.startDate) : null;
  const validStartDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const imageCount = storyData.images.length;
  const hasMusic = Boolean(storyData.youtubeUrl?.trim());
  const hasPassword = Boolean(storyData.storyPassword?.trim() || storyData.requiresPassword);
  const planName = typeof storyData.plan === 'string'
    ? storyData.plan
    : Array.isArray(storyData.plan)
      ? storyData.plan[0]?.name || 'Gratis'
      : storyData.plan?.name || 'Gratis';

  return (
    <div className="space-y-16">
      {/* Upper Console: Journey Counter */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary/30" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 font-mono">Tempo de Jornada</p>
           </div>
        </div>

        <div className="py-4 transform scale-110 lg:scale-[1.45] origin-left">
          <DurationCounter startDate={validStartDate} density="dashboard" />
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
               Iniciado em {formatDateLabel(storyData.startDate)}
            </div>
            <div className="h-[1px] flex-grow bg-white/5" />
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest font-mono">
                {planName} Plan
            </div>
        </div>
      </div>

      {/* Stats Grid - Minimalist Text-based */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
        <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 group-hover:text-primary transition-colors">
                <Camera className="w-4 h-4" />
                <span>Momentos</span>
            </div>
            <p className="text-2xl font-black text-white leading-none">{imageCount}</p>
        </div>

        <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 group-hover:text-primary transition-colors">
                <Music4 className="w-4 h-4" />
                <span>Música</span>
            </div>
            <p className="text-2xl font-black text-white leading-none">{hasMusic ? 'Ativa' : 'Off'}</p>
        </div>

        <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 group-hover:text-primary transition-colors">
                <Lock className="w-4 h-4" />
                <span>Segurança</span>
            </div>
            <p className="text-2xl font-black text-white leading-none">{hasPassword ? 'Ativa' : 'Off'}</p>
        </div>

        <div className="space-y-3 group">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 group-hover:text-primary transition-colors">
                <LayoutGrid className="w-4 h-4" />
                <span>Posição</span>
            </div>
            <p className="text-2xl font-black text-white leading-none capitalize">
                {storyData.layoutPosition === 'top' ? 'Topo' : storyData.layoutPosition === 'center' ? 'Centro' : 'Base'}
            </p>
        </div>
      </div>

      <div className="flex items-center gap-8 pt-8">
        <button 
          onClick={onEdit} 
          className="btn-primary !px-12 !py-6 group shadow-none hover:shadow-[0_0_30px_rgba(255,45,85,0.2)]"
        >
          <PencilLine className="h-4 w-4 transition-transform group-hover:-rotate-12" />
          {uiCopy.dashboard.editStory}
        </button>
        
        <p className="max-w-[240px] text-[10px] font-medium text-slate-600 leading-relaxed italic">
          "O amor é o único legado que realmente importa."
        </p>
      </div>
    </div>
  );
};

export default DashboardSummary;
