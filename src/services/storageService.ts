import { supabase } from '@/integrations/supabase/client';

export type StorageBucket = 'public-assets' | 'user-content' | 'admin-assets';

export type AssetCategory = 
  | 'branding/logos'
  | 'branding/icons' 
  | 'hero/images'
  | 'hero/videos'
  | 'venues'
  | 'gallery/wedding'
  | 'gallery/couple'
  | 'gallery/featured'
  | 'profiles/avatar'
  | 'social/posts'
  | 'social/stories'
  | 'cms/drafts'
  | 'cms/staging'
  | 'documents';

interface UploadOptions {
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
  generateThumbnail?: boolean;
  optimizeImage?: boolean;
}

export class StorageService {
  /**
   * Determine which bucket to use based on category
   */
  static determineBucket(category: AssetCategory): StorageBucket {
    // Public categories
    const publicCategories = [
      'branding/logos',
      'branding/icons',
      'hero/images', 
      'hero/videos',
      'venues',
      'gallery/wedding',
      'gallery/couple',
      'gallery/featured'
    ];

    // Admin-only categories
    const adminCategories = [
      'cms/drafts',
      'cms/staging',
      'documents'
    ];

    if (publicCategories.includes(category)) {
      return 'public-assets';
    } else if (adminCategories.includes(category)) {
      return 'admin-assets';
    } else {
      return 'user-content';
    }
  }

  /**
   * Generate organized path for file storage
   */
  static generatePath(
    category: AssetCategory, 
    file: File, 
    metadata?: { venueId?: string; userId?: string; subfolder?: string }
  ): string {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const safeName = file.name
      .split('.')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    let path = category;

    // Handle special cases
    if (category === 'venues' && metadata?.venueId) {
      path = `venues/${metadata.venueId}/hero`;
    } else if (category === 'profiles/avatar' && metadata?.userId) {
      path = `profiles/${metadata.userId}/avatar`;
    } else if (category === 'social/posts' && metadata?.userId) {
      path = `social/${metadata.userId}/posts`;
    }

    if (metadata?.subfolder) {
      path += `/${metadata.subfolder}`;
    }

    return `${path}/${safeName}-${timestamp}.${fileExt}`;
  }

  /**
   * Upload file with automatic organization
   */
  static async uploadFile(
    file: File,
    category: AssetCategory,
    metadata?: Record<string, any>,
    options?: UploadOptions
  ) {
    try {
      const bucket = this.determineBucket(category);
      const path = this.generatePath(category, file, metadata);

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
            original_name: file.name,
            category,
            ...metadata,
            ...options?.metadata
          }
        });

      if (error) throw error;

      // Get public URL if bucket is public
      let publicUrl = null;
      if (bucket === 'public-assets') {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        publicUrl = urlData.publicUrl;
      }

      // Save to media library
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_library')
        .insert({
          filename: path.split('/').pop(),
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_bucket: bucket,
          storage_path: path,
          public_url: publicUrl,
          alt_text: metadata?.alt_text,
          caption: metadata?.caption,
          tags: metadata?.tags || [],
          metadata: {
            category,
            ...metadata
          }
        })
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Generate thumbnail if requested and is image
      if (options?.generateThumbnail && file.type.startsWith('image/')) {
        await this.generateThumbnail(bucket, path);
      }

      return { 
        success: true, 
        data: mediaData,
        publicUrl,
        path 
      };

    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error as Error 
      };
    }
  }

  /**
   * Generate thumbnail for an image
   */
  static async generateThumbnail(bucket: StorageBucket, imagePath: string) {
    // This would typically be handled by a server-side function
    // For now, we'll just create a reference
    const thumbnailPath = imagePath.replace(/\/([^/]+)$/, '/thumbnails/$1');
    
    // In production, this would trigger a server function to:
    // 1. Download the original image
    // 2. Resize to 300x300
    // 3. Upload to thumbnails folder
    
    return thumbnailPath;
  }

  /**
   * Get organized media by category
   */
  static async getMediaByCategory(category: AssetCategory, options?: {
    limit?: number;
    offset?: number;
    tags?: string[];
  }) {
    let query = supabase
      .from('media_library')
      .select('*')
      .eq('metadata->>category', category)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options?.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Move file between buckets/folders
   */
  static async moveFile(
    fromBucket: StorageBucket,
    fromPath: string,
    toBucket: StorageBucket,
    toPath: string
  ) {
    try {
      // Download file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(fromBucket)
        .download(fromPath);

      if (downloadError) throw downloadError;

      // Upload to new location
      const { error: uploadError } = await supabase.storage
        .from(toBucket)
        .upload(toPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Delete from old location
      const { error: deleteError } = await supabase.storage
        .from(fromBucket)
        .remove([fromPath]);

      if (deleteError) throw deleteError;

      // Update media library
      await supabase
        .from('media_library')
        .update({
          storage_bucket: toBucket,
          storage_path: toPath,
          public_url: toBucket === 'public-assets' 
            ? supabase.storage.from(toBucket).getPublicUrl(toPath).data.publicUrl
            : null
        })
        .eq('storage_bucket', fromBucket)
        .eq('storage_path', fromPath);

      return { success: true };

    } catch (error) {
      console.error('Move file error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Delete file and its references
   */
  static async deleteFile(bucket: StorageBucket, path: string) {
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) throw deleteError;

      // Delete from media library
      await supabase
        .from('media_library')
        .delete()
        .eq('storage_bucket', bucket)
        .eq('storage_path', path);

      return { success: true };

    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get venue images
   */
  static async getVenueImages(venueId: string) {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('storage_bucket', 'public-assets')
      .like('storage_path', `venues/${venueId}/%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Upload venue image
   */
  static async uploadVenueImage(
    venueId: string, 
    file: File, 
    type: 'hero' | 'gallery' = 'hero'
  ) {
    return this.uploadFile(
      file,
      'venues',
      { 
        venueId, 
        subfolder: type,
        venue_image_type: type
      },
      { generateThumbnail: true }
    );
  }
}