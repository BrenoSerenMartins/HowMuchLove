import React from 'react';

const HeroSection: React.FC = () => {

  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center text-center pb-40">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 mb-6">
          O Presente Perfeito <span className="text-pink-500">Existe.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8">
          Crie uma prévia da sua cápsula do tempo digital. Um presente inesquecível, grátis e sem precisar de cadastro para testar.
        </p>
        <button 
          onClick={handleScrollToDemo}
          className="bg-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 inline-block"
        >
          Testar Agora (Grátis)
        </button>
      </div>
    </section>
  );
};

export default HeroSection;