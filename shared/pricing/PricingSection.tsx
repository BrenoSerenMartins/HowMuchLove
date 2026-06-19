import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
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
  variant?: 'default' | 'compact';
}

const PricingSection: React.FC<PricingSectionProps> = ({ id, plans: dbPlans, currentPlan, onPlanSelect, variant = 'default' }) => {
  const { addToast } = useNotification();
  const { navigate } = useNavigate();
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const planRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isCompact = variant === 'compact';

  // Format the raw DB plans into the structure the PlanCard expects
  const formattedPlans: DisplayPlan[] = useMemo(
    () =>
      (dbPlans || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price.toFixed(2).replace('.', ','),
        priceValue: p.price,
        billing_provider: p.billing_provider,
        billing_price_id: p.billing_price_id,
        billingCycle: p.billing_cycle,
        features: p.features,
        isFeatured: p.is_featured,
        is_active: p.is_active,
        cta: `Escolher ${p.name}`,
      })),
    [dbPlans],
  );

  const currentPlanDetails = currentPlan
    ? formattedPlans.find((plan) => plan.name === currentPlan)
    : null;

  const centeredPlanId = currentPlanDetails?.id ?? formattedPlans.find((plan) => plan.isFeatured)?.id ?? formattedPlans[0]?.id;

  useEffect(() => {
    if (!isCompact || !centeredPlanId) return;

    const targetIndex = formattedPlans.findIndex((plan) => plan.id === centeredPlanId);
    const targetNode = planRefs.current[targetIndex];

    if (!targetNode) return;

    const timer = window.setTimeout(() => {
      targetNode.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [centeredPlanId, formattedPlans, isCompact]);

  const getPlanStatus = (plan: DisplayPlan) => {
    if (!currentPlanDetails) return undefined;
    if (plan.id === currentPlanDetails.id) return 'current';
    if (plan.priceValue > currentPlanDetails.priceValue) return 'upgrade';
    if (plan.priceValue < currentPlanDetails.priceValue) return 'downgrade';
    return undefined;
  };

  const parsePriceToNumber = (priceString: string): number => parseFloat(priceString.replace(',', '.'));

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
  
  if (isCompact) {
    return (
      <div id={id} className="relative w-full">
        {/* Plan Rows - Executive List for Settings */}
        <div className="flex flex-col gap-4">
          {formattedPlans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full"
            >
              <PlanCard
                plan={plan}
                status={getPlanStatus(plan)}
                onSelect={handleSelectPlan}
                disabled={!plan.billing_price_id || plan.billing_provider !== 'stripe'}
                density="compact"
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id={id} className="section-fluid relative overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(500px,70vw,1000px)] h-[clamp(500px,70vw,1000px)] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 container-fluid overflow-visible">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mx-auto mb-20 max-w-4xl"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            Escolha seu Legado
          </span>
          <h2 className="font-black text-white leading-[0.9] tracking-tighter mb-8">
            {uiCopy.pricing.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.pricing.titleHighlight}
            </span>
          </h2>
          <p className="text-slate-400 text-fluid-body font-medium max-w-2xl mx-auto">
            {uiCopy.pricing.description}
          </p>
        </motion.div>

        {/* Plan Cards Grid - Horizontal on mobile, Grid on desktop */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto pb-12 pt-6 md:grid md:grid-cols-3 gap-6 md:gap-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory overflow-y-visible items-stretch"
        >
          {formattedPlans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              ref={(node) => {
                planRefs.current[index] = node;
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-[85vw] md:w-auto flex-shrink-0 snap-center h-auto"
            >
              <PlanCard
                plan={plan}
                status={getPlanStatus(plan)}
                onSelect={handleSelectPlan}
                disabled={!plan.billing_price_id || plan.billing_provider !== 'stripe'}
                density="default"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
