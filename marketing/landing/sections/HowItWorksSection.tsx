import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Wand2, Share2, ArrowRight } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteButton from '@/shared/ui/EliteButton';


interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, icon, title, description, index }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="relative group h-full"
  >
    <div className="card-elite p-10 pt-16 flex flex-col items-center text-center h-full relative">
      <div className="absolute top-8 left-10 text-5xl font-black text-white/5 group-hover:text-primary/10 transition-colors duration-500">
        0{step}
      </div>
      <div className="mb-8 p-5 rounded-3xl bg-primary/10 text-primary transition-transform duration-700 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm font-medium leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const HowItWorksSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-it-works" className="section-fluid relative overflow-visible">
      {/* Background Decorative Element */}
      <div className="absolute bottom-1/2 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 container-fluid overflow-visible">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            Jornada Mágica
          </span>
          <h2 className="font-black text-white leading-[0.9] tracking-tighter mb-8">
            {uiCopy.marketing.howItWorks.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.marketing.howItWorks.titleHighlight}
            </span>
          </h2>
          <p className="text-slate-400 text-fluid-body font-medium max-w-2xl mx-auto">
            {uiCopy.marketing.howItWorks.description}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-stretch mt-12">
          {uiCopy.marketing.howItWorks.steps.map((step, index) => (
            <div key={step.title} className="w-full h-auto">
              <StepCard
                index={index}
                step={index + 1}
                icon={
                  index === 0 ? <UserPlus className="w-6 h-6 md:w-8 md:h-8" /> : 
                  index === 1 ? <Wand2 className="w-6 h-6 md:w-8 md:h-8" /> : 
                  <Share2 className="w-6 h-6 md:w-8 md:h-8" />
                }
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <EliteButton variant="primary" 
            onClick={handleScrollToDemo}
            size="lg"
            className="group"
          >
            {uiCopy.marketing.howItWorks.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </EliteButton>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
