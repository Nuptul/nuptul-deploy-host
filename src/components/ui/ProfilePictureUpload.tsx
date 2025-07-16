import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onImageUpdate?: (imageUrl: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadButton?: boolean;
  userId?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32',
  xl: 'w-48 h-48'
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  className = '',
  size = 'lg',
  showUploadButton = true,
  userId
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const targetUserId = userId || user?.id;

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
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a profile picture.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Resize the image
      const resizedFile = await resizeImage(file);
      
      // Generate unique filename
      const fileExt = 'jpg'; // We always convert to JPEG
      const fileName = `profile-${targetUserId}-${Date.now()}.${fileExt}`;
      const filePath = `${targetUserId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-profiles')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-profiles')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (updateError) throw updateError;

      // Delete old profile picture if it exists and is different
      if (currentImageUrl && currentImageUrl !== publicUrl) {
        try {
          const oldPath = currentImageUrl.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from('user-profiles')
              .remove([`${targetUserId}/${oldPath}`]);
          }
        } catch (deleteError) {
          console.warn('Failed to delete old profile picture:', deleteError);
        }
      }

      onImageUpdate?.(publicUrl);
      
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  const removeProfilePicture = async () => {
    if (!targetUserId || !currentImageUrl) return;

    setUploading(true);

    try {
      // Update database to remove profile picture
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (updateError) throw updateError;

      // Delete from storage
      try {
        const fileName = currentImageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('user-profiles')
            .remove([`${targetUserId}/${fileName}`]);
        }
      } catch (deleteError) {
        console.warn('Failed to delete from storage:', deleteError);
      }

      onImageUpdate?.(null);
      
      toast({
        title: "Success!",
        description: "Profile picture removed successfully",
      });

    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
          ${uploading ? 'opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => showUploadButton && fileInputRef.current?.click()}
      >
        {currentImageUrl ? (
          <>
            <img 
              src={currentImageUrl} 
              alt="Profile" 
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

        {/* Upload indicator */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Action Buttons - Mobile Optimized */}
      {showUploadButton && (
        <div className="mt-4 space-y-2">
          {!currentImageUrl ? (
            <>
              {/* Camera button for mobile */}
              <Button 
                variant="default" 
                size="default"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-wedding-navy hover:bg-wedding-navy-light text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take a Selfie
              </Button>
              
              {/* Upload button */}
              <Button 
                variant="outline" 
                size="default"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-white/80 hover:bg-white border-wedding-gold/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose from Gallery
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 bg-white/80 hover:bg-white border-wedding-gold/30"
              >
                <Camera className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={removeProfilePicture}
                disabled={uploading}
                className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </div>
      )}

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
      {!currentImageUrl && size === 'xl' && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Drag & drop an image or click to browse
          </p>
          <p className="mt-1">Max 5MB • JPG, PNG, GIF</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;