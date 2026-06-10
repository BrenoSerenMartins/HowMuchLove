import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

const HeroSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center text-center relative overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(400px,60vw,900px)] h-[clamp(400px,60vw,900px)] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0 animate-glow-pulse" />

      <motion.div
        initial="initial"
        animate="animate"
        className="relative z-10 w-full container-fluid py-20"
      >
        <motion.div 
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[clamp(10px,0.8vw,12px)] font-black uppercase tracking-[0.4em] text-slate-300 font-mono">
            {uiCopy.marketing.hero.titleHighlight}
          </span>
        </motion.div>

        <motion.h1 
          variants={{
            ...fadeInUp,
            transition: { ...fadeInUp.transition, delay: 0.1 }
          }}
          className="font-black leading-[0.85] text-white mb-12 tracking-tighter"
        >
          {uiCopy.marketing.hero.titleLead} <br/>
          <span className="text-primary italic font-cursive lowercase tracking-normal px-4">
            {uiCopy.marketing.hero.titleHighlight}
          </span>
        </motion.h1>

        <motion.p 
          variants={{
            ...fadeInUp,
            transition: { ...fadeInUp.transition, delay: 0.2 }
          }}
          className="text-fluid-body text-slate-400 max-w-[clamp(30rem,50vw,50rem)] mx-auto mb-16 font-medium leading-relaxed"
        >
          {uiCopy.marketing.hero.description}
        </motion.p>

        <motion.div
          variants={{
            ...fadeInUp,
            transition: { ...fadeInUp.transition, delay: 0.3 }
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button 
            onClick={handleScrollToDemo}
            className="btn-primary !py-5 !px-12 !text-xs group"
          >
            {uiCopy.marketing.hero.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-surface-black flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover opacity-80" />
              </div>
            ))}
            <div className="pl-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">+1.200 casais</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">criando memórias</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
