import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { LoveStoryData } from '@/types';
import YouTubePlayer from './YouTubePlayer';
import StoryHero from './StoryHero';
import StoryMessage from './StoryMessage';
import StoryFloatingControls from './StoryFloatingControls';
import StoryWatermark from './StoryWatermark';
import { uiCopy } from '@/shared/lib/ui-copy';
import { isFreePlan } from '@/shared/lib/plans';
import {
    getDesktopHeroStyle,
    getHeroHeightClass,
    resolveIsDesktopStory,
    resolvePreviewDensity,
    resolvePublicDensity,
    type PreviewDensity,
} from './story-layout';

const extractYouTubeID = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
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
    const [containerWidth, setContainerWidth] = useState(0);

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
    
    // The component now only cares about its own container's scroll progress
    const { scrollYProgress } = useScroll({
        container: containerRef
    });

    const bgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const updateSize = () => {
            setContainerWidth(element.clientWidth);
        };

        updateSize();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    // All density and layout logic now flows from containerWidth
    const storyDensity: PreviewDensity = previewDensityOverride ?? resolvePreviewDensity(containerWidth);
    const isDesktopStory = containerWidth >= 1024;
    const heroHeightClass = getHeroHeightClass(isPreview, isDesktopStory);
    const activeHeroImageUrl = images?.[topImageIndex]?.image_url || backgroundImageUrl;
    
    // Dynamic Hero Styling based on available container space
    const heroDesktopStyle: CSSProperties | undefined = isDesktopStory ? {
        aspectRatio: '16 / 9',
        width: '100%',
        maxWidth: '1200px',
        marginInline: 'auto',
    } : undefined;

    useEffect(() => {
        if (!isDesktopStory) return;

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
    }, [activeHeroImageUrl, isDesktopStory]);

    useEffect(() => {
        const imagesCount = images?.length || 0;
        if (imagesCount <= 1) return;
        
        const timer = setInterval(() => {
            setTopImageIndex((prevIndex) => (prevIndex + 1) % imagesCount);
        }, 5000); 
        
        return () => clearInterval(timer);
    }, [images?.length]);

    return (
        <div
            ref={containerRef}
            className={`w-full flex flex-col relative h-full min-h-screen overflow-y-auto overflow-x-hidden hide-scrollbar`}
        >
            <div className="absolute inset-0 z-0 bg-[#050505] pointer-events-none">
                <div className="absolute inset-0 z-[-1] lights-container opacity-40"></div>
                <div className="bg-grain fixed" />
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={activeHeroImageUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <img 
                            src={activeHeroImageUrl} 
                            alt="" 
                            fetchpriority="high"
                            decoding="async"
                            className="w-full h-full object-cover blur-3xl scale-110" 
                        />
                    </motion.div>
                </AnimatePresence>
                {isFreePlan(plan) && <StoryWatermark density={storyDensity} />}
            </div>

            {/* Main Immersive Hero - Now fully aware of its container space */}
            <div className={`w-full max-w-[1400px] mx-auto relative z-10 ${isDesktopStory ? 'p-[clamp(1rem,4vw,3rem)]' : 'p-4'}`}>
                <StoryHero
                    images={images}
                    backgroundImageUrl={backgroundImageUrl}
                    activeHeroImageUrl={activeHeroImageUrl}
                    topImageIndex={topImageIndex}
                    date={date}
                    layoutPosition={layoutPosition}
                    storyDensity={storyDensity}
                    heroOrientation={heroOrientation}
                    isDesktopPublicHero={isDesktopStory}
                    heroHeightClass={heroHeightClass}
                    heroDesktopStyle={heroDesktopStyle}
                    showEmptyState={(!images || images.length === 0) && !message}
                    plan={plan}
                />
            </div>

            {/* Message Section - Scroll Revealed within local container */}
            {message && (
                <StoryMessage message={message} isPreview={isPreview} storyDensity={storyDensity} />
            )}

            <StoryFloatingControls
                isPreview={isPreview}
                videoId={videoId}
                hasEntered={!!hasEntered}
                isMuted={isMuted ?? true}
                onToggleMute={() => setIsMuted?.(!isMuted)}
                showUpgradeCta={!isPreview && isFreePlan(plan)}
            />

            {videoId && <YouTubePlayer videoId={videoId} isMuted={isMuted ?? true} hasEntered={!!hasEntered} />}
        </div>
    );
};

export default PublicStory;
