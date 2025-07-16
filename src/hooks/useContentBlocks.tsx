import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentBlock {
  id: string;
  page: string;
  section: string;
  block_key: string;
  content_type: 'text' | 'image' | 'video' | 'html';
  content: any;
  metadata?: any;
  is_active: boolean;
}

export const useContentBlock = (page: string, section: string, blockKey: string) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContentBlock = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page', page)
          .eq('section', section)
          .eq('block_key', blockKey)
          .eq('is_active', true)
          .single();

        if (error) {
          // If no content block exists, return null (not an error)
          if (error.code === 'PGRST116') {
            setContent(null);
          } else {
            throw error;
          }
        } else {
          setContent(data?.content || null);
        }
      } catch (err) {
        console.error('Error fetching content block:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentBlock();
  }, [page, section, blockKey]);

  return { content, loading, error };
};

export const useContentBlocks = (page: string, section?: string) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContentBlocks = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('content_blocks')
          .select('*')
          .eq('page', page)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (section) {
          query = query.eq('section', section);
        }

        const { data, error } = await query;

        if (error) throw error;
        setBlocks(data || []);
      } catch (err) {
        console.error('Error fetching content blocks:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentBlocks();
  }, [page, section]);

  return { blocks, loading, error };
};

// Specialized hook for venue images
export const useVenueImage = (venueId: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenueImage = async () => {
      try {
        // First try to get from media library (new structure)
        const { data: mediaData } = await supabase
          .from('media_library')
          .select('public_url')
          .eq('storage_bucket', 'public-assets')
          .like('storage_path', `venues/${venueId}/hero/%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (mediaData?.public_url) {
          setImageUrl(mediaData.public_url);
        } else {
          // Try content blocks
          const blockKey = `venue_${venueId}_image`;
          const { data: blockData } = await supabase
            .from('content_blocks')
            .select('*')
            .eq('page', 'venues')
            .eq('block_key', blockKey)
            .eq('is_active', true)
            .single();

          if (blockData?.content?.url) {
            setImageUrl(blockData.content.url);
          } else {
            // Fallback to venues table
            const { data: venueData } = await supabase
              .from('venues')
              .select('image_url')
              .eq('id', venueId)
              .single();

            if (venueData?.image_url) {
              setImageUrl(venueData.image_url);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching venue image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueImage();
  }, [venueId]);

  return { imageUrl, loading };
};