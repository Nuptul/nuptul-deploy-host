import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X, AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureSignupProps {
  onImageSelect?: (file: File | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32',
  xl: 'w-48 h-48'
};

export const ProfilePictureSignup: React.FC<ProfilePictureSignupProps> = ({
  onImageSelect,
  className = '',
  size = 'lg',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Function to resize image
  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use better quality settings for profile pictures
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9); // 90% quality for good balance of size and quality
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Resize the image
      const resizedFile = await resizeImage(file);
      
      // Check if resized file is still too large (unlikely but possible)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (resizedFile.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Image is too large even after resizing. Please choose a smaller image.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);

      setSelectedFile(resizedFile);
      onImageSelect?.(resizedFile);
      
      toast({
        title: "Image Selected",
        description: "Your profile picture has been optimized and will be uploaded after signup",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try another one.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    onImageSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Profile Picture Display */}
      <div 
        className={`
          ${sizeClasses[size]} 
          relative rounded-full overflow-hidden 
          bg-gradient-to-br from-wedding-navy/20 to-wedding-gold/20
          border-2 border-wedding-gold/30
          cursor-pointer group
          ${dragOver ? 'border-wedding-gold border-dashed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-8 h-8 text-muted-foreground" />
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-wedding-gold/20">
                <Upload className="w-6 h-6 text-wedding-gold" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="mt-4 space-y-2">
        {!previewUrl ? (
          <>
            {/* Camera button for mobile */}
            <Button 
              variant="default" 
              size="default"
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full bg-wedding-navy hover:bg-wedding-navy-light text-white"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take a Selfie
            </Button>
            
            {/* Upload button */}
            <Button 
              variant="outline" 
              size="default"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full bg-white/80 hover:bg-white border-wedding-gold/30"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose from Gallery
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="default"
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 bg-white/80 hover:bg-white border-wedding-gold/30"
            >
              <Camera className="w-5 h-5 mr-2" />
              Retake
            </Button>
            
            <Button 
              variant="outline" 
              size="default"
              type="button"
              onClick={removeImage}
              disabled={isProcessing}
              className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
            >
              <X className="w-5 h-5 mr-2" />
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* Camera input for mobile - capture="user" for front camera (selfie) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload instructions */}
      {!previewUrl && size === 'xl' && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Photo will be uploaded after signup
          </p>
          <p className="mt-1">Image will be automatically optimized</p>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Optimizing image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureSignup;