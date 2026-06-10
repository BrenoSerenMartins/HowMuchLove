import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { Plan } from '@/types';
import { uiCopy } from '@/shared/lib/ui-copy';

type PlanStatus = 'current' | 'upgrade' | 'downgrade';

interface PlanCardProps {
  plan: Plan;
  status?: PlanStatus;
  onSelect?: (planId: number) => void;
  disabled?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, status, onSelect, disabled = false }) => {
  const isCurrentPlan = status === 'current';
  const isFeatured = plan.isFeatured;

  let buttonText = plan.cta;
  if (disabled) {
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

  return (
    <div
      className={`card-elite p-8 md:p-10 flex flex-col h-full relative group transition-all duration-500 ${
        isFeatured ? 'border-primary/20 bg-white/[0.05]' : ''
      } ${isCurrentPlan ? 'ring-2 ring-primary/40' : ''}`}
    >
      {isFeatured && !isCurrentPlan && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,45,85,0.4)] flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          {uiCopy.pricing.popularBadge}
        </div>
      )}
      
      {isCurrentPlan && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
          {uiCopy.pricing.currentBadge}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-black text-white tracking-tight uppercase">{plan.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">R${plan.price}</span>
          {plan.billingCycle !== uiCopy.pricing.oneTimePayment ? (
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">/{plan.billingCycle}</span>
          ) : (
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">{uiCopy.pricing.oneTimePayment}</span>
          )}
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/5 mb-8" />

      <ul className="space-y-5 text-left flex-grow mb-12">
        {(plan.features || []).map((feature, index) => {
          const isSpecialFeature = feature === uiCopy.pricing.specialFeature;
          return (
            <li key={index} className="flex items-start gap-4">
              <div className={`mt-1 p-0.5 rounded-full ${isSpecialFeature ? 'text-primary' : 'text-slate-500'}`}>
                <Check className="h-3.5 w-3.5 stroke-[4]" />
              </div>
              <span className={`text-[13px] font-medium leading-relaxed ${isSpecialFeature ? 'text-primary font-black uppercase tracking-wider text-[11px]' : 'text-slate-400'}`}>
                {feature}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleSelect}
        disabled={isCurrentPlan || disabled}
        className={`w-full py-5 px-6 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-300 ${
          isFeatured 
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
