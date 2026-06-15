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
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<PlanFromDB[]>([]);
  const [activeSection, setActiveSection] = useState('profile');

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
      setActiveSection('billing');
      setTimeout(() => {
        const element = document.getElementById('pricing-section');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
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

  if (!user) return null;
  if (isLoading) return <div className="flex items-center justify-center py-32"><LoadingSpinner /></div>;

  const currentPlanLabel = user?.plan || uiCopy.account.noPlanActive;

  return (
    <PageWrapper>
      <div className="container-fluid py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-[clamp(4rem,10vw,10rem)] items-start">
          
          {/* Instrumental Sidebar - Even More Minimalist */}
          <aside className="lg:sticky lg:top-32 h-auto lg:h-[calc(100vh-16rem)]">
            <SettingsSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onLogout={handleLogout}
                onBack={() => navigate('/dashboard')}
                userName={user.name}
            />
          </aside>

          {/* Unified Studio Deck Surface */}
          <main className="min-w-0">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card-elite bg-white/[0.01] border-white/5 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

                <div className="p-8 md:p-12 lg:p-16 space-y-24 relative z-10">
                    
                    {/* 01 / PROFILE */}
                    {activeSection === 'profile' && (
                        <SettingsSection 
                            id="profile" 
                            number="01 / ACCOUNT" 
                            title="Perfil do Proprietário"
                            description="Informações de identidade técnica e credenciais de acesso ao estúdio."
                        >
                            <div className="divide-y divide-white/5 border-t border-b border-white/5">
                                <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors hover:bg-white/[0.01] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">Display Name</p>
                                        <p className="text-xl font-bold text-white tracking-tight">{user.name}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono border border-white/5 px-3 py-1.5 rounded-lg bg-white/[0.02]">Verified Profile</span>
                                </div>

                                <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors hover:bg-white/[0.01] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">System Identifier</p>
                                        <p className="text-xl font-bold text-white tracking-tight">{user.email}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono border border-white/5 px-3 py-1.5 rounded-lg bg-white/[0.02]">Protected Channel</span>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {/* 02 / BILLING */}
                    {activeSection === 'billing' && (
                        <SettingsSection 
                            id="billing" 
                            number="02 / BILLING" 
                            title="Nível de Assinatura"
                            description="Gestão de tier técnica e capacidades do estúdio de criação."
                        >
                            <div className="space-y-16">
                                {/* Current Tier Snapshot */}
                                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                                    <div className="space-y-2 relative z-10">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono">Current Active Tier</p>
                                        <h4 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{currentPlanLabel}</h4>
                                    </div>
                                    <div className="relative z-10 p-5 rounded-full bg-white/5 border border-white/10 transition-transform duration-700 group-hover:scale-110">
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    </div>
                                </div>

                                {/* Tier Selection Terminal */}
                                <div id="pricing-section" className="space-y-10">
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono whitespace-nowrap">Tier Matrix Selection</p>
                                        <div className="h-[1px] flex-grow bg-white/5" />
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
                            number="03 / SECURITY" 
                            title="Segurança de Sistema"
                            description="Controles de sessão e integridade da conta proprietária."
                        >
                            <div className="divide-y divide-white/5 border-t border-b border-white/5">
                                <div className="py-12 flex items-center justify-between group transition-colors hover:bg-red-500/[0.01] px-4 -mx-4 rounded-xl">
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Sessão Ativa</h4>
                                        <p className="text-sm text-slate-500 max-w-md">Encerre sua sessão atual e limpe os tokens de autenticação local.</p>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="py-4 px-10 rounded-xl border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-red-500/10 hover:border-red-500/30"
                                    >
                                        Encerrar Estúdio
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
