import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentBlock {
  id: string;
  section: string;
  type: 'text' | 'rich_text' | 'image' | 'video' | 'faq' | 'event';
  title: string;
  content: string;
  metadata: Record<string, any>;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentSection {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  blocks: ContentBlock[];
}

export const useContentBlocks = (sectionId?: string) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [sectionId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load sections first
      const { data: sectionsData, error: sectionsError } = await (supabase as any)
        .from('content_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      // Load blocks
      let blocksQuery = (supabase as any)
        .from('content_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (sectionId) {
        blocksQuery = blocksQuery.eq('section_key', sectionId);
      }

      const { data: blocksData, error: blocksError } = await blocksQuery;

      if (blocksError) throw blocksError;

      // Group blocks by section
      const sectionsWithBlocks = sectionsData?.map(section => ({
        ...section,
        blocks: blocksData?.filter(block => block.section === section.id) || []
      })) || [];

      setSections(sectionsWithBlocks);
      setBlocks(blocksData || []);

    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getBlocksBySection = (sectionId: string): ContentBlock[] => {
    return blocks.filter(block => block.section === sectionId);
  };

  const getBlocksByType = (type: ContentBlock['type']): ContentBlock[] => {
    return blocks.filter(block => block.type === type);
  };

  const getSection = (sectionId: string): ContentSection | undefined => {
    return sections.find(section => section.id === sectionId);
  };

  const refreshContent = () => {
    loadContent();
  };

  return {
    blocks,
    sections,
    loading,
    error,
    getBlocksBySection,
    getBlocksByType,
    getSection,
    refreshContent
  };
};

export default useContentBlocks;