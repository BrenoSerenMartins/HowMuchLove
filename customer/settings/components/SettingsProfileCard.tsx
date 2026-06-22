import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Sparkles, UserRound } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';
import EliteButton from '@/shared/ui/EliteButton';


const SettingsProfileCard: React.FC<{
  planName?: string | null;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}> = ({ planName, userName, userEmail, onLogout }) => {
  const currentPlanLabel = planName || uiCopy.account.noPlanActive;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      {/* Profile Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 font-mono">
           <UserRound className="w-4 h-4 text-primary/40" />
           Perfil do Proprietário
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
            {userName}
        </h2>
      </div>

      <div className="h-[1px] w-full bg-white/5" />

      {/* Info Grid */}
      <div className="space-y-8">
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono">Endereço de E-mail</p>
            <p className="text-sm font-semibold text-white/90 break-all">{userEmail}</p>
        </div>

        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono">Plano em Vigor</p>
            <div className="flex items-center gap-3">
                <p className="text-xl font-black text-primary uppercase tracking-tight">{currentPlanLabel}</p>
                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">Ativo</span>
            </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/5" />

      {/* Security & System */}
      <div className="space-y-6">
        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono mb-2">Segurança</p>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Seus dados estão protegidos por criptografia de ponta a ponta e sincronizados com a nuvem.
            </p>
        </div>

        <EliteButton variant="secondary"
          onClick={onLogout}
           className="group w-full justify-center !border-white/5 !bg-white/[0.02] !text-slate-400 hover:!text-white hover:!border-white/10"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {uiCopy.account.logout}
        </EliteButton>
      </div>
    </motion.div>
  );
};

export default SettingsProfileCard;
