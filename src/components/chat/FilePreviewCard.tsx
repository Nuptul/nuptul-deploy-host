import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Eye, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  FileText, 
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  File,
  X,
  Maximize,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FilePreviewCardProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    thumbnail?: string;
  };
  onDownload?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
  onFullscreen?: (fileId: string) => void;
  className?: string;
  compact?: boolean;
  showControls?: boolean;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  file,
  onDownload,
  onRemove,
  onFullscreen,
  className = '',
  compact = false,
  showControls = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // File type detection
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isDocument = ['application/pdf', 'text/', 'application/msword', 'application/vnd.'].some(
    type => file.type.includes(type)
  );
  const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].some(
    ext => file.name.toLowerCase().includes(ext)
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get file icon
  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-4 h-4" />;
    if (isVideo) return <Film className="w-4 h-4" />;
    if (isAudio) return <Music className="w-4 h-4" />;
    if (isDocument) return <FileText className="w-4 h-4" />;
    if (isArchive) return <Archive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Handle audio/video play
  const handlePlayPause = () => {
    if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    } else if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
    setIsMuted(!isMuted);
  };

  // Handle time update for audio/video
  const handleTimeUpdate = (e: any) => {
    const current = e.target.currentTime;
    const total = e.target.duration;
    setProgress((current / total) * 100);
    setDuration(total);
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload(file.id);
    } else {
      // Fallback download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Compact view
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg border ${className}`}
      >
        {/* File icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded flex items-center justify-center">
          {getFileIcon()}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>

        {/* Actions */}
        {showControls && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="w-6 h-6 p-0"
            >
              <Download className="w-3 h-3" />
            </Button>
            
            {onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(file.id)}
                className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Full preview card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border shadow-sm overflow-hidden ${className}`}
    >
      {/* Preview area */}
      <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
        {/* Image preview */}
        {isImage && (
          <img
            src={file.thumbnail || file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setLoadError(true)}
          />
        )}

        {/* Video preview */}
        {isVideo && (
          <video
            ref={videoRef}
            src={file.url}
            className="max-w-full max-h-full object-contain"
            onLoadedMetadata={() => setIsLoading(false)}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setLoadError(true)}
          />
        )}

        {/* Audio preview */}
        {isAudio && (
          <>
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Music className="w-16 h-16 mb-2" />
              <p className="text-sm font-medium">{file.name}</p>
            </div>
            <audio
              ref={audioRef}
              src={file.url}
              onLoadedMetadata={() => setIsLoading(false)}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setLoadError(true)}
            />
          </>
        )}

        {/* Document/File preview */}
        {(isDocument || isArchive || (!isImage && !isVideo && !isAudio)) && (
          <div className="flex flex-col items-center justify-center text-gray-500 p-4">
            <div className="w-16 h-16 mb-2 flex items-center justify-center">
              {getFileIcon()}
            </div>
            <p className="text-sm font-medium text-center">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <X className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        )}

        {/* Media controls overlay */}
        {(isVideo || isAudio) && showControls && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>
        )}

        {/* Top-right actions */}
        {showControls && (
          <div className="absolute top-2 right-2 flex gap-1">
            {onFullscreen && (isImage || isVideo) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFullscreen(file.id)}
                className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            )}

            {onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(file.id)}
                className="w-8 h-8 p-0 bg-black/50 hover:bg-red-600 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* File info and controls */}
      <div className="p-3">
        {/* File name and size */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{file.name}</h4>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          
          <Badge variant="secondary" className="ml-2 text-xs">
            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
        </div>

        {/* Audio/Video progress */}
        {(isAudio || isVideo) && duration > 0 && (
          <div className="mb-2">
            <Progress value={progress} className="h-1" />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {formatTime((progress / 100) * duration)}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Play/Pause for audio/video */}
              {(isAudio || isVideo) && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="w-8 h-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMuteToggle}
                    className="w-8 h-8 p-0"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="w-8 h-8 p-0"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FilePreviewCard;