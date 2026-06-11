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
type PreviewDensity = 'default' | 'dense' | 'compact';

const getLayoutContainerClasses = (position: LayoutPosition) => {
    switch (position) {
        case 'top': return 'justify-start';
        case 'center': return 'justify-center items-center';
        case 'bottom': default: return 'justify-end';
    }
};

const getLayoutPanelClasses = (position: LayoutPosition, density: PreviewDensity = 'default') => {
    const isDense = density !== 'default';
    const isCompact = density === 'compact';
    const horizontalPadding = isCompact ? 'px-[clamp(0.75rem,3vw,2rem)]' : isDense ? 'px-[clamp(1rem,4vw,3rem)]' : 'px-[clamp(1rem,5vw,5rem)]';
    switch (position) {
        case 'top': return `w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent ${isCompact ? 'pt-[clamp(1.5rem,4vw,2.5rem)] pb-[clamp(5rem,10vw,7rem)]' : isDense ? 'pt-[clamp(2rem,4vw,3rem)] pb-[clamp(6rem,12vw,8rem)]' : 'pt-[clamp(2.5rem,5vw,3.5rem)] pb-[clamp(7rem,14vw,10rem)]'} ${horizontalPadding}`;
        case 'center': return `w-full max-w-7xl bg-black/30 backdrop-blur-md rounded-[clamp(1.5rem,4vw,3rem)] ${isCompact ? 'p-[clamp(1rem,3vw,2.25rem)]' : isDense ? 'p-[clamp(1.25rem,3vw,4rem)]' : 'p-[clamp(1.5rem,5vw,5.5rem)]'} border border-white/10 mx-auto`;
        case 'bottom': default: return `w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isCompact ? 'pt-[clamp(5rem,10vw,6rem)] pb-[clamp(1.25rem,3vw,2rem)]' : isDense ? 'pt-[clamp(6rem,10vw,8rem)] pb-[clamp(1.5rem,3vw,2.25rem)]' : 'pt-[clamp(7rem,12vw,9rem)] pb-[clamp(2rem,4vw,3rem)]'} ${horizontalPadding}`;
    }
};

