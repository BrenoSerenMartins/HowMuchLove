import React, { useState, useEffect } from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { fetchPublicStory, verifyStoryPassword } from '../utils/api';
import type { LoveStoryData } from '../types';
import PublicStory from '../components/PublicStory';
import LoadingSpinner from '../components/LoadingSpinner';

// Define PageWrapper outside of the StoryPage component
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  
  return (
    <div className="min-h-screen flex flex-col text-white relative">
      <div 
          className="fixed inset-0 z-[-2]"
          style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(15px) brightness(0.6)',
              transform: 'scale(1.1)',
          }}
      />
      <div className="fixed inset-0 z-[-1] lights-container"></div>
      <main className="flex-grow flex items-center justify-center p-4 z-10">
        {children}
      </main>
    </div>
  );
};

const StoryPage: React.FC = () => {
  const { route } = useNavigate();
  const [storyData, setStoryData] = useState<LoveStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const storyId = route.split('/')[2];

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError('História não encontrada.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPublicStory(storyId);
        if (data && data.requiresPassword) {
          setIsPasswordProtected(true);
        } else if (data && data.startDate) {
          setStoryData(data);
          setIsPasswordVerified(true); // No password needed, so it's "verified"
        } else {
          setError('Esta história de amor ainda não foi contada ou não foi encontrada.');
        }
      } catch (e) {
        console.error("Failed to load story:", e);
        setError((e as Error).message || 'O link para esta história parece estar quebrado.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStory();
  }, [storyId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!password) {
      setPasswordError('Por favor, insira a senha.');
      return;
    }
    if (!storyId) return;

    try {
      const fullStoryData = await verifyStoryPassword(storyId, password);
      setStoryData(fullStoryData);
      setIsPasswordVerified(true);
    } catch (e) {
      console.error("Password verification failed:", e);
      setPasswordError((e as Error).message || 'Senha incorreta. Tente novamente.');
    }
  };

  const renderContent = () => {
    if (!storyData) return null;

    const needsEntryScreen = storyData.youtubeUrl && !hasEntered;

    if (needsEntryScreen) {
      return (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center flex justify-center items-center"
          style={{ backgroundImage: storyData.images && storyData.images.length > 0 ? `url(${storyData.images[0].image_url})` : 'linear-gradient(to bottom, #4c51bf, #6b46c1)' }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
          <div className="relative z-10 text-center">
            <button
              onClick={() => {
                setHasEntered(true);
                setIsMuted(false); // Unmute on entry
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 will-change-transform"
            >
              {storyData.entryButtonText || 'Entrar na História'}
            </button>
          </div>
        </div>
      );
    }

    return <PublicStory storyData={storyData} hasEntered={hasEntered} isMuted={isMuted} setIsMuted={setIsMuted} />;
  };

  const inputClasses = "w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-pink-400 focus:bg-black/30 text-white placeholder-slate-400 transition-colors";

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4 text-red-400">Oops!</h1>
          <p className="text-xl text-slate-300">{error}</p>
        </div>
      </PageWrapper>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <PageWrapper>
        <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Esta história é privada</h2>
          <p className="text-slate-300 mb-6">Por favor, insira a senha para visualizá-la.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className={`${inputClasses} ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'}`}
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Entrar
            </button>
          </form>
        </div>
      </PageWrapper>
    );
  }
  
  return renderContent();
};

export default StoryPage;
