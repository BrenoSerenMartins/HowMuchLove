import React from 'react';
import { motion } from 'framer-motion';
import { HeartCrack, ArrowLeft } from 'lucide-react';
import EliteButton from '@/shared/ui/EliteButton/index';
import { useNavigate } from '@/app/hooks/useNavigate';

const NotFoundPage: React.FC = () => {
  const { navigate } = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#050505] w-full">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(300px,50vw,600px)] h-[clamp(300px,50vw,600px)] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center max-w-lg mx-auto w-full"
      >
        <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,45,85,0.1)]">
          <HeartCrack className="w-10 h-10 text-primary/60" />
        </div>

        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white uppercase tracking-tighter leading-none mb-4">
          404
        </h1>
        
        <p className="text-[clamp(1.1rem,2vw,1.5rem)] font-cursive text-primary italic lowercase tracking-normal mb-6">
          cápsula não encontrada...
        </p>

        <p className="text-[clamp(12px,1.5vw,14px)] font-medium text-slate-400 leading-relaxed max-w-md mx-auto mb-10">
          Parece que o link que você tentou acessar expirou ou não existe. Se você estiver procurando por uma história de amor, verifique se o link está correto.
        </p>

        <EliteButton
          variant="primary"
          onClick={() => navigate('/')}
          size="lg"
          className="group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar para o Início
        </EliteButton>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
