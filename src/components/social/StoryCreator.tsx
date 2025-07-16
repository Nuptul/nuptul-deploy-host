import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Camera, 
  Video, 
  Upload,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Check
} from 'lucide-react';
import { useWeddingStories } from '@/hooks/useWeddingStories';
import { useToast } from '@/hooks/use-toast';

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({
  isOpen,
  onClose,
  onStoryCreated
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { createStory } = useWeddingStories();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB as per storage config)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 50MB',
        variant: 'destructive'
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image or video file',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setIsVideo(file.type.startsWith('video/'));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoControl = (action: 'play' | 'pause' | 'mute' | 'unmute') => {
    if (!videoRef.current) return;

    switch (action) {
      case 'play':
        videoRef.current.play();
        setIsPlaying(true);
        break;
      case 'pause':
        videoRef.current.pause();
        setIsPlaying(false);
        break;
      case 'mute':
        videoRef.current.muted = true;
        setIsMuted(true);
        break;
      case 'unmute':
        videoRef.current.muted = false;
        setIsMuted(false);
        break;
    }
  };

  const handleCreateStory = async () => {
    if (!selectedFile) {
      toast({
        title: 'No media selected',
        description: 'Please select an image or video for your story',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    
    try {
      const result = await createStory(selectedFile, caption);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Story created!',
        description: 'Your story has been shared with everyone',
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      setIsVideo(false);
      setIsPlaying(false);
      setIsMuted(false);
      
      onStoryCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: 'Failed to create story',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setIsVideo(false);
    setIsPlaying(false);
    setIsMuted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Create Your Story</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Upload Area */}
          {!selectedFile ? (
            <div>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-wedding-gold transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Upload a photo or video</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share a moment from your wedding journey
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max file size: 50MB • Expires in 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled
                >
                  <Video className="w-4 h-4" />
                  Record
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {isVideo ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={preview || undefined}
                      className="w-full h-64 object-cover"
                      muted={isMuted}
                      loop
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVideoControl(isPlaying ? 'pause' : 'play')}
                          className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVideoControl(isMuted ? 'unmute' : 'mute')}
                          className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={preview || undefined}
                    alt="Story preview"
                    className="w-full h-64 object-cover"
                  />
                )}
                
                {/* File Info */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {isVideo ? 'Video' : 'Image'} • {formatFileSize(selectedFile.size)}
                  </Badge>
                </div>
                
                {/* Reset Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="absolute top-2 right-2 w-8 h-8 p-0 bg-black/50 text-white hover:bg-black/70"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption Input */}
              <div>
                <Textarea
                  placeholder="Add a caption to your story... (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Stories disappear after 24 hours
                  </p>
                  <span className={`text-xs ${caption.length > 450 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {caption.length}/500
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={uploading}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Change Media
                </Button>
                <Button
                  onClick={handleCreateStory}
                  disabled={uploading}
                  className="flex-1 bg-wedding-gold hover:bg-wedding-gold/90"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {uploading ? 'Sharing...' : 'Share Story'}
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryCreator;