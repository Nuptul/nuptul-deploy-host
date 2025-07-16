import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ContactCategory {
  id: string;
  wedding_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactCategoryInput {
  wedding_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

interface UseContactCategoriesResult {
  categories: ContactCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: (weddingId: string) => Promise<void>;
  createCategory: (category: ContactCategoryInput) => Promise<ContactCategory | null>;
  updateCategory: (id: string, category: Partial<ContactCategoryInput>) => Promise<ContactCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useContactCategories = (): UseContactCategoriesResult => {
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (weddingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('contact_categories')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('display_order');
      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (category: ContactCategoryInput): Promise<ContactCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: createError } = await supabase
        .from('contact_categories')
        .insert([{
          ...category,
          is_active: category.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setCategories(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, category: Partial<ContactCategoryInput>): Promise<ContactCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: updateError } = await supabase
        .from('contact_categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setCategories(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const { error: deleteError } = await supabase
        .from('contact_categories')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setCategories(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useContactCategories;