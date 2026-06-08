import React, { useState } from 'react';
import { uiCopy } from '@/shared/lib/ui-copy';

// --- FAQ Item Component ---

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
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
          <p>{answer}</p>
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
            {uiCopy.marketing.faq.titleLead}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{uiCopy.marketing.faq.titleHighlight}</span>
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            {uiCopy.marketing.faq.description}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}>
          {uiCopy.marketing.faq.items.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
