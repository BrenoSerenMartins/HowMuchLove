import React from 'react';
import type { PreviewDensity } from './story-layout';

interface StoryWatermarkProps {
  density?: PreviewDensity;
}

const StoryWatermark: React.FC<StoryWatermarkProps> = ({ density = 'default' }) => {
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
        opacity: isCompact ? 0.24 : isDense ? 0.28 : 0.4,
      }}
    />
  );
};

export default StoryWatermark;
