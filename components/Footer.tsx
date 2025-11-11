import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-slate-500/80">
        <p>&copy; {new Date().getFullYear()} HowMuchLove. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;