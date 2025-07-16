import React, { useState, useEffect } from 'react';
import { Users, Upload, Download, UserPlus, Search, Mail, Phone, Calendar, Filter, AlertTriangle, Link, Heart, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtendedGuest {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  created_at: string;
  role: 'guest' | 'admin' | 'couple';
  // Extended fields for Sprint 3
  dietary_restrictions?: string;
  plus_one_name?: string;
  relationship?: 'family' | 'friend' | 'colleague' | 'other';
  table_preference?: string;
  special_notes?: string;
  group_id?: string;
  invitation_sent?: boolean;
  rsvp_deadline?: string;
}

interface GuestGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  guest_count: number;
}

interface GuestManagementProps {
  users: ExtendedGuest[];
  onRefresh: () => void;
}

const GuestManagement: React.FC<GuestManagementProps> = ({ users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('guests');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([]);
  const { toast } = useToast();

  const [newGuest, setNewGuest] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dietary_restrictions: '',
    plus_one_name: '',
    relationship: 'friend' as 'family' | 'friend' | 'colleague' | 'other',
    table_preference: '',
    special_notes: '',
    group_id: ''
  });

  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    loadGuestGroups();
    detectDuplicates();
  }, [users]);

  const loadGuestGroups = async () => {
    // Mock guest groups for Sprint 3 - would be loaded from database
    const mockGroups: GuestGroup[] = [
      { id: '1', name: 'Family', color: 'bg-glass-blue', guest_count: 12, description: 'Close family members' },
      { id: '2', name: 'College Friends', color: 'bg-glass-green', guest_count: 8, description: 'University friends' },
      { id: '3', name: 'Work Colleagues', color: 'bg-glass-purple', guest_count: 6, description: 'Professional contacts' },
      { id: '4', name: 'Neighbors', color: 'bg-glass-pink', guest_count: 4, description: 'Local community' },
    ];
    setGuestGroups(mockGroups);
  };

  const detectDuplicates = () => {
    const duplicates = [];
    const seen = new Map();
    
    users.forEach(user => {
      const key = user.email.toLowerCase();
      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: user });
      } else {
        seen.set(key, user);
      }
    });
    
    return duplicates;
  };

  const filteredGuests = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'with-plus-one' && user.plus_one_name) ||
      (filterBy === 'dietary-restrictions' && user.dietary_restrictions) ||
      (filterBy === 'no-rsvp' && !user.invitation_sent) ||
      (filterBy === user.relationship);
    
    return matchesSearch && matchesFilter;
  });

  const guestStats = {
    total: users.length,
    withPlusOne: users.filter(u => u.plus_one_name).length,
    dietaryRestrictions: users.filter(u => u.dietary_restrictions).length,
    invitationsSent: users.filter(u => u.invitation_sent).length,
    pendingRSVP: users.filter(u => u.invitation_sent && !u.rsvp_deadline).length,
    byRelationship: {
      family: users.filter(u => u.relationship === 'family').length,
      friend: users.filter(u => u.relationship === 'friend').length,
      colleague: users.filter(u => u.relationship === 'colleague').length,
      other: users.filter(u => u.relationship === 'other').length,
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Enhanced guest creation with extended fields
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newGuest.email,
        email_confirm: true,
        user_metadata: {
          first_name: newGuest.first_name,
          last_name: newGuest.last_name,
          phone: newGuest.phone,
          dietary_restrictions: newGuest.dietary_restrictions,
          plus_one_name: newGuest.plus_one_name,
          relationship: newGuest.relationship,
          table_preference: newGuest.table_preference,
          special_notes: newGuest.special_notes,
          group_id: newGuest.group_id
        }
      });

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Guest added with extended information",
      });

      setNewGuest({
        first_name: '', last_name: '', email: '', phone: '',
        dietary_restrictions: '', plus_one_name: '', relationship: 'friend',
        table_preference: '', special_notes: '', group_id: ''
      });
      setShowAddForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive"
      });
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      toast({
        title: "Error",
        description: "Please enter guest data",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    try {
      const lines = bulkData.trim().split('\n');
      const guests = lines.map(line => {
        // Enhanced CSV format: First,Last,Email,Phone,Dietary,PlusOne,Relationship,TablePref,Notes
        const [first_name, last_name, email, phone, dietary_restrictions, plus_one_name, relationship, table_preference, special_notes] = 
          line.split(',').map(s => s.trim());
        return { 
          first_name, last_name, email, phone, dietary_restrictions, 
          plus_one_name, relationship: (relationship || 'friend'), 
          table_preference, special_notes 
        };
      }).filter(guest => guest.email);

      let successCount = 0;
      for (const guest of guests) {
        try {
          await supabase.auth.admin.createUser({
            email: guest.email,
            email_confirm: true,
            user_metadata: guest
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add ${guest.email}:`, error);
        }
      }

      toast({
        title: "Success",
        description: `Added ${successCount} of ${guests.length} guests with extended data`,
      });

      setBulkData('');
      setShowBulkImport(false);
      onRefresh();
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast({
        title: "Error",
        description: "Failed to import guests",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const exportEnhancedGuestList = () => {
    const csvContent = [
      'First Name,Last Name,Email,Phone,Role,Dietary Restrictions,Plus One,Relationship,Table Preference,Special Notes,Join Date',
      ...users.map(user => 
        `${user.first_name || ''},${user.last_name || ''},${user.email},${user.phone || ''},${user.role},${user.dietary_restrictions || ''},${user.plus_one_name || ''},${user.relationship || ''},${user.table_preference || ''},${user.special_notes || ''},${new Date(user.created_at).toLocaleDateString()}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-guest-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRelationshipIcon = (relationship?: string) => {
    switch (relationship) {
      case 'family': return Heart;
      case 'friend': return Users;
      case 'colleague': return Phone;
      default: return Users;
    }
  };

  const getRelationshipColor = (relationship?: string) => {
    switch (relationship) {
      case 'family': return 'text-glass-pink';
      case 'friend': return 'text-glass-blue';
      case 'colleague': return 'text-glass-purple';
      default: return 'text-glass-green';
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="glass-card p-3 text-center">
          <Users className="w-4 h-4 mx-auto text-glass-blue mb-1" />
          <div className="text-sm font-semibold">{guestStats.total}</div>
          <div className="text-xs text-muted-foreground">Total Guests</div>
        </div>
        <div className="glass-card p-3 text-center">
          <Heart className="w-4 h-4 mx-auto text-glass-pink mb-1" />
          <div className="text-sm font-semibold">{guestStats.withPlusOne}</div>
          <div className="text-xs text-muted-foreground">Plus Ones</div>
        </div>
        <div className="glass-card p-3 text-center">
          <Mail className="w-4 h-4 mx-auto text-glass-green mb-1" />
          <div className="text-sm font-semibold">{guestStats.invitationsSent}</div>
          <div className="text-xs text-muted-foreground">Invited</div>
        </div>
        <div className="glass-card p-3 text-center">
          <AlertTriangle className="w-4 h-4 mx-auto text-glass-purple mb-1" />
          <div className="text-sm font-semibold">{guestStats.dietaryRestrictions}</div>
          <div className="text-xs text-muted-foreground">Dietary</div>
        </div>
      </div>

      {/* Enhanced Actions */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <UserPlus className="w-3 h-3 mr-1" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-popup max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">First Name</Label>
                  <Input
                    value={newGuest.first_name}
                    onChange={(e) => setNewGuest({ ...newGuest, first_name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    value={newGuest.last_name}
                    onChange={(e) => setNewGuest({ ...newGuest, last_name: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input
                    type="tel"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Select
                    value={newGuest.relationship}
                    onValueChange={(value) => 
                      setNewGuest({ ...newGuest, relationship: value as 'family' | 'friend' | 'colleague' | 'other' })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Plus One Name</Label>
                <Input
                  value={newGuest.plus_one_name}
                  onChange={(e) => setNewGuest({ ...newGuest, plus_one_name: e.target.value })}
                  className="text-sm"
                  placeholder="Partner or guest name"
                />
              </div>

              <div>
                <Label className="text-xs">Dietary Restrictions</Label>
                <Input
                  value={newGuest.dietary_restrictions}
                  onChange={(e) => setNewGuest({ ...newGuest, dietary_restrictions: e.target.value })}
                  className="text-sm"
                  placeholder="Allergies, preferences, etc."
                />
              </div>

              <div>
                <Label className="text-xs">Table Preference</Label>
                <Input
                  value={newGuest.table_preference}
                  onChange={(e) => setNewGuest({ ...newGuest, table_preference: e.target.value })}
                  className="text-sm"
                  placeholder="Seating preferences"
                />
              </div>

              <div>
                <Label className="text-xs">Special Notes</Label>
                <Textarea
                  value={newGuest.special_notes}
                  onChange={(e) => setNewGuest({ ...newGuest, special_notes: e.target.value })}
                  className="text-sm min-h-16"
                  placeholder="Any special requirements or notes"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" size="sm" className="flex-1">
                  Add Guest
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="text-xs"
        >
          <Upload className="w-3 h-3 mr-1" />
          Enhanced Import
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={exportEnhancedGuestList}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Export Enhanced
        </Button>

        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowDuplicates(!showDuplicates)}
          className="text-xs"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Check Duplicates
        </Button>
      </div>

      {/* Enhanced Bulk Import */}
      {showBulkImport && (
        <div className="glass-card p-4 space-y-3">
          <h4 className="text-sm font-medium text-wedding-navy">Enhanced Bulk Import</h4>
          <div className="text-xs text-muted-foreground">
            Format: First,Last,Email,Phone,Dietary,Plus One,Relationship,Table Pref,Notes (one per line)
          </div>
          <Textarea
            placeholder="John,Doe,john@example.com,+1234567890,Vegetarian,Jane Doe,friend,Table 5,VIP guest"
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            className="text-sm min-h-20"
          />
          <div className="flex space-x-2">
            <Button 
              onClick={handleBulkImport}
              disabled={importing}
              size="sm" 
              className="flex-1"
            >
              {importing ? 'Importing...' : 'Import Enhanced Data'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBulkImport(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-secondary border-0 text-sm"
          />
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Guests</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="friend">Friends</SelectItem>
            <SelectItem value="colleague">Colleagues</SelectItem>
            <SelectItem value="with-plus-one">With Plus One</SelectItem>
            <SelectItem value="dietary-restrictions">Dietary Needs</SelectItem>
            <SelectItem value="no-rsvp">No RSVP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Guest List */}
      <div className="space-y-2">
        {filteredGuests.slice(0, 8).map((guest) => {
          const RelationshipIcon = getRelationshipIcon(guest.relationship);
          return (
            <div key={guest.id} className="glass-card p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <RelationshipIcon className={`w-4 h-4 flex-shrink-0 mt-1 ${getRelationshipColor(guest.relationship)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-wedding-navy truncate">
                      {guest.first_name && guest.last_name 
                        ? `${guest.first_name} ${guest.last_name}`
                        : guest.email
                      }
                      {guest.plus_one_name && (
                        <span className="text-xs text-glass-pink ml-2">+{guest.plus_one_name}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {guest.email}
                    </div>
                    {guest.phone && (
                      <div className="text-xs text-muted-foreground">
                        {guest.phone}
                      </div>
                    )}
                    {guest.dietary_restrictions && (
                      <div className="text-xs text-glass-purple">
                        Diet: {guest.dietary_restrictions}
                      </div>
                    )}
                    {guest.table_preference && (
                      <div className="text-xs text-glass-green">
                        Table: {guest.table_preference}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={guest.role === 'admin' ? 'destructive' : 'secondary'}>
                    {guest.role}
                  </Badge>
                  {guest.relationship && (
                    <Badge variant="outline" className="text-xs">
                      {guest.relationship}
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(guest.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredGuests.length > 8 && (
          <div className="text-center text-xs text-muted-foreground">
            Showing 8 of {filteredGuests.length} guests
          </div>
        )}
      </div>

      {/* Relationship Summary */}
      <div className="glass-card p-3">
        <h4 className="text-sm font-medium text-wedding-navy mb-2">Guest Relationships</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-glass-pink" />
              Family
            </span>
            <Badge variant="outline">{guestStats.byRelationship.family}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-glass-blue" />
              Friends
            </span>
            <Badge variant="outline">{guestStats.byRelationship.friend}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-glass-purple" />
              Colleagues
            </span>
            <Badge variant="outline">{guestStats.byRelationship.colleague}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-glass-green" />
              Other
            </span>
            <Badge variant="outline">{guestStats.byRelationship.other}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestManagement;