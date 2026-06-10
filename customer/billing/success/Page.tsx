import React, { useEffect } from 'react';
import { useNavigate } from '@/app/hooks/useNavigate';
import { useNotification } from '@/app/providers/NotificationProvider';
import { useAuth } from '@/app/hooks/useAuth';
import PageWrapper from '@/shared/ui/PageWrapper';
import Header from '@/shared/ui/Header';
import Footer from '@/shared/ui/Footer';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import { uiCopy } from '@/shared/lib/ui-copy';

const PaymentSuccessPage: React.FC = () => {
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;
    addToast(uiCopy.payment.successToast, 'success');
    const syncProfile = async () => {
      if (cancelled) return;
      await refreshUser();
    };

    const syncTimer = setInterval(syncProfile, 1000);
    syncProfile();

    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000); // Redirect after 5 seconds
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(syncTimer);
    };
  }, [addToast, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 to-purple-100 overscroll-none">
      <Header />
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            <CheckIcon className="w-24 h-24 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-4">{uiCopy.payment.successTitle}</h1>
          <p className="text-lg text-slate-700 mb-8 max-w-md">
            {uiCopy.payment.successDescription}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition-colors"
          >
            {uiCopy.payment.successButton}
          </button>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
