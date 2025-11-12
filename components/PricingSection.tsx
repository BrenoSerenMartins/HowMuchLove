import React from 'react';
import type { Plan } from '../types';
import PlanCard from './PlanCard';
import { createPaymentPreference } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from '../hooks/useNavigate';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

const plans: Plan[] = [
  {
    name: 'Sonho',
    price: '4,90',
    billingCycle: 'mês',
    features: [
      'Página salva para sempre',
      'Imortalize seu momento favorito',
      'Declare seu amor com uma mensagem',
      'Link exclusivo para compartilhar',
    ],
    isFeatured: false,
    cta: 'Escolher Sonho',
  },
  {
    name: 'Eterno',
    price: '29,90',
    billingCycle: 'anual',
    features: [
      'Tudo do plano Sonho, e mais:',
      'Conte sua história com até 10 fotos',
      'Dê o tom com sua música especial',
      'Personalize a aparência do contador',
    ],
    isFeatured: true,
    cta: 'Escolher Eterno',
  },
  {
    name: 'Infinito',
    price: '49,90',
    billingCycle: 'Pagamento único',
    features: [
      'Tudo do plano Eterno, e mais:',
      'Um legado digital, sem mensalidades',
      'Reviva cada detalhe com até 20 fotos',
      'Emocione com um vídeo especial',
      'Acesso a todas as futuras atualizações',
    ],
    isFeatured: false,
    cta: 'Escolher Infinito',
  },
];

const planRank: { [key: string]: number } = {
  'Sonho': 1,
  'Eterno': 2,
  'Infinito': 3,
};

interface PricingSectionProps {
  id?: string;
  currentPlan?: string | null;
  onPlanChange?: (planName: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ id, currentPlan, onPlanChange }) => {
  const { addToast } = useNotification();
  const { navigate } = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext

  const getPlanStatus = (planName: string) => {
    if (!currentPlan) return undefined;
    if (planName === currentPlan) return 'current';
    if (planRank[planName] > planRank[currentPlan]) return 'upgrade';
    if (planRank[planName] < planRank[currentPlan]) return 'downgrade';
    return undefined;
  };

  const handleSelectPlan = async (planName: string) => {
    if (!user) {
      addToast('Crie uma conta para escolher um plano.', 'info');
      navigate('/register');
      return;
    }

    try {
      const { init_point } = await createPaymentPreference(planName);
      window.location.href = init_point; // Redirect to Mercado Pago checkout
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      addToast(error.message || 'Erro ao iniciar o pagamento. Tente novamente.', 'error');
    }
  };
  
  return (
    <section id={id} className="text-center pt-12 sm:pt-20 md:pt-24 pb-12 scroll-mt-20">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-800">
        Um Legado Digital para o <span className="text-pink-500">Seu Amor.</span>
      </h2>
      <p className="text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
        Gostou da prévia? Agora é hora de torná-la eterna. Salve sua homenagem e compartilhe seu link mágico com o plano ideal.
      </p>
      <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`
              relative w-full max-w-md md:w-1/3 transition-transform duration-300 hover:z-20
              ${plan.isFeatured ? 'md:scale-105 lg:scale-110 md:z-10' : ''}
            `}
          >
            <PlanCard plan={plan} status={getPlanStatus(plan.name)} onSelect={handleSelectPlan} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;