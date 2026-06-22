import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, CalendarDays, PencilLine, Star, Share2, ArrowUpRight, Heart } from 'lucide-react';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useNotification } from '@/app/providers/NotificationProvider';
import QRCodeModal from './components/QRCodeModal';
import DashboardHero from './components/DashboardHero';
import DashboardSummary from './components/DashboardSummary';
import DashboardActions from './components/DashboardActions';
import DashboardPreviewPane from './components/DashboardPreviewPane';
import { getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';
import PublicStory from '@/shared/ui/story-view/PublicStory';

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

  if (isLoading || !planFeatures) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (isPreviewing) {
    const previewData = { ...storyData, plan: user?.plan || 'Gratis' } as LoveStoryData;
    return (
      <div className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col h-screen w-screen overflow-hidden">
          <PublicStory 
            storyData={previewData} 
            isPreview={true} 
            hasEntered={true} 
            isMuted={true}
          />

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsPreviewing(false)}
            className="fixed top-8 left-8 z-[110] btn-secondary group !bg-black/60 !backdrop-blur-xl border-white/10 shadow-2xl pointer-events-auto"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao Dashboard
          </motion.button>
      </div>
    );
  }

  const isActiveStory = Boolean(storyData?.startDate && !isEditing);
  const previewStoryData = isEditing ? editorPreviewData ?? storyData : storyData;
  const heroImages = storyData?.images || [];

  return (
    <PageWrapper>
      <div className="relative">
        
        {/* Cinematic Background Layer - Liquid & Breathing - Portal to Body for Zero Clipping */}
        {isActiveStory && heroImages.length > 0 && createPortal(
           <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-60 animate-fade-in">
              {/* Soft Environmental Masks - Transparent at top to merge with shell */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]/40 z-10" />
              
              <div className="flex h-full w-full">
                 {heroImages.slice(0, 3).map((img, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ 
                            opacity: 1, 
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                            duration: 15, 
                            repeat: Infinity, 
                            ease: "linear",
                            delay: idx * 2
                        }}
                        className="flex-grow h-full relative"
                    >
                        <img 
                            src={img.image_url} 
                            alt="" 
                            className="w-full h-full object-cover blur-[80px]"
                        />
                    </motion.div>
                 ))}
              </div>
           </div>,
           document.body
        )}

        <div className="relative z-10 pb-32 pt-0 space-y-[clamp(2rem,6vh,8rem)]">
          {/* 1. HERO AREA: The Emotional Center (Unified Artistic Deck) */}
          <div className="container-fluid pt-[clamp(3rem,6vh,5rem)]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full min-h-[clamp(35rem,65vh,55rem)] rounded-[clamp(2.5rem,7vw,6rem)] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center group"
              >
                  {/* Backdrop Layer */}
                  {isActiveStory && heroImages[0] && (
                      <>
                          <img 
                              src={heroImages[0].image_url} 
                              alt="" 
                              className="absolute inset-0 w-full h-full object-cover opacity-70 blur-[2px] scale-110 transition-transform duration-[25s] group-hover:scale-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/20 z-10" />
                          <div className="absolute inset-0 bg-black/5 z-10" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 z-20 rounded-[clamp(2.5rem,7vw,6rem)]" />
                      </>
                  )}

                  {/* Dynamic Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent pointer-events-none z-10" />
                  
                  {/* Submerged Content: Perfectly Contained & Centered */}
                  <div className="relative z-30 w-full px-[clamp(1.5rem,6vw,6rem)] py-12 drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                      {isActiveStory ? (
                          <DashboardHero storyData={storyData!} />
                      ) : isEditing ? (
                          <div className="text-center space-y-6 animate-fade-in-up">
                              <h2 className="text-[clamp(3rem,9vw,6rem)] font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">Studio <br/> Creation</h2>
                              <p className="text-primary font-cursive text-[clamp(1.5rem,4vw,3rem)] lowercase italic tracking-normal">Aperfeiçoando sua jornada...</p>
                          </div>
                      ) : null}
                  </div>
              </motion.div>
          </div>

          {/* 2. DYNAMIC WORKSPACE: Floating Content Grid */}
          <div className="container-fluid px-[clamp(1rem,5vw,5rem)] max-w-fluid mx-auto w-full">
              <div className={`grid grid-cols-1 ${isEditing ? 'xl:grid-cols-2 gap-24' : ''} relative z-10`}>
                  
                  {/* Left: Actions & Editor */}
                  <div className="space-y-[clamp(1.5rem,4vh,4rem)]">
                      {!isActiveStory ? (
                      <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6 }}
                          className="p-[clamp(1.5rem,5vw,4rem)] border border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[clamp(2rem,4vw,3rem)]"
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
                      <div className="space-y-[clamp(2rem,6vh,10rem)] max-w-4xl mx-auto w-full">
                          <DashboardSummary 
                            storyData={storyData!} 
                            onEdit={() => setIsEditing(true)} 
                            onPreview={() => setIsPreviewing(true)}
                          />
                          
                          {shareLink && (
                            <DashboardActions
                                onShare={() => setIsQrModalOpen(true)}
                                planFeatures={planFeatures}
                                navigate={navigate}
                            />
                          )}
                      </div>
                      )}
                  </div>

                  {/* Right: Immersive Monitor (ONLY IN EDITING MODE) */}
                  {isEditing && (
                    <div className="relative group p-8 md:p-12 lg:p-16 border border-primary/[0.05] bg-primary/[0.02] backdrop-blur-3xl rounded-[3rem]">
                        <div className="lg:sticky lg:top-32 space-y-10">
                            <div className="flex items-center justify-between px-4">
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
          </div>
        </div>
        {shareLink && (
            <QRCodeModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                url={shareLink}
                title={storyData?.storyTitle || uiCopy.dashboard.previewTitle}
            />
        )}
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
