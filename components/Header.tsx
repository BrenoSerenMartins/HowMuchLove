import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import { GearIcon } from './icons/GearIcon';

const PlanBadge: React.FC<{ planName: string }> = ({ planName }) => {
  let styles = '';

  switch (planName) {
    case 'Sonho':
      styles = 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-400/30';
      break;
    case 'Eterno':
      styles = 'bg-pink-500 text-white shadow shadow-pink-500/30';
      break;
    case 'Infinito':
      styles = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md shadow-purple-500/40';
      break;
    default:
      styles = 'bg-slate-700 text-slate-300 ring-1 ring-inset ring-slate-600';
      break;
  }

  return (
    <span className={`ml-2 sm:ml-3 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold leading-none ${styles}`}>
      {planName || 'Gratis'}
    </span>
  );
};

interface HeaderProps {
  handleScrollTo: (id: string) => void;
  onLogoutRequest: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleScrollTo, onLogoutRequest }) => {
  const { user } = useAuth();
  const { navigate, route } = useNavigate();

  const isHomePage = route === '/';

  const navLinks = [
    { label: 'Funcionalidades', id: 'features' },
    { label: 'Como Funciona', id: 'how-it-works' },
    { label: 'Depoimentos', id: 'testimonials' },
    { label: 'Preços', id: 'pricing' },
  ];

  return (
    <header className="bg-black/50 backdrop-blur-xl shadow-lg sticky top-0 z-30 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={() => navigate('/')} className="focus:outline-none">
              <picture>
                <source srcSet="/images/logo.avif" type="image/avif" />
                <img src="/images/logo.png" alt="HowMuchLove Logo" className="max-h-5 sm:max-h-6 md:max-h-7 w-auto" fetchpriority="high" width="400" height="66" />
              </picture>
            </button>
            {user && <PlanBadge planName={user.plan} />}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {isHomePage && navLinks.map(link => (
            <button key={link.id} onClick={() => handleScrollTo(link.id)} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/settings')}
                className="text-slate-300 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-white/10"
                aria-label="Configurações da conta"
              >
                <GearIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={onLogoutRequest}
                className="border border-slate-600 text-slate-300 font-semibold py-1.5 px-4 text-sm sm:py-2 sm:px-5 rounded-lg hover:bg-slate-700/50 hover:text-white hover:border-slate-500 transition-colors duration-300"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="border border-slate-600 text-slate-300 font-semibold py-1.5 px-4 text-sm sm:py-2 sm:px-5 rounded-lg hover:bg-slate-700/50 hover:text-white hover:border-slate-500 transition-colors duration-300"
              >
                Entrar
              </button>
              <button
                onClick={() => handleScrollTo('pricing')}
                className="bg-pink-500 text-white font-semibold py-1.5 px-4 text-sm sm:py-2 sm:px-5 rounded-lg shadow-md hover:bg-pink-600 transition-transform transition-colors duration-300 transform hover:scale-105"
              >
                Ver Planos
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;