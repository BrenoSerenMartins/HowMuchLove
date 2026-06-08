import React from 'react';
import type { LoveStoryData } from '@/types';
import PublicStory from '@/story/public/components/PublicStory';
import { uiCopy } from '@/shared/lib/ui-copy';

interface StoryPreviewProps {
  storyData: LoveStoryData | null;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyData }) => {
  if (!storyData) {
    return <div className="h-full w-full flex justify-center items-center bg-slate-900 text-white"><p>{uiCopy.dashboard.previewPlaceholder}</p></div>;
  }

  return (
    <PublicStory
      storyData={storyData}
      hasEntered
      isMuted={false}
      setIsMuted={() => {}}
      isPreview
    />
  );
};

export default StoryPreview;
