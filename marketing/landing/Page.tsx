import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './sections/HeroSection';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import SocialProofSection from './sections/SocialProofSection';
import FAQSection from './sections/FAQSection';
import FinalCTASection from './sections/FinalCTASection';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { uiCopy } from '@/shared/lib/ui-copy';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { navigate } = useNavigate();

  React.useEffect(() => {
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

  if (user) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      
      <FeaturesSection />

      <HowItWorksSection />

      <section id="demo" className="relative z-10 scroll-mt-20 py-24">
          {/* Section Header for CounterDemo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 px-4"
          >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">
                Demonstração Ao Vivo
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter mb-6">
                  {uiCopy.marketing.demo.titleLead}{' '}
                  <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
                    {uiCopy.marketing.demo.titleHighlight}
                  </span>
              </h2>
              <p className="text-slate-400 mt-4 text-lg font-medium">
                  {uiCopy.marketing.demo.description}
              </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="card-elite max-w-5xl mx-auto p-4 sm:p-8"
          >
            <CounterDemo isDashboard={false} planFeatures={null} />
          </motion.div>
      </section>
      
      <SocialProofSection />

      {/* New FAQ Section Added */}
      <FAQSection />

      <FinalCTASection />
    </>
  );
};

export default HomePage;
