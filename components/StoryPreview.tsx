import React from 'react';
import type { LoveStoryData } from '../types';

// --- Helper Components (copied from PublicStory.tsx for consistency) ---

const QuoteStartIcon: React.FC<{ className?: string }> = ({ className = 'text-white/30' }) => (
    <svg className={`inline-block w-6 h-6 -mt-3 mr-1 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 10.5C6.5 12.43 8.07 14 10 14v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5C8.07 7 6.5 8.57 6.5 10.5zM14.5 10.5c0 1.93 1.57 3.5 3.5 3.5v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5c-1.93 0-3.5 1.57-3.5 3.5z"></path>
    </svg>
);

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-white tracking-tighter" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.5)' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] font-light text-white/80 uppercase tracking-widest" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
        {label}
      </span>
    </div>
);
  
const DurationCounter: React.FC<{ startDate: Date | null }> = ({ startDate }) => {
    const [duration, setDuration] = React.useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number; } | null>(null);
  
    React.useEffect(() => {
      if (!startDate) {
        setDuration(null);
        return;
      }
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
  
    if (!duration) return <div className="text-center"><p className="text-sm font-semibold text-white/90">{!startDate ? "Escolha uma data..." : "Calculando..."}</p></div>;
  
    return (
      <div className="grid grid-cols-6 gap-2 text-center">
        <TimeUnit value={duration.years} label="Anos" />
        <TimeUnit value={duration.months} label="Meses" />
        <TimeUnit value={duration.days} label="Dias" />
        <TimeUnit value={duration.hours} label="Horas" />
        <TimeUnit value={duration.minutes} label="Minutos" />
        <TimeUnit value={duration.seconds} label="Segundos" />
      </div>
    );
};

// --- Main Preview Component ---

interface StoryPreviewProps {
  storyData: Partial<LoveStoryData>;
  localImageUrl?: string | null;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData, localImageUrl }) => {
    const { startDate, message, layoutPosition = 'bottom' } = storyData;
    const date = startDate ? new Date(startDate) : null;
    const imageUrl = localImageUrl || (storyData.images && storyData.images.length > 0 ? storyData.images[0].image_url : null);

    const getLayoutContainerClasses = (position: 'top' | 'center' | 'bottom') => {
        switch(position) {
          case 'top': return 'justify-start';
          case 'center': return 'justify-center items-center';
          case 'bottom': default: return 'justify-end';
        }
    };
      
    const getLayoutPanelClasses = (position: 'top' | 'center' | 'bottom') => {
        switch(position) {
          case 'top': return 'w-full bg-gradient-to-b from-black/60 via-black/40 to-transparent pt-4 pb-8 px-4';
          case 'center': return 'w-full max-w-md bg-black/30 backdrop-blur-sm rounded-xl p-4';
          case 'bottom': default: return 'w-full bg-gradient-to-t from-black/60 via-black/40 to-transparent pt-8 pb-4 px-4';
        }
    };

    return (
        <div className="w-full h-full flex flex-col min-h-[400px] md:min-h-[650px]">
            <div 
              className={`relative w-full flex-grow flex flex-col rounded-xl shadow-inner overflow-hidden ${getLayoutContainerClasses(layoutPosition)}`}
              style={{ 
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #4a0e29, #2d0b1d)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
                {imageUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}
                
                <div className={`relative z-10 ${getLayoutPanelClasses(layoutPosition)}`}>
                    <div className="max-w-4xl mx-auto space-y-3">
                        <DurationCounter startDate={date} />
                    </div>
                </div>
            </div>
            {message && (
                <div className="mt-2 bg-slate-800/50 backdrop-blur-md rounded-lg p-3">
                    <p className="font-cursive text-slate-200 text-sm leading-relaxed break-words text-center">
                        <QuoteStartIcon className="text-slate-600" />
                        {message}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StoryPreview;
