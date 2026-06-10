import React from 'react';
import { useNavigate } from '@/app/hooks/useNavigate';
import PageWrapper from '@/shared/ui/PageWrapper';
import Header from '@/shared/ui/Header';
import Footer from '@/shared/ui/Footer';
import { uiCopy } from '@/shared/lib/ui-copy';

const PaymentFailurePage: React.FC = () => {
  const { navigate } = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-100 to-orange-100 overscroll-none">
      <Header />
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            {/* Replace with your actual ErrorIcon component or SVG */}
            <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold text-red-700 mb-4">{uiCopy.payment.failureTitle}</h1>
          <p className="text-lg text-slate-700 mb-8 max-w-md">
            {uiCopy.payment.failureDescription}
          </p>
          <button
            onClick={() => navigate('/settings#pricing-section')}
            className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            {uiCopy.payment.failureButton}
          </button>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default PaymentFailurePage;
