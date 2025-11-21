import React, { useState, useEffect } from 'react';
import type { LoveStoryData } from '../types';

// NOTE: This is a dedicated preview component to avoid altering the public-facing PublicStory.tsx.
// It duplicates rendering logic but is isolated for the preview context.

// --- Helper Functions & Sub-components (duplicated for isolation) ---

type LayoutPosition = 'top' | 'center' | 'bottom';

const getLayoutContainerClasses = (position: LayoutPosition) => {
    switch(position) {
      case 'top': return 'justify-start';
      case 'center': return 'justify-center items-center';
      case 'bottom': default: return 'justify-end';
    }
};
  
const getLayoutPanelClasses = (position: LayoutPosition) => {
    switch(position) {
      case 'top': return 'w-full bg-gradient-to-b from-black/70 via-black/50 to-transparent pt-6 pb-16 px-4 md:pt-8 md:px-8';
      case 'center': return 'w-full max-w-4xl bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8';
      case 'bottom': default: return 'w-full bg-gradient-to-t from-black/70 via-black/50 to-transparent pt-16 pb-6 px-4 md:pb-8 md:px-8';
    }
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold text-white tracking-tighter" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] sm:text-[10px] font-light text-white/80 uppercase tracking-widest" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.5)' }}>
        {label}
      </span>
    </div>
);
  
const DurationCounter: React.FC<{ startDate: Date | null }> = ({ startDate }) => {
    const [duration, setDuration] = useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number; } | null>(null);
  
    useEffect(() => {
      if (!startDate) { setDuration(null); return; }
      const calculateDuration = () => {
        const now = new Date();
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();
        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
          const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          days += daysInLastMonth;
          months--;
        }
        if (months < 0) { months += 12; years--; }
        setDuration({ years, months, days, hours, minutes, seconds });
      };
      calculateDuration();
      const interval = setInterval(calculateDuration, 1000);
      return () => clearInterval(interval);
    }, [startDate]);
  
    if (!duration) return null;
  
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6 text-center">
        <TimeUnit value={duration.years} label="Anos" />
        <TimeUnit value={duration.months} label="Meses" />
        <TimeUnit value={duration.days} label="Dias" />
        <TimeUnit value={duration.hours} label="Horas" />
        <TimeUnit value={duration.minutes} label="Minutos" />
        <TimeUnit value={duration.seconds} label="Segundos" />
      </div>
    );
};

const QuoteStartIcon: React.FC<{ className?: string }> = ({ className = 'text-white/30' }) => (
    <svg className={`inline-block w-8 h-8 -mt-4 mr-2 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 10.5C6.5 12.43 8.07 14 10 14v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5C8.07 7 6.5 8.57 6.5 10.5zM14.5 10.5c0 1.93 1.57 3.5 3.5 3.5v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5c-1.93 0-3.5 1.57-3.5 3.5z"></path>
    </svg>
);

interface StoryPreviewProps {
    storyData: LoveStoryData | null;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData }) => {
    if (!storyData) {
        return <div className="h-full w-full flex justify-center items-center bg-slate-900 text-white"><p>A pré-visualização aparecerá aqui.</p></div>;
    }

    const { startDate, message, images, layoutPosition = 'bottom' } = storyData;
    const date = startDate ? new Date(startDate) : null;
    const backgroundImageUrl = images && images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const [topImageIndex, setTopImageIndex] = useState(0);
    useEffect(() => {
        if (!images || images.length <= 1) return;
        const timer = setTimeout(() => setTopImageIndex((prev) => (prev + 1) % images.length), 5000);
        return () => clearTimeout(timer);
    }, [topImageIndex, images]);

    return (
        <div className="min-h-full w-full flex flex-col bg-slate-900 relative text-sm">
            <div className="blurry-background" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <style>
                    {`
                        .blurry-background::before {
                            content: '';
                            position: absolute;
                            top: 0; left: 0; right: 0; bottom: 0;
                            background-image: url(${backgroundImageUrl});
                            background-size: cover;
                            background-position: center;
                            filter: blur(5px);
                            z-index: -1;
                        }
                    `}
                </style>
            </div>

                                                            <div className="p-4 w-full max-w-screen-2xl mx-auto flex-shrink-0">

                                                                <section className={`relative w-full min-h-[470px] flex flex-col rounded-2xl shadow-xl overflow-hidden ${getLayoutContainerClasses(layoutPosition)}`}>                                {images && images.map((image, index) => (
                                    <div 
                                        key={image.id || index} 
                                        className="absolute inset-0 bg-cover bg-center rounded-2xl transition-all duration-1000 ease-in-out" 
                                        style={{
                                            backgroundImage: `url(${image.image_url})`, 
                                            opacity: index === topImageIndex ? 1 : 0,
                                            transform: index === topImageIndex ? 'scale(1)' : 'scale(1.05)',
                                            filter: index === topImageIndex ? 'blur(0px)' : 'blur(4px)',
                                            zIndex: index === topImageIndex ? 1 : 0,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 z-0 rounded-2xl"></div>
                                        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none z-20"></div>
                                    </div>
                                ))}
                                <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 65%, rgba(0,0,0,0.5) 100%)' }}></div>
                                <div className={`relative z-10 ${getLayoutPanelClasses(layoutPosition)}`}>
                                    <div className="max-w-4xl mx-auto space-y-4">
                                        <DurationCounter startDate={date} />
                                    </div>
                                </div>
                                {(!images || images.length === 0) && !message && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><p className="text-white/50 text-center">Adicione conteúdo à sua história.</p></div>}
                            </section>
                        </div>
            
            
            
                        {message && (
                            <section className={`flex-grow flex items-center justify-center w-full py-8 px-4`}>
                                <div className="bg-slate-800/60 backdrop-blur-md rounded-xl shadow-lg p-6 max-w-sm w-full">
                                    <p className="font-cursive text-slate-200 text-xl leading-relaxed break-words text-center">
                                        <QuoteStartIcon className="text-slate-600" />
                                        {message}
                                    </p>
                                </div>
                            </section>
                        )}        </div>
    );
};

export default StoryPreview;
