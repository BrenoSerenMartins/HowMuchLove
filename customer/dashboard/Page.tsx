import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useNotification } from '@/app/providers/NotificationProvider';
import QRCodeModal from './components/QRCodeModal';
import DashboardSummary from './components/DashboardSummary';
import DashboardActions from './components/DashboardActions';
import DashboardPreviewPane from './components/DashboardPreviewPane';
import { getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import StoryPreview from '@/shared/story-editor/StoryPreview';

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
  const [editorPreviewData, setEditorPreviewData] = useState<LoveStoryData | null>(null);
  
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
        setEditorPreviewData(data || { startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', removePassword: false, requiresPassword: false, entryButtonText: '' });
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
      setEditorPreviewData(updatedStoryData || newData);
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
    
    const isActiveStory = Boolean(storyData?.startDate && !isEditing);
    const previewStoryData = isEditing ? editorPreviewData ?? storyData : storyData;

    const welcomeText = isEditing 
      ? uiCopy.dashboard.editMode 
      : uiCopy.dashboard.welcome;

    return (
      <div className="container-fluid py-8 lg:py-16 space-y-24">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-4"
        >
          <div className="space-y-4">
            <h1 className="text-fluid-h2 font-black text-white leading-[0.9] tracking-tighter uppercase">
              {isEditing ? 'Aperfeiçoe seu' : 'Seu Legado'} <br />
              <span className="text-primary italic font-cursive lowercase tracking-normal px-2">
                {isEditing ? 'legado digital.' : 'está vivo.'}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black uppercase tracking-widest font-mono">Live Studio</span>
             </div>
             <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
             <p className="text-[10px] font-black uppercase tracking-widest font-mono hidden md:block">
                v2.4.0
             </p>
          </div>
        </motion.div>

        {/* Free-Flow Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[clamp(4rem,10vw,12rem)] items-start">
          {/* Left Side: Management Console OR Editor */}
          <div className="space-y-24 px-4">
            {isActiveStory ? (
              <>
                <DashboardSummary storyData={storyData!} onEdit={() => setIsEditing(true)} />
                
                {shareLink && (
                  <div className="pt-12 border-t border-white/5">
                      <DashboardActions
                        shareUrl={shareLink}
                        onPreview={() => setIsPreviewing(true)}
                        onShare={() => setIsQrModalOpen(true)}
                        planFeatures={planFeatures}
                        navigate={navigate}
                      />
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
                  showPreview={false}
                  onPreviewDataChange={setEditorPreviewData}
                />
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-8 group pt-8 border-t border-white/5"
            >
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-500 group-hover:text-primary transition-all duration-500">
                  <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">Dica do Studio</p>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md">
                      Mantenha sua história atualizada com novos momentos para que ela nunca pare de crescer e emocionar.
                  </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Immersive Monitor Pane */}
          <div className="lg:sticky lg:top-32 relative group px-4">
             {/* Background atmosphere specifically for the monitor area */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
             
             <DashboardPreviewPane
               storyData={previewStoryData}
               planFeatures={planFeatures}
               isEditing={isEditing}
             />
             
             <div className="mt-12 flex justify-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 font-mono">
                  Interação Ativa • Monitor v2.4
                </span>
             </div>
          </div>
        </div>
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
