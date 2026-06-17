import type { CSSProperties } from 'react';

export type LayoutPosition = 'top' | 'center' | 'bottom';
export type PreviewDensity = 'default' | 'dense' | 'compact';

export const resolvePreviewDensity = (width: number): PreviewDensity => {
  if (width > 0 && width < 640) {
    return 'compact';
  }

  if (width < 1100) {
    return 'dense';
  }

  return 'default';
};

export const resolvePublicDensity = (width: number): PreviewDensity => {
  return resolvePreviewDensity(width);
};

export const resolveIsDesktopStory = (isPreview: boolean, previewWidth: number, viewportWidth: number) => {
  const width = isPreview ? previewWidth : viewportWidth;
  return width >= 1024;
};

export const getLayoutContainerClasses = (position: LayoutPosition) => {
  switch (position) {
    case 'top':
      return 'justify-start';
    case 'center':
      return 'justify-center items-center';
    case 'bottom':
    default:
      return 'justify-end';
  }
};

export const getLayoutPanelClasses = (position: LayoutPosition, density: PreviewDensity = 'default') => {
  const isDense = density === 'dense';
  const isCompact = density === 'compact';
  const horizontalPadding = isCompact ? 'px-[clamp(0.75rem,3vw,2rem)]' : isDense ? 'px-[clamp(1rem,4vw,3rem)]' : 'px-[clamp(1rem,5vw,5rem)]';

  switch (position) {
    case 'top':
      return `w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent ${isCompact ? 'pt-[clamp(1.5rem,4vw,2.5rem)] pb-[clamp(5rem,10vw,7rem)]' : isDense ? 'pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(6rem,12vw,9rem)]' : 'pt-[clamp(2.5rem,5vw,4.5rem)] pb-[clamp(8rem,16vw,12rem)]'} ${horizontalPadding}`;
    case 'center':
      return `w-full max-w-7xl bg-black/30 backdrop-blur-md rounded-[clamp(1.5rem,4vw,3rem)] ${isCompact ? 'p-[clamp(1rem,3vw,2.25rem)]' : isDense ? 'p-[clamp(1.25rem,3vw,4rem)]' : 'p-[clamp(1.5rem,5vw,5.5rem)]'} border border-white/10 mx-auto`;
    case 'bottom':
    default:
      return `w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isCompact ? 'pt-[clamp(5rem,10vw,6rem)] pb-[clamp(1.5rem,3vw,2.5rem)]' : isDense ? 'pt-[clamp(6rem,10vw,8rem)] pb-[clamp(1.75rem,3vw,3rem)]' : 'pt-[clamp(8rem,14vw,11rem)] pb-[clamp(2.5rem,5vw,5rem)]'} ${horizontalPadding}`;
  }
};

export const getHeroHeightClass = (isPreview: boolean, isDesktopStory: boolean) => {
  return isDesktopStory ? 'h-auto min-h-[500px]' : 'min-h-[calc(100svh-2rem)]';
};

export const getDesktopHeroStyle = (viewportHeight = '100vh - 4rem'): CSSProperties => ({
  aspectRatio: '16 / 9',
  width: `min(100%, calc((${viewportHeight}) * 16 / 9))`,
  maxHeight: `calc(${viewportHeight})`,
  marginInline: 'auto',
});
