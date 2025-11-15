import React from 'react';

// --- SVG Icons (as functional components for easy use) ---

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MusicNoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
  </svg>
);

// --- Feature Card Component ---

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="w-5/6 md:w-full flex-shrink-0 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center transition-all duration-300 hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform snap-center">
    <div className="mb-4 text-pink-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-300 text-sm flex-grow">{description}</p>
  </div>
);

// --- Main Features Section Component ---

const FeaturesSection: React.FC = () => {
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="features" className="py-16 sm:py-20 overflow-hidden">
      <div className="container mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 px-4 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Uma Experiência <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Inesquecível</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Recursos pensados para eternizar seus momentos mais preciosos.
          </p>
        </div>

        {/* Features Container - Flex for mobile, Grid for desktop */}
        <div 
          className="flex space-x-6 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 px-8 md:px-0 pb-4 animate-fade-in-slide-up hide-scrollbar scroll-smooth snap-x snap-mandatory scroll-pl-8 scroll-pr-8"
          style={{ animationDelay: '300ms' }}
        >
          <FeatureCard 
            icon={<ClockIcon className="w-10 h-10" />}
            title="Contador Preciso"
            description="Celebre cada segundo, minuto, dia e ano juntos com um contador que nunca para."
          />
          <FeatureCard 
            icon={<ImageIcon className="w-10 h-10" />}
            title="Galeria de Fotos"
            description="Conte sua história com uma galeria de fotos que transita suavemente, como suas melhores memórias."
          />
          <FeatureCard 
            icon={<MusicNoteIcon className="w-10 h-10" />}
            title="Trilha Sonora"
            description="Adicione a música de vocês via YouTube e crie a atmosfera perfeita para a sua cápsula do tempo."
          />
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16 px-4 animate-fade-in-slide-up" style={{ animationDelay: '600ms' }}>
          <button 
            onClick={handleScrollToPricing}
            className="font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            Ver Planos e Preços
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;