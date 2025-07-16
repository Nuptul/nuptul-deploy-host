import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorageBucket {
  HOME_HERO: 'home-hero';
  VENUE_BEN_EAN: 'venue-ben-ean';
  VENUE_PUB: 'venue-pub';
  VENUE_BEACH: 'venue-beach';
  COUPLE_GALLERY: 'couple-gallery';
  USER_PROFILES: 'user-profiles';
  SOCIAL_FEED: 'social-feed';
  WEDDING_PHOTOS: 'wedding-photos'; // Legacy bucket
  GIFT_IMAGES: 'gift-images';
}

export const STORAGE_BUCKETS: StorageBucket = {
  HOME_HERO: 'home-hero',
  VENUE_BEN_EAN: 'venue-ben-ean',
  VENUE_PUB: 'venue-pub', 
  VENUE_BEACH: 'venue-beach',
  COUPLE_GALLERY: 'couple-gallery',
  USER_PROFILES: 'user-profiles',
  SOCIAL_FEED: 'social-feed',
  WEDDING_PHOTOS: 'wedding-photos',
  GIFT_IMAGES: 'gift-images'
};

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    bucket: keyof StorageBucket,
    folder: string = '',
    fileName?: string
  ) => {
    try {
      setUploading(true);

      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${timestamp}.${fileExt}`;
      
      // Create full path
      const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .getPublicUrl(filePath);

      toast({
        title: "Upload Successful",
        description: "File uploaded successfully",
      });

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl,
          bucket: STORAGE_BUCKETS[bucket]
        }
      };

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (
    bucket: keyof StorageBucket,
    filePath: string
  ) => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({
        title: "File Deleted",
        description: "File deleted successfully",
      });

      return { success: true };

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message
      };
    }
  };

  const getPublicUrl = (bucket: keyof StorageBucket, filePath: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const listFiles = async (bucket: keyof StorageBucket, folder: string = '') => {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw error;
      }

      return { success: true, data };

    } catch (error: any) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Helper functions for specific use cases
  const uploadUserProfileImage = async (file: File, userId: string) => {
    return uploadFile(file, 'USER_PROFILES', userId, 'profile-image');
  };

  const uploadSocialFeedImage = async (file: File, userId: string) => {
    return uploadFile(file, 'SOCIAL_FEED', userId);
  };

  const uploadVenueImage = async (file: File, venue: 'ben-ean' | 'pub' | 'beach') => {
    const bucketMap = {
      'ben-ean': 'VENUE_BEN_EAN' as keyof StorageBucket,
      'pub': 'VENUE_PUB' as keyof StorageBucket,
      'beach': 'VENUE_BEACH' as keyof StorageBucket
    };

    return uploadFile(file, bucketMap[venue]);
  };

  const uploadGiftImage = async (file: File, giftId?: string) => {
    return uploadFile(file, 'GIFT_IMAGES', giftId ? `gift-${giftId}` : '');
  };

  const uploadWeddingPhoto = async (file: File, userId: string) => {
    return uploadFile(file, 'WEDDING_PHOTOS', userId);
  };

  return {
    uploading,
    uploadFile,
    deleteFile,
    getPublicUrl,
    listFiles,
    uploadUserProfileImage,
    uploadSocialFeedImage,
    uploadVenueImage,
    uploadGiftImage,
    uploadWeddingPhoto,
    STORAGE_BUCKETS
  };
};