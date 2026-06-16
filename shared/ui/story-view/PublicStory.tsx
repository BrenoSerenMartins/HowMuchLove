import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

    const previewDensity: PreviewDensity = resolvePreviewDensity(previewSize.width);
    const publicDensity: PreviewDensity = resolvePublicDensity(viewportSize.width);
    const storyDensity: PreviewDensity = isPreview ? (previewDensityOverride ?? previewDensity) : publicDensity;
    const isDesktopStory = resolveIsDesktopStory(isPreview, previewSize.width, viewportSize.width);
    const isDesktopPreview = isPreview && isDesktopStory;
    const heroHeightClass = getHeroHeightClass(isPreview, isDesktopStory);
    const activeHeroImageUrl = images?.[topImageIndex]?.image_url || backgroundImageUrl;
    const heroDesktopStyle = !isPreview && isDesktopStory ? getDesktopHeroStyle('100vh - 4rem') : undefined;
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
                {isFreePlan(plan) && <StoryWatermark density={storyDensity} />}
            </div>

            {/* Main Immersive Hero */}
            <div className={`w-full max-w-[min(98vw,118rem)] mx-auto relative z-10 ${isDesktopPreview ? 'min-h-full p-2 pb-8 overflow-visible' : 'px-4'}`}>
                <StoryHero
                    images={images}
                    backgroundImageUrl={backgroundImageUrl}
                    activeHeroImageUrl={activeHeroImageUrl}
                    topImageIndex={topImageIndex}
                    date={date}
                    layoutPosition={layoutPosition}
                    storyDensity={storyDensity}
                    heroOrientation={heroOrientation}
                    isDesktopPublicHero={isDesktopPublicHero}
                    heroHeightClass={heroHeightClass}
                    heroDesktopStyle={heroDesktopStyle}
                    showEmptyState={(!images || images.length === 0) && !message}
                    plan={plan}
                />
            </div>

            {/* Message Section - Scroll Revealed */}
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
