import React from 'react';
import type { Plan } from '../types';
import { CheckIcon } from './icons/CheckIcon';

type PlanStatus = 'current' | 'upgrade' | 'downgrade';

interface PlanCardProps {
  plan: Plan;
  status?: PlanStatus;
  onSelect?: (planName: string) => void;
  disabled?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, status, onSelect, disabled = false }) => {
  const isCurrentPlan = status === 'current';

  const cardClasses = plan.isFeatured
    ? 'bg-white border-pink-500 border-2 shadow-lg hover:shadow-2xl hover:shadow-pink-200/50'
    : 'bg-white border-slate-200 border shadow-md hover:shadow-xl';

  let buttonText = plan.cta;
  let buttonClasses = plan.isFeatured
    ? 'bg-pink-500 text-white hover:bg-pink-600'
    : 'bg-pink-100 text-pink-700 hover:bg-pink-200';

  if (disabled) {
    buttonText = 'Carregando...';
    buttonClasses = 'bg-slate-200 text-slate-500 cursor-wait';
  } else if (isCurrentPlan) {
    buttonText = 'Seu Plano Atual';
    buttonClasses = 'bg-slate-200 text-slate-500 cursor-not-allowed';
  } else if (status === 'upgrade') {
    buttonText = 'Fazer Upgrade';
  } else if (status === 'downgrade') {
    buttonText = 'Mudar para este plano';
    buttonClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan.name);
    }
  };

  return (
    <div
      className={`relative rounded-xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 transform hover:scale-105 ${cardClasses}`}
    >
      {plan.isFeatured && !isCurrentPlan && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Popular
        </span>
      )}
      {isCurrentPlan && (
         <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Seu Plano
        </span>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
      <div className="mt-4 text-slate-500">
        <span className="text-3xl sm:text-4xl font-bold text-slate-900">R${plan.price}</span>
        {plan.billingCycle !== 'Pagamento único' ? (
           <span className="text-sm">/{plan.billingCycle}</span>
        ) : (
           <span className="block text-sm font-semibold text-pink-600 mt-1">{plan.billingCycle}</span>
        )}
      </div>
      <div className="border-t my-6 border-slate-200"></div>
      <ul className="space-y-4 text-left flex-grow">
        {plan.features.map((feature, index) => {
          const isSpecialFeature = feature === 'Pague uma vez, use para sempre';
          return (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-5 w-5 text-pink-500 mr-3 flex-shrink-0" />
              <span className={`text-slate-700 ${isSpecialFeature ? 'font-bold text-pink-600' : ''}`}>
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