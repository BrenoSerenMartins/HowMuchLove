import React from 'react';
import type { Plan } from '@/types';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
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

  const cardClasses = [
    'bg-gradient-to-br border shadow-lg transition-all duration-300 transform hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform',
    plan.isFeatured
      ? 'from-fuchsia-950 via-pink-950/90 to-slate-950 border-pink-400/50'
      : 'from-slate-900 to-slate-950 border-slate-700/70',
    isCurrentPlan ? 'ring-2 ring-pink-400/70' : '',
    status === 'upgrade' ? 'border-pink-300/50' : '',
    status === 'downgrade' ? 'opacity-95' : '',
  ].filter(Boolean).join(' ');

  let buttonClasses = '';
  let buttonText = plan.cta;
  buttonClasses = plan.isFeatured
    ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/30'
    : 'bg-slate-700 text-slate-200 hover:bg-slate-600';

  // Override button styles for special states
  if (disabled) {
    buttonText = uiCopy.pricing.loading;
    buttonClasses = 'bg-slate-800 text-slate-500 cursor-wait';
  } else if (isCurrentPlan) {
    buttonText = uiCopy.pricing.currentPlanButton;
    buttonClasses = 'bg-slate-800 text-slate-500 cursor-not-allowed';
  } else if (status === 'upgrade') {
    buttonText = uiCopy.pricing.upgradeButton;
  } else if (status === 'downgrade') {
    buttonText = uiCopy.pricing.downgradeButton;
    buttonClasses = 'bg-slate-700 text-slate-200 hover:bg-slate-600';
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan.id);
    }
  };

  return (
    <div
      className={`relative rounded-xl p-6 md:p-8 flex flex-col h-full shadow-lg transition-all duration-300 transform hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform ${cardClasses}`}
    >
      {plan.isFeatured && !isCurrentPlan && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {uiCopy.pricing.popularBadge}
        </span>
      )}
      {isCurrentPlan && (
         <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {uiCopy.pricing.currentBadge}
        </span>
      )}
      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
      <div className="mt-4 text-slate-300">
        <span className="text-3xl sm:text-4xl font-bold text-white">R${plan.price}</span>
        {plan.billingCycle !== uiCopy.pricing.oneTimePayment ? (
           <span className="text-sm">/{plan.billingCycle}</span>
        ) : (
           <span className="block text-sm font-semibold text-pink-400 mt-1">{uiCopy.pricing.oneTimePayment}</span>
        )}
      </div>
      <div className="border-t my-6 border-slate-700"></div>
      <ul className="space-y-4 text-left flex-grow">
        {(plan.features || []).map((feature, index) => {
          const isSpecialFeature = feature === uiCopy.pricing.specialFeature;
          return (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-5 w-5 text-pink-400 mr-3 flex-shrink-0" />
              <span className={`text-slate-300 text-sm md:text-base ${isSpecialFeature ? 'font-bold text-pink-400' : ''}`}>
                {feature}
              </span>
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleSelect}
        disabled={isCurrentPlan || disabled}
        className={`w-full mt-10 py-3 px-6 font-semibold rounded-lg shadow-sm transition-transform transition-colors duration-300 transform hover:scale-105 ${buttonClasses}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PlanCard;
