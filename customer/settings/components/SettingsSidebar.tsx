import React from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Shield, LogOut, ArrowLeft } from 'lucide-react';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  onBack: () => void;
  userName: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
  onBack,
  userName,
}) => {
  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'billing', label: 'Assinatura', icon: CreditCard },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full space-y-12">
      {/* Navigation Header */}
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-xl bg-primary/[0.05] border border-primary/10 group-hover:border-primary/20 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Voltar</span>
        </button>

        <div className="px-2">
            <p className="text-[clamp(1rem,1.2vw,1.3rem)] font-cursive text-primary/70 lowercase italic mb-1">olá,</p>
            <h2 className="text-[clamp(1.25rem,2vw,1.75rem)] font-black text-white tracking-tighter uppercase">{userName}</h2>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
              activeSection === item.id
                ? 'bg-primary/[0.08] border border-primary/20 text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-primary/[0.03]'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-primary' : ''}`} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] font-mono">{item.label}</span>
            {activeSection === item.id && (
              <motion.div
                layoutId="active-indicator"
                className="ml-auto w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(255,45,85,0.6)]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto pt-8 border-t border-primary/[0.06]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-600 hover:text-red-400 transition-colors group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] font-mono">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
