import React, { useState, useEffect } from 'react';
import PlanCard from './PlanCard';
import { fetchAllPlans } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from '../hooks/useNavigate';
import { useAuth } from '../hooks/useAuth';
import type { PlanFromDB, FormattedPlan } from '../types';

const planRank: { [key: string]: number } = {
  'Sonho': 1,
  'Eterno': 2,
  'Infinito': 3,
};

interface PricingSectionProps {
  id?: string;
  plans: PlanFromDB[]; // Receives raw DB plans
  currentPlan?: string | null;
  onPlanSelect: (plan: { name: string; amount: number }) => void;
  mpPublicKey: string | null;
}

// Helper function to generate features from DB plan data
const generateFeatures = (plan: PlanFromDB): string[] => {
  const features: string[] = [];

  if (plan.name === 'Sonho') {
    features.push(
      'Página salva para sempre',
      'Imortalize seu momento favorito',
      'Declare seu amor com uma mensagem',
      'Link exclusivo para compartilhar'
    );
  } else if (plan.name === 'Eterno') {
    features.push(
      'Tudo do plano Sonho, e mais:',
      `Conte sua história com até ${plan.image_limit} fotos`,
      'Dê o tom com sua música especial'
    );
    if (plan.allow_password_protection) {
      features.push('Proteja sua página com senha');
    }
  } else if (plan.name === 'Infinito') {
    features.push(
      'Tudo do plano Eterno, e mais:',
      'Um legado digital, sem mensalidades',
      `Reviva cada detalhe com até ${plan.image_limit} fotos`
    );
    if (plan.allow_youtube) {
      features.push('Emocione com um vídeo especial');
    }
    if (plan.allow_custom_button) {
        features.push('Personalize o botão de entrada');
    }
    features.push('Acesso a todas as futuras atualizações');
  }

  return features;
};


const PricingSection: React.FC<PricingSectionProps> = ({ id, plans: dbPlans, currentPlan, onPlanSelect, mpPublicKey }) => {
  const { addToast } = useNotification();
  const { navigate } = useNavigate();
  const { user } = useAuth();

  // Format the raw DB plans into the structure the PlanCard expects
  const formattedPlans: FormattedPlan[] = (dbPlans || []).map(p => ({
    name: p.name,
    price: p.price.toFixed(2).replace('.', ','), // Ensure 2 decimal places and comma
    billingCycle: p.name === 'Infinito' ? 'Pagamento único' : p.name === 'Eterno' ? 'anual' : 'mês',
    features: generateFeatures(p),
    isFeatured: p.name === 'Eterno',
    cta: `Escolher ${p.name}`,
  }));

  const getPlanStatus = (planName: string) => {
    if (!currentPlan || typeof currentPlan !== 'string' || !planRank[currentPlan]) {
      return undefined;
    }
    const currentRank = planRank[currentPlan];
    const newRank = planRank[planName];

    if (newRank === currentRank) {
      return 'current';
    }
    if (newRank > currentRank) {
      return 'upgrade';
    }
    if (newRank < currentRank) {
      return 'downgrade';
    }
    return undefined;
  };

  const parsePriceToNumber = (priceString: string): number => {
    return parseFloat(priceString.replace(',', '.'));
  };

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      addToast('Crie uma conta para escolher um plano.', 'info');
      navigate('/register');
      return;
    }

    if (!mpPublicKey) {
      addToast('A configuração de pagamento não está disponível no momento. Tente novamente mais tarde.', 'error');
      return;
    }

    const selectedPlan = formattedPlans.find(p => p.name === planName);
    if (!selectedPlan) {
      addToast('Plano não encontrado.', 'error');
      return;
    }

    onPlanSelect({
      name: selectedPlan.name,
      amount: parsePriceToNumber(selectedPlan.price),
    });
  };
  
  return (
    <section id={id} className="py-16 sm:py-20 scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Um Legado Digital para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Seu Amor.</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Gostou da prévia? Agora é hora de torná-la eterna. Salve sua homenagem e compartilhe seu link mágico com o plano ideal.
          </p>
        </div>

        {/* Plan Cards Container - Flex for mobile, Grid for desktop */}
        <div 
          className="flex space-x-6 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 px-8 md:px-0 pb-4 animate-fade-in-slide-up hide-scrollbar scroll-smooth snap-x snap-mandatory scroll-pl-8 scroll-pr-8"
          style={{ animationDelay: '300ms' }}
        >
          {formattedPlans.map((plan) => (
            <div 
              key={plan.name} 
              className={`
                relative w-3/4 flex-shrink-0 md:w-full transition-transform duration-300 hover:z-20 snap-center
                ${plan.isFeatured ? 'md:scale-105 lg:scale-110 md:z-10' : ''}
              `}
            >
              <PlanCard plan={plan} status={getPlanStatus(plan.name)} onSelect={handleSelectPlan} disabled={!mpPublicKey} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;