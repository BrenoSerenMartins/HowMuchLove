import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Share2, Sparkles } from 'lucide-react';
import type { PlanFeatures } from '@/types';
import { canShareStory } from '@/shared/lib/plans';
import { uiCopy } from '@/shared/lib/ui-copy';

const DashboardActions: React.FC<{
  onShare: () => void;
  planFeatures: Partial<PlanFeatures> | null;
  navigate: (path: string) => void;
}> = ({ onShare, planFeatures, navigate }) => {
  const isFreePlan = !canShareStory(planFeatures);

  const handleShareClick = () => {
    if (isFreePlan) {
      navigate('/settings#pricing-section');
      return;
    }
    onShare();
  };

  return (
    <div className="relative space-y-12">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono whitespace-nowrap">02 / DISTRIBUTION</span>
            <div className="h-[1px] flex-grow bg-white/5" />
        </div>

        <button
            onClick={handleShareClick}
            className="w-full group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.04]"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,45,85,0.2)]">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div className="text-left space-y-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Compartilhar Legado</h3>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest font-mono">
                            {isFreePlan ? 'Upgrade Necessário para publicar' : 'Link Único • QR Code Ativo'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isFreePlan ? (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                            <ArrowUpRight className="w-3 h-3" />
                            Desbloquear
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                            <Sparkles className="w-3 h-3" />
                            Abrir Painel
                        </div>
                    )}
                </div>
            </div>
        </button>
      </div>

      <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-gradient-to-r from-primary/5 to-transparent border border-white/5">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Heart className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic max-w-xl">
              "O amor é o único legado que realmente importa. Cada momento adicionado é um novo verso na eternidade da sua jornada."
          </p>
      </div>
    </div>
  );
};

export default DashboardActions;
