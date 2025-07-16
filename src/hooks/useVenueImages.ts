import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VenueImage {
  id: string;
  venue_id: string;
  image_url: string;
  image_path: string;
  title: string | null;
  description: string | null;
  image_order: number;
  image_type: 'cover' | 'gallery' | 'detail';
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useVenueImages = (venueId?: string) => {
  const [images, setImages] = useState<VenueImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      let query = supabase
        .from('venue_images')
        .select('*')
        .eq('is_published', true)
        .order('image_order', { ascending: true });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setImages((data || []) as VenueImage[]);
    } catch (error) {
      console.error('Error fetching venue images:', error);
      toast.error('Failed to load venue images');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (
    file: File, 
    venueId: string, 
    imageType: 'cover' | 'gallery' | 'detail' = 'gallery'
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      // Determine bucket based on venue
      const { data: venue } = await supabase
        .from('venues')
        .select('name')
        .eq('id', venueId)
        .single();
      
      let bucketName = 'venue-ben-ean';
      if (venue?.name.includes('Prince')) bucketName = 'venue-pub';
      if (venue?.name.includes('Beach')) bucketName = 'venue-beach';
      
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Insert image record
      const { data: imageData, error: dbError } = await supabase
        .from('venue_images')
        .insert({
          venue_id: venueId,
          image_url: publicUrl,
          image_path: `${bucketName}/${filePath}`,
          image_type: imageType,
          mime_type: file.type,
          file_size: file.size,
          image_order: images.length,
          is_published: true
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Image uploaded successfully');
      await fetchImages();
      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateImage = async (imageId: string, updates: Partial<VenueImage>) => {
    try {
      const { error } = await supabase
        .from('venue_images')
        .update(updates)
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image updated successfully');
      await fetchImages();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Delete from storage
      const pathParts = image.image_path.split('/');
      const bucketName = pathParts[0];
      const fileName = pathParts.slice(1).join('/');
      
      await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from('venue_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image deleted successfully');
      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  useEffect(() => {
    fetchImages();
  }, [venueId]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('venue-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_images'
        },
        () => {
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  return {
    images,
    loading,
    uploading,
    fetchImages,
    uploadImage,
    updateImage,
    deleteImage
  };
};