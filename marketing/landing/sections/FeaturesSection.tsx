import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Image, Music, ArrowRight } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteButton from '@/shared/ui/EliteButton';


interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="card-elite p-8 flex flex-col items-center text-center group h-full"
  >
    <div className="mb-6 p-4 rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm font-medium leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="features" className="section-fluid relative overflow-visible">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 overflow-visible container-fluid">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            Recursos Premium
          </span>
          <h2 className="font-black text-white leading-[0.9] tracking-tighter mb-8">
            {uiCopy.marketing.features.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.marketing.features.titleHighlight}
            </span>
          </h2>
          <p className="text-slate-400 text-fluid-body font-medium max-w-2xl mx-auto">
            {uiCopy.marketing.features.description}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-stretch mt-12">
          {uiCopy.marketing.features.cards.map((card, index) => (
            <div key={card.title} className="w-full h-auto">
              <FeatureCard 
                index={index}
                icon={
                  index === 0 ? <Clock className="w-6 h-6 md:w-8 md:h-8" /> : 
                  index === 1 ? <Image className="w-6 h-6 md:w-8 md:h-8" /> : 
                  <Music className="w-6 h-6 md:w-8 md:h-8" />
                }
                title={card.title}
                description={card.description}
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
          <EliteButton variant="secondary" 
            onClick={handleScrollToDemo}
             className="group"
          >
            {uiCopy.marketing.features.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </EliteButton>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
