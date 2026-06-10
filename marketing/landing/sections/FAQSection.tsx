import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.05]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <h3 className="text-lg font-black text-white/90 tracking-tight">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className="w-5 h-5 text-primary/50" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 pb-6 text-slate-400 text-sm font-medium leading-relaxed border-t border-white/[0.05] pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="section-fluid relative overflow-visible">
      <div className="relative z-10 overflow-visible container-fluid">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16 px-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            Dúvidas Comuns
          </span>
          <h2 className="font-black text-white leading-[0.9] tracking-tighter mb-8">
            {uiCopy.marketing.faq.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.marketing.faq.titleHighlight}
            </span>
          </h2>
          <p className="text-slate-400 text-fluid-body font-medium max-w-2xl mx-auto">
            {uiCopy.marketing.faq.description}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {uiCopy.marketing.faq.items.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <FAQItem question={item.question} answer={item.answer} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
