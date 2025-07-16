import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  onAvatarUpdate: (url: string | null) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  showRemoveOption?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userId,
  onAvatarUpdate,
  size = 'medium',
  className,
  disabled = false,
  showRemoveOption = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Size configurations
  const sizeConfig = {
    small: { 
      container: 'w-16 h-16', 
      icon: 'w-4 h-4', 
      upload: 'w-4 h-4',
      text: 'text-xs'
    },
    medium: { 
      container: 'w-24 h-24', 
      icon: 'w-6 h-6', 
      upload: 'w-5 h-5',
      text: 'text-sm'
    },
    large: { 
      container: 'w-32 h-32', 
      icon: 'w-8 h-8', 
      upload: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  const validateFile = (file: File): string | null => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check specific image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    return null;
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      // Create file name with timestamp to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update parent component
      onAvatarUpdate(newAvatarUrl);
      setPreviewUrl(null);

      toast({
        title: 'Success!',
        description: 'Avatar uploaded successfully',
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setIsUploading(true);

      // Delete from storage if URL exists
      if (currentAvatarUrl) {
        const filePath = currentAvatarUrl.split('/avatars/')[1];
        if (filePath) {
          await supabase.storage.from('avatars').remove([filePath]);
        }
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update parent component
      onAvatarUpdate(null);

      toast({
        title: 'Avatar Removed',
        description: 'Avatar has been removed successfully',
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Remove Failed',
        description: error.message || 'Failed to remove avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    if (disabled || isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  };

  const triggerFileInput = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn("relative group", className)}>
      <motion.div
        className={cn(
          "relative rounded-full overflow-hidden border-4 border-white/20 shadow-lg backdrop-blur-sm",
          config.container,
          dragActive && "border-blue-400 bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-white/40 transition-all duration-300"
        )}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100" />
        
        {/* Avatar image or placeholder */}
        <AnimatePresence mode="wait">
          {displayUrl ? (
            <motion.img
              key={displayUrl}
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              key="placeholder"
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <User className={cn("text-gray-400", config.icon)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload overlay */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            whileHover={{ opacity: 1 }}
          >
            {isUploading ? (
              <Loader2 className={cn("text-white animate-spin", config.upload)} />
            ) : (
              <Camera className={cn("text-white", config.upload)} />
            )}
          </motion.div>
        )}

        {/* Upload status indicator */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className={cn("text-blue-600", config.upload)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons */}
      {!disabled && (currentAvatarUrl || previewUrl) && showRemoveOption && (
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <Button
            size="sm"
            variant="destructive"
            className="w-6 h-6 rounded-full p-0 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              removeAvatar();
            }}
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        </motion.div>
      )}

      {/* Upload instructions */}
      {!disabled && !currentAvatarUrl && !previewUrl && (
        <motion.div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center p-2",
            config.text
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Upload className={cn("mb-1 text-gray-400", config.upload)} />
          <span className="text-gray-500 font-medium">Upload Photo</span>
        </motion.div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Drag and drop instructions */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            className="absolute inset-0 bg-blue-100/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-dashed border-blue-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-center">
              <Upload className={cn("mx-auto mb-1 text-blue-600", config.upload)} />
              <span className={cn("text-blue-600 font-medium", config.text)}>
                Drop to upload
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarUpload;