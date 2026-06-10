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
    <header className="bg-black/40 backdrop-blur-2xl sticky top-0 z-30 border-b border-white/[0.05]">
      <div className="container-fluid py-6 flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={() => navigate('/')} className="focus:outline-none transition-transform hover:scale-105 active:scale-95">
              <img
                src="/images/logo.avif"
                alt="HowMuchLove Logo"
                className="max-h-5 sm:max-h-6 md:max-h-7 w-auto brightness-110"
                fetchpriority="high"
                width="400"
                height="66"
              />
            </button>
            {user && <PlanBadge planName={user.plan} />}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isHomePage && navLinks.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleScrollTo(link.id)} 
              className="text-slate-400 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-white/5"
                aria-label={uiCopy.navigation.settingsAriaLabel}
                >
                  <GearIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              <button
                onClick={handleLogout}
                className="btn-secondary !py-2.5 !px-6"
              >
                {uiCopy.navigation.logout}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary !py-2.5 !px-6"
              >
                {uiCopy.navigation.login}
              </button>
              <button
                onClick={() => handleScrollTo('pricing')}
                className="btn-primary !py-2.5 !px-6"
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
