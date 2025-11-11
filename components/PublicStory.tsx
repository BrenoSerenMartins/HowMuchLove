import React, { useState, useEffect } from 'react';
import type { LoveStoryData } from '../types';
import YouTubePlayer from './YouTubePlayer';

// --- Helper Functions ---

const extractYouTubeID = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
};

type LayoutPosition = 'top' | 'center' | 'bottom';


// These helpers are copied from CounterDemo to render the preview consistently
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
      <span className="text-4xl md:text-6xl font-bold text-white tracking-tighter" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.4)' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] sm:text-xs md:text-sm font-light text-white/80 uppercase tracking-widest" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.4)' }}>
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

const Watermark: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    <span 
      className="text-white text-5xl font-bold opacity-20 transform -rotate-45 select-none"
      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
    >
      HOWMUCHLOVE.COM
    </span>
  </div>
);

interface PublicStoryProps {
    storyData: LoveStoryData | null;
    hasEntered?: boolean;
    isMuted?: boolean;
    setIsMuted?: (isMuted: boolean) => void;
}

const PublicStory: React.FC<PublicStoryProps> = ({ storyData, hasEntered, isMuted, setIsMuted }) => {
    if (!storyData) {
        return (
            <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-900 text-white">
                <p>História não encontrada.</p>
            </div>
        );
    }

    const { startDate, message, images, layoutPosition = 'bottom', youtubeUrl, plan } = storyData;
    const date = startDate ? new Date(startDate) : null;
    const videoId = youtubeUrl ? extractYouTubeID(youtubeUrl) : null;

    const [topImageIndex, setTopImageIndex] = useState(0);
    const [bottomImageIndex, setBottomImageIndex] = useState(0);
    const [topLayerOpacity, setTopLayerOpacity] = useState(1);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        const timer = setTimeout(() => {
            const nextIndex = (topImageIndex + 1) % images.length;
            setBottomImageIndex(nextIndex);
            setTopLayerOpacity(0);

            const swapTimer = setTimeout(() => {
                setTopImageIndex(nextIndex);
                setTopLayerOpacity(1);
            }, 1000);

            return () => clearTimeout(swapTimer);
        }, 5000);

        return () => clearTimeout(timer);
    }, [topImageIndex, images]);

    const topImage = images && images.length > 0 ? images[topImageIndex] : null;
    const bottomImage = images && images.length > 0 ? images[bottomImageIndex] : null;

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-900 pt-4">
            {plan === 'Gratis' && <Watermark />} {/* Render watermark if plan is Gratis */}

            {/* Mute/Unmute Button */}
            {videoId && hasEntered && (
                <button
                    onClick={() => setIsMuted?.(!isMuted)}
                    className="fixed bottom-4 right-4 z-50 bg-black/40 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-black/60 transition-all duration-300"
                    aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                >
                    {isMuted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.683 3.904 11 4.226 11 4.707V19.293c0 .481-.317.803-.707.414L5.586 15zM17 14l-4-4m0 4l4-4"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.683 3.904 11 4.226 11 4.707V19.293c0 .481-.317.803-.707.414L5.586 15z"></path></svg>
                    )}
                </button>
            )}

            {/* Image and Counter Section */}
            <div className="px-4 w-full max-w-screen-lg mx-auto">
                <section 
                  className={`relative w-full h-[calc(100vh-5rem)] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${getLayoutContainerClasses(layoutPosition)}`}
                  style={!topImage && !bottomImage ? { background: 'linear-gradient(135deg, #4a0e29, #2d0b1d)' } : {}}
                >
                    {/* Background Image Layers for Cross-fade */}
                    {bottomImage && (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${bottomImage.image_url})` }}
                        >
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                        </div>
                    )}
                    {topImage && (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                            style={{ 
                                backgroundImage: `url(${topImage.image_url})`,
                                opacity: topLayerOpacity
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                        </div>
                    )}
                    
                    {/* Counter Layer (always visible) */}
                    <div className={`relative z-10 ${getLayoutPanelClasses(layoutPosition)}`}>
                        <div className="max-w-4xl mx-auto space-y-6">
                            <DurationCounter startDate={date} />
                        </div>
                    </div>
                
                    {/* Placeholder for empty story */}
                    {!topImage && !message && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <p className="text-white/50 text-lg text-center">Adicione conteúdo à sua história para vê-la aqui.</p>
                      </div>
                    )}
                </section>            </div>

            {/* Message Section */}
            {message && (
                <section className="relative z-10 flex-grow flex items-center justify-center w-full py-8 px-4">
                    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-3xl w-full">
                        <p className="font-cursive text-slate-200 text-2xl sm:text-3xl lg:text-4xl leading-relaxed break-words text-center">
                            <QuoteStartIcon className="text-slate-600" />
                            {message}
                        </p>
                    </div>
                </section>
            )}
            {videoId && hasEntered && <YouTubePlayer videoId={videoId} isMuted={isMuted ?? true} />}
        </div>
    );
};

export default PublicStory;
