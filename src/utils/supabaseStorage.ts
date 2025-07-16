import { supabase } from '@/integrations/supabase/client';

/**
 * Get public URL for a file in Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL for the file
 */
export const getStorageUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Upload a file to Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The destination path within the bucket
 * @param file - The file to upload
 * @returns Promise with upload result
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  return await supabase.storage.from(bucket).upload(path, file);
};

/**
 * Delete a file from Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Promise with deletion result
 */
export const deleteFile = async (bucket: string, path: string) => {
  return await supabase.storage.from(bucket).remove([path]);
};

/**
 * List files in a Supabase storage bucket
 * @param bucket - The storage bucket name
 * @param path - The folder path (optional)
 * @returns Promise with list of files
 */
export const listFiles = async (bucket: string, path: string = '') => {
  return await supabase.storage.from(bucket).list(path, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });
};

/**
 * Check if a file exists in Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Promise with boolean result
 */
export const fileExists = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path.split('/').slice(0, -1).join('/'));
    if (error) return false;
    
    const fileName = path.split('/').pop();
    return data?.some(file => file.name === fileName) || false;
  } catch {
    return false;
  }
};

/**
 * Get a fallback URL if the Supabase storage URL fails
 * @param storageUrl - The Supabase storage URL
 * @param fallbackUrl - The fallback URL to use
 * @returns The storage URL or fallback URL
 */
export const getUrlWithFallback = (storageUrl: string, fallbackUrl: string): string => {
  // For now, return the storage URL and let the component handle fallbacks
  // In production, you might want to test the URL accessibility first
  return storageUrl || fallbackUrl;
};

/**
 * Constants for storage buckets
 */
export const STORAGE_BUCKETS = {
  BACKGROUNDS: 'backgrounds',
  PHOTOS: 'wedding-photos',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents'
} as const;