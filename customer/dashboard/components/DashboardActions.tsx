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
    <div className="relative space-y-16 group/actions">
      {/* Ambient Action Seating Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/[0.02] blur-[100px] rounded-full opacity-0 group-hover/actions:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <button
          onClick={handleShareClick}
          className="w-full group relative overflow-hidden rounded-[clamp(2rem,4vw,3rem)] border border-white/[0.03] bg-white/[0.005] backdrop-blur-2xl p-[clamp(1.5rem,4vw,3rem)] transition-all duration-1000 hover:border-primary/20 hover:bg-white/[0.01] hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] blur-[80px] rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-[clamp(1rem,3vw,2rem)]">
                  <div className="p-[clamp(1rem,2vw,1.5rem)] rounded-[clamp(1.5rem,3vw,2rem)] bg-primary/10 text-primary shadow-[0_0_30px_rgba(255,45,85,0.2)] group-hover:scale-110 transition-transform duration-700">
                      <Share2 className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)]" />
                  </div>
                  <div className="text-left space-y-1">
                      <h3 className="text-[clamp(1.25rem,2.5vw,2rem)] font-black text-white uppercase tracking-tight opacity-90 group-hover:opacity-100 transition-opacity">Compartilhar Legado</h3>
                      <p className="text-[clamp(10px,1vw,13px)] font-bold text-slate-500 uppercase tracking-widest font-mono opacity-60">
                          {isFreePlan ? 'Upgrade Necessário para publicar' : 'QR Code Ativo • Pronto para Enviar'}
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  {isFreePlan ? (
                      <div className="flex items-center gap-3 px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.75rem,1.5vw,1rem)] rounded-full bg-amber-500/10 border border-amber-500/20 text-[clamp(9px,1vw,12px)] font-black text-amber-500 uppercase tracking-widest backdrop-blur-md">
                          <ArrowUpRight className="w-[clamp(1rem,1.5vw,1.5rem)] h-[clamp(1rem,1.5vw,1.5rem)]" />
                          Desbloquear
                      </div>
                  ) : (
                      <div className="flex items-center gap-3 px-[clamp(1.5rem,2.5vw,2rem)] py-[clamp(0.75rem,1.5vw,1rem)] rounded-full bg-primary text-white text-[clamp(9px,1vw,12px)] font-black uppercase tracking-widest shadow-glow-primary group-hover:scale-105 transition-transform duration-700">
                          <Sparkles className="w-[clamp(1rem,1.5vw,1.5rem)] h-[clamp(1rem,1.5vw,1.5rem)]" />
                          Abrir Painel
                      </div>
                  )}
              </div>
          </div>
      </button>

      <div className="flex items-center gap-8 p-[clamp(1.5rem,4vw,3rem)] rounded-[clamp(2rem,4vw,3rem)] bg-gradient-to-r from-primary/[0.02] to-transparent border border-white/[0.02] backdrop-blur-xl opacity-70 hover:opacity-100 transition-opacity duration-1000">
          <div className="p-[clamp(0.75rem,1.5vw,1rem)] rounded-full bg-primary/10 text-primary animate-pulse shadow-[0_0_20px_rgba(255,45,85,0.2)]">
              <Heart className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)] fill-current" />
          </div>
          <p className="text-[clamp(12px,1.5vw,16px)] font-medium text-slate-400 leading-relaxed italic max-w-2xl">
              "O amor é o único legado que realmente importa. Cada momento adicionado é um novo verso na eternidade da sua jornada."
          </p>
      </div>
    </div>
  );
};

export default DashboardActions;
