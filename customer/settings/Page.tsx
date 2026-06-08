import React from 'react';
import { useState, useEffect } from 'react';
import PricingSection from '@/shared/pricing/PricingSection';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { ArrowLeftIcon } from '@/shared/ui/icons/ArrowLeftIcon';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner'; // Adicionado: Import do LoadingSpinner
import { getMpPublicKey, fetchAllPlans } from '@/shared/lib/pricing';
import TransparentCheckoutForm from './components/TransparentCheckoutForm';
import { useNotification } from '@/app/providers/NotificationProvider';
import { supabase } from '@/shared/lib/supabase';
import type { PlanFromDB } from '@/types';
import BottomNavBar from '@/shared/ui/BottomNavBar';
import { getApiErrorMessage, getErrorMessage, getPayloadErrorMessage, logError } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';

const SettingsPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanFromDB[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ id: number; name: string; amount: number } | null>(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [key, fetchedPlans] = await Promise.all([
          getMpPublicKey(),
          fetchAllPlans()
        ]);
        setMpPublicKey(key);
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

    // Check if the URL hash points to the pricing section and scroll to it
    if (window.location.hash.includes('pricing-section')) {
      const element = document.getElementById('pricing-section');
      if (element) {
        // Use a timeout to ensure the element is rendered before scrolling
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
        body: { planId: plan.id, planName: plan.name }, // Initial call to determine flow
      });

      if (error) throw new Error(getApiErrorMessage(error, data, uiCopy.payment.genericError));

      const responseMessage = getPayloadErrorMessage(data, '');
      if (responseMessage) {
        throw new Error(responseMessage);
      }

      if (data?.init_point) {
        addToast(uiCopy.payment.redirectingCheckout, 'info'); // Show message only for redirect
        window.location.href = data.init_point; // Redirect for Checkout Pro
      } else if (data?.flow === 'transparent') {
        // No message needed for transparent flow, modal opens directly
        setSelectedPlanDetails(plan); // Open modal for Transparent Checkout
        setIsCheckoutModalOpen(true);
      } else {
        throw new Error(uiCopy.payment.genericError);
      }
    } catch (err: any) {
      const message = getErrorMessage(err, uiCopy.payment.genericError);
      addToast(message, 'error');
      logError('customer/settings/Page.handlePlanSelected', err, { planId: plan.id, planName: plan.name });
    }
  };

  const handlePaymentSuccess = async (formData: any) => {
    addToast(uiCopy.payment.processing, 'info');
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { // Second call with full data for transparent checkout
          planId: formData.planId,
          planName: formData.planName,
          cardToken: formData.cardToken,
          paymentMethodId: formData.paymentMethodId,
        },
      });

      if (error) throw new Error(getApiErrorMessage(error, data, uiCopy.payment.genericError));

      const responseMessage = getPayloadErrorMessage(data, '');
      if (responseMessage) {
        throw new Error(responseMessage);
      }

      addToast(data?.message || uiCopy.payment.successToast, 'success');
      setIsCheckoutModalOpen(false);
      await refreshUser();

    } catch (err: any) {
      handlePaymentError(err);
    }
  };

  const handlePaymentError = (error: any) => {
    const message = getErrorMessage(error, uiCopy.payment.genericError);
    addToast(message, 'error');
  };

  if (!user) {
    return null; // Redirect logic in App.tsx will handle this
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </PageWrapper>
    );
  }

  const backgroundImageUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <div className="min-h-screen flex flex-col text-white relative">
        <main className="flex-grow container mx-auto py-8 md:py-12 z-10 pb-20 md:pb-12">
          <PageWrapper>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 hidden md:flex animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-slate-300 font-semibold hover:text-white transition-colors duration-300 group"
                >
                  <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span>{uiCopy.navigation.backToDashboard}</span>
                </button>
              </div>

              <div className="text-center mb-12 animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  {uiCopy.account.title}
                </h1>
                <p className="text-slate-300 mt-2 text-base sm:text-lg">
                  {uiCopy.account.description}
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8 border border-white/20 animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}>
                <h2 className="text-2xl font-bold text-white mb-6">{uiCopy.account.detailsTitle}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{uiCopy.account.currentPlanLabel}</p>
                    <p className="text-lg font-bold text-pink-400">{user?.plan || uiCopy.account.noPlanActive}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{uiCopy.account.nameLabel}</p>
                    <p className="text-lg text-white">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{uiCopy.account.emailLabel}</p>
                    <p className="text-lg text-white">{user.email}</p>
                  </div>
                </div>
                <div className="border-t my-8 border-white/20"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto border border-red-500 text-red-400 font-semibold py-2 px-6 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors duration-300"
                  >
                  {uiCopy.account.logout}
                  </button>
              </div>
              
              <div className="animate-fade-in-slide-up" style={{ animationDelay: '400ms' }}>
                <PricingSection 
                  id="pricing-section" 
                  plans={plans}
                  currentPlan={user?.plan} 
                  onPlanSelect={handlePlanSelected} 
                  mpPublicKey={mpPublicKey} 
                />
              </div>

            </div>
          </PageWrapper>
        </main>
        <BottomNavBar onMenuOpen={() => {}} onLogoutRequest={logout} />

        {isCheckoutModalOpen && selectedPlanDetails && mpPublicKey && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white text-3xl"
              >
                &times;
              </button>
              <TransparentCheckoutForm
                publicKey={mpPublicKey}
                planId={selectedPlanDetails.id}
                planName={selectedPlanDetails.name}
                amount={selectedPlanDetails.amount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default SettingsPage;
