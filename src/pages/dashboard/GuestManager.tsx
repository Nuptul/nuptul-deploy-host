import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit3, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Guest {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  dietary_needs: string[] | null;
  allergies: string[] | null;
  plus_one_name: string | null;
  contact_details: {
    address?: string;
    emergency_contact?: string;
    relationship?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface GuestFormData {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  dietary_needs: string[];
  allergies: string[];
  plus_one_name: string;
  address: string;
  emergency_contact: string;
  relationship: string;
}

const RSVP_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800'
} as const;

const RSVP_STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  declined: XCircle
} as const;

const GuestManager: React.FC = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
    phone: '',
    rsvp_status: 'pending',
    dietary_needs: [],
    allergies: [],
    plus_one_name: '',
    address: '',
    emergency_contact: '',
    relationship: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          display_name,
          email,
          phone,
          dietary_needs,
          allergies,
          contact_details,
          created_at,
          updated_at,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for guests only and format data
      const guestData: Guest[] = data
        ?.filter(profile => {
          const role = (profile.user_roles as any)?.[0]?.role;
          return role === 'guest' || !role; // Include profiles without roles as potential guests
        })
        .map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          email: profile.email,
          phone: profile.phone,
          rsvp_status: 'pending', // Default status, will be enhanced with actual RSVP tracking
          dietary_needs: profile.dietary_needs || [],
          allergies: profile.allergies || [],
          plus_one_name: null, // Will be enhanced with proper plus_one tracking
          contact_details: profile.contact_details || {},
          created_at: profile.created_at,
          updated_at: profile.updated_at
        })) || [];

      setGuests(guestData);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const guestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        email: formData.email,
        phone: formData.phone,
        dietary_needs: formData.dietary_needs,
        allergies: formData.allergies,
        contact_details: {
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          relationship: formData.relationship
        }
      };

      if (editingGuest) {
        // Update existing guest
        const { error } = await supabase
          .from('profiles')
          .update(guestData)
          .eq('id', editingGuest.id);

        if (error) throw error;
        toast.success('Guest updated successfully');
      } else {
        // Create new guest
        const { error } = await supabase
          .from('profiles')
          .insert([guestData]);

        if (error) throw error;

        // Assign guest role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.email)
          .single();

        if (profileData) {
          await supabase
            .from('user_roles')
            .insert([{ user_id: profileData.id, role: 'guest' }]);
        }

        toast.success('Guest added successfully');
      }

      setShowAddDialog(false);
      setEditingGuest(null);
      resetForm();
      fetchGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error(editingGuest ? 'Failed to update guest' : 'Failed to add guest');
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name || '',
      last_name: guest.last_name || '',
      display_name: guest.display_name || '',
      email: guest.email,
      phone: guest.phone || '',
      rsvp_status: guest.rsvp_status,
      dietary_needs: guest.dietary_needs || [],
      allergies: guest.allergies || [],
      plus_one_name: guest.plus_one_name || '',
      address: guest.contact_details?.address || '',
      emergency_contact: guest.contact_details?.emergency_contact || '',
      relationship: guest.contact_details?.relationship || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', guestId);

      if (error) throw error;
      
      toast.success('Guest deleted successfully');
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      display_name: '',
      email: '',
      phone: '',
      rsvp_status: 'pending',
      dietary_needs: [],
      allergies: [],
      plus_one_name: '',
      address: '',
      emergency_contact: '',
      relationship: ''
    });
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { 
      label: 'Total Guests', 
      value: guests.length, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Confirmed', 
      value: guests.filter(g => g.rsvp_status === 'confirmed').length, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Pending', 
      value: guests.filter(g => g.rsvp_status === 'pending').length, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      label: 'Declined', 
      value: guests.filter(g => g.rsvp_status === 'declined').length, 
      icon: XCircle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3f51]">Guest Manager</h1>
            <p className="text-sm text-[#7a736b]">Manage wedding guests and RSVPs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingGuest(null);
                  resetForm();
                }}
                className="bg-wedding-navy hover:bg-wedding-navy/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                </DialogTitle>
                <DialogDescription>
                  {editingGuest ? 'Update guest information and preferences.' : 'Add a new guest to your wedding list.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="display_name">Display Name (Optional)</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      placeholder="How they prefer to be called"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* RSVP Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">RSVP Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rsvp_status">RSVP Status</Label>
                      <Select value={formData.rsvp_status} onValueChange={(value: any) => setFormData({...formData, rsvp_status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="plus_one_name">Plus One Name</Label>
                      <Input
                        id="plus_one_name"
                        value={formData.plus_one_name}
                        onChange={(e) => setFormData({...formData, plus_one_name: e.target.value})}
                        placeholder="Partner or guest name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                      placeholder="Friend, Family, Colleague, etc."
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Contact Details</h3>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Full address for invitations"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                      placeholder="Emergency contact person and phone"
                    />
                  </div>
                </div>

                {/* Dietary & Allergies */}
                <div className="space-y-4">
                  <h3 className="font-medium text-wedding-navy">Dietary Preferences & Allergies</h3>
                  <div>
                    <Label htmlFor="dietary_needs">Dietary Needs</Label>
                    <Input
                      id="dietary_needs"
                      value={formData.dietary_needs.join(', ')}
                      onChange={(e) => setFormData({...formData, dietary_needs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      placeholder="Vegetarian, Vegan, Gluten-free, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      value={formData.allergies.join(', ')}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      placeholder="Nuts, Shellfish, Dairy, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingGuest(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-wedding-navy hover:bg-wedding-navy/90">
                    {editingGuest ? 'Update Guest' : 'Add Guest'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
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

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a736b]" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#7a736b]" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Guests List */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-[#2d3f51] mb-4">
          Guests ({filteredGuests.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3f51] mx-auto"></div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-[#7a736b]">
            {searchTerm || statusFilter !== 'all' ? 
              'No guests found matching your criteria.' : 
              'No guests added yet. Click "Add Guest" to get started.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredGuests.map((guest) => {
                const StatusIcon = RSVP_STATUS_ICONS[guest.rsvp_status];
                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2d3f51] flex items-center justify-center">
                        <span className="text-white font-medium">
                          {guest.display_name?.[0] || guest.first_name?.[0] || guest.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#2d3f51]">
                          {guest.display_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Unnamed Guest'}
                        </div>
                        <div className="text-sm text-[#7a736b] flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </span>
                          {guest.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {guest.phone}
                            </span>
                          )}
                          {guest.contact_details?.relationship && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {guest.contact_details.relationship}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={RSVP_STATUS_COLORS[guest.rsvp_status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                      </Badge>
                      
                      {(guest.dietary_needs?.length || guest.allergies?.length) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Special Needs
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(guest)}
                          className="w-8 h-8 p-0"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(guest.id)}
                          className="w-8 h-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default GuestManager;