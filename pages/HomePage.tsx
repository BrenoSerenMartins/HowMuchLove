import React, { useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CounterDemo from '../components/CounterDemo';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { navigate } = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  // While the auth state is loading, we can show a spinner or a blank page
  // to prevent a flash of the homepage before redirection.
  if (isLoading || user) {
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
          <HeroSection />
          <div className="container mx-auto px-4">
            <section id="demo" className="-mt-36 md:-mt-40 relative z-10 scroll-mt-20">
                <CounterDemo isDashboard={false} />
            </section>
            <PricingSection id="pricing" />
          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;