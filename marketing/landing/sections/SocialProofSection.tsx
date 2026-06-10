import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { uiCopy } from '@/shared/lib/ui-copy';

interface TestimonialCardProps {
  quote: string;
  author: string;
  detail: string;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, detail, index }) => (
  <motion.div 
    variants={{
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="card-elite p-8 flex flex-col h-full group"
  >
    <div className="flex gap-1 mb-6 text-primary/30 group-hover:text-primary transition-colors duration-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-current" />
      ))}
    </div>
    
    <p className="text-white/90 text-[15px] font-medium leading-relaxed italic mb-8 flex-grow">
      "{quote}"
    </p>

    <div className="flex items-center pt-6 border-t border-white/[0.05]">
      <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5">
        <img 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
          src={`https://i.pravatar.cc/100?u=${author}`} 
          alt={author} 
        />
      </div>
      <div className="ml-4">
        <p className="font-black text-white text-sm uppercase tracking-tight">{author}</p>
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] font-mono mt-0.5">{detail}</p>
      </div>
    </div>
  </motion.div>
);

const SocialProofSection: React.FC = () => {
  const handleScrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="testimonials" className="section-fluid relative overflow-visible">
      <div className="relative z-10 overflow-visible">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            Depoimentos Reais
          </span>
          <h2 className="font-black text-white leading-[0.9] tracking-tighter mb-8">
            {uiCopy.marketing.socialProof.titleLead}{' '}
            <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
              {uiCopy.marketing.socialProof.titleHighlight}
            </span>
          </h2>
          <p className="text-slate-400 text-fluid-body font-medium max-w-2xl mx-auto">
            {uiCopy.marketing.socialProof.description}
          </p>
        </motion.div>

        {/* Testimonials Grid - Horizontal scroll on mobile, Grid on desktop */}
        <div className="flex overflow-x-auto pb-12 pt-6 md:grid md:grid-cols-3 gap-6 md:gap-[clamp(1.5rem,4vw,4rem)] -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory overflow-y-visible">
          {uiCopy.marketing.socialProof.testimonials.map((testimonial, index) => (
            <div key={testimonial.author} className="w-[85vw] md:w-auto flex-shrink-0 snap-center">
              <TestimonialCard 
                index={index}
                quote={testimonial.quote}
                author={testimonial.author}
                detail={testimonial.detail}
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <button 
            onClick={handleScrollToDemo}
            className="btn-secondary group"
          >
            {uiCopy.marketing.socialProof.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default SocialProofSection;