const Watermark: React.FC<{ density?: PreviewDensity }> = ({ density = 'default' }) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='rgba(0,0,0,0)'/><text x='50%' y='50%' font-size='16' fill='white' fill-opacity='0.15' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45, 100, 100)' font-family='Plus Jakarta Sans' font-weight='900'>HOWMUCHLOVE</text></svg>`;
    const encodedSvg = `data:image/svg+xml;base64,${btoa(svg)}`;
    const isDense = density !== 'default';
    const isCompact = density === 'compact';

    return (
        <div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
                backgroundImage: `url("${encodedSvg}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: isCompact ? '140px 140px' : isDense ? '160px 160px' : '200px 200px',
                opacity: isCompact ? 0.24 : isDense ? 0.28 : 0.4
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
    previewDensityOverride?: PreviewDensity;
}

const PublicStory: React.FC<PublicStoryProps> = ({ storyData, hasEntered, isMuted, setIsMuted, isPreview = false, previewDensityOverride }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

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
    const [heroOrientation, setHeroOrientation] = useState<'landscape' | 'portrait'>('landscape');
    const { scrollYProgress } = useScroll({
        container: isPreview ? containerRef : undefined
    });

    const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

    useEffect(() => {
        if (!isPreview) return;

        const element = containerRef.current;
        if (!element) return;

        const updateSize = () => {
            setPreviewSize({
                width: element.clientWidth,
                height: element.clientHeight,
            });
        };

        updateSize();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);

        return () => observer.disconnect();
    }, [isPreview]);

    useEffect(() => {
        if (isPreview) return;

        const updateViewport = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();
        window.addEventListener('resize', updateViewport);

        return () => window.removeEventListener('resize', updateViewport);
    }, [isPreview]);

    const previewDensity: PreviewDensity = previewSize.width > 0 && previewSize.width < 420
        ? 'compact'
        : previewSize.width < 960
            ? 'dense'
            : 'default';
    const publicDensity: PreviewDensity = viewportSize.width >= 1280 ? 'dense' : 'default';
    const storyDensity: PreviewDensity = isPreview ? (previewDensityOverride ?? previewDensity) : publicDensity;
    const isDesktopStory = isPreview ? previewSize.width >= 960 : viewportSize.width >= 1024;
    const isDesktopPreview = isPreview && isDesktopStory;
    const heroHeightClass = isPreview
        ? (isDesktopStory ? 'aspect-video min-h-[540px]' : 'min-h-full')
        : isDesktopStory
            ? 'mx-auto'
            : 'h-[calc(100vh-6rem)]';
    const activeHeroImageUrl = images?.[topImageIndex]?.image_url || backgroundImageUrl;
    const heroDesktopViewportHeight = '100vh - 4rem';
    const heroDesktopStyle: React.CSSProperties | undefined = !isPreview && isDesktopStory
        ? {
            aspectRatio: '16 / 9',
            width: `min(100%, calc((${heroDesktopViewportHeight}) * 16 / 9))`,
            maxHeight: `calc(${heroDesktopViewportHeight})`,
            marginInline: 'auto',
        }
        : undefined;
    const isDesktopPublicHero = !isPreview && isDesktopStory;

    useEffect(() => {
        if (!isDesktopPublicHero) return;

        let cancelled = false;
        const image = new Image();
        image.onload = () => {
            if (cancelled) return;
            const isLandscape = (image.naturalWidth || 16) >= (image.naturalHeight || 9);
            setHeroOrientation(isLandscape ? 'landscape' : 'portrait');
        };
        image.onerror = () => {
            if (cancelled) return;
            setHeroOrientation('landscape');
        };
        image.src = activeHeroImageUrl;

        return () => {
            cancelled = true;
        };
    }, [activeHeroImageUrl, isDesktopPublicHero]);

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
            className={`w-full flex flex-col relative ${isPreview ? 'h-full overflow-y-auto overflow-x-hidden hide-scrollbar' : 'min-h-screen pt-4 overflow-x-hidden'}`}
        >
            <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 bg-[#050505]`}>
                <div className="absolute inset-0 z-[-1] lights-container opacity-40"></div>
                <div className="bg-grain" />
                <motion.div style={{ scale: isPreview ? 1 : bgScale, opacity: isPreview ? 0.2 : bgOpacity }} className="w-full h-full">
                    <img src={backgroundImageUrl} alt="" className="w-full h-full object-cover brightness-[0.2] blur-xl" />
                </motion.div>
                {isFreePlan(plan) && <Watermark density={storyDensity} />}
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
            <div className={`w-full max-w-[min(98vw,118rem)] mx-auto relative z-10 ${isDesktopPreview ? 'min-h-full p-2 pb-8 overflow-visible' : 'px-4'}`}>
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={heroDesktopStyle}
                    className={`relative w-full ${heroHeightClass} flex flex-col rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden ${getLayoutContainerClasses(layoutPosition)} ring-1 ring-white/10`}
                >
                    {/* Cross-fading Gallery */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={images?.[topImageIndex]?.id || 'bg'}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            {isDesktopPublicHero && heroOrientation === 'portrait' ? (
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <div className="h-full w-[clamp(34rem,40vw,46rem)] shrink-0 overflow-hidden">
                                        <img
                                            src={images?.[topImageIndex]?.image_url || backgroundImageUrl}
                                            alt=""
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${images?.[topImageIndex]?.image_url || backgroundImageUrl})` }}
                                />
                            )}
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
                        className={`relative z-20 ${getLayoutPanelClasses(layoutPosition, storyDensity)}`}
                    >
                        <div className={`mx-auto text-center ${storyDensity === 'compact' ? 'max-w-2xl' : storyDensity === 'dense' ? 'max-w-3xl' : 'max-w-4xl'}`}>
                            <DurationCounter startDate={date} density={storyDensity} />
                        </div>
                    </motion.div>

                    {(!images || images.length === 0) && !message && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <p className="text-white/30 text-lg font-black uppercase tracking-widest font-mono">Iniciando História...</p>
                        </div>
                    )}

                    {/* Scroll Indicator */}
                </motion.section>
            </div>

            {/* Message Section - Scroll Revealed */}
            {message && (
                <section className={`relative z-10 flex flex-col items-center justify-center w-full px-6 ${isPreview ? (storyDensity === 'compact' ? 'py-[clamp(2rem,5vw,3rem)]' : storyDensity === 'dense' ? 'py-[clamp(3rem,6vw,5rem)]' : 'py-[clamp(6rem,10vw,9rem)]') : 'py-[clamp(6rem,10vw,10rem)]'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: isPreview ? "-20px" : "-100px" }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className={`card-elite w-full text-center relative overflow-hidden ${isPreview ? (storyDensity === 'compact' ? 'max-w-full p-[clamp(1rem,3vw,1.5rem)]' : storyDensity === 'dense' ? 'max-w-[clamp(22rem,78vw,60rem)] p-[clamp(1.25rem,3vw,2.25rem)]' : 'max-w-[clamp(26rem,84vw,72rem)] p-[clamp(1.75rem,4vw,6rem)]') : 'max-w-[clamp(26rem,84vw,72rem)] p-[clamp(1.75rem,4vw,6rem)]'}`}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <Quote className={`text-primary/30 mx-auto ${isPreview && storyDensity === 'compact' ? 'w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] mb-[clamp(0.75rem,2vw,1rem)]' : isPreview && storyDensity === 'dense' ? 'w-[clamp(1.25rem,2vw,2rem)] h-[clamp(1.25rem,2vw,2rem)] mb-[clamp(0.9rem,2vw,1.5rem)]' : 'w-[clamp(1.5rem,3vw,3rem)] h-[clamp(1.5rem,3vw,3rem)] mb-[clamp(1rem,3vw,2.5rem)]'}`} />
                            <p className={`font-cursive text-white leading-[1.15] break-words ${isPreview && storyDensity === 'compact' ? 'text-[clamp(0.95rem,3.2vw,1.45rem)] mb-[clamp(0.75rem,2vw,1rem)]' : isPreview && storyDensity === 'dense' ? 'text-[clamp(1.1rem,2.5vw,2rem)] mb-[clamp(0.9rem,2vw,1.25rem)]' : 'text-[clamp(1.2rem,3vw,4rem)] mb-[clamp(1rem,3vw,2.5rem)]'}`}>
                                {message}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-white/10" />
                                <Sparkles className={`${isPreview && storyDensity === 'compact' ? 'w-[clamp(0.45rem,1vw,0.7rem)] h-[clamp(0.45rem,1vw,0.7rem)]' : isPreview && storyDensity === 'dense' ? 'w-[clamp(0.55rem,1.2vw,0.85rem)] h-[clamp(0.55rem,1.2vw,0.85rem)]' : 'w-[clamp(0.65rem,1.4vw,1rem)] h-[clamp(0.65rem,1.4vw,1rem)]'} text-primary`} />
                                <div className="h-[1px] w-12 bg-white/10" />
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Floating Ads/Upgrade for Free Users */}
            {!isPreview && isFreePlan(plan) && (
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
