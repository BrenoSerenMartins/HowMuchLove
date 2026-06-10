import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Settings, 
  LogOut, 
  LogIn, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { uiCopy } from '@/shared/lib/ui-copy';

interface BottomNavBarProps {
  onMenuOpen: () => void;
  onLogoutRequest: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onLogoutRequest }) => {
  const { user } = useAuth();
  const { navigate, route } = useNavigate();

  const handleScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loggedOutItems = [
    { path: '/login', label: uiCopy.navigation.login, icon: <LogIn className="w-5 h-5" /> },
    { action: () => handleScrollTo('demo'), label: uiCopy.navigation.demo, icon: <Sparkles className="w-5 h-5" /> },
  ];

  const loggedInItems = [
    { path: '/dashboard', label: uiCopy.navigation.story, icon: <Heart className="w-5 h-5" /> },
    { path: '/settings', label: uiCopy.navigation.account, icon: <Settings className="w-5 h-5" /> },
    { action: onLogoutRequest, label: uiCopy.navigation.logout, icon: <LogOut className="w-5 h-5" /> },
  ];

  const navItems = user ? loggedInItems : loggedOutItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-primary/5 blur-2xl -z-10" />
      
      <div className="bg-black/60 backdrop-blur-3xl border-t border-white/[0.08] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-6 pb-6 pt-3">
        <div className="flex justify-around items-center gap-2">
          {navItems.map((item) => {
            const isActive = route === item.path;
            return (
              <button
                key={item.label}
                onClick={() => (item.path ? navigate(item.path) : item.action?.())}
                className="relative flex flex-col items-center justify-center py-2 transition-all duration-300 w-full group focus:outline-none"
              >
                {isActive && (
                    <motion.div 
                        layoutId="bottom-nav-indicator"
                        className="absolute -top-3 w-10 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,45,85,0.8)]"
                    />
                )}
                
                <div className={`transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-500 group-hover:text-white'}`}>
                    {item.icon}
                </div>
                
                <span className={`mt-2 text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'
                }`}>
                    {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
