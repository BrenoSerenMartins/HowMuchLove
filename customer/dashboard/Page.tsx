import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Share2, 
  ArrowUpRight, 
  ChevronLeft, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useNotification } from '@/app/providers/NotificationProvider';
import QRCodeModal from './components/QRCodeModal';
import DashboardSummary from './components/DashboardSummary';
import { getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import { canShareStory } from '@/shared/lib/plans';
import StoryPreview from '@/shared/story-editor/StoryPreview';

// --- Styled ShareSection ---
const ShareSection: React.FC<{ shareUrl: string; onPreview: () => void; onShare: () => void; planFeatures: Partial<PlanFeatures> | null; navigate: (path: string) => void; }> = ({ shareUrl, onPreview, onShare, planFeatures, navigate }) => {
  const isFreePlan = !canShareStory(planFeatures);

  const handleShareClick = () => {
    if (isFreePlan) {
      navigate('/settings#pricing-section');
    } else {
      onShare();
    }
  };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 card-elite p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status da História</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-3">
              {uiCopy.dashboard.shareReadyTitle}
            </h3>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              {isFreePlan 
                ? uiCopy.dashboard.shareUpgradeDescription
                : uiCopy.dashboard.shareReadyDescription
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={onPreview}
              className="btn-secondary group flex-grow sm:flex-grow-0"
            >
              <Eye className="w-4 h-4" />
              {uiCopy.dashboard.preview}
            </button>
            <button
              onClick={handleShareClick}
              className="btn-primary group flex-grow sm:flex-grow-0"
            >
              <Share2 className="w-4 h-4" />
              {isFreePlan ? uiCopy.dashboard.upgrade : uiCopy.dashboard.share}
            </button>
          </div>
        </div>
      </motion.div>
    );
};

// --- Styled Dashboard Page ---
const DashboardPage: React.FC = () => {
  const { user, saveStory, loadStory, planFeatures } = useAuth();
  const { setIsDirty, navigate, setPreviewMode } = useNavigate();
  const { addToast } = useNotification();
  const [storyData, setStoryData] = useState<LoveStoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const generateShareLink = (userId: string) => {
      const storyId = encodeURIComponent(userId);
      const baseUrl = window.location.href.split('#')[0];
      return `${baseUrl}#/story/${storyId}`;
  }

  useEffect(() => {
    return () => { setIsDirty(false); };
  }, [setIsDirty]);

  useEffect(() => {
    setPreviewMode(isPreviewing);
    return () => setPreviewMode(false);
  }, [isPreviewing, setPreviewMode]);

  useEffect(() => {
    const fetchStory = async () => {
        setIsLoading(true);
      try {
        const data = await loadStory();
        setStoryData(data || { startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', removePassword: false, requiresPassword: false, entryButtonText: '' });
        if (data?.startDate && user) {
          setShareLink(generateShareLink(user.id));
        }
      } catch (error) {
        addToast(getErrorMessage(error, uiCopy.dashboard.loadError), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (!isPreviewing) {
        fetchStory();
    }
  }, [loadStory, user, isPreviewing]);

  const handleSaveStory = async (newData: LoveStoryData, newFiles: File[], imageIdsToDelete: number[]) => {
    setSaveStatus('saving');
    try {
      await saveStory(newData, newFiles, imageIdsToDelete);
      const updatedStoryData = await loadStory();
      setStoryData(updatedStoryData || newData);
      if (updatedStoryData?.startDate && user) {
        setShareLink(generateShareLink(user.id));
      } else {
        setShareLink(null);
      }
      setIsDirty(false);
      addToast(uiCopy.dashboard.saveSuccess, 'success');
      setIsEditing(false);
    } catch (error) {
      addToast(getErrorMessage(error, uiCopy.dashboard.saveError), 'error');
    } finally {
      setSaveStatus('idle');
    }
  };

  const renderContent = () => {
    if (isLoading || !planFeatures) {
      return (
        <div className="flex justify-center items-center py-32">
          <LoadingSpinner />
        </div>
      );
    }
    
    if (storyData?.startDate && !isEditing) {
      return (
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DashboardSummary storyData={storyData} onEdit={() => setIsEditing(true)} />
          </motion.div>
          {shareLink && <ShareSection 
            shareUrl={shareLink} 
            onPreview={() => setIsPreviewing(true)} 
            onShare={() => setIsQrModalOpen(true)}
            planFeatures={planFeatures}
            navigate={navigate}
          />}
        </div>
      );
    }

    const welcomeText = isEditing 
      ? uiCopy.dashboard.editMode 
      : uiCopy.dashboard.welcome;
    const subText = isEditing
      ? uiCopy.dashboard.editModeDescription
      : uiCopy.dashboard.draftDescription;

    return (
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary font-mono">Espaço Criativo</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                {welcomeText} {!isEditing && <span className="text-primary italic font-cursive lowercase tracking-normal px-2">{user?.name}!</span>}
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                {subText}
            </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
            <CounterDemo 
              initialData={storyData} 
              onSave={handleSaveStory}
              onCancel={() => setIsEditing(false)}
              saveStatus={saveStatus}
              isDashboard 
              onDirty={() => setIsDirty(true)}
              planFeatures={planFeatures}
            />
        </motion.div>
      </div>
    );
  };
  
  if (isPreviewing) {
    const previewData = { ...storyData, plan: planFeatures };
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#050505] p-3 md:p-10">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-8 ring-white/[0.02]"
          >
            <StoryPreview storyData={previewData} plan={planFeatures} />
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsPreviewing(false)}
            className="fixed top-8 left-8 z-[110] btn-secondary group !bg-black/60 !backdrop-blur-xl"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {uiCopy.story.backToEditor}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
        {renderContent()}
        {shareLink && (
            <QRCodeModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                url={shareLink}
                title={storyData?.storyTitle || uiCopy.dashboard.previewTitle}
            />
        )}
    </PageWrapper>
  );
};

export default DashboardPage;
