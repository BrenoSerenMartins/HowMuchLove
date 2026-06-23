import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, ShieldAlert, Sparkles } from 'lucide-react';
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
import SettingsSidebar from './components/SettingsSidebar';
import SettingsSection from './components/SettingsSection';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate, route } = useNavigate();
  const { addToast } = useNotification();
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [plans, setPlans] = useState<PlanFromDB[]>([]);
  
  const cleanRoute = route.split('?')[0].split('#')[0];
  const activeSection = cleanRoute === '/settings' ? 'profile' : cleanRoute.split('/').pop() || 'profile';

  useEffect(() => {
    if (window.location.hash.includes('pricing-section')) {
      navigate('/settings/billing');
      setTimeout(() => {
        const element = document.getElementById('pricing-section');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [navigate]);

  useEffect(() => {
    if (activeSection !== 'billing') return;
    if (plans.length > 0) return;

    let cancelled = false;

    const fetchPlans = async () => {
      setIsPlansLoading(true);
      try {
        const fetchedPlans = await fetchAllPlans();
        if (!cancelled && fetchedPlans) {
          setPlans(fetchedPlans);
        }
      } catch (error) {
        if (!cancelled) {
          logError('customer/settings/Page.fetchPlans', error);
          addToast(getErrorMessage(error, uiCopy.common.unexpectedError), 'error');
        }
      } finally {
        if (!cancelled) {
          setIsPlansLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      cancelled = true;
    };
  }, [activeSection, plans.length, addToast]);

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
      if (responseMessage) throw new Error(responseMessage);

      if (data?.url) {
        addToast(uiCopy.payment.redirectingCheckout, 'info');
        window.location.href = data.url;
      } else {
        throw new Error(uiCopy.payment.genericError);
      }
    } catch (err: any) {
      addToast(getErrorMessage(err, uiCopy.payment.genericError), 'error');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutPlanId = searchParams.get('checkoutPlanId');
    const checkoutPlanName = searchParams.get('checkoutPlanName');
    
    if (checkoutPlanId && checkoutPlanName) {
      navigate('/settings/billing');
      handlePlanSelected({ id: Number(checkoutPlanId), name: checkoutPlanName, amount: 0 });
      window.history.replaceState(null, '', '/settings');
    }
  }, [navigate]);

  if (!user) return null;

  const currentPlanLabel = user?.plan || uiCopy.account.noPlanActive;

  return (
    <PageWrapper>
      <div className="h-[100dvh] flex flex-col px-[clamp(1rem,4vw,3rem)] pt-[clamp(5rem,10vh,8rem)] pb-[clamp(1.5rem,4vh,3rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-[clamp(2rem,5vw,6rem)] flex-1 min-h-0 items-stretch">
          
          <aside className="lg:h-full flex flex-col">
            <SettingsSidebar 
                activeSection={activeSection}
                onSectionChange={(section) => navigate(section === 'profile' ? '/settings' : `/settings/${section}`)}
                onLogout={handleLogout}
                onBack={() => navigate('/dashboard')}
                userName={user.name}
            />
          </aside>

          {/* Unified Studio Deck Surface */}
          <main className="min-w-0 h-full min-h-0">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card-elite bg-primary/[0.01] border-primary/[0.06] overflow-hidden relative h-full flex flex-col"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.06] blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/[0.03] blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

                <div className="p-[clamp(2rem,4vw,4rem)] flex-1 flex flex-col min-h-0 relative z-10">
                    
                    {/* 01 / PROFILE */}
                    {activeSection === 'profile' && (
                        <SettingsSection 
                            id="profile" 
                            number="01 / CONTA" 
                            title="Quem Está por Trás do Amor"
                            description="Suas informações de identidade e acesso ao seu espaço de memórias."
                        >
                            <div className="divide-y divide-primary/[0.06] border-t border-b border-primary/[0.06]">
                                <div className="py-[clamp(1.5rem,4vh,3rem)] flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors hover:bg-primary/[0.02] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">Como te chamamos</p>
                                        <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white tracking-tight">{user.name}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest font-mono border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/[0.05]">Perfil Verificado</span>
                                </div>

                                <div className="py-[clamp(1.5rem,4vh,3rem)] flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors hover:bg-primary/[0.02] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">Seu email de acesso</p>
                                        <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white tracking-tight">{user.email}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest font-mono border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/[0.05]">Canal Protegido</span>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {/* 02 / BILLING */}
                    {activeSection === 'billing' && (
                        <SettingsSection 
                            id="billing" 
                            number="02 / ASSINATURA" 
                            title="Eternize Seu Amor"
                            description="Escolha o nível de acesso e desbloqueie todo o potencial da sua cápsula do tempo."
                        >
                            <div className="space-y-[clamp(1rem,3vh,2rem)] h-full overflow-y-auto custom-scrollbar pr-2">
                                {isPlansLoading && plans.length === 0 ? (
                                  <div className="min-h-[24rem] flex items-center justify-center">
                                    <LoadingSpinner />
                                  </div>
                                ) : null}
                                {/* Current Plan */}
                                <div className="flex items-center justify-between p-[clamp(1.5rem,4vw,3rem)] rounded-[clamp(2rem,4vw,3rem)] bg-gradient-to-br from-primary/[0.06] to-amber-500/[0.02] border border-primary/20 group overflow-hidden relative shrink-0">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                                    <div className="space-y-2 relative z-10">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono">Seu plano atual</p>
                                        <h4 className="text-[clamp(2rem,5vw,4rem)] font-black text-white tracking-tighter uppercase leading-none">{currentPlanLabel}</h4>
                                        <p className="text-[clamp(1rem,1.3vw,1.4rem)] font-cursive text-primary/70 lowercase italic">guardando seus momentos com carinho...</p>
                                    </div>
                                    <div className="relative z-10 p-[clamp(1rem,2vw,1.5rem)] rounded-full bg-primary/10 border border-primary/20 transition-transform duration-700 group-hover:scale-110 shadow-[0_0_30px_rgba(255,45,85,0.2)]">
                                        <Sparkles className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-primary" />
                                    </div>
                                </div>

                                {/* Plan Selection */}
                                <div id="pricing-section" className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono whitespace-nowrap">Escolha seu nível</p>
                                        <div className="h-[1px] flex-grow bg-primary/10" />
                                    </div>
                                    <div className="w-full">
                                        <PricingSection
                                            plans={plans}
                                            currentPlan={user?.plan}
                                            onPlanSelect={handlePlanSelected}
                                            variant="compact"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {/* 03 / SECURITY */}
                    {activeSection === 'security' && (
                        <SettingsSection 
                            id="security" 
                            number="03 / SEGURANÇA" 
                            title="Proteção da Sua Conta"
                            description="Controle sua sessão e mantenha sua história em segurança."
                        >
                            <div className="divide-y divide-primary/[0.06] border-t border-b border-primary/[0.06]">
                                <div className="py-[clamp(2rem,6vh,4rem)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group transition-colors hover:bg-red-500/[0.01] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-2">
                                        <h4 className="text-[clamp(1.1rem,2vw,1.5rem)] font-black text-white uppercase tracking-tight">Sessão Ativa</h4>
                                        <p className="text-[clamp(12px,1.3vw,15px)] text-slate-500 max-w-md leading-relaxed">Encerre sua sessão atual neste dispositivo. Sua história continua salva e protegida.</p>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="shrink-0 py-[clamp(0.75rem,1.5vw,1rem)] px-[clamp(1.5rem,3vw,2.5rem)] rounded-xl border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[clamp(9px,1vw,11px)] transition-all hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300"
                                    >
                                        Encerrar Sessão
                                    </button>
                                </div>
                            </div>
                        </SettingsSection>
                    )}
                </div>
            </motion.div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SettingsPage;
