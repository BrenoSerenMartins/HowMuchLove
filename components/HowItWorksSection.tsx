import React from 'react';

// --- SVG Icons (as functional components for easy use) ---

const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
  </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);


// --- Step Card Component ---

interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ step, icon, title, description }) => (
  <div className="relative w-5/6 md:w-full flex-shrink-0 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center transition-all duration-300 hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform snap-center">
    <div className="absolute -top-5 bg-pink-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl border-4 border-slate-900">{step}</div>
    <div className="mt-8 mb-4 text-pink-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-300 text-sm flex-grow">{description}</p>
  </div>
);

// --- Main How It Works Section Component ---

const HowItWorksSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-it-works" className="py-16 sm:py-20 overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Sua cápsula do tempo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">em 3 passos.</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Transformar suas memórias em um legado eterno é mais fácil do que você imagina.
          </p>
        </div>
      </div>

      {/* Steps Container - Full bleed carousel on mobile */}
      <div 
        className="relative flex space-x-4 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 pb-4 pt-8 animate-fade-in-slide-up hide-scrollbar scroll-smooth snap-x snap-mandatory md:container md:mx-auto py-8 scroll-px-4"
        style={{ animationDelay: '300ms' }}
      >
        <StepCard 
          step={1}
          icon={<PlusCircleIcon className="w-10 h-10" />}
          title="Crie sua História"
          description="Defina a data que deu início a tudo e escreva a mensagem que será o coração da sua história eternizada."
        />
        <StepCard 
          step={2}
          icon={<SparklesIcon className="w-10 h-10" />}
          title="Personalize"
          description="Dê vida à sua história com uma galeria de fotos, a trilha sonora de vocês e outros detalhes que a tornam única."
        />
        <StepCard 
          step={3}
          icon={<ShareIcon className="w-10 h-10" />}
          title="Compartilhe"
          description="É hora da surpresa! Compartilhe o link diretamente ou adicione um toque mágico ao seu presente físico com o QR Code exclusivo."
        />
      </div>

      {/* CTA Button */}
      <div className="container mx-auto px-4 text-center mt-16 animate-fade-in-slide-up" style={{ animationDelay: '600ms' }}>
        <button 
          onClick={handleScrollToDemo}
          className="font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-purple-500/30"
        >
          Dar o Primeiro Passo (Grátis)
        </button>
      </div>
    </section>
  );
};

export default HowItWorksSection;