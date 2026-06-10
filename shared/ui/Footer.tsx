import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block bg-black/40 backdrop-blur-2xl border-t border-white/[0.05] mt-32 py-16 relative z-10">
      <div className="container-fluid text-center">
        <div className="mb-8 flex justify-center items-center">
            <img
              src="/images/logo.avif"
              alt="HowMuchLove Logo"
              className="max-h-5 w-auto opacity-50 hover:opacity-100 transition-opacity"
              width="400"
              height="66"
            />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          &copy; {new Date().getFullYear()} HowMuchLove. <span className="text-primary/50">Feito com Amor.</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;