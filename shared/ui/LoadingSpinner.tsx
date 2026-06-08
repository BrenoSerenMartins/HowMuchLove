import React from 'react';

// Pulsing heart animation
const style = `
@keyframes pulseHeart {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.animate-pulseHeart {
  animation: pulseHeart 1.5s ease-in-out infinite;
}
`;

const LoadingSpinner: React.FC = () => {
  return (
    <>
      <style>{style}</style>
      <div className="flex flex-col items-center justify-center gap-4">
        <svg
          className="w-12 h-12 text-pink-500 animate-pulseHeart"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="text-pink-500 font-semibold">Carregando...</span>
      </div>
    </>
  );
};

export default LoadingSpinner;
