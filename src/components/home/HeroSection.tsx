import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '@/hooks/useAppSettings';
import { getUrlWithFallback } from '@/utils/supabaseStorage';
import { glassEffects, nuptulColors } from '@/styles/nuptul-design-system';


import { Heart } from 'lucide-react';

interface HeroBackgroundProps {
  backgroundType: string;
  backgroundUrl: string;
  mobileBackgroundUrl: string;
  videoAutoplay: boolean;
  videoMuted: boolean;
  videoLoop: boolean;
  overlayOpacity: number;
  children: React.ReactNode;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
  backgroundType,
  backgroundUrl,
  mobileBackgroundUrl,
  videoAutoplay,
  videoMuted,
  videoLoop,
  overlayOpacity,
  children
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useImageFallback, setUseImageFallback] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use single responsive video URL for all devices
  const currentBackgroundUrl = backgroundUrl;

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
    }
    return url;
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.target as HTMLVideoElement;
    let errorMessage = 'Unknown video error';
    
    if (video && video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video load aborted by user';
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = 'Video decode error (unsupported format)';
          break;
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video source not supported';
          break;
        default:
          errorMessage = `Video error code: ${video.error.code}`;
      }
    }
    
    console.error('Video failed to load:', errorMessage);
    console.error('Video URL was:', currentBackgroundUrl);
    console.error('Video error object:', video?.error);
    console.error('Is mobile device:', isMobile);
    console.error('Video element state:', {
      readyState: video?.readyState,
      networkState: video?.networkState,
      currentSrc: video?.currentSrc,
      duration: video?.duration
    });
    
    setVideoError(true);
    setUseImageFallback(true);
  };

  const handleVideoLoaded = () => {
    
    setVideoLoaded(true);
  };

  // Enhanced mobile video timeout and fallback logic
  useEffect(() => {
    if (backgroundType === 'video') {
      // Longer timeout for mobile devices (slower networks)
      const timeoutDuration = isMobile ? 8000 : 5000;
      
      const timeout = setTimeout(() => {
        if (!videoLoaded && !videoError) {
          
          setUseImageFallback(true);
        }
      }, timeoutDuration);
      
      // Try to trigger video play on mobile after a short delay
      if (isMobile && videoAutoplay) {
        const mobilePlayTimeout = setTimeout(() => {
          const video = document.querySelector('video');
          if (video && video.paused) {
            
            video.play().catch(err => {
              
            });
          }
        }, 1000);
        
        return () => {
          clearTimeout(timeout);
          clearTimeout(mobilePlayTimeout);
        };
      }
      
      return () => clearTimeout(timeout);
    }
  }, [backgroundType, videoLoaded, videoError, isMobile, videoAutoplay]);

  // Debug logging
  console.log('HeroBackground Debug:', {
    backgroundType,
    backgroundUrl: currentBackgroundUrl,
    videoError,
    isMobile,
    useImageFallback,
    videoLoaded,
    videoAutoplay,
    videoMuted,
    videoLoop
  });

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] mb-6 sm:mb-8 lg:mb-10 rounded-[20px] overflow-hidden">
      {/* Background Media */}
      {backgroundType === 'video' && !videoError && !useImageFallback ? (
        <div className="absolute inset-0 w-full h-full" data-testid="hero-background-video">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={videoAutoplay}
            muted={videoMuted}
            loop={videoLoop}
            playsInline
            controls={false}
            preload="metadata"
            webkit-playsinline="true"
            crossOrigin="anonymous"
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            onCanPlay={handleVideoLoaded}
            onLoadStart={() => console.log('Video loading started')}
            onWaiting={() => console.log('Video waiting for data')}
            onCanPlayThrough={() => {
              
              setVideoLoaded(true);
            }}
            onTimeUpdate={() => {
              // Verify video is actually playing
              const video = document.querySelector('video');
              if (video && !video.paused && video.currentTime > 0) {
                setVideoLoaded(true);
              }
            }}
            onStalled={() => console.log('Video stalled')}
            onSuspend={() => console.log('Video suspended')}
            onAbort={() => console.log('Video aborted')}
            onEmptied={() => console.log('Video emptied')}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          >
            <source src={currentBackgroundUrl} type="video/mp4" />
            {/* Fallback source without CORS for cross-origin issues */}
            <source src={currentBackgroundUrl.replace('?', '').split('?')[0]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Enhanced loading indicator with debug info */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading video...</p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 text-xs text-gray-500 max-w-xs mx-auto">
                    <p>Device: {isMobile ? 'Mobile' : 'Desktop'}</p>
                    <p>URL: {currentBackgroundUrl.substring(0, 50)}...</p>
                    <p>Autoplay: {videoAutoplay ? 'Yes' : 'No'}</p>
                    <p>Muted: {videoMuted ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : backgroundType === 'youtube' && !useImageFallback ? (
        <iframe
          src={getYouTubeEmbedUrl(currentBackgroundUrl)}
          className="absolute top-0 left-0 w-full h-full object-cover"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="background-video"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getUrlWithFallback(
              mobileBackgroundUrl || currentBackgroundUrl,
              'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
            )})`,
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{
          opacity: overlayOpacity,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
};

interface HeroSectionProps {
}

const HeroSection: React.FC<HeroSectionProps> = () => {
  const { settings, loading } = useAppSettings();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-[500px] sm:h-[600px] lg:h-[700px] mb-6 sm:mb-8 lg:mb-10 rounded-[20px] overflow-hidden bg-muted animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-muted-foreground/20 rounded-full mx-auto"></div>
            <div className="h-8 w-48 bg-muted-foreground/20 rounded mx-auto"></div>
            <div className="h-6 w-32 bg-muted-foreground/20 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(settings.wedding_date);
  const formattedDate = weddingDate.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use Ben Ean venue image as the hero background
  const backgroundType = settings.hero_background_type || 'image';
  const backgroundUrl = settings.hero_background_url || 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-ben-ean/Ben%20Ean%20Venue%20Main.png';
  const mobileBackgroundUrl = settings.hero_background_mobile_url || 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-ben-ean/Ben%20Ean%20Venue%20Main.png';
  const overlayOpacity = parseFloat(settings.hero_overlay_opacity || '0.5');
  const overlayPosition = settings.hero_overlay_position || 'center';
  const videoAutoplay = settings.hero_video_autoplay === 'true';
  const videoMuted = settings.hero_video_muted === 'true';
  const videoLoop = settings.hero_video_loop === 'true';

  const getPositionClasses = () => {
    switch (overlayPosition) {
      case 'top':
        return 'items-start justify-center pt-16';
      case 'bottom':
        return 'items-end justify-center pb-16';
      case 'left':
        return 'items-center justify-start pl-16';
      case 'right':
        return 'items-center justify-end pr-16';
      case 'top-left':
        return 'items-start justify-start pt-16 pl-16';
      case 'top-right':
        return 'items-start justify-end pt-16 pr-16';
      case 'bottom-left':
        return 'items-end justify-start pb-16 pl-16';
      case 'bottom-right':
        return 'items-end justify-end pb-16 pr-16';
      default:
        return 'items-center justify-center';
    }
  };

  return (
    <div className="relative w-full hero-section" data-testid="enhanced-hero-section">
      {/* Welcome Message with Logo-Inspired Glass Effect */}
      <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-up">
        <div
          className="p-8 sm:p-10 lg:p-12 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              rgba(255, 255, 255, 0.6) 0%,
              rgba(255, 255, 255, 0.55) 50%,
              rgba(255, 255, 255, 0.65) 100%)`,
            backdropFilter: 'blur(20px) saturate(2)',
            WebkitBackdropFilter: 'blur(20px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '24px',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.15),
              0 4px 16px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(0, 0, 0, 0.05)
            `
          }}
        >


          <h1
            className="couple-names wedding-names text-5xl sm:text-6xl lg:text-7xl mb-4"
            style={{
              fontFamily: '"Great Vibes", "Dancing Script", "Brush Script MT", cursive',
              color: '#000000',
              textShadow: `
                0 2px 4px rgba(255, 255, 255, 0.8),
                0 4px 8px rgba(220, 38, 38, 0.15),
                0 1px 2px rgba(71, 85, 105, 0.1)
              `,
              lineHeight: '1.1',
              fontWeight: '400',
              letterSpacing: '0.02em',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased'
            }}
            data-wedding-names="true"
          >
            {settings.app_name}
          </h1>
          <p
            className="text-base sm:text-lg lg:text-xl mb-6"
            style={{
              fontFamily: '"Inter", "SF Pro Display", sans-serif',
              color: '#000000',
              fontWeight: '600',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            WE ARE GETTING MARRIED!
          </p>
          <p
            className="text-base sm:text-lg lg:text-xl mt-6"
            style={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              color: '#000000',
              fontWeight: '500',
              letterSpacing: '0.05em',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
            }}
          >
            {formattedDate}
          </p>
          <p
            className="text-base sm:text-lg mt-8 max-w-2xl mx-auto leading-relaxed"
            style={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontStyle: 'italic',
              color: '#000000',
              textShadow: '0 1px 3px rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.02em',
              lineHeight: '1.7',
              fontWeight: '400',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            {settings.hero_subtitle}
          </p>

        </div>
      </div>

      {/* Travel & Accommodation Cards section removed - now available in Guest Dashboard */}

      {/* Hero Background Video/Image */}
      <HeroBackground
        backgroundType={backgroundType}
        backgroundUrl={backgroundUrl}
        mobileBackgroundUrl={mobileBackgroundUrl}
        videoAutoplay={videoAutoplay}
        videoMuted={videoMuted}
        videoLoop={videoLoop}
        overlayOpacity={overlayOpacity}
      >
        {/* Empty - no content overlay on video */}
      </HeroBackground>
    </div>
  );
};

export default HeroSection;