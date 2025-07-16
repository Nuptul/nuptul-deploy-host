import React, { useState, useRef } from 'react';
import { X, Camera, Type, Palette, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (storyData: {
    type: 'photo' | 'video' | 'text';
    file?: File;
    textContent?: string;
    backgroundColor?: string;
    textStyle?: any;
  }) => Promise<void>;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({
  isOpen,
  onClose,
  onCreateStory
}) => {
  const [step, setStep] = useState<'select' | 'camera' | 'text' | 'upload' | 'preview'>('select');
  const [storyType, setStoryType] = useState<'photo' | 'video' | 'text'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [textStyle, setTextStyle] = useState({
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'inherit'
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const backgroundColors = [
    '#667eea', '#764ba2', '#FF6B6B', '#4ECDC4', 
    '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3',
    '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  const fontStyles = [
    { name: 'Bold', style: { fontSize: '24px', fontWeight: 'bold', fontFamily: 'inherit' } },
    { name: 'Script', style: { fontSize: '24px', fontWeight: 'normal', fontFamily: 'cursive' } },
    { name: 'Mono', style: { fontSize: '20px', fontWeight: 'normal', fontFamily: 'monospace' } },
    { name: 'Serif', style: { fontSize: '24px', fontWeight: 'normal', fontFamily: 'serif' } }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = async () => {
    setIsCreating(true);
    
    try {
      await onCreateStory({
        type: storyType,
        file: selectedFile || undefined,
        textContent: storyType === 'text' ? textContent : undefined,
        backgroundColor: storyType === 'text' ? backgroundColor : undefined,
        textStyle: storyType === 'text' ? textStyle : undefined
      });
      
      // Reset state
      setStep('select');
      setSelectedFile(null);
      setTextContent('');
      setPreview(null);
      onClose();
      
      toast({
        title: "Story created!",
        description: "Your story has been posted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="flex flex-col space-y-6 p-6">
            <h2 className="text-xl font-semibold text-[#2d3f51] text-center">Create Your Story</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="h-16 flex items-center justify-center space-x-3 hover:bg-[#667eea]/10"
                onClick={() => {
                  setStoryType('photo');
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-6 h-6 text-[#667eea]" />
                <span className="font-medium">Take Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex items-center justify-center space-x-3 hover:bg-[#667eea]/10"
                onClick={() => {
                  setStoryType('photo');
                  setStep('upload');
                }}
              >
                <Upload className="w-6 h-6 text-[#667eea]" />
                <span className="font-medium">Upload Media</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex items-center justify-center space-x-3 hover:bg-[#667eea]/10"
                onClick={() => {
                  setStoryType('text');
                  setStep('text');
                }}
              >
                <Type className="w-6 h-6 text-[#667eea]" />
                <span className="font-medium">Create Text</span>
              </Button>
            </div>
          </div>
        );
        
      case 'upload':
        return (
          <div className="flex flex-col space-y-6 p-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-[#2d3f51]">Upload Media</h2>
            </div>
            
            <div 
              className="border-2 border-dashed border-[#667eea]/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#667eea]/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-[#667eea] mx-auto mb-4" />
              <p className="text-[#2d3f51] font-medium mb-2">Click to upload photo or video</p>
              <p className="text-[#7a736b] text-sm">Max file size: 10MB</p>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="flex flex-col space-y-6 p-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-[#2d3f51]">Create Text Story</h2>
            </div>
            
            {/* Preview */}
            <div 
              className="aspect-[9/16] max-h-80 rounded-lg flex items-center justify-center p-6 relative overflow-hidden"
              style={{ background: backgroundColor }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-full bg-transparent text-white placeholder-white/70 text-center resize-none outline-none"
                style={{
                  fontSize: textStyle.fontSize,
                  fontWeight: textStyle.fontWeight,
                  fontFamily: textStyle.fontFamily
                }}
                maxLength={200}
              />
            </div>
            
            {/* Background Colors */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="w-4 h-4 text-[#2d3f51]" />
                <span className="text-sm font-medium text-[#2d3f51]">Background</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      backgroundColor === color ? 'border-white shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>
            
            {/* Font Styles */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-[#2d3f51]" />
                <span className="text-sm font-medium text-[#2d3f51]">Font Style</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {fontStyles.map((font) => (
                  <button
                    key={font.name}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      JSON.stringify(textStyle) === JSON.stringify(font.style)
                        ? 'border-[#667eea] bg-[#667eea]/10 text-[#667eea]'
                        : 'border-gray-300 text-[#2d3f51]'
                    }`}
                    style={font.style}
                    onClick={() => setTextStyle(font.style)}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={() => setStep('preview')}
              disabled={!textContent.trim()}
              className="bg-[#667eea] hover:bg-[#667eea]/90"
            >
              Preview Story
            </Button>
          </div>
        );
        
      case 'preview':
        return (
          <div className="flex flex-col space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setStep(storyType === 'text' ? 'text' : 'select')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-[#2d3f51]">Preview</h2>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="aspect-[9/16] max-h-80 rounded-lg overflow-hidden relative bg-black">
              {storyType === 'text' ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-6"
                  style={{ background: backgroundColor }}
                >
                  <div 
                    className="text-white text-center"
                    style={{
                      fontSize: textStyle.fontSize,
                      fontWeight: textStyle.fontWeight,
                      fontFamily: textStyle.fontFamily
                    }}
                  >
                    {textContent}
                  </div>
                </div>
              ) : preview ? (
                selectedFile?.type.startsWith('video/') ? (
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  No preview available
                </div>
              )}
            </div>
            
            <Button
              onClick={handleCreateStory}
              disabled={isCreating}
              className="bg-[#667eea] hover:bg-[#667eea]/90"
            >
              {isCreating ? 'Creating...' : 'Share to Your Story'}
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div></div>
          <h1 className="text-lg font-semibold text-[#2d3f51]">New Story</h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        {renderStepContent()}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default StoryCreator;