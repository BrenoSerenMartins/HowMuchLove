import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart, ShieldAlert, Sparkles, Play } from 'lucide-react';
import { useNavigate } from '@/app/hooks/useNavigate';
import { fetchPublicStory, verifyStoryPassword } from '@/shared/lib/story-api';
import type { LoveStoryData } from '@/types';
import PublicStory from '@/shared/ui/story-view/PublicStory';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { getErrorMessage } from '@/shared/lib/errors';
import { uiCopy } from '@/shared/lib/ui-copy';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col text-white relative bg-[#050505]">
      <div className="fixed inset-0 z-[-1] lights-container opacity-40"></div>
      <div className="bg-grain" />
      <main className="flex-grow flex items-center justify-center p-4 z-10">
        {children}
      </main>
    </div>
  );
};

const ENTRY_TRANSITION_MS = 2000;

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
        if (data && data.requiresPassword) {
          setIsPasswordProtected(true);
        } else if (data && data.startDate) {
          setStoryData(data);
          setIsPasswordVerified(true);
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
        
        <AnimatePresence>
          {needsEntryScreen && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: ENTRY_TRANSITION_MS / 1000 }}
              className="fixed inset-0 z-50 w-full h-full flex justify-center items-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#050505]">
                <img 
                  src={storyData.images?.[0]?.image_url} 
                  alt="" 
                  className="w-full h-full object-cover opacity-30 blur-2xl scale-110"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center px-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 font-mono">Uma Nova História</span>
                </div>
                
                <h1 className="text-4xl sm:text-7xl font-black text-white leading-none tracking-tighter mb-12">
                  Pronto para <br/>
                  <span className="text-primary italic font-cursive lowercase tracking-normal">se emocionar?</span>
                </h1>

                <button
                  onClick={startEntryTransition}
                  className="btn-primary !py-6 !px-16 !text-xs group"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {storyData.entryButtonText || uiCopy.story.enterButton}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elite p-12 text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 mb-8 border border-red-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white leading-none tracking-tighter mb-4 uppercase">
            {isNotFound ? uiCopy.story.notFoundTitle : uiCopy.story.loadErrorTitle}
          </h1>
          <p className="text-lg text-slate-400 font-medium">{error}</p>
        </motion.div>
      </PageWrapper>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <PageWrapper>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elite p-12 text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-8 border border-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white leading-none tracking-tighter mb-4 uppercase">{uiCopy.story.privateTitle}</h2>
          <p className="text-slate-400 mb-10 font-medium leading-relaxed">{uiCopy.story.privateDescription}</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={uiCopy.story.passwordPlaceholder}
                className={`input-elite pr-12 ${passwordError ? '!border-red-500/50' : ''}`}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
            </div>
            
            {passwordError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[11px] font-black uppercase tracking-widest">{passwordError}</motion.p>
            )}

            <button
              type="submit"
              className="btn-primary w-full !py-5"
            >
              {uiCopy.story.enterButton}
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </form>
        </motion.div>
      </PageWrapper>
    );
  }
  
  return renderContent();
};

export default StoryPage;
