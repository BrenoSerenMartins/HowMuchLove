import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  isMuted: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, isMuted }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    const createPlayer = () => {
      if (!playerRef.current || playerInstanceRef.current) return;
      
      playerInstanceRef.current = new (window as any).YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(50);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            // Autoplay might be blocked, but we attempt it.
            // The user's first interaction (e.g., clicking unmute) will then work.
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // If the browser blocks autoplay, the state might be UNSTARTED or PAUSED.
            // This tries to ensure it plays after the first user interaction.
            if (event.data === (window as any).YT.PlayerState.PAUSED || event.data === (window as any).YT.PlayerState.UNSTARTED) {
                event.target.playVideo();
            }
          }
        },
      });
    };

    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = createPlayer;
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      if ((window as any).YT && (window as any).YT.Player) {
        createPlayer();
      }
    }

    return () => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === 'function') {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current.mute === 'function') {
      if (isMuted) {
        playerInstanceRef.current.mute();
      } else {
        playerInstanceRef.current.unMute();
        // This also serves as a user interaction to kickstart playback if it was blocked
        playerInstanceRef.current.playVideo();
      }
    }
  }, [isMuted]);

  return <div ref={playerRef} style={{ width: 0, height: 0, position: 'absolute', top: -9999, left: -9999 }} />;
};

export default YouTubePlayer;
