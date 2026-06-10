import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Calendar, Camera } from 'lucide-react';
import type { LoveStoryData } from '@/types';
import DurationCounter from '@/shared/ui/story-view/DurationCounter';
import { uiCopy } from '@/shared/lib/ui-copy';

interface DashboardSummaryProps {
  storyData: LoveStoryData;
  onEdit: () => void;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ storyData, onEdit }) => {
  const { startDate, images } = storyData;
  const date = startDate ? new Date(startDate) : null;
  const mainImage = images && images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-elite p-8 md:p-12 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 ring-1 ring-white/10">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${mainImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-6 left-8 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {images.length} {images.length === 1 ? 'Momento' : 'Momentos'}
            </span>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 font-mono">
              Sua História Ativa
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none">
            {uiCopy.dashboard.summaryTitle}
          </h2>
          
          <div className="py-8 transform scale-110 sm:scale-125">
            <DurationCounter startDate={date} />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="btn-secondary !py-4 !px-10 group"
          >
            <Edit3 className="w-4 h-4 text-primary transition-transform group-hover:rotate-12" />
            {uiCopy.dashboard.editStory}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSummary;
