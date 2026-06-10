import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

const HeroSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40, filter: 'blur(15px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <section className="h-[100dvh] w-full grid grid-rows-[1fr_auto_1fr] items-center text-center relative overflow-visible z-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(400px,60vw,900px)] h-[clamp(400px,60vw,900px)] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0 animate-glow-pulse" />

      {/* Top tier (empty) */}
      <div className="h-full" />

      {/* Middle tier (Content) */}
      <motion.div
        initial="initial"
        animate="animate"
        className="relative z-10 w-full container-fluid py-8 flex flex-col items-center"
      >
        <motion.h1 
          variants={fadeInUp}
          className="font-black leading-[0.82] text-white mb-6 tracking-tighter"
        >
          {uiCopy.marketing.hero.titleLead} <br/>
          <span className="text-primary italic font-cursive lowercase tracking-normal px-4">
            {uiCopy.marketing.hero.titleHighlight}
          </span>
        </motion.h1>

        <motion.p 
          variants={{
            ...fadeInUp,
            transition: { ...fadeInUp.transition, delay: 0.3 }
          }}
          className="text-fluid-body text-slate-400 max-w-[clamp(28rem,45vw,45rem)] mx-auto mb-10 font-medium leading-relaxed"
        >
          {uiCopy.marketing.hero.description}
        </motion.p>

        <motion.div
          variants={{
            ...fadeInUp,
            transition: { ...fadeInUp.transition, delay: 0.6 }
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
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

      {/* Bottom tier (Explore) */}
      <div className="h-full flex flex-col justify-end pb-10 items-center relative z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Role para explorar</span>
            <motion.div
              animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-[1px] h-10 bg-gradient-to-b from-primary via-primary/50 to-transparent"
            />
          </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
