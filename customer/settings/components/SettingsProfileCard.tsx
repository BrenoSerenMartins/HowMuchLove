import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Sparkles, UserRound } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

const SettingsProfileCard: React.FC<{
  planName?: string | null;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}> = ({ planName, userName, userEmail, onLogout }) => {
  const currentPlanLabel = planName || uiCopy.account.noPlanActive;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card-elite relative overflow-hidden border border-white/10 bg-white/[0.03] p-6 sm:p-8 xl:sticky xl:top-28"
    >
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Conta ativa
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-slate-300">
            Plano atual
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black tracking-tight text-white leading-none">
            Seus dados e assinatura
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Gerencie suas informações de acesso e acompanhe o plano que está associado à sua conta.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
              Plano
            </p>
            <p className="mt-2 text-lg font-bold text-primary">
              {currentPlanLabel}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
              <UserRound className="h-3.5 w-3.5 text-primary" />
              Nome
            </div>
            <p className="text-sm font-semibold text-white/90">
              {userName}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
              <Mail className="h-3.5 w-3.5 text-primary" />
              E-mail
            </div>
            <p className="break-all text-sm font-semibold text-white/90">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
            Segurança
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Suas informações ficam sincronizadas com a conta e o plano é atualizado automaticamente quando a cobrança é confirmada.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="btn-secondary group w-full justify-center !border-red-400/30 !bg-red-500/10 !text-red-200 hover:!bg-red-500/15"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {uiCopy.account.logout}
        </button>
      </div>
    </motion.aside>
  );
};

export default SettingsProfileCard;
