import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CounterDemo from '../components/CounterDemo';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '../hooks/useNavigate'; // Use the custom useNavigate hook
import type { LoveStoryData } from '../types';
import PageWrapper from '../components/PageWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import QRCodeModal from '../components/QRCodeModal';
import PublicStory from '../components/PublicStory';

const ShareSection: React.FC<{ shareUrl: string; onPreview: () => void; onShare: () => void; plan?: string; navigate: (path: string) => void; }> = ({ shareUrl, onPreview, onShare, plan, navigate }) => {
  const isGratis = plan === 'Gratis';

  const handleShareClick = () => {
    if (isGratis) {
      navigate('/settings#pricing-section');
    } else {
      onShare();
    }
  };

  return (
    <div className="mt-8 bg-pink-50/80 backdrop-blur-sm border-t-2 border-pink-200 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg text-pink-800">Sua história está no ar!</h3>
          <p className="text-pink-700 mt-1 text-sm">
            {isGratis 
              ? "Faça um upgrade para compartilhar sua história com o mundo."
              : "Use os botões para ver uma prévia ou compartilhar com o mundo."
            }
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onPreview}
            className="bg-white text-center border-2 border-pink-500 text-pink-500 font-semibold py-2 px-4 rounded-md hover:bg-pink-50 transition-colors duration-200"
          >
            Ver Prévia
          </button>
          <button
            onClick={handleShareClick}
            className={`font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
              isGratis
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {isGratis ? 'Fazer Upgrade' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user, saveStory, loadStory, uploadImage, deleteImage } = useAuth();
  const { setIsDirty, navigate } = useNavigate(); // Get navigate from custom hook
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
    // Reset dirty state when component unmounts (e.g., after confirming navigation away)
    return () => {
        setIsDirty(false);
    };
  }, [setIsDirty]);

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      const data = await loadStory();
      setStoryData(data || { startDate: null, message: '', images: [], layoutPosition: 'bottom', youtubeUrl: '', storyPassword: '', entryButtonText: '' });
      if (data?.startDate && user) { // Only show share link if story has a start date
        setShareLink(generateShareLink(user.email));
      }
      setIsLoading(false);
    };
    if (!isPreviewing) { // Don't refetch when returning from preview
        fetchStory();
    }
  }, [loadStory, user, isPreviewing]);

  const handleSaveStory = async (newData: LoveStoryData, newFiles: File[]) => {
    setSaveStatus('saving');
    try {
      // Determine which images to delete
      const originalImageIds = new Set(storyData?.images.map(img => img.id) || []);
      const currentImageIds = new Set(newData.images.map(img => img.id));
      const imageIdsToDelete = Array.from(originalImageIds).filter(id => !currentImageIds.has(id));

      // The saveStory function in AuthContext will now handle everything
      await saveStory(newData, newFiles, imageIdsToDelete); 
      
      // After saving, reload the story to get the final state
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      );
    }
    
    if (!storyData?.startDate) {
        return (
            <PageWrapper>
                 <div className="text-center">
                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
                        Seja bem-vindo(a), <span className="text-pink-500">{user?.name}!</span>
                    </h1>
                    <p className="text-slate-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
                        Sua história de amor ainda não foi contada. Preencha os detalhes abaixo para começar a celebrar cada momento.
                    </p>
                    <div className="mt-8">
                       <CounterDemo 
                          initialData={storyData} 
                          onSave={handleSaveStory} 
                          onImageUpload={undefined} // No longer used
                          onImageDelete={deleteImage}
                          saveStatus={saveStatus}
                          isDashboard 
                          onDirty={() => setIsDirty(true)}
                          currentPlan={user?.plan}
                        />
                    </div>
                </div>
            </PageWrapper>
        )
    }

    return (
      <>
        <PageWrapper>
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
                    Bem-vindo(a) de volta, <span className="text-pink-500">{user?.name}!</span>
                </h1>
                <p className="text-slate-600 mt-2 text-base sm:text-lg">
                    Esta é a sua história. Personalize, salve, reviva e compartilhe seus momentos.
                </p>
            </div>
            <CounterDemo 
              initialData={storyData} 
              onSave={handleSaveStory} 
              onImageUpload={undefined} // No longer used
              onImageDelete={deleteImage}
              saveStatus={saveStatus}
              isDashboard 
              onDirty={() => setIsDirty(true)}
              currentPlan={user?.plan}
            />
        </PageWrapper>
        <div className="relative z-10">
          {shareLink && <ShareSection 
            shareUrl={shareLink} 
            onPreview={() => setIsPreviewing(true)} 
            onShare={() => setIsQrModalOpen(true)}
            plan={user?.plan}
            navigate={navigate} // Pass navigate prop
          />}
        </div>
      </>
    );
  };
  
  if (isPreviewing) {
    const previewData = { ...storyData, plan: user?.plan };
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

  return (
    <div className="min-h-screen flex flex-col bg-animated-lights lights-container overscroll-none">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
      <Footer />
      {shareLink && (
        <QRCodeModal 
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            url={shareLink}
            title={storyData?.storyTitle || 'Nossa História de Amor'}
        />
      )}
    </div>
  );
};

export default DashboardPage;