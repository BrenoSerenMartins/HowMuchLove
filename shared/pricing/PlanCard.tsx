import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import type { Plan } from '@/types';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteButton from '@/shared/ui/EliteButton';

type PlanStatus = 'current' | 'upgrade' | 'downgrade';
type PlanDensity = 'default' | 'compact';

interface PlanCardProps {
  plan: Plan;
  status?: PlanStatus;
  onSelect?: (planId: number) => void;
  disabled?: boolean;
  density?: PlanDensity;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, status, onSelect, disabled = false, density = 'default' }) => {
  const isCurrentPlan = status === 'current';
  const isFeatured = plan.isFeatured;
  const isCompact = density === 'compact';
  const isComingSoon = plan.is_active === false;

  let buttonText = plan.cta;
  if (isComingSoon) {
    buttonText = uiCopy.pricing.comingSoon;
  } else if (disabled) {
    buttonText = uiCopy.pricing.loading;
  } else if (isCurrentPlan) {
    buttonText = uiCopy.pricing.currentPlanButton;
  } else if (status === 'upgrade') {
    buttonText = uiCopy.pricing.upgradeButton;
  } else if (status === 'downgrade') {
    buttonText = uiCopy.pricing.downgradeButton;
  }

  const handleSelect = () => {
    if (onSelect) onSelect(plan.id);
  };

  if (isCompact) {
    return (
      <div
        className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border transition-all duration-500 ${
          isCurrentPlan 
            ? 'bg-primary/[0.03] border-primary/20 shadow-[0_0_30px_rgba(255,45,85,0.05)]' 
            : isComingSoon
                ? 'bg-white/[0.01] border-white/5 opacity-60'
                : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
        }`}
      >
        {/* Left: Identity */}
        <div className="flex items-center gap-5 min-w-[200px]">
           <div className={`p-3 rounded-2xl border transition-colors ${isCurrentPlan ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-slate-500 group-hover:text-slate-300'}`}>
              <Sparkles className="w-5 h-5" />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{plan.name}</h3>
                {isCurrentPlan && (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[7px] font-black text-green-500 uppercase tracking-widest">Active</span>
                )}
                {isComingSoon && (
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[7px] font-black text-primary uppercase tracking-widest">Em breve</span>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest font-mono">Tier Level {plan.id}</p>
           </div>
        </div>

        {/* Center: Capabilities (Hidden on very small mobile if needed, but here as tight tags) */}
        <div className="flex-grow flex flex-wrap items-center gap-3">
            {(plan.features || []).slice(0, 3).map((feature, idx) => (
                <div key={idx} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                    <Check className="w-2.5 h-2.5 text-primary/60" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">{feature}</span>
                </div>
            ))}
        </div>

        {/* Right: Pricing & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="text-right sm:text-left flex flex-col">
                <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-1">R$</span>
                    <span className="text-2xl font-black text-white tracking-tighter font-mono">{plan.price}</span>
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono leading-none">/ {plan.billingCycle}</p>
            </div>

            <EliteButton 
              variant={isCurrentPlan ? 'secondary' : (isFeatured ? 'primary' : 'secondary')}
              onClick={handleSelect}
              disabled={isCurrentPlan || isComingSoon || disabled}
              className={`min-w-[140px] ${!isFeatured && !isCurrentPlan ? '!bg-white/5 hover:!bg-white/10 !border-white/10' : ''}`}
            >
                {buttonText}
            </EliteButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card-elite flex flex-col h-full relative group transition-all duration-500 p-8 md:p-10 ${
        isFeatured ? 'border-primary/20 bg-white/[0.05]' : ''
      } ${isCurrentPlan ? 'ring-2 ring-primary/40' : ''} ${isComingSoon ? 'opacity-70 border-white/5' : ''}`}
    >
      {isFeatured && !isCurrentPlan && !isComingSoon && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-black rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,45,85,0.4)] flex items-center gap-2 text-[9px] px-4 py-1.5">
          <Sparkles className="w-3 h-3" />
          {uiCopy.pricing.popularBadge}
        </div>
      )}
      
      {isComingSoon && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 text-slate-400 font-black rounded-full uppercase tracking-[0.2em] backdrop-blur-md border border-white/10 text-[9px] px-4 py-1.5">
          {uiCopy.pricing.comingSoon}
        </div>
      )}
      
      {isCurrentPlan && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 text-white font-black rounded-full uppercase tracking-[0.2em] backdrop-blur-md border border-white/10 text-[9px] px-4 py-1.5">
          {uiCopy.pricing.currentBadge}
        </div>
      )}

      <div className="mb-8">
        <h3 className="font-black text-white tracking-tight uppercase text-2xl">{plan.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-black text-white tracking-tighter text-4xl md:text-5xl">R${plan.price}</span>
          {plan.billingCycle !== uiCopy.pricing.oneTimePayment ? (
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">/{plan.billingCycle}</span>
          ) : (
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">{uiCopy.pricing.oneTimePayment}</span>
          )}
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/5 mb-8" />

      <ul className="text-left flex-grow space-y-5 mb-12">
        {(plan.features || []).map((feature, index) => {
          const isSpecialFeature = feature === uiCopy.pricing.specialFeature;
          return (
            <li key={index} className="flex items-start gap-4">
              <div className={`mt-1 p-0.5 rounded-full ${isSpecialFeature ? 'text-primary' : 'text-slate-500'}`}>
                <Check className="h-3.5 w-3.5 stroke-[4]" />
              </div>
              <span className={`font-medium leading-relaxed text-[13px] ${isSpecialFeature ? 'text-primary font-black uppercase tracking-wider text-[11px]' : 'text-slate-400'}`}>
                {feature}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleSelect}
        disabled={isCurrentPlan || isComingSoon || disabled}
        className={`w-full font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 py-5 px-6 text-10px ${
          isCurrentPlan
            ? 'bg-transparent border border-primary/20 text-primary cursor-default'
            : isComingSoon
                ? 'bg-white/5 border border-white/10 text-slate-500 cursor-default'
                : isFeatured 
                    ? 'bg-primary text-white shadow-[0_10px_25px_-5px_rgba(255,45,85,0.4)] hover:shadow-[0_20px_40px_-8px_rgba(255,45,85,0.5)] hover:-translate-y-1' 
                    : 'btn-secondary'
        } disabled:opacity-30 disabled:pointer-events-none disabled:transform-none`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PlanCard;
