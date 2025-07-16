import React, { useState, useRef, useCallback } from 'react';
import { 
  Send, 
  Smile, 
  Plus, 
  Paperclip, 
  Mic, 
  MicOff, 
  Camera, 
  Image as ImageIcon, 
  Video, 
  FileText,
  X,
  Square,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
}

interface VoiceMessage {
  id: string;
  blob: Blob;
  duration: number;
  url: string;
}

interface EnhancedComposerBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, files?: MediaFile[], voiceMessage?: VoiceMessage) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showMediaButtons?: boolean;
  showVoiceRecording?: boolean;
  onOpenMediaModal?: () => void;
}

const EnhancedComposerBar: React.FC<EnhancedComposerBarProps> = ({
  value,
  onChange,
  onSend,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 1000,
  showMediaButtons = true,
  showVoiceRecording = true,
  onOpenMediaModal
}) => {
  const [attachedFiles, setAttachedFiles] = useState<MediaFile[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  const handleInputChange = useCallback((text: string) => {
    onChange(text);
    
    // Trigger typing indicator
    if (onTyping && text.length > 0) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else if (onTyping && text.length === 0) {
      onTyping(false);
    }
  }, [onChange, onTyping]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < files.length && i < 5; i++) { // Max 5 files
      const file = files[i];
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 50MB)`);
        continue;
      }
      
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file)
      };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        try {
          const preview = await createImagePreview(file);
          mediaFile.preview = preview;
        } catch (error) {
          console.error('Error creating preview:', error);
        }
      }
      
      newFiles.push(mediaFile);
    }
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Get file type
  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Create image preview
  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Remove attached file
  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Start voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setVoiceMessage({
          id: `voice-${Date.now()}`,
          blob: audioBlob,
          duration: recordingTime,
          url: audioUrl
        });
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [recordingTime]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // Cancel voice recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // Play/pause voice message
  const toggleVoicePlayback = useCallback(() => {
    if (!voiceMessage) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(voiceMessage.url);
      audioRef.current.onended = () => setIsPlayingVoice(false);
    }
    
    if (isPlayingVoice) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
    } else {
      audioRef.current.play();
      setIsPlayingVoice(true);
    }
  }, [voiceMessage, isPlayingVoice]);

  // Remove voice message
  const removeVoiceMessage = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (voiceMessage) {
      URL.revokeObjectURL(voiceMessage.url);
    }
    
    setVoiceMessage(null);
    setIsPlayingVoice(false);
  }, [voiceMessage]);

  // Handle send
  const handleSend = useCallback(() => {
    if ((!value.trim() && attachedFiles.length === 0 && !voiceMessage) || disabled) {
      return;
    }
    
    onSend(value, attachedFiles, voiceMessage || undefined);
    
    // Reset state
    onChange('');
    setAttachedFiles([]);
    setVoiceMessage(null);
    setIsPlayingVoice(false);
    setShowQuickActions(false);
    
    if (audioRef.current) {
      audioRef.current = null;
    }
    
    // Stop typing indicator
    if (onTyping) {
      onTyping(false);
    }
  }, [value, attachedFiles, voiceMessage, disabled, onSend, onChange, onTyping]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick action buttons
  const quickActions = [
    {
      icon: Camera,
      label: 'Camera',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileSelect(files);
        };
        input.click();
        setShowQuickActions(false);
      }
    },
    {
      icon: ImageIcon,
      label: 'Photo',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileSelect(files);
        };
        input.click();
        setShowQuickActions(false);
      }
    },
    {
      icon: Video,
      label: 'Video',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileSelect(files);
        };
        input.click();
        setShowQuickActions(false);
      }
    },
    {
      icon: FileText,
      label: 'Document',
      action: () => {
        if (onOpenMediaModal) {
          onOpenMediaModal();
          setShowQuickActions(false);
        } else {
          fileInputRef.current?.click();
          setShowQuickActions(false);
        }
      }
    }
  ];

  return (
    <div className="bg-white border-t p-4 space-y-3">
      {/* Attached Files */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-x-auto pb-2"
          >
            {attachedFiles.map((file) => (
              <div key={file.id} className="relative shrink-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {file.type === 'video' && <Video className="w-6 h-6 text-gray-500" />}
                      {file.type === 'audio' && <Mic className="w-6 h-6 text-gray-500" />}
                      {file.type === 'document' && <FileText className="w-6 h-6 text-gray-500" />}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-center mt-1 truncate w-16">
                  {file.file.name}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Message */}
      <AnimatePresence>
        {voiceMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
          >
            <Button
              size="sm"
              onClick={toggleVoicePlayback}
              className="w-8 h-8 rounded-full"
            >
              {isPlayingVoice ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-blue-200 rounded-full">
                  <div className="h-1 bg-blue-500 rounded-full w-1/3"></div>
                </div>
                <span className="text-xs text-blue-600">
                  {formatTime(voiceMessage.duration)}
                </span>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={removeVoiceMessage}
              className="w-8 h-8 rounded-full text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Interface */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center gap-4 p-4 bg-red-50 rounded-lg"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-red-700">
              Recording... {formatTime(recordingTime)}
            </span>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelRecording}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        {/* Quick Actions */}
        {showMediaButtons && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-9 h-9 rounded-full"
            >
              <Plus className={`w-5 h-5 transition-transform ${showQuickActions ? 'rotate-45' : ''}`} />
            </Button>
            
            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 grid grid-cols-2 gap-2 w-36"
                >
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={action.action}
                      className="flex flex-col gap-1 h-auto p-2"
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            maxLength={maxLength}
            className="pr-10 rounded-full border-gray-300 focus:border-blue-500"
          />
          
          {/* Character count */}
          {value.length > maxLength * 0.8 && (
            <div className="absolute -top-6 right-0">
              <Badge 
                variant={value.length >= maxLength ? "destructive" : "secondary"}
                className="text-xs"
              >
                {value.length}/{maxLength}
              </Badge>
            </div>
          )}
        </div>

        {/* Voice Recording Button */}
        {showVoiceRecording && !isRecording && value.trim() === '' && attachedFiles.length === 0 && !voiceMessage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={startRecording}
            className="w-9 h-9 rounded-full"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}

        {/* Send Button */}
        {(value.trim() || attachedFiles.length > 0 || voiceMessage) && !isRecording && (
          <Button
            onClick={handleSend}
            disabled={disabled}
            size="sm"
            className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default EnhancedComposerBar;