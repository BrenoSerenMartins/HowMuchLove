import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { GearIcon } from './icons/GearIcon';
import { uiCopy } from '@/shared/lib/ui-copy';

// --- New Icons for loggedOutItems ---
const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5.5c.58 0 1.13.2 1.55.55L20.5 11.25a2.25 2.25 0 010 3.18l-6.75 6.75a2.25 2.25 0 01-3.18 0L3.55 12.5a2.25 2.25 0 01-.55-1.55V7a4 4 0 014-4z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
  </svg>
);
// --- End New Icons ---


interface BottomNavBarProps {
  onMenuOpen: () => void;
  onLogoutRequest: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onMenuOpen, onLogoutRequest }) => {
  const { user } = useAuth();
  const { navigate, route } = useNavigate();

  const handleScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loggedOutItems = [
    { path: '/login', label: uiCopy.navigation.login, icon: <ArrowRightOnRectangleIcon className="w-5 h-5" /> },
    { action: () => handleScrollTo('pricing'), label: uiCopy.navigation.plans, icon: <TagIcon className="w-5 h-5" /> },
    { action: () => handleScrollTo('demo'), label: uiCopy.navigation.demo, icon: <SparklesIcon className="w-5 h-5" /> },
  ];

  const loggedInItems = [
    { path: '/dashboard', label: uiCopy.navigation.story, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> },
    { path: '/settings', label: uiCopy.navigation.account, icon: <GearIcon className="w-5 h-5" /> },
    { action: onLogoutRequest, label: uiCopy.navigation.logout, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> },
  ];

  const navItems = user ? loggedInItems : loggedOutItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-black/50 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.2)]">
        <div className="container mx-auto px-2 h-14 flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => (item.path ? navigate(item.path) : item.action?.())}
              className={`flex flex-col items-center justify-center text-[11px] font-medium transition-colors duration-200 w-full h-full rounded-lg focus:outline-none ${
                route === item.path ? 'text-pink-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
