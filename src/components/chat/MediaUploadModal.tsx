import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Camera, 
  Video, 
  FileText, 
  Music, 
  Image as ImageIcon,
  Download,
  Trash2,
  Plus,
  Mic,
  Square,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
  duration?: number;
  size: number;
  uploadProgress: number;
  uploaded: boolean;
  url?: string;
}

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (files: MediaFile[], message?: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSend,
  maxFiles = 10,
  maxFileSize = 50,
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt']
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // File type detection
  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Create file preview
  const createPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadedmetadata = () => {
          canvas.width = 200;
          canvas.height = (video.videoHeight / video.videoWidth) * 200;
          video.currentTime = 1; // Seek to 1 second for thumbnail
        };
        
        video.onseeked = () => {
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
          video.remove();
        };
        
        video.src = URL.createObjectURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  // Add files to upload queue
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: MediaFile[] = [];

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxFileSize}MB)`);
        continue;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.name.toLowerCase().endsWith(type);
      });

      if (!isAllowed) {
        toast.error(`${file.name} is not an allowed file type`);
        continue;
      }

      const preview = await createPreview(file);
      
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: getFileType(file),
        preview,
        size: file.size,
        uploadProgress: 0,
        uploaded: false
      };

      validFiles.push(mediaFile);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, maxFileSize, allowedTypes, createPreview]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

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
        setAudioBlob(audioBlob);
        
        // Create audio file from blob
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, {
          type: 'audio/wav'
        });
        
        addFiles([audioFile]);
        
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
      toast.error('Failed to start recording');
    }
  }, [addFiles]);

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

  // Upload files to Supabase
  const uploadFiles = useCallback(async (): Promise<MediaFile[]> => {
    setIsUploading(true);
    const uploadedFiles: MediaFile[] = [];

    for (const mediaFile of files) {
      try {
        const fileExt = mediaFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `chat-media/${fileName}`;

        const { data, error } = await supabase.storage
          .from('chat-uploads')
          .upload(filePath, mediaFile.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-uploads')
          .getPublicUrl(filePath);

        const uploadedFile: MediaFile = {
          ...mediaFile,
          uploadProgress: 100,
          uploaded: true,
          url: publicUrl
        };

        uploadedFiles.push(uploadedFile);
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? uploadedFile : f
        ));

      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${mediaFile.file.name}`);
      }
    }

    setIsUploading(false);
    return uploadedFiles;
  }, [files]);

  // Send files and message
  const handleSend = useCallback(async () => {
    try {
      const uploadedFiles = await uploadFiles();
      onSend(uploadedFiles, message);
      
      // Reset state
      setFiles([]);
      setMessage('');
      onClose();
      
    } catch (error) {
      console.error('Error sending files:', error);
      toast.error('Failed to send files');
    }
  }, [uploadFiles, onSend, message, onClose]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get file icon
  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Share Media</h2>
              <p className="text-sm text-gray-500">
                Upload files, record voice messages, or capture photos
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">
                Max {maxFiles} files, {maxFileSize}MB each
              </p>
              
              {/* Upload Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) addFiles(files);
                    };
                    input.click();
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? 'bg-red-50 border-red-200' : ''}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2 text-red-600" />
                      Stop ({formatTime(recordingTime)})
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Record Voice
                    </>
                  )}
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={(e) => e.target.files && addFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Selected Files ({files.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file) => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.file.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {file.type}
                            </Badge>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                          
                          {file.uploadProgress > 0 && file.uploadProgress < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${file.uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add a message (optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message to go with your files..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''} selected`}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={files.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Send {files.length > 0 && `(${files.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaUploadModal;