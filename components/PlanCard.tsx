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

  let cardClasses = '';
  let buttonClasses = '';
  let buttonText = plan.cta;

  // Define styles based on the plan name
  switch (plan.name) {
    case 'Sonho':
      cardClasses = 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 border';
      buttonClasses = 'bg-slate-700 text-slate-200 hover:bg-slate-600';
      break;
    case 'Eterno': // Featured plan
      cardClasses = 'bg-gradient-to-br from-purple-900 via-pink-800/80 to-rose-900 border-pink-500 border-2';
      buttonClasses = 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/30';
      break;
    case 'Infinito':
      cardClasses = 'bg-gradient-to-br from-slate-900 to-indigo-900 border-indigo-700 border';
      buttonClasses = 'bg-indigo-700 text-white hover:bg-indigo-600';
      break;
    default:
      cardClasses = 'bg-slate-900 border-slate-700 border';
      buttonClasses = 'bg-slate-700 text-slate-200 hover:bg-slate-600';
  }

  // Override button styles for special states
  if (disabled) {
    buttonText = 'Carregando...';
    buttonClasses = 'bg-slate-800 text-slate-500 cursor-wait';
  } else if (isCurrentPlan) {
    buttonText = 'Seu Plano Atual';
    buttonClasses = 'bg-slate-800 text-slate-500 cursor-not-allowed';
  } else if (status === 'upgrade') {
    buttonText = 'Fazer Upgrade';
  } else if (status === 'downgrade') {
    buttonText = 'Mudar para este plano';
    buttonClasses = 'bg-slate-700 text-slate-200 hover:bg-slate-600';
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan.name);
    }
  };

  return (
    <div
      className={`relative rounded-xl p-6 md:p-8 flex flex-col h-full shadow-lg transition-all duration-300 transform hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform ${cardClasses}`}
    >
      {plan.isFeatured && !isCurrentPlan && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Popular
        </span>
      )}
      {isCurrentPlan && (
         <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Seu Plano
        </span>
      )}
      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
      <div className="mt-4 text-slate-300">
        <span className="text-3xl sm:text-4xl font-bold text-white">R${plan.price}</span>
        {plan.billingCycle !== 'Pagamento único' ? (
           <span className="text-sm">/{plan.billingCycle}</span>
        ) : (
           <span className="block text-sm font-semibold text-pink-400 mt-1">{plan.billingCycle}</span>
        )}
      </div>
      <div className="border-t my-6 border-slate-700"></div>
      <ul className="space-y-4 text-left flex-grow">
        {plan.features.map((feature, index) => {
          const isSpecialFeature = feature === 'Pague uma vez, use para sempre';
          return (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-5 w-5 text-pink-400 mr-3 flex-shrink-0" />
              <span className={`text-slate-300 ${isSpecialFeature ? 'font-bold text-pink-400' : ''}`}>
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