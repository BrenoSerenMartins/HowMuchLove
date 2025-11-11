import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import { GearIcon } from './icons/GearIcon';

const PlanBadge: React.FC<{ planName: string }> = ({ planName }) => {
  let styles = '';

  switch (planName) {
    case 'Sonho':
      styles = 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-600/20';
      break;
    case 'Eterno':
      styles = 'bg-pink-500 text-white shadow shadow-pink-500/30';
      break;
    case 'Infinito':
      styles = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md shadow-purple-500/40';
      break;
    default:
      return null;
  }

  return (
    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${styles}`}>
      {planName}
    </span>
  );
};


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigate();

  const handleScrollToPricing = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={() => navigate('/')} className="text-xl sm:text-2xl font-bold text-slate-900 focus:outline-none">
              HowMuch<span className="text-pink-500 font-extrabold">Love</span>
            </button>
            {user && user.plan && <PlanBadge planName={user.plan} />}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/settings')}
                className="text-slate-600 hover:text-pink-500 transition-colors duration-300 p-2 rounded-full hover:bg-slate-100"
                aria-label="Configurações da conta"
              >
                <GearIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="border-2 border-pink-500 text-pink-500 font-semibold py-1.5 px-3 text-sm sm:py-2 sm:px-5 sm:text-base rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors duration-300"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-pink-500 text-pink-500 font-semibold py-1.5 px-3 text-sm sm:py-2 sm:px-5 sm:text-base rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors duration-300"
              >
                Entrar
              </button>
              <button
                onClick={handleScrollToPricing}
                className="bg-pink-500 text-white font-semibold py-1.5 px-3 text-sm sm:py-2 sm:px-5 sm:text-base rounded-lg shadow-md hover:bg-pink-600 transition-transform transition-colors duration-300 transform hover:scale-105"
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