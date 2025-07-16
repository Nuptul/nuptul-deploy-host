import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoBackgroundProps {
  videoUrl: string;
  fallbackImage?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  fallbackImage,
  className,
  overlay = true,
  overlayOpacity = 0.5
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = () => {
      console.error('Video failed to load:', videoUrl);
      setVideoError(true);
      setVideoLoaded(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Try to load the video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Fallback background */}
      {fallbackImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${fallbackImage})` }}
        />
      )}

      {/* Video element */}
      {!videoError && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000',
            videoLoaded ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
        </video>
      )}

      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};

export default VideoBackground;