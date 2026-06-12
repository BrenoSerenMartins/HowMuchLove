import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import PricingSection from '@/shared/pricing/PricingSection';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { fetchAllPlans } from '@/shared/lib/pricing';
import { useNotification } from '@/app/providers/NotificationProvider';
import { supabase } from '@/shared/lib/supabase';
import type { PlanFromDB } from '@/types';
import { getApiErrorMessage, getErrorMessage, getPayloadErrorMessage, logError } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import SettingsProfileCard from './components/SettingsProfileCard';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<PlanFromDB[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const fetchedPlans = await fetchAllPlans();
        if (fetchedPlans) {
          setPlans(fetchedPlans);
        }
      } catch (error) {
        logError('customer/settings/Page.fetchInitialData', error);
        addToast(getErrorMessage(error, uiCopy.common.unexpectedError), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    if (window.location.hash.includes('pricing-section')) {
      const element = document.getElementById('pricing-section');
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePlanSelected = async (plan: { id: number; name: string; amount: number }) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { planId: plan.id, planName: plan.name },
      });

      if (error) throw new Error(getApiErrorMessage(error, data, uiCopy.payment.genericError));

      const responseMessage = getPayloadErrorMessage(data, '');
      if (responseMessage) {
        throw new Error(responseMessage);
      }

      if (data?.url) {
        addToast(uiCopy.payment.redirectingCheckout, 'info');
        window.location.href = data.url;
      } else {
        throw new Error(uiCopy.payment.genericError);
      }
    } catch (err: any) {
      const message = getErrorMessage(err, uiCopy.payment.genericError);
      addToast(message, 'error');
      logError('customer/settings/Page.handlePlanSelected', err, { planId: plan.id, planName: plan.name });
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner />
      </div>
    );
  }

  const currentPlanLabel = user?.plan || uiCopy.account.noPlanActive;

  return (
    <PageWrapper>
      <div className="container-fluid space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between"
        >
          <div className="space-y-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-all group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {uiCopy.navigation.backToDashboard}
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,45,85,0.1)]">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary font-mono">
                  Conta e Assinatura
                </span>
              </div>

              <div className="max-w-3xl">
                <h1 className="text-fluid-h2 font-black text-white leading-[0.9] tracking-tighter">
                  Gerencie seu <br/>
                  <span className="text-primary italic font-cursive lowercase tracking-normal">legado digital.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-slate-400 font-medium text-fluid-body leading-relaxed">
                  Atualize seus dados, acompanhe o plano atual e escolha o próximo passo da sua história sem sair da página.
                </p>
              </div>
            </div>
          </div>

          <div className="card-elite p-8 w-full xl:max-w-xl relative overflow-hidden group border-white/10 bg-white/[0.03]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">
                  Resumo rápido
                </p>
                <p className="text-3xl font-black tracking-tighter text-white uppercase">
                  {currentPlanLabel}
                </p>
                <p className="max-w-md text-xs font-medium text-slate-400 leading-relaxed">
                  Sua conta está sincronizada e pronta para publicar e compartilhar.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:text-right">
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  <ShieldCheck className="w-3 h-3" />
                  Conta Ativa
                </span>
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                  <CreditCard className="w-3 h-3" />
                  Checkout Seguro
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-12 xl:grid-cols-[minmax(340px,0.35fr)_minmax(0,1fr)] items-start">
          <SettingsProfileCard
            planName={user.plan}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
          />

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-elite p-8 md:p-12 relative overflow-hidden border-white/10 bg-white/[0.03]"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-mono">
                    Upgrade de Experiência
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-[0.9] uppercase">
                    Escolha o próximo passo <br/>
                    da sua história.
                  </h2>
                  <p className="max-w-2xl text-slate-400 font-medium text-sm leading-relaxed">
                    {currentPlanLabel === uiCopy.account.noPlanActive
                      ? 'Comece com um plano para publicar e compartilhar sua história.'
                      : 'Confira os planos disponíveis e faça upgrade quando quiser ampliar os recursos da sua conta.'}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
              <PricingSection
                id="pricing-section"
                plans={plans}
                currentPlan={user?.plan}
                onPlanSelect={handlePlanSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SettingsPage;
