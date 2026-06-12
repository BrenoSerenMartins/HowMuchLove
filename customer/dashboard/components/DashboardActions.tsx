import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Share2, Sparkles } from 'lucide-react';
import type { PlanFeatures } from '@/types';
import { canShareStory } from '@/shared/lib/plans';
import { uiCopy } from '@/shared/lib/ui-copy';

const DashboardActions: React.FC<{
  shareUrl: string;
  onPreview: () => void;
  onShare: () => void;
  planFeatures: Partial<PlanFeatures> | null;
  navigate: (path: string) => void;
}> = ({ shareUrl, onPreview, onShare, planFeatures, navigate }) => {
  const isFreePlan = !canShareStory(planFeatures);

  const handleShareClick = () => {
    if (isFreePlan) {
      navigate('/settings#pricing-section');
      return;
    }
    onShare();
  };

  return (
    <div className="relative flex flex-col gap-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono">
              Link de Publicação
            </h3>
        </div>

        <div className="flex items-center justify-between gap-6 group">
            <div className="flex-grow min-w-0 py-2 border-b border-white/5 group-hover:border-primary/30 transition-colors">
               <p className="truncate text-xs font-mono text-slate-500 group-hover:text-slate-200 transition-colors">
                 {shareUrl}
               </p>
            </div>
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                }}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                title="Copiar Link"
            >
                <Share2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onPreview}
          className="btn-secondary !py-5 group justify-center border-white/5 hover:border-white/10"
        >
          <Eye className="h-4 w-4 text-primary/70" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{uiCopy.dashboard.preview}</span>
        </button>
        <button
          onClick={handleShareClick}
          className="btn-primary !py-5 group justify-center shadow-none hover:shadow-[0_0_30px_rgba(255,45,85,0.2)]"
        >
          {isFreePlan ? (
            <>
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{uiCopy.dashboard.upgrade}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Gerar QR Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardActions;
