import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Video, Phone, MessageSquare, Check } from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { Contact } from '@/utils/socialUtils';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface ContactPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact, action: 'video' | 'audio' | 'message') => void;
  action: 'video' | 'audio' | 'message';
  title?: string;
  description?: string;
}

const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
  action,
  title,
  description
}) => {
  const { onlineUsers } = usePresence();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = onlineUsers.map(user => ({
    id: user.user_id,
    name: user.name,
    email: user.email || '',
    avatar_url: user.avatar,
    is_online: true,
    last_seen: new Date().toISOString(),
    role: 'guest' as const
  }));

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleConfirm = () => {
    if (selectedContact) {
      onSelectContact(selectedContact, action);
      onClose();
      setSelectedContact(null);
      setSearchQuery('');
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Phone className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'video':
        return 'Start Video Call';
      case 'audio':
        return 'Start Voice Call';
      case 'message':
        return 'Send Message';
    }
  };

  const getDefaultTitle = () => {
    switch (action) {
      case 'video':
        return 'Choose Contact for Video Call';
      case 'audio':
        return 'Choose Contact for Voice Call';
      case 'message':
        return 'Choose Contact to Message';
    }
  };

  const getDefaultDescription = () => {
    switch (action) {
      case 'video':
        return 'Select a wedding guest to start a video call';
      case 'audio':
        return 'Select a wedding guest to start a voice call';
      case 'message':
        return 'Select a wedding guest to send a message';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {title || getDefaultTitle()}
          </DialogTitle>
          <DialogDescription>
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contacts List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No contacts found</p>
                  {onlineUsers.length === 0 && (
                    <p className="text-sm mt-2">No one else is online right now</p>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedContact?.id === contact.id
                        ? 'bg-wedding-gold/20 border border-wedding-gold'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar_url} alt={contact.name} />
                        <AvatarFallback className="bg-gradient-to-br from-wedding-gold to-yellow-500 text-white">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>

                    {contact.role === 'couple' && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-wedding-gold/20 to-yellow-400/20 text-wedding-gold border-wedding-gold/30">
                        💍 Couple
                      </Badge>
                    )}

                    {selectedContact?.id === contact.id && (
                      <div className="w-5 h-5 bg-wedding-gold rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedContact}
              className="flex-1 gap-2"
              style={{
                background: action === 'video' 
                  ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                  : action === 'audio'
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
              }}
            >
              {getActionIcon()}
              {getActionText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactPickerModal;