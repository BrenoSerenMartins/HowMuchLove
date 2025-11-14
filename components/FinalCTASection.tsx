import React from 'react';

const FinalCTASection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-24 bg-black/30 backdrop-blur-xl border-t border-white/10 text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para criar um presente <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">inesquecível?</span>
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Comece agora mesmo a eternizar seus momentos mais preciosos. É rápido, fácil e você pode testar gratuitamente!
          </p>
          <button 
            onClick={handleScrollToDemo}
            className="font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-purple-500/30"
          >
            Testar Agora (Grátis)
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
