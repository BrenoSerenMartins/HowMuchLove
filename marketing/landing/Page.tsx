import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import HeroSection from './sections/HeroSection';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import SocialProofSection from './sections/SocialProofSection';
import FAQSection from './sections/FAQSection';
import FinalCTASection from './sections/FinalCTASection';
import PricingSection from '@/shared/pricing/PricingSection';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { fetchAllPlans } from '@/shared/lib/pricing';
import { supabase } from '@/shared/lib/supabase';
import { useNotification } from '@/app/providers/NotificationProvider';
import { getApiErrorMessage, getErrorMessage, getPayloadErrorMessage, logError } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import type { PlanFromDB } from '@/types';

const HomePage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const [plans, setPlans] = useState<PlanFromDB[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await fetchAllPlans();
        if (fetchedPlans) {
          setPlans(fetchedPlans);
        }
      } catch (error) {
        logError('marketing/landing/Page.fetchPlans', error);
      } finally {
        setIsPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanSelected = async (plan: { id: number; name: string; amount: number }) => {
    if (!user) {
      addToast(uiCopy.payment.createAccount, 'info');
      navigate('/register');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { planId: plan.id, planName: plan.name },
      });

      if (error) throw new Error(getApiErrorMessage(error, data, uiCopy.payment.genericError));

      if (data?.url) {
        addToast(uiCopy.payment.redirectingCheckout, 'info');
        window.location.href = data.url;
      }
    } catch (err: any) {
      addToast(getErrorMessage(err, uiCopy.payment.genericError), 'error');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#050505]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      
      <FeaturesSection />

      <HowItWorksSection />

      <section id="demo" className="relative z-10 scroll-mt-20 py-24">
          {/* Section Header for CounterDemo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 px-4"
          >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">
                Demonstração Ao Vivo
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter mb-6">
                  {uiCopy.marketing.demo.titleLead}{' '}
                  <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
                    {uiCopy.marketing.demo.titleHighlight}
                  </span>
              </h2>
              <p className="text-slate-400 mt-4 text-lg font-medium">
                  {uiCopy.marketing.demo.description}
              </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="card-elite !bg-transparent !shadow-none !backdrop-blur-0 max-w-6xl mx-auto p-4 sm:p-8 overflow-x-hidden overflow-y-visible"
          >
            <CounterDemo isDashboard={false} planFeatures={null} />
          </motion.div>
      </section>
      
      <SocialProofSection />

      {/* Coming Soon / Pricing Placeholder */}
      <section id="pricing" className="section-fluid relative overflow-visible">
        <div className="relative z-10 container-fluid overflow-visible">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elite p-12 md:p-20 max-w-4xl mx-auto text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-mono">Lançamento Próximo</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter mb-8 uppercase">
              Novos Planos <br/>
              <span className="text-primary italic font-cursive lowercase tracking-normal px-2">em breve.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Estamos preparando pacotes exclusivos para eternizar histórias de forma ainda mais épica. 
              <br className="hidden md:block" />
              <span className="text-white/60">Por enquanto, aproveite o nosso plano grátis!</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* New FAQ Section Added */}
      <FAQSection />

      <FinalCTASection />
    </>
  );
};

export default HomePage;
