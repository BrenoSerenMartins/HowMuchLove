import React, { useState } from 'react';

// --- FAQ Item Component ---

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left"
      >
        <h3 className="text-base md:text-lg font-semibold text-white">{question}</h3>
        <svg
          className={`w-6 h-6 text-slate-300 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="px-5 pb-5 text-slate-300 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};


// --- Main FAQ Section Component ---

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Frequentes</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Tirando suas últimas dúvidas para que você possa criar seu presente com tranquilidade.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}>
          <FAQItem question="Preciso pagar para testar?">
            <p>
              Não! Você pode criar sua história, adicionar uma data, mensagem, uma foto e ver a pré-visualização de como ficará o presente. Tudo isso de graça e sem precisar de cadastro.
            </p>
          </FAQItem>
          <FAQItem question="A pessoa que recebe o presente precisa pagar?">
            <p>
              Nunca. O acesso à história é sempre gratuito e ilimitado para quem recebe o link. Apenas quem cria a história precisa de um plano para poder compartilhá-la.
            </p>
          </FAQItem>
          <FAQItem question="Meus dados e fotos estão seguros?">
            <p>
              Sim. Sua história só pode ser acessada através do link exclusivo gerado para você. Além disso, nossos planos pagos oferecem a opção de proteção por senha para uma camada extra de privacidade.
            </p>
          </FAQItem>
          <FAQItem question="Posso editar a história depois de publicada?">
            <p>
              Sim! Com qualquer um dos nossos planos, você pode fazer login no seu painel a qualquer momento para adicionar mais fotos (de acordo com seu plano), alterar a mensagem, a música e muito mais.
            </p>
          </FAQItem>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
