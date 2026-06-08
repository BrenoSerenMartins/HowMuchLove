import React, { useState, useEffect } from 'react';
import type { LoveStoryData } from '@/types';
import YouTubePlayer from './YouTubePlayer';
import DurationCounter from './DurationCounter';
import { uiCopy } from '@/shared/lib/ui-copy';

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

const getPlanName = (plan: LoveStoryData['plan']): string => {
    if (!plan) return 'Gratis';
    if (typeof plan === 'string') return plan;
    if (Array.isArray(plan)) {
        return getPlanName(plan[0] as LoveStoryData['plan']);
    }
    if (typeof plan === 'object') {
        if ('name' in plan && typeof plan.name === 'string') {
            return plan.name;
        }
        if ('plan_name' in plan && typeof plan.plan_name === 'string') {
            return plan.plan_name;
        }
    }
    return 'Gratis';
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

const QuoteStartIcon: React.FC<{ className?: string }> = ({ className = 'text-white/30' }) => (
    <svg className={`inline-block w-8 h-8 -mt-4 mr-2 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 10.5C6.5 12.43 8.07 14 10 14v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5C8.07 7 6.5 8.57 6.5 10.5zM14.5 10.5c0 1.93 1.57 3.5 3.5 3.5v1.5c-2.76 0-5-2.24-5-5s2.24-5 5-5v1.5c-1.93 0-3.5 1.57-3.5 3.5z"></path>
    </svg>
);

const Watermark: React.FC = () => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='rgba(0,0,0,0.02)'/><text x='50%' y='50%' font-size='24' fill='white' fill-opacity='0.3' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45, 100, 100)'>howmuchlove.com.br</text></svg>`;
    const encodedSvg = `data:image/svg+xml;base64,${btoa(svg)}`;

    return (
        <div 
            className="absolute inset-0 pointer-events-none z-50"
            style={{
                backgroundImage: `url("${encodedSvg}")`,
                backgroundRepeat: 'repeat'
            }}
        ></div>
    );
};

interface PublicStoryProps {
    storyData: LoveStoryData | null;
    hasEntered?: boolean;
    isMuted?: boolean;
    setIsMuted?: (isMuted: boolean) => void;
    isPreview?: boolean;
}

// --- Custom Hook for Intersection Observer ---
const useOnScreen = (ref: React.RefObject<HTMLElement>, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return isIntersecting;
};

const PublicStory: React.FC<PublicStoryProps> = ({ storyData, hasEntered, isMuted, setIsMuted, isPreview = false }) => {
    if (!storyData) {
        return (
            <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-900 text-white">
                <p>{uiCopy.story.notFoundDescription}</p>
            </div>
        );
    }

    const { startDate, message, images, layoutPosition = 'bottom', youtubeUrl, plan } = storyData;
    const planName = getPlanName(plan);
    const date = startDate ? new Date(startDate) : null;
    const videoId = youtubeUrl ? extractYouTubeID(youtubeUrl) : null;
    const backgroundImageUrl = images && images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const [topImageIndex, setTopImageIndex] = useState(0);
    const [startBlur, setStartBlur] = useState(false);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        const timer = setTimeout(() => {
            setTopImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearTimeout(timer);
    }, [topImageIndex, images]);

    const messageRef = React.useRef<HTMLDivElement>(null);
    const isMessageOnScreen = useOnScreen(messageRef, "-100px");

    useEffect(() => {
        if (isMessageOnScreen) {
            const timer = setTimeout(() => {
                setStartBlur(true);
            }, 500); // Delay to start blur after fade-in starts
            return () => clearTimeout(timer);
        }
    }, [isMessageOnScreen]);

    return (
        <div 
            className={`w-full flex flex-col relative ${isPreview ? 'h-full overflow-y-auto' : 'min-h-screen pt-4 overflow-hidden'}`}
        >
            <style>
                {`
                    .blurry-background::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image: url(${backgroundImageUrl});
                        background-size: cover;
                        background-position: center;
                        filter: blur(5px);
                        animation: pan-background 30s infinite alternate linear;
                        z-index: -1;
                    }

                    @keyframes pan-background {
                        0% { background-position: 0% 0%; }
                        100% { background-position: 100% 100%; }
                    }
                `}
            </style>
            <div className="blurry-background">
                {planName === 'Gratis' && <Watermark />} {/* Render watermark if plan is Gratis */}
            </div>
            {/* Mute/Unmute Button */}
            {videoId && hasEntered && (
                <button
                    onClick={() => setIsMuted?.(!isMuted)}
                    className="fixed bottom-4 right-4 z-50 bg-black/40 backdrop-blur-sm text-white p-4 rounded-full shadow-lg hover:bg-black/60 transition-all duration-300"
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
            <div className="px-4 w-full max-w-screen-2xl mx-auto">
                <section 
                  className={`relative w-full ${isPreview ? '' : 'h-[calc(100vh-5rem)]'} flex flex-col rounded-3xl shadow-2xl overflow-hidden ${getLayoutContainerClasses(layoutPosition)}`}
                  style={{ 
                    ...(!images || images.length === 0 ? { background: 'linear-gradient(135deg, #4a0e29, #2d0b1d)' } : {}),
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.3)' // Custom outer shadow
                  }}
                >
                    {/* Background Image Layers for Cross-fade */}
                    {images && images.map((image, index) => (
                        <div
                            key={image.id}
                            className="absolute inset-0 bg-cover bg-center rounded-3xl transition-all duration-1000 ease-in-out"
                            style={{
                                backgroundImage: `url(${image.image_url})`,
                                opacity: index === topImageIndex ? 1 : 0,
                                transform: index === topImageIndex ? 'scale(1)' : 'scale(0.9)',
                                filter: index === topImageIndex ? 'blur(0px)' : 'blur(4px)',
                                zIndex: index === topImageIndex ? 1 : 0,
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 z-0 rounded-3xl"></div>
                            {/* Border Overlay */}
                            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none z-20"></div>
                        </div>
                    ))}
                    
                    {/* Inner Vignette Effect */}
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 65%, rgba(0,0,0,0.5) 100%)'
                    }}></div>

                    {/* Counter Layer (always visible) */}
                    <div className={`relative z-10 ${getLayoutPanelClasses(layoutPosition)}`}>
                        <div className="max-w-4xl mx-auto space-y-6">
                            <DurationCounter startDate={date} />
                        </div>
                    </div>
                
                    {/* Placeholder for empty story */}
                    {(!images || images.length === 0) && !message && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <p className="text-white/50 text-lg text-center">Adicione conteúdo à sua história para vê-la aqui.</p>
                      </div>
                    )}
                </section>            </div>

            {/* Scroll Down Arrow */}
            {!isMessageOnScreen && message && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-subtle-bounce">
                    <style>
                        {`
                            @keyframes subtle-bounce {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-5px); }
                            }
                            .animate-subtle-bounce {
                                animation: subtle-bounce 1.5s infinite ease-in-out;
                            }
                        `}
                    </style>
                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </div>
            )}

            {/* Message Section */}
            {message && (
                <section 
                    ref={messageRef}
                    className={`transition-opacity duration-500 ${isMessageOnScreen ? 'opacity-100' : 'opacity-0'} flex-grow flex items-center justify-center w-full py-8 px-4`}
                >
                    <div 
                        className={`bg-slate-800/60 rounded-2xl shadow-xl p-8 max-w-3xl w-full transition-all duration-1000 ease-in-out ${startBlur ? 'backdrop-blur-md' : 'backdrop-blur-none'}`}
                    >
                        <p 
                            className="font-cursive text-slate-200 text-2xl sm:text-3xl lg:text-4xl leading-relaxed break-words text-center"
                            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
                        >
                            <QuoteStartIcon className="text-slate-600" />
                            {message}
                        </p>
                    </div>
                </section>
            )}
            {videoId && hasEntered && <YouTubePlayer videoId={videoId} isMuted={isMuted ?? true} />}
            {planName === 'Gratis' && (
                <a 
                    href="/#/settings#pricing-section"
                    className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
                >
                    Remover Marca D'água
                </a>
            )}
        </div>
    );
};

export default PublicStory;
