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
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="features" className="py-16 sm:py-20 overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            O que torna sua história <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">eternizada.</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Cada detalhe, cuidadosamente pensado para transformar suas memórias em um tesouro que dura para sempre.
          </p>
        </div>
      </div>

      {/* Features Container - Full bleed carousel on mobile */}
      <div 
        className="flex space-x-4 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 pb-4 animate-fade-in-slide-up hide-scrollbar scroll-smooth snap-x snap-mandatory md:container md:mx-auto py-8 scroll-px-4"
        style={{ animationDelay: '300ms' }}
      >
        <FeatureCard 
          icon={<ClockIcon className="w-10 h-10" />}
          title="O Tempo do Nosso Amor"
          description="Veja o tempo do seu amor em movimento. Um contador que parte do primeiro segundo, celebra o agora e segue contando, rumo ao infinito."
        />
        <FeatureCard 
          icon={<ImageIcon className="w-10 h-10" />}
          title="Os Capítulos da Nossa História"
          description="Cada foto, uma página do seu livro de amor. Organize e reviva os capítulos da sua jornada, dos primeiros encontros às grandes conquistas."
        />
        <FeatureCard 
          icon={<MusicNoteIcon className="w-10 h-10" />}
          title="A Melodia da Nossa História"
          description="Se a sua história de amor fosse uma canção, qual seria? Adicione a melodia que embala seus capítulos e dá o tom exato para cada momento."
        />
      </div>

      {/* CTA Button */}
      <div className="container mx-auto px-4 text-center mt-16 animate-fade-in-slide-up" style={{ animationDelay: '600ms' }}>
        <button 
          onClick={handleScrollToDemo}
          className="font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20"
        >
          Comece a Criar Sua História
        </button>
      </div>
    </section>
  );
};

export default FeaturesSection;