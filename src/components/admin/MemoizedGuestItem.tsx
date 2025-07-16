import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit3, Heart, Baby } from 'lucide-react';

interface ExtendedGuest {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  created_at: string;
  role: 'guest' | 'admin' | 'couple';
  dietary_restrictions?: string;
  plus_one_name?: string;
  relationship?: 'family' | 'friend' | 'colleague' | 'other';
  table_preference?: string;
  special_notes?: string;
  group_id?: string;
  invitation_sent?: boolean;
  rsvp_deadline?: string;
}

interface MemoizedGuestItemProps {
  guest: ExtendedGuest;
  onEdit: (guest: ExtendedGuest) => void;
}

const MemoizedGuestItem = React.memo<MemoizedGuestItemProps>(({ guest, onEdit }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'couple': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const getRelationshipIcon = (relationship?: string) => {
    switch (relationship) {
      case 'family': return <Heart className="w-3 h-3" />;
      case 'friend': return '👥';
      case 'colleague': return '💼';
      default: return null;
    }
  };

  return (
    <div className="p-4 border border-border/50 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="font-medium text-wedding-navy">
              {guest.first_name || guest.last_name
                ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim()
                : 'Name not provided'
              }
            </h3>
            <p className="text-sm text-muted-foreground">{guest.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {guest.relationship && (
              <Badge variant="secondary" className="text-xs">
                <span className="mr-1">{getRelationshipIcon(guest.relationship)}</span>
                {guest.relationship}
              </Badge>
            )}
            <Badge className={`text-white text-xs ${getRoleColor(guest.role)}`}>
              {guest.role}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(guest)}
          className="opacity-60 hover:opacity-100"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        {guest.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{guest.phone}</span>
          </div>
        )}
        
        {guest.plus_one_name && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Baby className="w-3 h-3" />
            <span>Plus one: {guest.plus_one_name}</span>
          </div>
        )}

        {guest.dietary_restrictions && (
          <div className="text-xs bg-orange-50 text-orange-800 px-2 py-1 rounded">
            Dietary: {guest.dietary_restrictions}
          </div>
        )}

        {guest.special_notes && (
          <div className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
            Notes: {guest.special_notes}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
          <span>Joined: {new Date(guest.created_at).toLocaleDateString()}</span>
          {guest.invitation_sent && (
            <Badge variant="outline" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Invited
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

MemoizedGuestItem.displayName = 'MemoizedGuestItem';

export default MemoizedGuestItem;