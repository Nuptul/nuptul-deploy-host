import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Send, Edit3, Trash2, Ban, UserCheck, UserX, Crown, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import type { User } from '../dashboard/types';

type Guest = Tables<'guests'> & {
  type: 'guest';
};

type UserWithType = User & {
  type: 'user';
};

type UnifiedAccount = UserWithType | Guest;

interface UnifiedAccountsManagementProps {
  users: User[];
  onRefresh: () => void;
}

const UnifiedAccountsManagement: React.FC<UnifiedAccountsManagementProps> = ({ users, onRefresh }) => {
  const [accounts, setAccounts] = useState<UnifiedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UnifiedAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showInviteTemplate, setShowInviteTemplate] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const { toast } = useToast();

  // Guest form state
  const [guestForm, setGuestForm] = useState({
    guest_names: '',
    guest_count: 1,
    mobile: '',
    category: 'family',
    location: '',
    notes: ''
  });

  // Invitation template state
  const [inviteTemplate, setInviteTemplate] = useState({
    background: 'elegant',
    font: 'playfair',
    customMessage: 'You are cordially invited to celebrate the wedding of Tim & Kirsten!'
  });

  useEffect(() => {
    fetchAllAccounts();
  }, [users]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, typeFilter, statusFilter]);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      
      // Fetch guests
      const { data: guests, error } = await supabase
        .from('guests')
        .select('*')
        .order('guest_names');

      if (error) throw error;

      // Combine users and guests
      const guestsWithType = (guests || []).map(guest => ({ ...guest, type: 'guest' as const }));
      const usersWithType = users.map(user => ({ ...user, type: 'user' as const }));
      
      setAccounts([...usersWithType, ...guestsWithType] as UnifiedAccount[]);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account => {
        if (account.type === 'user') {
          return account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 `${account.first_name} ${account.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return account.guest_names.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 account.mobile?.includes(searchTerm) ||
                 account.location?.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === typeFilter);
    }

    // Status filter for guests
    if (statusFilter !== 'all' && statusFilter !== 'users') {
      filtered = filtered.filter(account => 
        account.type === 'guest' && account.rsvp_status === statusFilter
      );
    }

    setFilteredAccounts(filtered);
  };

  const addGuest = async () => {
    try {
      const { error } = await (supabase as any)
        .from('guests')
        .insert([guestForm]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Guest added successfully",
      });

      setShowAddGuest(false);
      setGuestForm({
        guest_names: '',
        guest_count: 1,
        mobile: '',
        category: 'family',
        location: '',
        notes: ''
      });
      fetchAllAccounts();
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive"
      });
    }
  };

  const sendInvitation = async (guest: Guest) => {
    try {
      // This would integrate with email service
      // For now, just mark as invited
      const { error } = await (supabase as any)
        .from('guests')
        .update({ invite_sent: true })
        .eq('id', guest.id);

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${guest.guest_names}`,
      });

      fetchAllAccounts();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'guest' | 'admin' | 'couple') => {
    try {
        const { error } = await (supabase as any)
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'couple': return Shield;
      default: return UserCheck;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-glass-green text-white';
      case 'declined': return 'bg-glass-pink text-white';
      case 'pending': return 'bg-glass-blue text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="glass-card p-3 text-center">
          <div className="text-sm font-semibold">{accounts.filter(a => a.type === 'user').length}</div>
          <div className="text-xs text-muted-foreground">Registered Users</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm font-semibold">{accounts.filter(a => a.type === 'guest').length}</div>
          <div className="text-xs text-muted-foreground">Guest Records</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm font-semibold">
            {accounts.filter(a => a.type === 'guest' && (a as Guest).rsvp_status === 'attending').length}
          </div>
          <div className="text-xs text-muted-foreground">Attending</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-sm font-semibold">
            {accounts.filter(a => a.type === 'guest' && (a as Guest).invite_sent).length}
          </div>
          <div className="text-xs text-muted-foreground">Invited</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-secondary border-0 text-sm"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-32 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="guest">Guests</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
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
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Guest Names</Label>
                <Input
                  value={guestForm.guest_names}
                  onChange={(e) => setGuestForm({ ...guestForm, guest_names: e.target.value })}
                  placeholder="John & Jane Smith"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Guest Count</Label>
                  <Input
                    type="number"
                    value={guestForm.guest_count}
                    onChange={(e) => setGuestForm({ ...guestForm, guest_count: parseInt(e.target.value) || 1 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={guestForm.category} onValueChange={(value) => setGuestForm({ ...guestForm, category: value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Mobile</Label>
                <Input
                  value={guestForm.mobile}
                  onChange={(e) => setGuestForm({ ...guestForm, mobile: e.target.value })}
                  placeholder="+61 xxx xxx xxx"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Location</Label>
                <Input
                  value={guestForm.location}
                  onChange={(e) => setGuestForm({ ...guestForm, location: e.target.value })}
                  placeholder="Sydney, NSW"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                  className="text-sm min-h-16"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={addGuest} className="flex-1">
                  Add Guest
                </Button>
                <Button variant="outline" onClick={() => setShowAddGuest(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts List */}
      <div className="space-y-2">
        {filteredAccounts.map((account) => (
          <div key={`${account.type}-${account.id}`} className="glass-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {account.type === 'user' ? (
                  <>
                    {(() => {
                      const RoleIcon = getRoleIcon(account.role);
                      return <RoleIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-wedding-navy truncate">
                        {account.first_name && account.last_name 
                          ? `${account.first_name} ${account.last_name}`
                          : account.email
                        }
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{account.email}</span>
                        <Badge variant="outline" className="text-xs">User</Badge>
                        <Badge variant={account.role === 'admin' ? 'destructive' : 'secondary'}>
                          {account.role}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-wedding-navy truncate">
                        {account.guest_names}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{account.guest_count} people</span>
                        <Badge variant="outline" className="text-xs">Guest</Badge>
                        <Badge className={getStatusColor(account.rsvp_status || 'pending')}>
                          {account.rsvp_status || 'pending'}
                        </Badge>
                        {account.mobile && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {account.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                {account.type === 'user' ? (
                  <>
                    {account.role !== 'admin' && (
                      <Button
                        className="text-xs px-2 py-1 min-h-[44px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => updateUserRole(account.id, 'admin')}
                        style={{
                          background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                          backdropFilter: 'blur(20px) saturate(1.8)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                        }}
                      >
                        Make Admin
                      </Button>
                    )}
                    {account.role === 'admin' && (
                      <Button
                        className="text-xs px-2 py-1 min-h-[44px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => updateUserRole(account.id, 'guest')}
                        style={{
                          background: 'linear-gradient(135deg, #FF9500 0%, #FF6D00 100%)',
                          backdropFilter: 'blur(20px) saturate(1.8)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(255, 149, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FF6D00 0%, #E65100 100%)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 149, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FF9500 0%, #FF6D00 100%)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 149, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                        }}
                      >
                        Remove Admin
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {!account.invite_sent && (
                      <Button
                        className="text-xs px-2 py-1 min-h-[44px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => sendInvitation(account)}
                        style={{
                          background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                          backdropFilter: 'blur(20px) saturate(1.8)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Invite
                      </Button>
                    )}
                    <Button
                      className="text-xs px-2 py-1 min-h-[44px] min-w-[44px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => setSelectedGuest(account)}
                      style={{
                        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredAccounts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No accounts found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedAccountsManagement;