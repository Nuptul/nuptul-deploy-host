import { supabase } from '@/integrations/supabase/client';

// Global messenger state
let messengerInstance: any = null;
let messengerCallbacks: {
  onOpen?: (options?: MessengerOptions) => void;
  onVideoCall?: (chatId: string) => void;
  onAudioCall?: (chatId: string) => void;
} = {};

export interface MessengerOptions {
  center?: boolean;
  minimized?: boolean;
  chatId?: string;
  userId?: string;
}

// Register the messenger instance
export const registerMessenger = (
  callbacks: {
    onOpen?: (options?: MessengerOptions) => void;
    onVideoCall?: (chatId: string) => void;
    onAudioCall?: (chatId: string) => void;
  }
) => {
  messengerCallbacks = callbacks;
};

// Open messenger from anywhere in the app
export const openMessenger = (options?: MessengerOptions) => {
  // Dispatch custom event for Layout component
  const event = new CustomEvent('openMessenger', {
    detail: {
      center: options?.center ?? true,
      ...options
    }
  });
  window.dispatchEvent(event);
  
  // Also call registered callback if available
  if (messengerCallbacks.onOpen) {
    messengerCallbacks.onOpen(options);
  }
};

// Start a video call
export const startVideoCall = async (chatId: string) => {
  if (messengerCallbacks.onVideoCall) {
    messengerCallbacks.onVideoCall(chatId);
  } else {
    console.warn('Video call handler not registered');
  }
};

// Start an audio call
export const startAudioCall = async (chatId: string) => {
  if (messengerCallbacks.onAudioCall) {
    messengerCallbacks.onAudioCall(chatId);
  } else {
    console.warn('Audio call handler not registered');
  }
};

// Create or get a direct chat with a user
export const createOrGetDirectChat = async (userId: string, currentUserId: string) => {
  try {
    // First check if a direct chat already exists between these users
    const { data: existingChats, error: searchError } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        direct_chats!inner(
          id,
          is_group
        )
      `)
      .eq('user_id', currentUserId);

    if (searchError) throw searchError;

    // Look for a direct chat (not group) that includes both users
    for (const memberRecord of existingChats || []) {
      const chatId = memberRecord.chat_id;
      
      // Check if the other user is also a member
      const { data: otherMember } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (otherMember && memberRecord.direct_chats?.is_group === false) {
        return { chatId, isNew: false };
      }
    }

    // No existing chat found, create a new one
    const { data: newChat, error: createError } = await supabase
      .from('direct_chats')
      .insert({
        is_group: false,
        created_by: currentUserId
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add both users as members
    const { error: membersError } = await supabase
      .from('chat_members')
      .insert([
        { chat_id: newChat.id, user_id: currentUserId },
        { chat_id: newChat.id, user_id: userId }
      ]);

    if (membersError) throw membersError;

    return { chatId: newChat.id, isNew: true };
  } catch (error) {
    console.error('Error creating/getting direct chat:', error);
    throw error;
  }
};

// Send a message to a chat
export const sendMessage = async (
  chatId: string, 
  userId: string, 
  content: string,
  mediaFile?: File
) => {
  try {
    let mediaUrl = null;
    let mediaType = null;
    let mediaThumbnail = null;

    // Upload media if provided
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `chat-media/${chatId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('direct-chats')
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('direct-chats')
        .getPublicUrl(filePath);

      mediaUrl = publicUrl;
      mediaType = mediaFile.type.startsWith('image/') ? 'image' : 
                  mediaFile.type.startsWith('video/') ? 'video' : 'file';
    }

    // Send the message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content: content || null,
        media_url: mediaUrl,
        media_type: mediaType,
        media_thumbnail: mediaThumbnail,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Get unread message count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    // Get all chats the user is a member of
    const { data: memberChats, error: memberError } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;

    const chatIds = memberChats?.map(m => m.chat_id) || [];
    
    if (chatIds.length === 0) return 0;

    // Count unread messages
    const { count, error: countError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_id', chatIds)
      .neq('user_id', userId)
      .eq('is_read', false);

    if (countError) throw countError;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};