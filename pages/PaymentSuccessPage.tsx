import React, { useEffect } from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/PageWrapper';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckIcon from '../components/icons/CheckIcon';

const PaymentSuccessPage: React.FC = () => {
  const { navigate } = useNavigate();
  const { addToast } = useNotification();
  const { refreshUser } = useAuth();

  useEffect(() => {
    addToast('Pagamento aprovado! Seu plano foi atualizado.', 'success');
    refreshUser(); // Refresh user data to show updated plan
    // Optionally, redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000); // Redirect after 5 seconds
    return () => clearTimeout(timer);
  }, [addToast, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 to-purple-100 overscroll-none">
      <Header />
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            <CheckIcon className="w-24 h-24 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-4">Pagamento Aprovado!</h1>
          <p className="text-lg text-slate-700 mb-8 max-w-md">
            Sua compra foi realizada com sucesso. Seu plano foi atualizado e você já pode aproveitar todos os novos recursos.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition-colors"
          >
            Ir para o Painel
          </button>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;