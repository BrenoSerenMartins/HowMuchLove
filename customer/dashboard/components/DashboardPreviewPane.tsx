import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { LoveStoryData, PlanFeatures } from '@/types';
import StoryPreview from '@/shared/story-editor/StoryPreview';

const DashboardPreviewPane: React.FC<{
  storyData: LoveStoryData | null;
  planFeatures: Partial<PlanFeatures> | null;
  isEditing?: boolean;
}> = ({ storyData, planFeatures }) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex h-full w-full max-w-[clamp(360px,30vw,520px)] flex-col gap-4 xl:sticky xl:top-28"
    >
      <StoryPreview storyData={storyData} plan={planFeatures} showInteractionHint={false} />
    </motion.aside>
  );
};

export default DashboardPreviewPane;
