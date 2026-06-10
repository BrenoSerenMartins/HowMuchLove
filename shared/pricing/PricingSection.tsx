import React, { useState, useEffect, useRef } from 'react';
import PlanCard from './PlanCard';
import { useNotification } from '@/app/providers/NotificationProvider';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useAuth } from '@/app/hooks/useAuth';
import type { PlanFromDB, FormattedPlan } from '@/types';
import { uiCopy } from '@/shared/lib/ui-copy';

type DisplayPlan = FormattedPlan & {
  priceValue: number;
  billing_provider?: string | null;
  billing_price_id?: string | null;
};

interface PricingSectionProps {
  id?: string;
  plans: PlanFromDB[]; // Receives raw DB plans
  currentPlan?: string | null;
  onPlanSelect: (plan: { id: number; name: string; amount: number }) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ id, plans: dbPlans, currentPlan, onPlanSelect }) => {
  const { addToast } = useNotification();
  const { navigate } = useNavigate();
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Format the raw DB plans into the structure the PlanCard expects
  const formattedPlans: DisplayPlan[] = (dbPlans || []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toFixed(2).replace('.', ','), // Ensure 2 decimal places and comma
    priceValue: p.price,
    billing_provider: p.billing_provider,
    billing_price_id: p.billing_price_id,
    billingCycle: p.billing_cycle,
    features: p.features,
    isFeatured: p.is_featured,
    cta: `Escolher ${p.name}`,
  }));

    useEffect(() => {
      if (!carouselRef.current || formattedPlans.length === 0) return;
  
      requestAnimationFrame(() => {
        let targetIndex = -1;
    
        // Prioritize current plan if user is logged in
        if (user && currentPlan) {
          targetIndex = formattedPlans.findIndex(p => p.name === currentPlan);
        }
    
        // Fallback to featured plan if no current plan or user not logged in
        if (targetIndex === -1) {
          targetIndex = formattedPlans.findIndex(p => p.isFeatured);
        }
        
        if (targetIndex !== -1) {
          const targetElement = carouselRef.current.children[targetIndex] as HTMLElement;
          if (targetElement && carouselRef.current) {
            // Calculate scrollLeft to center the target element
            const scrollLeft = targetElement.offsetLeft - 
                               (carouselRef.current.offsetWidth / 2) + 
                               (targetElement.offsetWidth / 2);
            
            carouselRef.current.scrollLeft = scrollLeft;
          }
        }
      });
    }, [dbPlans, user, currentPlan]); // Re-run if these change
  const currentPlanDetails = currentPlan
    ? formattedPlans.find((plan) => plan.name === currentPlan)
    : null;

  const getPlanStatus = (plan: DisplayPlan) => {
    if (!currentPlanDetails) {
      return undefined;
    }

    if (plan.id === currentPlanDetails.id) {
      return 'current';
    }

    if (plan.priceValue > currentPlanDetails.priceValue) {
      return 'upgrade';
    }

    if (plan.priceValue < currentPlanDetails.priceValue) {
      return 'downgrade';
    }

    return undefined;
  };

  const parsePriceToNumber = (priceString: string): number => {
    return parseFloat(priceString.replace(',', '.'));
  };

  const handleSelectPlan = (planId: number) => {
    if (!user) {
      addToast(uiCopy.payment.createAccount, 'info');
      navigate('/register');
      return;
    }

    const selectedPlan = formattedPlans.find(p => p.id === planId);
    if (!selectedPlan) {
      addToast(uiCopy.payment.planNotFound, 'error');
      return;
    }

    if (!selectedPlan.billing_price_id || selectedPlan.billing_provider !== 'stripe') {
      addToast(uiCopy.payment.checkoutUnavailable, 'error');
      return;
    }

    onPlanSelect({
      id: selectedPlan.id,
      name: selectedPlan.name,
      amount: parsePriceToNumber(selectedPlan.price),
    });
  };
  
  return (
    <section id={id} className="py-16 sm:py-20 scroll-mt-20 overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {uiCopy.pricing.titleLead}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{uiCopy.pricing.titleHighlight}</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            {uiCopy.pricing.description}
          </p>
        </div>
      </div>

      {/* Plan Cards Container - Full bleed on mobile */}
      <div 
        ref={carouselRef}
        className="flex space-x-4 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 pb-4 animate-fade-in-slide-up hide-scrollbar scroll-smooth snap-x snap-mandatory py-8 scroll-px-4"
        style={{ animationDelay: '300ms' }}
      >
        {formattedPlans.map((plan) => (
          <div 
            key={plan.id} 
            className={`
              relative w-5/6 flex-shrink-0 md:w-full transition-transform duration-300 hover:z-20 snap-center
              ${plan.isFeatured ? 'md:scale-105 lg:scale-110 md:z-10' : ''}
            `}
          >
            <PlanCard
              plan={plan}
              status={getPlanStatus(plan)}
              onSelect={handleSelectPlan}
              disabled={!plan.billing_price_id || plan.billing_provider !== 'stripe'}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
