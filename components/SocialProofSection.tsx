import React from 'react';

// --- Testimonial Card Component ---

interface TestimonialCardProps {
  quote: string;
  author: string;
  detail: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, detail }) => (
  <div className="w-5/6 md:w-full flex-shrink-0 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:scale-103 hover:-translate-y-1 hover:shadow-xl will-change-transform">
    <p className="text-slate-300 text-sm flex-grow mb-4">"{quote}"</p>
    <div className="flex items-center">
      <img 
        className="w-10 h-10 rounded-full object-cover" 
        src={`https://i.pravatar.cc/40?u=${author}`} 
        alt={author} 
      />
      <div className="ml-3">
        <p className="font-bold text-white">{author}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  </div>
);

// --- Main Social Proof Section Component ---

const SocialProofSection: React.FC = () => {
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="testimonials" className="py-16 sm:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Milhares de Histórias <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Eternizadas</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Veja o que alguns dos nossos casais apaixonados estão dizendo.
          </p>
        </div>

        {/* Testimonials Container - Flex for mobile, Grid for desktop */}
        <div 
          className="flex space-x-6 overflow-x-auto md:overflow-visible md:grid md:grid-cols-3 md:gap-8 md:space-x-0 pb-4 animate-fade-in-slide-up hide-scrollbar"
          style={{ animationDelay: '300ms' }}
        >
          <TestimonialCard 
            quote="Foi o presente mais emocionante que já recebi. Chorei quando vi o contador e nossas fotos passando com a nossa música. Incrível!"
            author="Juliana R."
            detail="Surpreendeu o namorado"
          />
          <TestimonialCard 
            quote="Achei que seria complicado, mas criei tudo em menos de 10 minutos pelo celular. A interface é linda e super fácil de usar."
            author="Marcos T."
            detail="Presente de aniversário de namoro"
          />
          <TestimonialCard 
            quote="O resultado final é muito mais do que eu esperava. Parece um site profissional, super premium. Minha esposa amou."
            author="Fernando P."
            detail="Celebração de bodas de papel"
          />
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16 animate-fade-in-slide-up" style={{ animationDelay: '600ms' }}>
          <button 
            onClick={handleScrollToPricing}
            className="font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            Comece a Sua História Agora
          </button>
        </div>

      </div>
    </section>
  );
};

export default SocialProofSection;
