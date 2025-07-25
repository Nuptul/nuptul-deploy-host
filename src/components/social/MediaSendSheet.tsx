import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Image, 
  Video, 
  Mic, 
  X, 
  FileText,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaSendSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMedia: (file: File) => void;
  children?: React.ReactNode;
}

const MediaSendSheet: React.FC<MediaSendSheetProps> = ({
  isOpen,
  onOpenChange,
  onSendMedia,
  children
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleSend = () => {
    if (selectedFile) {
      onSendMedia(selectedFile);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (file.type.startsWith('audio/')) return <Mic className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const quickActions = [
    {
      icon: <Camera className="w-6 h-6" />,
      label: 'Camera',
      accept: 'image/*',
      capture: 'environment' as const
    },
    {
      icon: <Image className="w-6 h-6" />,
      label: 'Photos',
      accept: 'image/*'
    },
    {
      icon: <Video className="w-6 h-6" />,
      label: 'Videos', 
      accept: 'video/*'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      label: 'Audio',
      accept: 'audio/*'
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="bottom" className="glass-card border-t">
        <SheetHeader className="text-center">
          <SheetTitle className="text-wedding-navy">Send Media</SheetTitle>
          <SheetDescription>
            Share photos, videos, or audio with your wedding party
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <label key={index} className="cursor-pointer">
                <input
                  type="file"
                  accept={action.accept}
                  capture={action.capture}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card p-4 text-center transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)',
                    border: '1px solid rgba(0, 102, 204, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(0, 122, 255, 0.1) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)';
                  }}
                >
                  <div className="mb-2 flex justify-center" style={{ color: '#0066CC' }}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#007AFF' }}>
                    {action.label}
                  </span>
                </motion.div>
              </label>
            ))}
          </div>

          {/* Drag and Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-wedding-navy bg-wedding-navy/5"
                : "border-gray-300 hover:border-wedding-navy/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports images, videos, and audio files
            </p>
            <label className="inline-block mt-4 cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" className="pointer-events-none">
                Browse Files
              </Button>
            </label>
          </div>

          {/* Selected File Preview */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-wedding-navy">
                      {getFileIcon(selectedFile)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleSend}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      Send
                    </Button>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MediaSendSheet;