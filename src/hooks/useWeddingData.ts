import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeddingEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  venue_name?: string;
  address?: string;
  dress_code?: string;
  notes?: string;
  is_main_event: boolean;
}

export interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: 'attending' | 'not_attending' | 'maybe';
  guest_count: number;
  dietary_restrictions?: string;
  message?: string;
}

export interface Photo {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  file_url: string;
  created_at: string;
  profiles: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
  photo_likes: { id: string; user_id: string }[];
  photo_comments: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      display_name?: string;
      first_name?: string;
      last_name?: string;
    };
  }[];
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
  message_likes: { id: string; user_id: string }[];
}

export const useWeddingEvents = () => {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, refetch: fetchEvents };
};

export const useRSVPs = (userId?: string) => {
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRSVPs();
  }, [userId]);

  const fetchRSVPs = async () => {
    try {
      let query = supabase.from('rsvps').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRSVPs((data || []) as RSVP[]);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRSVP = async (eventId: string, status: RSVP['status'], guestCount = 1, dietaryRestrictions?: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      // Check if RSVP already exists
      const { data: existingRSVP } = await supabase
        .from('rsvps')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      const rsvpPayload = {
        user_id: user.id,
        event_id: eventId,
        status,
        guest_count: guestCount,
        dietary_restrictions: dietaryRestrictions,
        message,
      };

      let error;
      if (existingRSVP) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from('rsvps')
          .update({
            ...rsvpPayload,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRSVP.id);
        error = updateError;
      } else {
        // Insert new RSVP
        const { error: insertError } = await supabase
          .from('rsvps')
          .insert(rsvpPayload);
        error = insertError;
      }

      if (error) throw error;
      await fetchRSVPs();
      return { success: true };
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      return { error };
    }
  };

  return { rsvps, loading, submitRSVP, refetch: fetchRSVPs };
};

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles(display_name, first_name, last_name),
          photo_likes(id, user_id),
          photo_comments(
            id,
            content,
            created_at,
            profiles(display_name, first_name, last_name)
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []) as Photo[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePhoto = async (photoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if like already exists
      const { data: existingLike } = await supabase
        .from('photo_likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingLike) {
        const { error } = await supabase
          .from('photo_likes')
          .insert({ 
            photo_id: photoId,
            user_id: user.id
          });

        if (error) throw error;
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const unlikePhoto = async (photoId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('photo_likes')
        .delete()
        .eq('photo_id', photoId)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchPhotos();
    } catch (error) {
      console.error('Error unliking photo:', error);
    }
  };

  const uploadPhoto = async (file: File, title?: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filePath);

      // Insert photo record into database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          title,
          description,
          file_url: publicUrl,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          is_approved: true
        });

      if (dbError) throw dbError;

      await fetchPhotos();
      return { success: true };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { error };
    }
  };

  return { photos, loading, likePhoto, unlikePhoto, uploadPhoto, refetch: fetchPhotos };
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles(display_name, first_name, last_name),
          message_likes(id, user_id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const postMessage = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      const { error } = await supabase
        .from('messages')
        .insert({ 
          content, 
          is_public: true,
          user_id: user.id
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error posting message:', error);
      return { error };
    }
  };

  const likeMessage = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if like already exists
      const { data: existingLike } = await supabase
        .from('message_likes')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingLike) {
        const { error } = await supabase
          .from('message_likes')
          .insert({ 
            message_id: messageId,
            user_id: user.id
          });

        if (error) throw error;
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  return { messages, loading, postMessage, likeMessage, refetch: fetchMessages };
};