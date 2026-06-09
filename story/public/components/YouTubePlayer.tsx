import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  isMuted: boolean;
  hasEntered: boolean;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __youTubeIframeApiPromise?: Promise<void>;
  }
}

const loadYouTubeIframeApi = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available.'));
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (window.__youTubeIframeApiPromise) {
    return window.__youTubeIframeApiPromise;
  }

  window.__youTubeIframeApiPromise = new Promise<void>((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return window.__youTubeIframeApiPromise;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, isMuted, hasEntered }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const playCheckTimeoutRef = useRef<number | null>(null);
  const volumeFadeIntervalRef = useRef<number | null>(null);
  const latestStateRef = useRef({ isMuted, hasEntered });
  const logPlayer = (event: string, details: Record<string, unknown> = {}) => {
    console.log('[story/public/YouTubePlayer]', { videoId, event, ...details });
  };

  const describePlayerState = (state: number): string => {
    switch (state) {
      case -1: return 'UNSTARTED';
      case 0: return 'ENDED';
      case 1: return 'PLAYING';
      case 2: return 'PAUSED';
      case 3: return 'BUFFERING';
      case 5: return 'CUED';
      default: return `UNKNOWN_${state}`;
    }
  };

  const schedulePlayCheck = (player: any, source: string) => {
    if (playCheckTimeoutRef.current) {
      window.clearTimeout(playCheckTimeoutRef.current);
      playCheckTimeoutRef.current = null;
    }

    playCheckTimeoutRef.current = window.setTimeout(() => {
      if (!player || typeof player.getPlayerState !== 'function') return;
      const state = player.getPlayerState();
      const stateName = describePlayerState(state);
      if (state === 1) {
        logPlayer('play-confirmed', { source, state: stateName });
      } else {
        logPlayer('play-not-playing', { source, state: stateName });
      }
    }, 1200);
  };

  const clearVolumeFade = () => {
    if (volumeFadeIntervalRef.current) {
      window.clearInterval(volumeFadeIntervalRef.current);
      volumeFadeIntervalRef.current = null;
    }
  };

  const startVolumeFade = (player: any, source: string) => {
    if (!player || typeof player.setVolume !== 'function') return;

    clearVolumeFade();
    const targetVolume = 50;
    const fadeSteps = 20;
    const fadeDurationMs = 2400;
    const stepDelay = Math.max(50, Math.round(fadeDurationMs / fadeSteps));
    let currentStep = 0;

    logPlayer('fade-start', { source, targetVolume, fadeSteps, stepDelay });
    player.setVolume(0);

    volumeFadeIntervalRef.current = window.setInterval(() => {
      currentStep += 1;
      const progress = currentStep / fadeSteps;
      const easedProgress = progress * progress;
      const nextVolume = Math.min(targetVolume, Math.round(targetVolume * easedProgress));
      player.setVolume(nextVolume);
      logPlayer('fade-step', { source, currentStep, progress: Number(progress.toFixed(2)), nextVolume });

      if (currentStep >= fadeSteps) {
        clearVolumeFade();
        logPlayer('fade-complete', { source, finalVolume: targetVolume });
      }
    }, stepDelay);
  };

  useEffect(() => {
    latestStateRef.current = { isMuted, hasEntered };
  }, [isMuted, hasEntered]);

  const syncPlayerState = (player: any) => {
    if (!player || typeof player.mute !== 'function') return;

    const { isMuted: muted, hasEntered: entered } = latestStateRef.current;
    logPlayer('sync-state', { muted, entered });

    clearVolumeFade();

    if (!entered) {
      player.mute();
      player.setVolume?.(0);
      if (typeof player.playVideo === 'function') {
        logPlayer('play-attempt', { source: 'sync-state-muted' });
        player.playVideo();
        schedulePlayCheck(player, 'sync-state-muted');
      }
      return;
    }

    if (muted) {
      player.mute();
      player.setVolume?.(0);
    } else {
      player.unMute();
    }

    if (entered && typeof player.playVideo === 'function') {
      logPlayer('play-attempt', { source: 'sync-state' });
      player.playVideo();
      schedulePlayCheck(player, 'sync-state');
      if (!muted) {
        startVolumeFade(player, 'sync-state');
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    logPlayer('effect-mounted', { muted: isMuted, entered: hasEntered });

    const createPlayer = () => {
      if (!playerRef.current || playerInstanceRef.current) return;
      logPlayer('create-player', { autoplay: true, muted: latestStateRef.current.isMuted, entered: latestStateRef.current.hasEntered });
      
      playerInstanceRef.current = new (window as any).YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            logPlayer('ready');
            event.target.setVolume(50);
            syncPlayerState(event.target);
          },
          onStateChange: (event: any) => {
            logPlayer('state-change', { state: describePlayerState(event.data) });
            if (event.data === (window as any).YT.PlayerState.UNSTARTED || event.data === (window as any).YT.PlayerState.PAUSED) {
              logPlayer('play-attempt', { source: 'onStateChange' });
              event.target.playVideo();
              schedulePlayCheck(event.target, 'onStateChange');
            }
          },
          onError: (event: any) => {
            logPlayer('error', { code: event.data });
          },
        },
      });
    };

    loadYouTubeIframeApi()
      .then(() => {
        if (!isMounted) return;
        logPlayer('api-ready');
        createPlayer();
      })
      .catch((error) => {
        logPlayer('api-load-error', { message: error instanceof Error ? error.message : String(error) });
      });

    return () => {
      isMounted = false;
      if (playCheckTimeoutRef.current) {
        window.clearTimeout(playCheckTimeoutRef.current);
        playCheckTimeoutRef.current = null;
      }
      clearVolumeFade();
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === 'function') {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerInstanceRef.current) {
      logPlayer('external-sync', { muted: isMuted, entered: hasEntered });
      syncPlayerState(playerInstanceRef.current);
    }
  }, [isMuted, hasEntered]);

  return <div ref={playerRef} style={{ width: 1, height: 1, opacity: 0, position: 'absolute', top: -9999, left: -9999, pointerEvents: 'none' }} />;
};

export default YouTubePlayer;
