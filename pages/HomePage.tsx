import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CounterDemo from '../components/CounterDemo';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMpPublicKey } from '../utils/api';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { navigate } = useNavigate();
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchKey = async () => {
      const key = await getMpPublicKey();
      setMpPublicKey(key);
    };
    fetchKey();

    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  // If the user is logged in, the useEffect hook will redirect them to the dashboard.
  // We render a loading spinner here to prevent a "flash" of the homepage content
  // before the redirect happens.
  if (user) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-animated-lights lights-container overscroll-none">
      <Header />
      <main className="flex-grow">
        <PageWrapper>
          <div className="container mx-auto px-4">
            <HeroSection />
          </div>
          <section id="demo" className="-mt-36 md:-mt-40 relative z-10 scroll-mt-20">
              <CounterDemo isDashboard={false} />
          </section>
          <div className="container mx-auto px-4">
            <PricingSection id="pricing" mpPublicKey={mpPublicKey} />
          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;