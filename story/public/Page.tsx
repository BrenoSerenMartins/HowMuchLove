import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/app/hooks/useNavigate';
import { fetchPublicStory, verifyStoryPassword } from '@/shared/lib/story-api';
import type { LoveStoryData } from '@/types';
import PublicStory from './components/PublicStory';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { errorMessages, getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';

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

const ENTRY_TRANSITION_MS = 2400;

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
  const [errorKind, setErrorKind] = useState<'notFound' | 'loadError' | null>(null);
  const [entryTransitionState, setEntryTransitionState] = useState<'hidden' | 'visible' | 'fading'>('hidden');
  const entryTransitionTimeoutRef = useRef<number | null>(null);

  const storyId = route.split('/')[2];

  const clearEntryTransitionTimeout = () => {
    if (entryTransitionTimeoutRef.current) {
      window.clearTimeout(entryTransitionTimeoutRef.current);
      entryTransitionTimeoutRef.current = null;
    }
  };

  const startEntryTransition = () => {
    if (!storyData?.youtubeUrl || hasEntered) return;

    clearEntryTransitionTimeout();
    setHasEntered(true);
    setIsMuted(false);
    setEntryTransitionState('fading');
    entryTransitionTimeoutRef.current = window.setTimeout(() => {
      setEntryTransitionState('hidden');
      entryTransitionTimeoutRef.current = null;
    }, ENTRY_TRANSITION_MS);
  };

  useEffect(() => {
    const loadStory = async () => {
      clearEntryTransitionTimeout();
      setHasEntered(false);
      setIsMuted(true);
      setEntryTransitionState('hidden');

      if (!storyId) {
        setErrorKind('notFound');
        setError(uiCopy.story.notFoundDescription);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPublicStory(storyId);
        console.log('[story/public/Page]', {
          storyId,
          loaded: Boolean(data),
          requiresPassword: Boolean(data?.requiresPassword),
          youtubeUrl: data?.youtubeUrl,
        });
        if (data && data.requiresPassword) {
          setIsPasswordProtected(true);
        } else if (data && data.startDate) {
          setStoryData(data);
          setIsPasswordVerified(true); // No password needed, so it's "verified"
        } else {
          setErrorKind('notFound');
          setError(uiCopy.story.notFoundDescription);
        }
      } catch (e) {
        setErrorKind('loadError');
        setError(uiCopy.story.loadErrorDescription);
      } finally {
        setLoading(false);
      }
    };
    
    loadStory();
    return clearEntryTransitionTimeout;
  }, [storyId]);

  useEffect(() => {
    if (!storyData?.youtubeUrl) {
      setEntryTransitionState('hidden');
      return;
    }

    if (!hasEntered) {
      setEntryTransitionState('visible');
    }
  }, [storyData?.youtubeUrl, hasEntered]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!password) {
      setPasswordError(uiCopy.story.passwordRequired);
      return;
    }
    if (!storyId) return;

    try {
      const fullStoryData = await verifyStoryPassword(storyId, password);
      setHasEntered(false);
      setIsMuted(true);
      setEntryTransitionState('hidden');
      setStoryData(fullStoryData);
      setIsPasswordVerified(true);
    } catch (e) {
      setPasswordError(getErrorMessage(e, uiCopy.story.passwordInvalid));
    }
  };

  const renderContent = () => {
    if (!storyData) return null;

    const needsEntryScreen = storyData.youtubeUrl && entryTransitionState !== 'hidden';
    const storyOpacity = storyData.youtubeUrl ? (hasEntered ? 1 : 0) : 1;
    console.log('[story/public/Page]', {
      storyId,
      needsEntryScreen,
      hasEntered,
      entryTransitionState,
      youtubeUrl: storyData.youtubeUrl,
    });

    return (
      <>
        <div
          className="transition-opacity ease-out"
          style={{
            opacity: storyOpacity,
            transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
          }}
        >
          <PublicStory
            storyData={storyData}
            hasEntered={hasEntered}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </div>
        {needsEntryScreen && (
          <div
            className="fixed inset-0 z-50 w-full h-full bg-cover bg-center flex justify-center items-center transition-opacity ease-out"
            style={{
              backgroundImage: storyData.images && storyData.images.length > 0 ? `url(${storyData.images[0].image_url})` : 'linear-gradient(to bottom, #4c51bf, #6b46c1)',
              opacity: entryTransitionState === 'visible' ? 1 : 0,
              pointerEvents: entryTransitionState === 'visible' ? 'auto' : 'none',
              transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all ease-out" style={{ transitionDuration: `${ENTRY_TRANSITION_MS}ms` }}></div>
            <div className="relative z-10 text-center">
              <button
                onClick={startEntryTransition}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 will-change-transform"
              >
                {storyData.entryButtonText || uiCopy.story.enterButton}
              </button>
            </div>
          </div>
        )}
      </>
    );
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
    const isNotFound = errorKind === 'notFound';
    return (
      <PageWrapper>
        <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4 text-red-400">
            {isNotFound ? uiCopy.story.notFoundTitle : uiCopy.story.loadErrorTitle}
          </h1>
          <p className="text-xl text-slate-300">{error}</p>
        </div>
      </PageWrapper>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <PageWrapper>
        <div className="bg-black/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">{uiCopy.story.privateTitle}</h2>
          <p className="text-slate-300 mb-6">{uiCopy.story.privateDescription}</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={uiCopy.story.passwordPlaceholder}
              className={`${inputClasses} ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'}`}
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {uiCopy.story.enterButton}
            </button>
          </form>
        </div>
      </PageWrapper>
    );
  }
  
  return renderContent();
};

export default StoryPage;
