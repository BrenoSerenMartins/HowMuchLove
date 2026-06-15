import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, CalendarDays } from 'lucide-react';
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
    const heroImages = storyData?.images || [];

    return (
      <div className="relative min-h-[calc(100vh-8rem)]">
        {/* Cinematic Background Layer - Evocative & Visible */}
        {isActiveStory && heroImages.length > 0 && (
           <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-10" />
              <div className="absolute inset-0 bg-[#050505]/40 z-10" />
              <div className="flex h-full w-full">
                 {heroImages.slice(0, 3).map((img, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 3, delay: idx * 0.8 }}
                        className="flex-grow h-full relative"
                    >
                        <img 
                            src={img.image_url} 
                            alt="" 
                            className="w-full h-full object-cover blur-[100px]"
                        />
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        <div className="container-fluid py-8 lg:py-16 space-y-12 relative z-10">
          {/* Dashboard System Header */}
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

          {/* The Unified Studio Deck */}
          <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="card-elite bg-white/[0.01] border-white/5 overflow-hidden relative shadow-[0_50px_100px_-30px_rgba(0,0,0,1)]"
          >
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full -mr-64 -mt-64 pointer-events-none" />
              
              {/* 1. HERO AREA: The Emotional Center (Full Width) */}
              <div className="relative min-h-[450px] md:min-h-[500px] flex items-center justify-center border-b border-white/5 overflow-hidden text-center p-8 md:p-12 lg:p-20">
                  {/* Internal Hero Backdrop - The "Soul" of the Story */}
                  {isActiveStory && heroImages[0] && (
                      <motion.div 
                        key={heroImages[0].image_url}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0"
                      >
                          <img 
                              src={heroImages[0].image_url} 
                              alt="" 
                              className="w-full h-full object-cover opacity-60 blur-[4px] scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                          <div className="absolute inset-0 bg-black/10 z-10" />
                      </motion.div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                  
                  {isActiveStory ? (
                      <div className="relative z-20 w-full">
                          <DashboardSummary storyData={storyData!} onEdit={() => setIsEditing(true)} onlyHero />
                      </div>
                  ) : isEditing ? (
                      <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative z-20 py-12"
                      >
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Modo de Edição Ativo</h2>
                          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Aperfeiçoando sua história em tempo real</p>
                      </motion.div>
                  ) : null}
              </div>

              {/* 2. DYNAMIC WORKSPACE: Changes between Management and Editing */}
              <div className={`grid grid-cols-1 ${isEditing ? 'xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x' : ''} divide-white/5 relative z-10`}>
                  
                  {/* Left: Actions & Editor */}
                  <div className="p-8 md:p-12 lg:p-16 space-y-16">
                      {!isActiveStory ? (
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
                      ) : (
                      <div className="space-y-16">
                          <DashboardSummary 
                            storyData={storyData!} 
                            onEdit={() => setIsEditing(true)} 
                            onPreview={() => setIsPreviewing(true)}
                            onlyStats 
                          />
                          
                          {shareLink && (
                          <div className="pt-12 border-t border-white/5">
                              <DashboardActions
                                  onShare={() => setIsQrModalOpen(true)}
                                  planFeatures={planFeatures}
                                  navigate={navigate}
                              />
                          </div>
                          )}
                      </div>
                      )}
                  </div>

                  {/* Right: Immersive Monitor (ONLY IN EDITING MODE) */}
                  {isEditing && (
                    <div className="p-8 md:p-12 lg:p-16 bg-black/20 relative group">
                        <div className="lg:sticky lg:top-32 space-y-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 font-mono">
                                    Studio Monitor v2.4
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live Sync</span>
                                </div>
                            </div>

                            <DashboardPreviewPane
                                storyData={previewStoryData}
                                planFeatures={planFeatures}
                                isEditing={isEditing}
                            />
                        </div>
                    </div>
                  )}
              </div>
          </motion.div>
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
            className="h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 backdrop-blur-3xl shadow-[0_50px_100px_-30px_rgba(0,0,0,1)] ring-8 ring-white/[0.02]"
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
