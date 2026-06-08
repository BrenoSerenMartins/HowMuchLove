import React, { useState, useEffect } from 'react';
import CounterDemo from '@/shared/story-editor/CounterDemo';
import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate } from '@/app/hooks/useNavigate';
import type { LoveStoryData, PlanFeatures } from '@/types';
import PageWrapper from '@/shared/ui/PageWrapper';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useNotification } from '@/app/providers/NotificationProvider';
import QRCodeModal from './components/QRCodeModal';
import PublicStory from '@/story/public/components/PublicStory';
import BottomNavBar from '@/shared/ui/BottomNavBar';
import DashboardSummary from './components/DashboardSummary';
import { getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';

// --- Styled ShareSection ---
  const ShareSection: React.FC<{ shareUrl: string; onPreview: () => void; onShare: () => void; planFeatures: Partial<PlanFeatures> | null; navigate: (path: string) => void; }> = ({ shareUrl, onPreview, onShare, planFeatures, navigate }) => {
  const isGratis = planFeatures?.name === 'Gratis';

  const handleShareClick = () => {
    if (isGratis) {
      navigate('/settings#pricing-section');
    } else {
      onShare();
    }
  };

    return (
      <div className="mt-12 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-black/30">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
          <h3 className="font-bold text-lg text-white">{uiCopy.dashboard.shareReadyTitle}</h3>
          <p className="text-slate-300 mt-1 text-sm">
            {isGratis 
              ? uiCopy.dashboard.shareUpgradeDescription
              : uiCopy.dashboard.shareReadyDescription
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onPreview}
            className="w-full bg-white/20 text-center border border-white/20 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            {uiCopy.dashboard.preview}
          </button>
          <button
            onClick={handleShareClick}
            className="w-full font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            {isGratis ? uiCopy.dashboard.upgrade : uiCopy.dashboard.share}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styled ShareSection ---
// ... (ShareSection component remains the same)

// --- Styled Dashboard Page ---
const DashboardPage: React.FC = () => {
  const { user, logout, saveStory, loadStory, planFeatures } = useAuth();
  const { setIsDirty, navigate, setPreviewMode } = useNavigate(); // Destructure setPreviewMode
  const { addToast } = useNotification();
  const [storyData, setStoryData] = useState<LoveStoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // This is for the story data
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

  // Effect to manage global preview mode state
  useEffect(() => {
    setPreviewMode(isPreviewing);
    return () => setPreviewMode(false); // Ensure it's reset on unmount
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
      setIsEditing(false); // Return to summary view
    } catch (error) {
      addToast(getErrorMessage(error, uiCopy.dashboard.saveError), 'error');
    } finally {
      setSaveStatus('idle');
    }
  };

  // This is the single source of truth for what this page should render.
  const renderContent = () => {
    if (isLoading || !planFeatures) {
      return (
        <PageWrapper>
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </PageWrapper>
      );
    }
    
    // User has an existing story and is NOT in editing mode -> Show Summary
    if (storyData?.startDate && !isEditing) {
      return (
        <PageWrapper>
          <div className="animate-fade-in-slide-up">
            <DashboardSummary storyData={storyData} onEdit={() => setIsEditing(true)} />
          </div>
          {shareLink && <div className="animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}><ShareSection 
            shareUrl={shareLink} 
            onPreview={() => setIsPreviewing(true)} 
            onShare={() => setIsQrModalOpen(true)}
            planFeatures={planFeatures}
            navigate={navigate}
          /></div>}
        </PageWrapper>
      );
    }

    // User is a NEW user OR is in editing mode -> Show Editor
    const welcomeText = isEditing 
      ? uiCopy.dashboard.editMode 
      : uiCopy.dashboard.welcome;
    const subText = isEditing
      ? uiCopy.dashboard.editModeDescription
      : uiCopy.dashboard.draftDescription;

    return (
      <PageWrapper>
        <div className="text-center mb-10 animate-fade-in-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0px 2px 5px rgba(0,0,0,0.3)'}}>
                {welcomeText} {!isEditing && <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{user?.name}!</span>}
            </h1>
            <p className="text-slate-300 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
                {subText}
            </p>
        </div>
        <div className="transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-3xl animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
            <CounterDemo 
              initialData={storyData} 
              onSave={handleSaveStory}
              onCancel={() => setIsEditing(false)}
              saveStatus={saveStatus}
              isDashboard 
              onDirty={() => setIsDirty(true)}
              planFeatures={planFeatures}
            />
        </div>
      </PageWrapper>
    );
  };
  
  if (isPreviewing) {
    const previewData = { ...storyData, plan: planFeatures?.name };
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900">
        <PublicStory storyData={previewData} hasEntered isMuted={false} setIsMuted={() => {}} />
            <button
            onClick={() => setIsPreviewing(false)}
            className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-xl text-white font-semibold py-2 px-4 rounded-lg border border-white/10 shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
        >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {uiCopy.story.backToEditor}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white relative">
        <main className="flex-grow container mx-auto py-8 md:py-12 z-10 pb-20 md:pb-12">
            {renderContent()}
        </main>
        {shareLink && (
            <QRCodeModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                url={shareLink}
                title={storyData?.storyTitle || uiCopy.dashboard.previewTitle}
            />
        )}
        <BottomNavBar onMenuOpen={() => {}} onLogoutRequest={logout} />
    </div>
  );
};

export default DashboardPage;
