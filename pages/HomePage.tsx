import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import CounterDemo from '../components/CounterDemo';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import SocialProofSection from '../components/SocialProofSection';
import FAQSection from '../components/FAQSection';
import FinalCTASection from '../components/FinalCTASection'; // Import the new component
import PricingSection from '../components/PricingSection';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMpPublicKey, fetchAllPlans } from '../utils/api';
import type { PlanFromDB } from '../types';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { navigate } = useNavigate();
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanFromDB[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [key, fetchedPlans] = await Promise.all([
        getMpPublicKey(),
        fetchAllPlans()
      ]);
      setMpPublicKey(key);
      if (fetchedPlans) {
        setPlans(fetchedPlans);
      }
    };
    fetchInitialData();

    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handlePlanSelected = () => {
    // On the homepage, we always redirect to register
    navigate('/register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
          <HeroSection />
      </div>
      
      <FeaturesSection />

      <HowItWorksSection />

      <section id="demo" className="relative z-10 scroll-mt-20 py-16 sm:py-20">
          {/* Section Header for CounterDemo */}
          <div className="text-center max-w-3xl mx-auto mb-12 px-4 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Teste ao Vivo: Crie sua Própria <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Prévia</span>
              </h2>
              <p className="text-slate-300 mt-4 text-lg">
                  Experimente agora mesmo como é fácil e divertido criar sua história de amor.
              </p>
          </div>
          <CounterDemo isDashboard={false} planFeatures={null} />
      </section>
      
      <SocialProofSection />

      {/* New FAQ Section Added */}
      <FAQSection />

      <PricingSection 
          id="pricing" 
          plans={plans} 
          mpPublicKey={mpPublicKey} 
          onPlanSelect={handlePlanSelected} 
      />
      
      <FinalCTASection />
    </>
  );
};

export default HomePage;