// Social utilities for managing contacts, calls, and interactions

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
  role?: 'guest' | 'admin' | 'couple';
}

export interface CallSession {
  id: string;
  type: 'audio' | 'video';
  participants: string[];
  started_at: string;
  status: 'pending' | 'active' | 'ended';
}

// Get available contacts for calling
export const getAvailableContacts = (onlineUsers: any[], currentUserId: string): Contact[] => {
  return onlineUsers
    .filter(user => user.user_id !== currentUserId)
    .map(user => ({
      id: user.user_id,
      name: user.name,
      email: user.email || '',
      avatar_url: user.avatar,
      is_online: true,
      last_seen: new Date().toISOString(),
      role: 'guest'
    }));
};

// Show contact picker dialog
export const showContactPicker = async (
  contacts: Contact[],
  onSelect: (contact: Contact) => void
) => {
  // This will be replaced with a proper modal dialog
  const selectedContact = contacts[0]; // Temporary: select first contact
  if (selectedContact) {
    onSelect(selectedContact);
  }
};

// Initialize a call session
export const initializeCall = async (
  type: 'audio' | 'video',
  recipientId: string,
  currentUserId: string
): Promise<CallSession> => {
  return {
    id: `call-${Date.now()}`,
    type,
    participants: [currentUserId, recipientId],
    started_at: new Date().toISOString(),
    status: 'pending'
  };
};

// Open instant messenger for a specific contact
export const openMessengerForContact = (contactId: string) => {
  // This integrates with the existing messenger utils
  import('@/utils/messengerUtils').then(({ openMessenger }) => {
    openMessenger({ 
      center: true, 
      minimized: false,
      targetUserId: contactId 
    });
  });
};

// Open search modal
export const openSearchModal = () => {
  // Trigger search popup
  const event = new CustomEvent('social:openSearch');
  window.dispatchEvent(event);
};

// Open notifications panel
export const openNotificationsPanel = () => {
  // Trigger notifications popup
  const event = new CustomEvent('social:openNotifications');
  window.dispatchEvent(event);
};

// Open settings panel
export const openSettingsPanel = () => {
  // Navigate to settings page
  window.location.href = '/settings';
};

// Open story creator
export const openStoryCreator = (onComplete?: (file: File) => void) => {
  // Create hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file && onComplete) {
      onComplete(file);
    }
  };
  input.click();
};