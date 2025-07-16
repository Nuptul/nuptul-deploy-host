import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ScreenShareStreamProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  userName?: string;
  onClose?: () => void;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ScreenShareStream: React.FC<ScreenShareStreamProps> = ({
  stream,
  isLocal = false,
  userName = 'Unknown User',
  onClose,
  className = '',
  isMinimized = false,
  onToggleMinimize
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    width: number;
    height: number;
    frameRate: number;
  } | null>(null);

  // Setup video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Get stream information
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setStreamInfo({
          width: settings.width || 1920,
          height: settings.height || 1080,
          frameRate: settings.frameRate || 30
        });
      }
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  // Handle audio toggle
  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Don't render if no stream
  if (!stream) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700 w-64 h-48">
          {/* Minimized header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-2 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {isLocal ? 'Your Screen' : `${userName}'s Screen`}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onToggleMinimize}
                  className="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white p-0"
                >
                  <Maximize className="w-3 h-3" />
                </Button>
                
                {onClose && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    className="w-6 h-6 rounded-full bg-black/50 hover:bg-red-600 text-white p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-contain bg-black"
          />

          {/* Status badges */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full view
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black z-50 flex flex-col ${className}`}
      >
        {/* Header controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
          <div className="flex items-center justify-between">
            {/* Stream info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {isLocal ? 'Your Screen' : `${userName}'s Screen`}
                  </h3>
                  {streamInfo && (
                    <p className="text-white/70 text-sm">
                      {streamInfo.width}×{streamInfo.height} @ {streamInfo.frameRate}fps
                    </p>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                  Live
                </Badge>
                
                {stream.getAudioTracks().length > 0 && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Audio
                  </Badge>
                )}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {/* Audio toggle */}
              {stream.getAudioTracks().length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleAudio}
                  className={`text-white hover:bg-white/20 ${
                    !isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                >
                  {isAudioEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Fullscreen toggle */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>

              {/* Minimize */}
              {onToggleMinimize && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onToggleMinimize}
                  className="text-white hover:bg-white/20"
                >
                  <Minimize className="w-4 h-4" />
                </Button>
              )}

              {/* Close */}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Video container */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              maxWidth: '95vw',
              maxHeight: '85vh'
            }}
          />
        </div>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-center">
            <p className="text-white/70 text-sm">
              {isLocal 
                ? 'You are sharing your screen' 
                : `Viewing ${userName}'s screen`
              }
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenShareStream;