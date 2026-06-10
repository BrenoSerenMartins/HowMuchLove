import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Volume2, VolumeX, ChevronDown, Sparkles, Quote } from 'lucide-react';
import type { LoveStoryData } from '@/types';
import YouTubePlayer from './YouTubePlayer';
import DurationCounter from './DurationCounter';
import { uiCopy } from '@/shared/lib/ui-copy';
import { isFreePlan } from '@/shared/lib/plans';

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

const getLayoutContainerClasses = (position: LayoutPosition) => {
    switch(position) {
      case 'top': return 'justify-start';
      case 'center': return 'justify-center items-center';
      case 'bottom': default: return 'justify-end';
    }
};
  
const getLayoutPanelClasses = (position: LayoutPosition) => {
    switch(position) {
      case 'top': return 'w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-12 pb-32 px-[clamp(1.5rem,8vw,8rem)]';
      case 'center': return 'w-full max-w-7xl bg-black/30 backdrop-blur-md rounded-[clamp(2rem,5vw,4rem)] p-12 md:p-24 border border-white/10 mx-auto';
      case 'bottom': default: return 'w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-32 pb-12 px-[clamp(1.5rem,8vw,8rem)]';
    }
};

const Watermark: React.FC = () => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='rgba(0,0,0,0)'/><text x='50%' y='50%' font-size='16' fill='white' fill-opacity='0.15' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45, 100, 100)' font-family='Plus Jakarta Sans' font-weight='900'>HOWMUCHLOVE</text></svg>`;
    const encodedSvg = `data:image/svg+xml;base64,${btoa(svg)}`;

    return (
        <div 
            className="absolute inset-0 pointer-events-none z-50 opacity-40"
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

const PublicStory: React.FC<PublicStoryProps> = ({ storyData, hasEntered, isMuted, setIsMuted, isPreview = false }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    if (!storyData) {
        return (
            <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#050505] text-white">
                <p>{uiCopy.story.notFoundDescription}</p>
            </div>
        );
    }

    const { startDate, message, images, layoutPosition = 'bottom', youtubeUrl, plan } = storyData;
    const date = startDate ? new Date(startDate) : null;
    const videoId = youtubeUrl ? extractYouTubeID(youtubeUrl) : null;
    const backgroundImageUrl = images && images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop';

    const [topImageIndex, setTopImageIndex] = useState(0);
    const { scrollYProgress } = useScroll({
        container: isPreview ? containerRef : undefined
    });
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const timer = setTimeout(() => {
            setTopImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 6000);
        return () => clearTimeout(timer);
    }, [topImageIndex, images]);

    return (
        <div 
            ref={containerRef}
            className={`w-full flex flex-col relative ${isPreview ? 'h-full overflow-y-auto overflow-x-hidden' : 'min-h-screen pt-4 overflow-x-hidden'}`}
        >
            <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0`}>
              <motion.div style={{ scale, opacity }} className="w-full h-full">
                <img src={backgroundImageUrl} alt="" className="w-full h-full object-cover brightness-[0.2] blur-xl" />
              </motion.div>
              {isFreePlan(plan) && <Watermark />}
            </div>

            {/* Mute Toggle */}
            {videoId && hasEntered && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setIsMuted?.(!isMuted)}
                    className={`${isPreview ? 'absolute' : 'fixed'} bottom-8 right-8 z-50 p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white shadow-2xl hover:bg-white/10 hover:scale-110 transition-all active:scale-95`}
                >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </motion.button>
            )}

            {/* Main Immersive Hero */}
            <div className="px-4 w-full max-w-screen-2xl mx-auto relative z-10">
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative w-full ${isPreview ? 'min-h-[500px] aspect-[9/16]' : 'h-[calc(100vh-6rem)]'} flex flex-col rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden ${getLayoutContainerClasses(layoutPosition)} ring-1 ring-white/10`}
                >
                    {/* Cross-fading Gallery */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={images?.[topImageIndex]?.id || 'bg'}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${images?.[topImageIndex]?.image_url || backgroundImageUrl})` }}
                        >
                            <div className="absolute inset-0 bg-black/30" />
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Vignette & Gradients */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                    {/* Counter Layer */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className={`relative z-20 ${getLayoutPanelClasses(layoutPosition)}`}
                    >
                        <div className="max-w-4xl mx-auto text-center">
                            <DurationCounter startDate={date} />
                        </div>
                    </motion.div>
                
                    {(!images || images.length === 0) && !message && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <p className="text-white/30 text-lg font-black uppercase tracking-widest font-mono">Iniciando História...</p>
                      </div>
                    )}

                    {/* Scroll Indicator */}
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Role</span>
                                <ChevronDown className="w-5 h-5 animate-bounce" />
                            </div>
                        </motion.div>
                    )}
                </motion.section>
            </div>

            {/* Message Section - Scroll Revealed */}
            {message && (
                <section className="relative z-10 flex flex-col items-center justify-center w-full py-40 px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: isPreview ? "-20px" : "-100px" }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="card-elite p-12 md:p-24 max-w-5xl w-full text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        
                        <div className="relative z-10">
                            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-10" />
                            <p className="font-cursive text-white text-3xl sm:text-5xl lg:text-6xl leading-[1.3] mb-12">
                                {message}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-white/10" />
                                <Sparkles className="w-4 h-4 text-primary" />
                                <div className="h-[1px] w-12 bg-white/10" />
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Floating Ads/Upgrade for Free Users */}
            {isFreePlan(plan) && (
                <motion.a 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    href="/#/settings#pricing-section"
                    className={`${isPreview ? 'absolute' : 'fixed'} bottom-8 left-8 z-50 btn-secondary !bg-black/60 !backdrop-blur-xl group`}
                >
                    <Sparkles className="w-4 h-4 text-primary transition-transform group-hover:rotate-12" />
                    Remover Marca D'água
                </motion.a>
            )}

            {videoId && <YouTubePlayer videoId={videoId} isMuted={isMuted ?? true} hasEntered={!!hasEntered} />}
        </div>
    );
};

export default PublicStory;
