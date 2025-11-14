import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-xl border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-slate-400">
        <p>&copy; {new Date().getFullYear()} HowMuchLove. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;