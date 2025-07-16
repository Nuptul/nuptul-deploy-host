import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Settings, Activity, Search, Filter, MoreHorizontal, UserCheck, Mail, Phone, MapPin, Plus, Edit, Trash2, Copy, Utensils, FileText, User, Key } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GuestMatcher } from '@/utils/guestMatching';
import AdminPasswordReset from '@/components/admin/AdminPasswordReset';
import RoleAssignment from '@/components/admin/RoleAssignment';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  role: 'guest' | 'admin' | 'couple';
  guest_list_id?: string;
  guest_name?: string;
  mobile?: string;
  address?: string;
  address_suburb?: string;
  state?: string;
  country?: string;
  postcode?: string;
  dietary_requirements?: string[];
  allergies?: string[];
  emergency_contact?: string;
  relationship_to_couple?: string;
  special_accommodations?: string;
  bio?: string;
  profile_picture_url?: string;
  rsvp_completed?: boolean;
  rsvp_status?: string | null;
}

interface GuestListItem {
  id: string;
  name: string;
  mobile_number: string | null;
  email_address: string | null;
  matched_user_id: string | null;
  guest_count: number;
  postal_address: string | null;
  save_the_date_sent: boolean;
  invite_sent: boolean;
  rsvp_count: number;
  rsvp_status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  dietary_requirements: string | null;
  notes: string | null;
  invitation_code: string | null;
  created_at: string;
  is_plus_one?: boolean;
  plus_one_of?: string;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [unlinkedUsers, setUnlinkedUsers] = useState<User[]>([]);
  const [unmatchedGuests, setUnmatchedGuests] = useState<GuestListItem[]>([]);
  const [allGuests, setAllGuests] = useState<GuestListItem[]>([]);
  const [showLinkingPanel, setShowLinkingPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'guests' | 'linking'>('users');
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestRsvpFilter, setGuestRsvpFilter] = useState<string>('all');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestListItem | null>(null);
  const [rsvpData, setRsvpData] = useState<any[]>([]);
  const [rsvpSearchTerm, setRsvpSearchTerm] = useState('');
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserEditForm, setShowUserEditForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchUnlinkedData();
    fetchAllGuests();
    fetchRsvpData();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get users from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *, 
          dietary_requirements, 
          allergies, 
          emergency_contact, 
          relationship_to_couple, 
          special_accommodations,
          bio,
          profile_picture_url,
          rsvp_completed,
          mobile,
          address,
          address_suburb,
          state,
          country,
          postcode
        `)
        .order('created_at', { ascending: false });
      
      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        toast.error('Failed to load user profiles');
        return;
      }

      // Get user roles data separately
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Get guest list data to check for matches
      const { data: guestData } = await supabase
        .from('guest_list')
        .select('id, name, matched_user_id');

      const rolesMap = new Map(userRolesData?.map(r => [r.user_id, r.role]) || []);
      const guestMap = new Map(guestData?.map(g => [g.matched_user_id, g]) || []);

      const formattedUsers: User[] = (profileData || []).map((user: any) => {
        const guestMatch = guestMap.get(user.user_id);
        
        return {
          id: user.user_id || user.id,
          email: user.email || 'No email',
          display_name: user.display_name || null,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          created_at: user.created_at,
          role: rolesMap.get(user.user_id || user.id) || 'guest',
          guest_list_id: guestMatch?.id || null,
          guest_name: guestMatch?.name || null,
          mobile: user.mobile || null,
          address: user.address || null,
          address_suburb: user.address_suburb || null,
          state: user.state || null,
          country: user.country || null,
          postcode: user.postcode || null,
          dietary_requirements: user.dietary_requirements || [],
          allergies: user.allergies || [],
          emergency_contact: user.emergency_contact || null,
          relationship_to_couple: user.relationship_to_couple || null,
          special_accommodations: user.special_accommodations || null,
          rsvp_completed: user.rsvp_completed || false,
          bio: user.bio || null,
          profile_picture_url: user.profile_picture_url || null,
          rsvp_status: user.rsvp_status || null
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlinkedData = async () => {
    try {
      const [unlinkedUsersData, unmatchedGuestsData] = await Promise.all([
        GuestMatcher.getUnlinkedUsers(),
        GuestMatcher.getUnmatchedGuests()
      ]);
      
      setUnlinkedUsers(unlinkedUsersData);
      setUnmatchedGuests(unmatchedGuestsData);
    } catch (error) {
      console.error('Error fetching unlinked data:', error);
    }
  };

  const fetchAllGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_list')
        .select('*')
        .order('name');

      if (error) throw error;
      setAllGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guest list');
    }
  };

  const fetchRsvpData = async () => {
    try {
      // Get RSVP data from profiles table combined with guest list
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          display_name,
          email,
          phone,
          rsvp_status,
          rsvp_responded_at,
          plus_one_name,
          plus_one_email,
          dietary_needs,
          allergies,
          special_requests,
          bio,
          profile_picture_url,
          guest_list_id,
          guest_list:guest_list_id (
            name,
            guest_count,
            invitation_code
          )
        `)
        .order('rsvp_responded_at', { ascending: false });

      if (error) throw error;
      setRsvpData(data || []);
    } catch (error) {
      console.error('Error fetching RSVP data:', error);
      toast.error('Failed to load RSVP data');
    }
  };

  const addGuest = async (guestData: Partial<GuestListItem>) => {
    try {
      const { error } = await supabase
        .from('guest_list')
        .insert([{
          name: guestData.name,
          email_address: guestData.email_address,
          mobile_number: guestData.mobile_number,
          guest_count: guestData.guest_count || 1,
          postal_address: guestData.postal_address,
          rsvp_status: 'pending',
          invitation_code: `WEDDING${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          save_the_date_sent: false,
          invite_sent: false,
          rsvp_count: 0
        }]);

      if (error) throw error;
      
      toast.success('Guest added successfully');
      fetchAllGuests();
      fetchUnlinkedData();
      setShowGuestForm(false);
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Failed to add guest');
    }
  };

  const updateGuest = async (guestId: string, guestData: Partial<GuestListItem>) => {
    try {
      const { error } = await supabase
        .from('guest_list')
        .update(guestData)
        .eq('id', guestId);

      if (error) throw error;
      
      toast.success('Guest updated successfully');
      fetchAllGuests();
      fetchUnlinkedData();
      setEditingGuest(null);
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Failed to update guest');
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    try {
      const { error } = await supabase
        .from('guest_list')
        .delete()
        .eq('id', guestId);

      if (error) throw error;
      
      toast.success('Guest deleted successfully');
      fetchAllGuests();
      fetchUnlinkedData();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest');
    }
  };

  const linkAsPlusOne = async (userId: string, primaryUserId: string) => {
    try {
      // Get primary user's email
      const primaryUser = users.find(u => u.id === primaryUserId);
      if (!primaryUser) {
        toast.error('Primary user not found');
        return;
      }

      // Update the user's profile to indicate they're a plus one
      const { error } = await supabase
        .from('profiles')
        .update({
          is_plus_one: true,
          plus_one_of: primaryUser.email,
          relationship_to_couple: 'Plus One'
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Successfully linked as plus one');
      fetchUsers();
      fetchRsvpData();
    } catch (error) {
      console.error('Error linking as plus one:', error);
      toast.error('Failed to link as plus one');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'guest' | 'admin' | 'couple') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const linkUserToGuest = async (userId: string, guestId: string) => {
    try {
      const success = await GuestMatcher.linkUserToGuest(userId, guestId);
      if (success) {
        toast.success('User linked to guest list successfully');
        fetchUsers();
        fetchUnlinkedData();
      } else {
        toast.error('Failed to link user to guest');
      }
    } catch (error) {
      console.error('Error linking user to guest:', error);
      toast.error('Failed to link user to guest');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      // Delete from auth and profiles table
      if (supabaseAdmin) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;
      }
      
      // Delete from profiles table as fallback
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('User profile updated successfully');
      fetchUsers();
      setEditingUser(null);
      setShowUserEditForm(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update user profile');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const filteredGuests = allGuests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
                         guest.email_address?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
                         guest.mobile_number?.includes(guestSearchTerm);
    
    const matchesRsvp = guestRsvpFilter === 'all' || guest.rsvp_status === guestRsvpFilter;
    
    return matchesSearch && matchesRsvp;
  });

  const filteredRsvps = rsvpData.filter(rsvp => {
    const matchesSearch = rsvp.first_name?.toLowerCase().includes(rsvpSearchTerm.toLowerCase()) ||
                         rsvp.last_name?.toLowerCase().includes(rsvpSearchTerm.toLowerCase()) ||
                         rsvp.display_name?.toLowerCase().includes(rsvpSearchTerm.toLowerCase()) ||
                         rsvp.email?.toLowerCase().includes(rsvpSearchTerm.toLowerCase());
    
    const matchesStatus = rsvpStatusFilter === 'all' || rsvp.rsvp_status === rsvpStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const rsvpStats = {
    confirmed: rsvpData.filter(r => r.rsvp_status === 'confirmed').length,
    declined: rsvpData.filter(r => r.rsvp_status === 'declined').length,
    pending: rsvpData.filter(r => !r.rsvp_status || r.rsvp_status === 'pending').length,
    withDietary: rsvpData.filter(r => r.dietary_needs?.length > 0 || r.allergies?.length > 0).length
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Total Guests', value: allGuests.length, icon: UserCheck },
    { label: 'RSVP Confirmed', value: rsvpStats.confirmed, icon: UserPlus },
    { label: 'Unmatched Guests', value: unmatchedGuests.length, icon: Settings },
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3f51]">User Roles & Guest List Management</h1>
          <p className="text-sm text-[#7a736b]">Manage users, roles, guest list, and linking</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'users' 
                ? 'bg-[#2d3f51] text-white' 
                : 'bg-white/20 text-[#2d3f51] hover:bg-white/30'
            }`}
          >
            Users & RSVPs
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'guests' 
                ? 'bg-[#2d3f51] text-white' 
                : 'bg-white/20 text-[#2d3f51] hover:bg-white/30'
            }`}
          >
            Guest List
          </button>
          <button
            onClick={() => setActiveTab('linking')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'linking' 
                ? 'bg-[#2d3f51] text-white' 
                : 'bg-white/20 text-[#2d3f51] hover:bg-white/30'
            }`}
          >
            Linking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2d3f51] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-[#2d3f51]">{stat.value}</div>
                  <div className="text-xs text-[#7a736b]">{stat.label}</div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'linking' && (
        <GlassCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#2d3f51] mb-4">User-Guest Linking</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Unlinked Users */}
            <div>
              <h4 className="font-medium text-[#2d3f51] mb-3">Unlinked Users ({unlinkedUsers.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unlinkedUsers.map(user => (
                  <div key={user.id} className="p-3 bg-white/20 rounded-lg">
                    <div className="font-medium text-sm">
                      {user.display_name || `${user.first_name} ${user.last_name}`}
                    </div>
                    <div className="text-xs text-[#7a736b]">{user.email}</div>
                  </div>
                ))}
                {unlinkedUsers.length === 0 && (
                  <div className="text-center text-[#7a736b] text-sm py-4">
                    All users are linked to guest list
                  </div>
                )}
              </div>
            </div>

            {/* Unmatched Guests */}
            <div>
              <h4 className="font-medium text-[#2d3f51] mb-3">Unmatched Guests ({unmatchedGuests.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unmatchedGuests.map(guest => (
                  <div key={guest.id} className="p-3 bg-white/20 rounded-lg">
                    <div className="font-medium text-sm">{guest.name}</div>
                    <div className="text-xs text-[#7a736b]">
                      {guest.email_address && <div>📧 {guest.email_address}</div>}
                      {guest.mobile_number && <div>📱 {guest.mobile_number}</div>}
                    </div>
                  </div>
                ))}
                {unmatchedGuests.length === 0 && (
                  <div className="text-center text-[#7a736b] text-sm py-4">
                    All guests are matched to users
                  </div>
                )}
              </div>
            </div>
          </div>

          {(unlinkedUsers.length > 0 && unmatchedGuests.length > 0) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Manual Linking Instructions:</strong>
              </p>
              <p className="text-xs text-blue-600">
                Switch to the Users tab and use the "Link to Guest" dropdown for unlinked users.
              </p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Filters */}
      {(activeTab === 'users' || activeTab === 'guests') && (
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a736b]" />
              <input
                type="text"
                placeholder={
                  activeTab === 'users' ? "Search users..." : 
                  "Search guests..."
                }
                value={
                  activeTab === 'users' ? searchTerm : 
                  guestSearchTerm
                }
                onChange={(e) => {
                  if (activeTab === 'users') setSearchTerm(e.target.value);
                  else setGuestSearchTerm(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51] placeholder-[#7a736b]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#7a736b]" />
              {activeTab === 'users' ? (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                >
                  <option value="all">All Roles</option>
                  <option value="guest">Guest</option>
                  <option value="admin">Admin</option>
                  <option value="couple">Couple</option>
                </select>
              ) : activeTab === 'guests' ? (
                <select
                  value={guestRsvpFilter}
                  onChange={(e) => setGuestRsvpFilter(e.target.value)}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                >
                  <option value="all">All RSVP Status</option>
                  <option value="pending">Pending</option>
                  <option value="attending">Attending</option>
                  <option value="not_attending">Not Attending</option>
                  <option value="maybe">Maybe</option>
                </select>
              ) : (
                <select
                  value={rsvpStatusFilter}
                  onChange={(e) => setRsvpStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                  <option value="pending">Pending</option>
                </select>
              )}
            </div>
            {activeTab === 'guests' && (
              <button
                onClick={() => setShowGuestForm(true)}
                className="px-4 py-2 bg-[#2d3f51] text-white rounded-lg hover:bg-[#2d3f51]/90 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Guest
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {/* Content based on active tab */}
      {activeTab === 'users' && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[#2d3f51] mb-4">Users ({filteredUsers.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-[#7a736b]">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center overflow-hidden">
                      {user.profile_picture_url ? (
                        <img 
                          src={user.profile_picture_url} 
                          alt={user.display_name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {user.display_name?.[0] || user.first_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#2d3f51] flex items-center gap-2">
                        {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                        {(user.email === 'lyconcrypt@gmail.com' || user.email === 'supabaselyoncrypt@gmail.com') && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">TEST</span>
                        )}
                        {user.role === 'couple' && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">👰🤵</span>
                        )}
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">ADMIN</span>
                        )}
                      </div>
                      <div className="text-sm text-[#7a736b]">{user.email}</div>
                      {user.guest_name && (
                        <div className="text-xs text-green-600">Linked to: {user.guest_name}</div>
                      )}
                      <div className="text-xs text-[#7a736b] mt-1 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>RSVP: <span className="font-medium">{user.rsvp_completed ? 'Yes' : 'Pending'}</span></span>
                          <span>Dietary: <span className="font-medium">
                            {user.dietary_requirements && Array.isArray(user.dietary_requirements) && user.dietary_requirements.length > 0 
                              ? user.dietary_requirements.join(', ') 
                              : 'None specified'}
                          </span></span>
                        </div>
                        {user.allergies && Array.isArray(user.allergies) && user.allergies.length > 0 && (
                          <div className="text-red-600">
                            ⚠️ Allergies: {user.allergies.join(', ')}
                          </div>
                        )}
                        {user.mobile && (
                          <div>📱 {user.mobile}</div>
                        )}
                        {user.relationship_to_couple && (
                          <div>💒 {user.relationship_to_couple}</div>
                        )}
                        {user.bio && (
                          <div className="text-xs text-[#7a736b] mt-2 p-2 bg-gray-50 rounded italic max-w-md">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {user.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!user.guest_list_id && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            linkUserToGuest(user.id, e.target.value);
                          }
                        }}
                        className="px-3 py-1 bg-blue-50 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-700"
                        defaultValue=""
                      >
                        <option value="">Link to Guest</option>
                        {unmatchedGuests.map(guest => (
                          <option key={guest.id} value={guest.id}>
                            {guest.name}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {user.guest_list_id && (
                      <span className="px-3 py-1 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700">
                        ✓ Linked
                      </span>
                    )}

                    {/* Plus One Linking */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          linkAsPlusOne(user.id, e.target.value);
                        }
                      }}
                      className="px-3 py-1 bg-purple-50 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-purple-700"
                      defaultValue=""
                    >
                      <option value="">Link as Plus One</option>
                      {users.filter(u => u.id !== user.id && u.role === 'guest').map(primaryUser => (
                        <option key={primaryUser.id} value={primaryUser.id}>
                          Plus one of {primaryUser.display_name || `${primaryUser.first_name} ${primaryUser.last_name}`}
                        </option>
                      ))}
                    </select>
                    
                    <RoleAssignment
                      userId={user.id}
                      currentRole={user.role}
                      userEmail={user.email}
                      onRoleUpdate={(newRole) => {
                        setUsers(prev => prev.map(u => 
                          u.id === user.id ? { ...u, role: newRole } : u
                        ));
                      }}
                    />
                    
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserEditForm(true);
                      }}
                      className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => {
                        setPasswordResetUser(user);
                        setShowPasswordReset(true);
                      }}
                      className="w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4 text-orange-600" />
                    </button>
                    
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'guests' && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[#2d3f51] mb-4">Guest List ({filteredGuests.length})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-[#7a736b]">
              No guests found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center">
                      <span className="text-white font-medium">
                        {guest.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-[#2d3f51] flex items-center gap-2">
                        {guest.name}
                        {guest.notes?.toLowerCase().includes('wedding party') && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">💒 Wedding Party</span>
                        )}
                        {guest.is_plus_one && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">+1</span>
                        )}
                      </div>
                      <div className="text-sm text-[#7a736b] flex items-center gap-4">
                        {guest.email_address && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email_address}
                          </span>
                        )}
                        {guest.mobile_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.mobile_number}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7a736b] mt-1 flex items-center gap-4">
                        <span>Party Size: {guest.guest_count}</span>
                        {guest.matched_user_id && <span className="text-green-600">✓ Registered</span>}
                        {guest.is_plus_one && <span className="text-purple-600">Plus one of {guest.plus_one_of}</span>}
                        {guest.dietary_requirements && (
                          <span className="text-orange-600">🍽️ Dietary needs</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm ${
                      guest.rsvp_status === 'attending' ? 'bg-green-50 border border-green-300 text-green-700' :
                      guest.rsvp_status === 'not_attending' ? 'bg-red-50 border border-red-300 text-red-700' :
                      guest.rsvp_status === 'maybe' ? 'bg-yellow-50 border border-yellow-300 text-yellow-700' :
                      'bg-gray-50 border border-gray-300 text-gray-700'
                    }`}>
                      {guest.rsvp_status}
                    </span>
                    
                    <button
                      onClick={() => setEditingGuest(guest)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[#7a736b]" />
                    </button>
                    
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'rsvps' && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2d3f51]">RSVP Management ({filteredRsvps.length})</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Confirmed: {rsvpStats.confirmed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Declined: {rsvpStats.declined}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Pending: {rsvpStats.pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Dietary: {rsvpStats.withDietary}</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
            </div>
          ) : filteredRsvps.length === 0 ? (
            <div className="text-center py-8 text-[#7a736b]">
              No RSVPs found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="flex items-center justify-between p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center overflow-hidden">
                      {rsvp.profile_picture_url ? (
                        <img 
                          src={rsvp.profile_picture_url} 
                          alt={rsvp.display_name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {rsvp.display_name?.[0] || rsvp.first_name?.[0] || rsvp.email?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#2d3f51]">
                        {rsvp.display_name || `${rsvp.first_name || ''} ${rsvp.last_name || ''}`.trim() || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-[#7a736b]">{rsvp.email}</div>
                      {rsvp.plus_one_name && (
                        <div className="text-xs text-blue-600">Plus One: {rsvp.plus_one_name}</div>
                      )}
                      {rsvp.is_plus_one && (
                        <div className="text-xs text-purple-600">Plus one of: {rsvp.plus_one_of}</div>
                      )}
                      {rsvp.rsvp_responded_at && (
                        <div className="text-xs text-[#7a736b]">
                          Responded: {new Date(rsvp.rsvp_responded_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm ${
                      rsvp.rsvp_status === 'confirmed' ? 'bg-green-50 border border-green-300 text-green-700' :
                      rsvp.rsvp_status === 'declined' ? 'bg-red-50 border border-red-300 text-red-700' :
                      'bg-yellow-50 border border-yellow-300 text-yellow-700'
                    }`}>
                      {rsvp.rsvp_status || 'pending'}
                    </span>
                    
                    {(rsvp.dietary_needs?.length > 0 || rsvp.allergies?.length > 0) && (
                      <span className="px-3 py-1 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-700 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        Dietary
                      </span>
                    )}
                    
                    <button
                      onClick={() => {
                        // Show RSVP details modal
                        alert(`RSVP Details for ${rsvp.display_name || rsvp.first_name}:\n\nStatus: ${rsvp.rsvp_status || 'pending'}\nDietary: ${rsvp.dietary_needs?.join(', ') || 'None'}\nAllergies: ${rsvp.allergies?.join(', ') || 'None'}\nSpecial Requests: ${rsvp.special_requests || 'None'}`);
                      }}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-[#7a736b]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Guest Form Modal */}
      {(showGuestForm || editingGuest) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#2d3f51] mb-4">
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const guestData = {
                  name: formData.get('name') as string,
                  email_address: formData.get('email_address') as string || null,
                  mobile_number: formData.get('mobile_number') as string || null,
                  guest_count: parseInt(formData.get('guest_count') as string) || 1,
                  postal_address: formData.get('postal_address') as string || null,
                  dietary_requirements: formData.get('dietary_requirements') as string || null,
                  notes: formData.get('notes') as string || null,
                  rsvp_status: formData.get('rsvp_status') as 'pending' | 'attending' | 'not_attending' | 'maybe'
                };
                
                if (editingGuest) {
                  updateGuest(editingGuest.id, guestData);
                } else {
                  addGuest(guestData);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingGuest?.name || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email_address"
                    defaultValue={editingGuest?.email_address || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_number"
                    defaultValue={editingGuest?.mobile_number || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Guest Count</label>
                  <input
                    type="number"
                    name="guest_count"
                    min="1"
                    defaultValue={editingGuest?.guest_count || 1}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">RSVP Status</label>
                  <select
                    name="rsvp_status"
                    defaultValue={editingGuest?.rsvp_status || 'pending'}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="not_attending">Not Attending</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Postal Address</label>
                  <textarea
                    name="postal_address"
                    rows={3}
                    defaultValue={editingGuest?.postal_address || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Dietary Requirements</label>
                  <textarea
                    name="dietary_requirements"
                    rows={2}
                    defaultValue={editingGuest?.dietary_requirements || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Notes</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={editingGuest?.notes || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuestForm(false);
                      setEditingGuest(null);
                    }}
                    className="px-4 py-2 bg-white/20 text-[#2d3f51] rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2d3f51] text-white rounded-lg hover:bg-[#2d3f51]/90 transition-colors"
                  >
                    {editingGuest ? 'Update' : 'Add'} Guest
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* User Edit Form Modal */}
      {showUserEditForm && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#2d3f51] mb-4">
                Edit User Profile: {editingUser.display_name || `${editingUser.first_name} ${editingUser.last_name}`}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const profileData = {
                  first_name: formData.get('first_name'),
                  last_name: formData.get('last_name'),
                  display_name: formData.get('display_name'),
                  mobile: formData.get('mobile'),
                  address: formData.get('address'),
                  address_suburb: formData.get('address_suburb'),
                  state: formData.get('state'),
                  country: formData.get('country'),
                  postcode: formData.get('postcode'),
                  emergency_contact: formData.get('emergency_contact'),
                  relationship_to_couple: formData.get('relationship_to_couple'),
                  dietary_requirements: formData.getAll('dietary_requirements'),
                  allergies: formData.getAll('allergies'),
                  special_accommodations: formData.get('special_accommodations'),
                  bio: formData.get('bio'),
                  profile_picture_url: formData.get('profile_picture_url'),
                };
                updateUserProfile(editingUser.id, profileData);
              }} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      defaultValue={editingUser.first_name || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      defaultValue={editingUser.last_name || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Display Name</label>
                  <input
                    type="text"
                    name="display_name"
                    defaultValue={editingUser.display_name || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    defaultValue={editingUser.mobile || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Address</label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={editingUser.address || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">Suburb</label>
                    <input
                      type="text"
                      name="address_suburb"
                      defaultValue={editingUser.address_suburb || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={editingUser.state || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      defaultValue={editingUser.country || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3f51] mb-2">Postcode</label>
                    <input
                      type="text"
                      name="postcode"
                      defaultValue={editingUser.postcode || ''}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Relationship to Couple</label>
                  <select
                    name="relationship_to_couple"
                    defaultValue={editingUser.relationship_to_couple || ''}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  >
                    <option value="">Select relationship</option>
                    
                    <optgroup label="👰🤵 Wedding Party">
                      <option value="Best Man">👨‍💼 Best Man</option>
                      <option value="Maid of Honor">👰‍♀️ Maid of Honor</option>
                      <option value="Bridesmaid">💐 Bridesmaid</option>
                      <option value="Groomsman">🤵 Groomsman</option>
                      <option value="Flower Girl">🌸 Flower Girl</option>
                      <option value="Ring Bearer">💍 Ring Bearer</option>
                    </optgroup>
                    
                    <optgroup label="👨‍👩‍👧‍👦 Immediate Family">
                      <option value="Father">👨 Father</option>
                      <option value="Mother">👩 Mother</option>
                      <option value="Sister">👭 Sister</option>
                      <option value="Brother">👬 Brother</option>
                      <option value="Son">👦 Son</option>
                      <option value="Daughter">👧 Daughter</option>
                    </optgroup>
                    
                    <optgroup label="👴👵 Extended Family">
                      <option value="Grandfather">👴 Grandfather</option>
                      <option value="Grandmother">👵 Grandmother</option>
                      <option value="Great Grandfather">👴 Great Grandfather</option>
                      <option value="Great Grandmother">👵 Great Grandmother</option>
                      <option value="Uncle">👨 Uncle</option>
                      <option value="Aunt">👩 Aunt</option>
                      <option value="Cousin">👫 Cousin</option>
                    </optgroup>
                    
                    <optgroup label="💑 In-Laws">
                      <option value="Father-in-law">👨 Father-in-law</option>
                      <option value="Mother-in-law">👩 Mother-in-law</option>
                      <option value="Sister-in-law">👭 Sister-in-law</option>
                      <option value="Brother-in-law">👬 Brother-in-law</option>
                    </optgroup>
                    
                    <optgroup label="👥 Friends & Others">
                      <option value="Close Friend">👥 Close Friend</option>
                      <option value="University Friend">🎓 University Friend</option>
                      <option value="Work Colleague">💼 Work Colleague</option>
                      <option value="Childhood Friend">🧸 Childhood Friend</option>
                      <option value="Family Friend">👨‍👩‍👧‍👦 Family Friend</option>
                      <option value="Neighbor">🏠 Neighbor</option>
                      <option value="Plus One">➕ Plus One</option>
                      <option value="Other">❓ Other</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    defaultValue={editingUser.emergency_contact || ''}
                    placeholder="Name and phone number"
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Dietary Requirements</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Kosher', 'Halal', 'Low-sodium', 'Keto', 'Pescatarian', 'Shellfish'].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="dietary_requirements"
                          value={option}
                          defaultChecked={editingUser.dietary_requirements?.includes(option) || false}
                          className="rounded border-white/30 text-[#2d3f51] focus:ring-[#2d3f51]/20"
                        />
                        <span className="text-sm text-[#2d3f51]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Allergies</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Wheat/Gluten', 'Fish', 'Sesame', 'Sulfites', 'Other'].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="allergies"
                          value={option}
                          defaultChecked={editingUser.allergies?.includes(option) || false}
                          className="rounded border-white/30 text-[#2d3f51] focus:ring-[#2d3f51]/20"
                        />
                        <span className="text-sm text-[#2d3f51]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Special Accommodations</label>
                  <textarea
                    name="special_accommodations"
                    rows={3}
                    defaultValue={editingUser.special_accommodations || ''}
                    placeholder="Any accessibility needs, special requests, or accommodations..."
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    defaultValue={editingUser.bio || ''}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f51] mb-2">Profile Picture URL</label>
                  <input
                    type="url"
                    name="profile_picture_url"
                    defaultValue={editingUser.profile_picture_url || ''}
                    placeholder="https://example.com/profile-picture.jpg"
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d3f51]/20 text-[#2d3f51]"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserEditForm(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 bg-white/20 text-[#2d3f51] rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2d3f51] text-white rounded-lg hover:bg-[#2d3f51]/90 transition-colors"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Password Reset Dialog */}
      <AdminPasswordReset
        isOpen={showPasswordReset}
        onClose={() => {
          setShowPasswordReset(false);
          setPasswordResetUser(null);
        }}
        user={passwordResetUser ? {
          id: passwordResetUser.id,
          email: passwordResetUser.email,
          display_name: passwordResetUser.display_name,
          first_name: passwordResetUser.first_name,
          last_name: passwordResetUser.last_name
        } : undefined}
      />
    </div>
  );
};

export default AdminUsers;