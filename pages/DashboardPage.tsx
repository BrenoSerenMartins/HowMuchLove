import React, { useState, useEffect } from 'react';
import CounterDemo from '../components/CounterDemo';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate';
import type { LoveStoryData, Plan } from '../types';
import PageWrapper from '../components/PageWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import QRCodeModal from '../components/QRCodeModal';
import PublicStory from '../components/PublicStory';
import BottomNavBar from '../components/BottomNavBar';

// --- Styled ShareSection ---
const ShareSection: React.FC<{ shareUrl: string; onPreview: () => void; onShare: () => void; planFeatures: Partial<Plan> | null; navigate: (path: string) => void; }> = ({ shareUrl, onPreview, onShare, planFeatures, navigate }) => {
  const isGratis = planFeatures?.plan_name === 'Gratis';

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
          <h3 className="font-bold text-lg text-white">Sua história está no ar!</h3>
          <p className="text-slate-300 mt-1 text-sm">
            {isGratis 
              ? "Faça um upgrade para compartilhar sua história com o mundo."
              : "Use os botões para ver uma prévia ou compartilhar com o mundo."
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onPreview}
            className="w-full bg-white/20 text-center border border-white/20 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            Ver Prévia
          </button>
          <button
            onClick={handleShareClick}
            className="w-full font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            {isGratis ? 'Fazer Upgrade' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styled Dashboard Page ---
const DashboardPage: React.FC = () => {
  const { user, logout, saveStory, loadStory, deleteImage, planFeatures } = useAuth();
  const { setIsDirty, navigate } = useNavigate();
  const { addToast } = useNotification();
  const [storyData, setStoryData] = useState<LoveStoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const generateShareLink = (email: string) => {
      const storyId = btoa(email);
      const baseUrl = window.location.href.split('#')[0];
      return `${baseUrl}#/story/${storyId}`;
  }

  useEffect(() => {
    return () => { setIsDirty(false); };
  }, [setIsDirty]);

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      const data = await loadStory();
      setStoryData(data || { startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', entryButtonText: '' });
      if (data?.startDate && user) {
        setShareLink(generateShareLink(user.email));
      }
      setIsLoading(false);
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
        setShareLink(generateShareLink(user.email));
      } else {
        setShareLink(null);
      }
      setIsDirty(false);
      addToast('Sua história foi salva com sucesso!', 'success');
    } catch (error) {
      console.error("Failed to save story", error);
      addToast('Ocorreu um erro ao salvar. Tente novamente.', 'error');
    } finally {
      setSaveStatus('idle');
    }
  };

  // Add a loading check for planFeatures
  if (isLoading || !planFeatures) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      );
    }
    
    const WelcomeHeader = (
        <div className="text-center mb-10 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0px 2px 5px rgba(0,0,0,0.3)'}}>
                {storyData?.startDate ? 'Bem-vindo(a) de volta,' : 'Seja bem-vindo(a),'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{user?.name}!</span>
            </h1>
            <p className="text-slate-300 mt-3 text-base sm:text-lg max-w-2xl mx-auto">
                {storyData?.startDate 
                    ? 'Esta é a sua história. Personalize, salve, reviva e compartilhe seus momentos.'
                    : 'Sua história de amor ainda não foi contada. Preencha os detalhes abaixo para começar a celebrar cada momento.'
                }
            </p>
        </div>
    );

    return (
      <PageWrapper>
        {WelcomeHeader}
        <div className="transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-3xl animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
            <CounterDemo 
              initialData={storyData} 
              onSave={handleSaveStory} 
              onImageDelete={deleteImage}
              saveStatus={saveStatus}
              isDashboard 
              onDirty={() => setIsDirty(true)}
              planFeatures={planFeatures}
            />
        </div>
        {shareLink && <div className="animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}><ShareSection 
          shareUrl={shareLink} 
          onPreview={() => setIsPreviewing(true)} 
          onShare={() => setIsQrModalOpen(true)}
          planFeatures={planFeatures}
          navigate={navigate}
        /></div>}
      </PageWrapper>
    );
  };
  
  if (isPreviewing) {
    const previewData = { ...storyData, plan: planFeatures?.plan_name };
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900">
        <PublicStory storyData={previewData} hasEntered isMuted={false} setIsMuted={() => {}} />
        <button
            onClick={() => setIsPreviewing(false)}
            className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm text-slate-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-white transition-all duration-300 flex items-center gap-2 group"
        >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Voltar ao Editor
        </button>
      </div>
    );
  }

  const backgroundImageUrl = storyData?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <div className="min-h-screen flex flex-col text-white relative">
        <main className="flex-grow container mx-auto px-8 py-8 md:py-12 z-10 pb-20 md:pb-12">
            {renderContent()}
        </main>
        {shareLink && (
            <QRCodeModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                url={shareLink}
                title={storyData?.storyTitle || 'Nossa História de Amor'}
            />
        )}
        <BottomNavBar onMenuOpen={() => {}} onLogoutRequest={logout} />
    </div>
  );
};

export default DashboardPage;
