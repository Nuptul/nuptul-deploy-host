import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, Loader2, User, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedProfilePictureUploadProps {
  currentImageUrl?: string | null;
  userId?: string;
  onImageUpdate?: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  showUploadButton?: boolean;
  showEditOverlay?: boolean;
  variant?: 'default' | 'glassmorphism';
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-base', 
  lg: 'w-24 h-24 text-lg',
  xl: 'w-32 h-32 text-xl'
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

export const EnhancedProfilePictureUpload: React.FC<EnhancedProfilePictureUploadProps> = ({
  currentImageUrl,
  userId,
  onImageUpdate,
  size = 'lg',
  className = '',
  disabled = false,
  showUploadButton = true,
  showEditOverlay = true,
  variant = 'glassmorphism'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile, updateProfile } = useAuth();
  
  const targetUserId = userId || user?.id;
  const displayName = profile?.display_name || profile?.first_name || user?.email || 'User';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const uploadImage = async (file: File) => {
    if (!targetUserId) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetUserId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Delete old image if exists
      if (currentImageUrl) {
        const oldPath = currentImageUrl.split('/profile-pictures/')[1];
        if (oldPath) {
          await supabase.storage.from('profile-pictures').remove([oldPath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const newImageUrl = urlData.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: newImageUrl,
          avatar_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId);

      if (updateError) {
        throw updateError;
      }

      // Update auth context if it's the current user
      if (targetUserId === user?.id && updateProfile) {
        await updateProfile({
          profile_picture_url: newImageUrl,
          avatar_url: newImageUrl
        });
      }

      // Notify parent component
      if (onImageUpdate) {
        onImageUpdate(newImageUrl);
      }

      toast({
        title: 'Success!',
        description: 'Profile picture updated successfully',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!targetUserId || !currentImageUrl) return;

    try {
      setUploading(true);

      // Remove from storage
      const oldPath = currentImageUrl.split('/profile-pictures/')[1];
      if (oldPath) {
        await supabase.storage.from('profile-pictures').remove([oldPath]);
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_url: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId);

      if (updateError) {
        throw updateError;
      }

      // Update auth context if it's the current user
      if (targetUserId === user?.id && updateProfile) {
        await updateProfile({
          profile_picture_url: null,
          avatar_url: null
        });
      }

      // Notify parent component
      if (onImageUpdate) {
        onImageUpdate(null);
      }

      toast({
        title: 'Success!',
        description: 'Profile picture removed successfully',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading) return;
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const getContainerStyles = () => {
    if (variant === 'glassmorphism') {
      return {
        background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: '2px solid rgba(0, 122, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
      };
    }
    return {
      background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
      border: '2px solid #d0d0d0'
    };
  };

  return (
    <div className={cn('relative', className)}>
      {/* Profile Picture Display */}
      <div 
        className={cn(
          sizeClasses[size],
          'relative rounded-full overflow-hidden cursor-pointer group transition-all duration-300',
          dragOver && 'scale-105',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
        style={getContainerStyles()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && showUploadButton && fileInputRef.current?.click()}
      >
        {currentImageUrl ? (
          <>
            <img 
              src={currentImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
            {/* Edit Overlay */}
            {showEditOverlay && !disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Edit3 className={cn(iconSizes[size], 'text-white')} />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {uploading ? (
              <Loader2 className={cn(iconSizes[size], 'animate-spin text-glass-blue')} />
            ) : (
              <div className="text-center">
                <User className={cn(iconSizes[size], 'text-glass-blue mb-1')} />
                <div className="text-xs font-semibold text-glass-blue">
                  {getInitials(displayName)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showUploadButton && !disabled && (
        <div className="mt-3 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 bg-white/80 hover:bg-white border-glass-blue/30"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 bg-white/80 hover:bg-white border-glass-blue/30"
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
          
          {currentImageUrl && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={removeImage}
              disabled={uploading}
              className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
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
        disabled={disabled || uploading}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default EnhancedProfilePictureUpload;
