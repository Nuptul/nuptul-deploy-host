import { supabase } from '@/integrations/supabase/client';

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: string;
  category_id?: string;
  question: string;
  answer: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at?: string;
  updated_at?: string;
  // From view
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  category_description?: string;
}

// Category Management
export async function getCategories() {
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data as FAQCategory[];
}

export async function createCategory(category: Omit<FAQCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('faq_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data as FAQCategory;
}

export async function updateCategory(id: string, updates: Partial<FAQCategory>) {
  const { data, error } = await supabase
    .from('faq_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FAQCategory;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('faq_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// FAQ Item Management
export async function getFAQItems(categoryId?: string | null) {
  let query = supabase
    .from('faq_with_categories')
    .select('*')
    .order('display_order');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as FAQItem[];
}

export async function getFAQItem(id: string) {
  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as FAQItem;
}

export async function createFAQItem(item: Omit<FAQItem, 'id' | 'created_at' | 'updated_at' | 'view_count'>) {
  const { data, error } = await supabase
    .from('faq_items')
    .insert({
      ...item,
      view_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data as FAQItem;
}

export async function updateFAQItem(id: string, updates: Partial<FAQItem>) {
  const { data, error } = await supabase
    .from('faq_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FAQItem;
}

export async function deleteFAQItem(id: string) {
  const { error } = await supabase
    .from('faq_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Bulk update display order
export async function updateFAQOrder(items: { id: string; display_order: number }[]) {
  const promises = items.map(item => 
    supabase
      .from('faq_items')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
  );

  const results = await Promise.all(promises);
  const hasError = results.some(result => result.error);
  
  if (hasError) {
    throw new Error('Failed to update FAQ order');
  }
}

// Get all active FAQs for randomization on the home page
export async function getAllFAQs() {
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, question, answer')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

// Get featured FAQs for home page
export async function getFeaturedFAQs(limit: number = 5) {
  const { data, error } = await supabase
    .rpc('get_featured_faqs', { limit_count: limit });

  if (error) throw error;
  return data;
}

// Increment view count
export async function incrementFAQViewCount(id: string) {
  const { error } = await supabase
    .rpc('increment_faq_view_count', { faq_id: id });

  if (error) throw error;
}

export interface GroupedFAQs {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  items: FAQItem[];
}

// Public FAQs for guest view
export async function getPublicFAQs(): Promise<GroupedFAQs[]> {
  const { data, error } = await supabase
    .from('faq_with_categories')
    .select('*')
    .order('category_name, display_order');

  if (error) throw error;
  
  // Group by category
  const grouped = data.reduce((acc, faq) => {
    const categoryName = faq.category_name || 'General';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        slug: faq.category_slug || 'general',
        icon: faq.category_icon || 'HelpCircle',
        description: faq.category_description,
        items: []
      };
    }
    acc[categoryName].items.push(faq);
    return acc;
  }, {} as Record<string, GroupedFAQs>);

  return Object.values(grouped);
}