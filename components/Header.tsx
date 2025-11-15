import React, { useState, useEffect } from 'react';
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

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate, route } = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = route === '/';

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (isHomePage) {
      // Already on home page, but section not found (rare)
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  }

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  }

  const navLinks = [
    { label: 'Funcionalidades', id: 'features' },
    { label: 'Como Funciona', id: 'how-it-works' },
    { label: 'Depoimentos', id: 'testimonials' },
    { label: 'Preços', id: 'pricing' },
  ];

  return (
    <>
      <header className="bg-black/50 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
              <button onClick={() => navigate('/')} className="focus:outline-none">
                <img src="/images/logo.png" alt="HowMuchLove Logo" className="h-7 sm:h-8 w-auto" />
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
                  onClick={handleLogout}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white p-2" aria-label="Abrir menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <div className={`fixed inset-0 z-50 transition-transform transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className="relative w-4/5 max-w-sm ml-auto h-full bg-slate-900/95 backdrop-blur-lg border-l border-white/10 flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-white">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-white p-2" aria-label="Fechar menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <nav className="flex flex-col space-y-4">
            {isHomePage && navLinks.map(link => (
              <button key={link.id} onClick={() => handleScrollTo(link.id)} className="text-slate-300 hover:text-white transition-colors text-lg text-left py-2">
                {link.label}
              </button>
            ))}
            {!isHomePage && (
              <button onClick={() => handleNavigate('/')} className="text-slate-300 hover:text-white transition-colors text-lg text-left py-2">
                Página Inicial
              </button>
            )}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10">
            {user ? (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full text-center bg-slate-700/50 text-slate-200 font-semibold py-3 px-5 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Configurações
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-center border border-slate-600 text-slate-300 font-semibold py-3 px-5 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full text-center border border-slate-600 text-slate-300 font-semibold py-3 px-5 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => handleScrollTo('pricing')}
                  className="w-full text-center bg-pink-500 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-pink-600 transition-colors"
                >
                  Ver Planos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;