import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import PageWrapper from '../components/PageWrapper';

const SettingsPage: React.FC = () => {
  const { user, logout, simulatePlan } = useAuth();
  const { navigate } = useNavigate();
  
  useEffect(() => {
    // Force disable overscroll for this page specifically
    const style = document.createElement('style');
    style.innerHTML = `html, body { overscroll-behavior: none !important; }`;
    document.head.appendChild(style);

    // Check if the URL hash points to the pricing section and scroll to it
    if (window.location.hash.includes('pricing-section')) {
      const element = document.getElementById('pricing-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Cleanup function to remove the style when the component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handlePlanChange = (planName: string) => {
    simulatePlan(planName);
  };

  if (!user) {
    return null; // Redirect logic in App.tsx will handle this
  }

  return (
    <div className="min-h-screen flex flex-col bg-rose-50 overscroll-none">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <PageWrapper>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-slate-600 font-semibold hover:text-pink-500 transition-colors duration-300 group"
              >
                <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>Voltar ao Painel</span>
              </button>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
                Configurações da Conta
              </h1>
              <p className="text-slate-600 mt-2 text-base sm:text-lg">
                Gerencie suas informações e seu plano.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Plano Atual</p>
                  <p className="text-lg font-bold text-pink-600">{user?.plan || 'Nenhum plano ativo'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Nome</p>
                  <p className="text-lg text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-lg text-slate-900">{user.email}</p>
                </div>
              </div>
              <div className="border-t my-8 border-slate-200"></div>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto border-2 border-red-500 text-red-500 font-semibold py-2 px-6 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                >
                  Sair da Conta
                </button>
            </div>
            
            <PricingSection id="pricing-section" className="scroll-mt-24" currentPlan={user?.plan} onPlanChange={handlePlanChange} />

          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;