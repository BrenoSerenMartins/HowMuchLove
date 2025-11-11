import React from 'react';
import { useNavigate } from '../hooks/useNavigate';
import PageWrapper from '../components/PageWrapper';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentPendingPage: React.FC = () => {
  const { navigate } = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-100 to-orange-100 overscroll-none">
      <Header />
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            {/* Replace with a pending/hourglass icon */}
            <svg className="w-24 h-24 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold text-yellow-700 mb-4">Pagamento Pendente</h1>
          <p className="text-lg text-slate-700 mb-8 max-w-md">
            Seu pagamento está aguardando aprovação. Assim que for confirmado, seu plano será atualizado automaticamente.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
          >
            Ir para o Painel
          </button>
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default PaymentPendingPage;