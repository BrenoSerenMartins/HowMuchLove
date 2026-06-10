import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import { GearIcon } from './icons/GearIcon';
import { uiCopy } from '@/shared/lib/ui-copy';

const PlanBadge: React.FC<{ planName: string }> = ({ planName }) => {
  let styles = '';

  switch (planName) {
    case 'Sonho':
      styles = 'bg-primary/20 text-primary ring-1 ring-inset ring-primary/30';
      break;
    case 'Eterno':
      styles = 'bg-primary text-white shadow-[0_0_15px_rgba(255,45,85,0.4)]';
      break;
    case 'Infinito':
      styles = 'bg-gradient-to-r from-purple-500 to-primary text-white font-black shadow-[0_0_20px_rgba(255,45,85,0.5)]';
      break;
    default:
      styles = 'bg-white/10 text-slate-300 ring-1 ring-inset ring-white/10';
      break;
  }

  return (
    <span className={`ml-2 sm:ml-3 px-2 sm:px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none ${styles} font-mono`}>
      {planName || 'Gratis'}
    </span>
  );
};

interface HeaderProps {
  handleScrollTo?: (id: string) => void;
  onLogoutRequest?: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleScrollTo: handleScrollToProp, onLogoutRequest }) => {
  const { user, performLogout } = useAuth();
  const { navigate, route } = useNavigate();

  const handleScrollTo = handleScrollToProp ?? ((_id: string) => {});
  const isHomePage = route === '/';
  const handleLogout = onLogoutRequest ?? performLogout;

  const navLinks = [
    { label: uiCopy.navigation.features, id: 'features' },
    { label: uiCopy.navigation.howItWorks, id: 'how-it-works' },
    { label: uiCopy.navigation.testimonials, id: 'testimonials' },
    { label: uiCopy.navigation.pricing, id: 'pricing' },
  ];

  return (
    <header className="fixed top-8 left-0 right-0 z-50 px-6 md:px-12 pointer-events-none">
      <div className="max-w-fluid mx-auto flex justify-center lg:justify-between items-center gap-6">
        {/* Brand Capsule */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-full px-6 py-2.5 flex items-center shadow-2xl pointer-events-auto group transition-all hover:bg-white/[0.05] hover:border-white/10">
            <button onClick={() => navigate('/')} className="focus:outline-none transition-transform hover:scale-105 active:scale-95">
              <img
                src="/images/logo.avif"
                alt="HowMuchLove Logo"
                className="max-h-4 md:max-h-5 w-auto brightness-125 opacity-80 group-hover:opacity-100 transition-opacity"
                fetchpriority="high"
                width="400"
                height="66"
              />
            </button>
            {user && <PlanBadge planName={user.plan} />}
        </div>

        {/* Desktop Navigation - Light Capsule */}
        <div className="hidden lg:flex items-center gap-10 bg-white/[0.02] backdrop-blur-2xl px-10 py-3 rounded-full border border-white/[0.05] shadow-2xl pointer-events-auto">
          {isHomePage && navLinks.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleScrollTo(link.id)} 
              className="text-slate-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.3em] opacity-70 hover:opacity-100"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Actions Capsule */}
        <div className="hidden lg:flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl px-4 py-2 rounded-full border border-white/[0.05] shadow-2xl pointer-events-auto">
          {user ? (
            <>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-slate-400 hover:text-white transition-all p-2 rounded-full hover:bg-white/5"
                  aria-label={uiCopy.navigation.settingsAriaLabel}
                >
                  <GearIcon className="w-4 h-4" />
                </button>
              <button
                onClick={handleLogout}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white px-4 py-2 transition-all"
              >
                {uiCopy.navigation.logout}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white px-4 py-2 transition-all"
              >
                {uiCopy.navigation.login}
              </button>
              <button
                onClick={() => isHomePage ? handleScrollTo('pricing') : navigate('/#pricing')}
                className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,45,85,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                {uiCopy.navigation.viewPlans}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
