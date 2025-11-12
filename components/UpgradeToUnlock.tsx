import React from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

interface UpgradeToUnlockProps {
  children: React.ReactNode;
  isFeatureAllowed: boolean;
  message: string;
}

const UpgradeToUnlock: React.FC<UpgradeToUnlockProps> = ({ children, isFeatureAllowed, message }) => {
  const { navigate } = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext

  if (isFeatureAllowed) {
    return <>{children}</>;
  }

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      navigate('/settings#pricing-section');
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-end pr-4 z-10 cursor-pointer"
        onClick={handleUpgradeClick}
        title="Clique para fazer upgrade"
      >
        <div className="p-2 bg-pink-100/80 backdrop-blur-sm rounded-full shadow-md group-hover:bg-pink-200/90 transition-all duration-200">
          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a5 5 0 00-5 5v2H3a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1V10a1 1 0 00-1-1h-2V7a5 5 0 00-5-5zm-3 5a3 3 0 016 0v2H7V7z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToUnlock;


