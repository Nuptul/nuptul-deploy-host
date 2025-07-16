import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ContactDetails {
  id: string;
  contact_id: string;
  category_id?: string;
  contact_type: 'vendor' | 'venue' | 'family' | 'friend' | 'other';
  first_name: string;
  last_name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  is_favorite: boolean;
  last_contacted?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactDetailsInput {
  contact_id: string;
  category_id?: string;
  contact_type: 'vendor' | 'venue' | 'family' | 'friend' | 'other';
  first_name: string;
  last_name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  is_favorite?: boolean;
  last_contacted?: string;
}

interface UseContactDetailsResult {
  contacts: ContactDetails[];
  loading: boolean;
  error: string | null;
  fetchContacts: (contactId?: string) => Promise<void>;
  createContact: (contact: ContactDetailsInput) => Promise<ContactDetails | null>;
  updateContact: (id: string, contact: Partial<ContactDetailsInput>) => Promise<ContactDetails | null>;
  deleteContact: (id: string) => Promise<boolean>;
}

export const useContactDetails = (): UseContactDetailsResult => {
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (contactId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('contact_details').select('*').order('last_name');
      if (contactId) query = query.eq('contact_id', contactId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (contact: ContactDetailsInput): Promise<ContactDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: createError } = await supabase
        .from('contact_details')
        .insert([{
          ...contact,
          priority: contact.priority || 'medium',
          is_favorite: contact.is_favorite ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setContacts(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (id: string, contact: Partial<ContactDetailsInput>): Promise<ContactDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: updateError } = await supabase
        .from('contact_details')
        .update({ ...contact, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setContacts(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const { error: deleteError } = await supabase
        .from('contact_details')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setContacts(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
  };
};

export default useContactDetails;