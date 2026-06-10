import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

const FinalCTASection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-fluid relative overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(400px,60vw,800px)] h-[clamp(400px,60vw,800px)] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 container-fluid overflow-visible">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="card-elite max-w-7xl mx-auto p-12 md:p-24 lg:p-32 text-center relative overflow-visible"
        >
          {/* Decorative Sparkles */}
          <div className="absolute top-10 left-10 opacity-20">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-20">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-black text-white leading-[0.85] tracking-tighter mb-12"
          >
            {uiCopy.marketing.finalCta.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.marketing.finalCta.titleHighlight}
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-fluid-body text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            {uiCopy.marketing.finalCta.description}
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={handleScrollToDemo}
            className="btn-primary !py-6 !px-16 !text-sm group shadow-[0_0_30px_rgba(255,45,85,0.4)]"
          >
            {uiCopy.marketing.finalCta.cta}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
