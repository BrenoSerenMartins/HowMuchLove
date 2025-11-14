import React from 'react';

const HeroSection: React.FC = () => {

  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center py-20">
      <div 
        className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto animate-fade-in-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6" style={{ textShadow: '0px 3px 10px rgba(0,0,0,0.3)'}}>
          O Presente Perfeito <br/> para quem você{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Ama.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
          Crie uma cápsula do tempo digital com suas fotos, uma mensagem especial e uma contagem de quanto tempo estão juntos.
          <br/>
          <span className="font-semibold text-slate-100">Um presente inesquecível, grátis para testar.</span>
        </p>
        <button 
          onClick={handleScrollToDemo}
          className="font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-purple-500/30"
        >
          Testar Agora (Grátis)
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
