import React, { useState, useEffect } from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { fetchPublicStory, verifyStoryPassword } from '../utils/api';
import type { LoveStoryData } from '../types';
import PublicStory from '../components/PublicStory';
import LoadingSpinner from '../components/LoadingSpinner';

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
  }, [route, storyId]);

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
              className="bg-white/90 text-slate-800 font-bold py-4 px-10 rounded-lg shadow-2xl hover:bg-white transition-all duration-300 transform hover:scale-105"
            >
              {storyData.entryButtonText || 'Entrar na História'}
            </button>
          </div>
        </div>
      );
    }

    return <PublicStory storyData={storyData} hasEntered={hasEntered} isMuted={isMuted} setIsMuted={setIsMuted} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900 overscroll-none">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900 text-white text-center p-4 overscroll-none">
        <div>
          <h1 className="text-4xl font-bold mb-4">Oops!</h1>
          <p className="text-xl text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900 text-white p-4 overscroll-none">
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Esta história é privada</h2>
          <p className="text-slate-600 mb-6">Por favor, insira a senha para visualizá-la.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 text-slate-800"
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-300"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return renderContent();
};

export default StoryPage;