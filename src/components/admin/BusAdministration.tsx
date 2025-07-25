import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusSchedule {
  id?: string;
  route_type: 'arrival' | 'departure';
  route_name: string;
  departure_time: string;
  departure_date: string;
  departure_location: string;
  arrival_location?: string;
  arrival_time?: string;
  max_capacity: number;
  current_bookings: number;
  driver_name?: string;
  driver_phone?: string;
  bus_company?: string;
  bus_registration?: string;
  special_notes?: string;
  is_active: boolean;
}

const BusAdministration: React.FC = () => {
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<BusSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const initialSchedule: BusSchedule = {
    route_type: 'arrival',
    route_name: '',
    departure_time: '',
    departure_date: '',
    departure_location: '',
    arrival_location: '',
    arrival_time: '',
    max_capacity: 27,
    current_bookings: 0,
    driver_name: '',
    driver_phone: '',
    bus_company: '',
    bus_registration: '',
    special_notes: '',
    is_active: true
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bus_schedules')
        .select('*')
        .order('departure_date', { ascending: true })
        .order('departure_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load bus schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (schedule: BusSchedule) => {
    try {
      if (schedule.id) {
        // Update existing schedule
        const { error } = await supabase
          .from('bus_schedules')
          .update(schedule)
          .eq('id', schedule.id);

        if (error) throw error;
        toast.success('Bus schedule updated successfully');
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('bus_schedules')
          .insert(schedule);

        if (error) throw error;
        toast.success('Bus schedule created successfully');
      }

      setEditingSchedule(null);
      setIsCreating(false);
      loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save bus schedule');
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this bus schedule? This will also cancel all bookings.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bus_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      toast.success('Bus schedule deleted successfully');
      loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete bus schedule');
    }
  };

  const startCreating = () => {
    setEditingSchedule({ ...initialSchedule });
    setIsCreating(true);
  };

  const startEditing = (schedule: BusSchedule) => {
    setEditingSchedule({ ...schedule });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingSchedule(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bus Administration</h2>
          <p className="text-muted-foreground">
            Manage bus schedules, routes, and capacity for wedding transportation
          </p>
        </div>
        <Button
          className="min-h-[44px] px-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={startCreating}
          disabled={isCreating || !!editingSchedule}
          style={{
            background: (isCreating || !!editingSchedule) ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            cursor: (isCreating || !!editingSchedule) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!(isCreating || !!editingSchedule)) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(isCreating || !!editingSchedule)) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bus Schedule
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {schedules.filter(s => s.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Routes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {schedules.reduce((sum, s) => sum + (s.max_capacity - s.current_bookings), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Available Seats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {schedules.reduce((sum, s) => sum + s.current_bookings, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Booked Seats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {schedules.reduce((sum, s) => sum + s.max_capacity, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Capacity</div>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Create Form */}
      {editingSchedule && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Create New Bus Schedule' : 'Edit Bus Schedule'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="route_type">Route Type</Label>
                <select
                  id="route_type"
                  value={editingSchedule.route_type}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    route_type: e.target.value as 'arrival' | 'departure'
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="arrival">🚌 To Wedding (Arrival)</option>
                  <option value="departure">🏠 From Wedding (Departure)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="route_name">Route Name</Label>
                <Input
                  id="route_name"
                  value={editingSchedule.route_name}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    route_name: e.target.value
                  })}
                  placeholder="e.g., Wedding Arrival Bus"
                />
              </div>

              <div>
                <Label htmlFor="departure_date">Departure Date</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={editingSchedule.departure_date}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    departure_date: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="departure_time">Departure Time</Label>
                <Input
                  id="departure_time"
                  type="time"
                  value={editingSchedule.departure_time}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    departure_time: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="departure_location">Departure Location</Label>
                <Input
                  id="departure_location"
                  value={editingSchedule.departure_location}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    departure_location: e.target.value
                  })}
                  placeholder="e.g., City Center Station"
                />
              </div>

              <div>
                <Label htmlFor="arrival_location">Arrival Location</Label>
                <Input
                  id="arrival_location"
                  value={editingSchedule.arrival_location || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    arrival_location: e.target.value
                  })}
                  placeholder="e.g., Wedding Venue"
                />
              </div>

              <div>
                <Label htmlFor="arrival_time">Arrival Time (Optional)</Label>
                <Input
                  id="arrival_time"
                  type="time"
                  value={editingSchedule.arrival_time || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    arrival_time: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="max_capacity">Maximum Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={editingSchedule.max_capacity}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    max_capacity: parseInt(e.target.value) || 27
                  })}
                />
              </div>

              <div>
                <Label htmlFor="driver_name">Driver Name</Label>
                <Input
                  id="driver_name"
                  value={editingSchedule.driver_name || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    driver_name: e.target.value
                  })}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <Label htmlFor="driver_phone">Driver Phone</Label>
                <Input
                  id="driver_phone"
                  value={editingSchedule.driver_phone || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    driver_phone: e.target.value
                  })}
                  placeholder="e.g., +61 400 123 456"
                />
              </div>

              <div>
                <Label htmlFor="bus_company">Bus Company</Label>
                <Input
                  id="bus_company"
                  value={editingSchedule.bus_company || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    bus_company: e.target.value
                  })}
                  placeholder="e.g., Premium Charter"
                />
              </div>

              <div>
                <Label htmlFor="bus_registration">Bus Registration</Label>
                <Input
                  id="bus_registration"
                  value={editingSchedule.bus_registration || ''}
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    bus_registration: e.target.value
                  })}
                  placeholder="e.g., ABC123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="special_notes">Special Notes</Label>
              <Textarea
                id="special_notes"
                value={editingSchedule.special_notes || ''}
                onChange={(e) => setEditingSchedule({
                  ...editingSchedule,
                  special_notes: e.target.value
                })}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editingSchedule.is_active}
                onCheckedChange={(checked) => setEditingSchedule({
                  ...editingSchedule,
                  is_active: checked
                })}
              />
              <Label htmlFor="is_active">Active (available for booking)</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                className="min-h-[44px] px-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={cancelEditing}
                style={{
                  background: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(142, 142, 147, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #636366 0%, #48484A 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(142, 142, 147, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(142, 142, 147, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="min-h-[44px] px-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleSave(editingSchedule)}
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
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? 'Create Schedule' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map(schedule => (
          <Card key={schedule.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  {schedule.route_name}
                  <Badge variant={schedule.route_type === 'arrival' ? 'default' : 'secondary'}>
                    {schedule.route_type === 'arrival' ? '🚌 To Wedding' : '🏠 From Wedding'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {!editingSchedule && (
                    <>
                      <Button
                        className="min-h-[44px] min-w-[44px] p-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => startEditing(schedule)}
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
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        className="min-h-[44px] min-w-[44px] p-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => schedule.id && handleDelete(schedule.id)}
                        disabled={schedule.current_bookings > 0}
                        style={{
                          background: schedule.current_bookings > 0 ? 'rgba(255, 59, 48, 0.5)' : 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
                          backdropFilter: 'blur(20px) saturate(1.8)',
                          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(255, 59, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                          cursor: schedule.current_bookings > 0 ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (schedule.current_bookings === 0) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #D70015 0%, #A50000 100%)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 59, 48, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (schedule.current_bookings === 0) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 59, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  {schedule.departure_date}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  {schedule.departure_time}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {schedule.departure_location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {schedule.arrival_location || 'No arrival location'}
                </div>
              </div>

              {schedule.driver_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  {schedule.driver_name}
                  {schedule.driver_phone && (
                    <span className="text-muted-foreground">({schedule.driver_phone})</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Capacity:</span> {schedule.current_bookings}/{schedule.max_capacity}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                    {schedule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {schedule.current_bookings > 0 && (
                    <Badge variant="outline">
                      {schedule.current_bookings} booked
                    </Badge>
                  )}
                </div>
              </div>

              {schedule.current_bookings > 0 && schedule.current_bookings === schedule.max_capacity && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Bus is fully booked
                </div>
              )}

              {schedule.special_notes && (
                <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
                  {schedule.special_notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bus schedules configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first bus schedule to start managing wedding transportation.
            </p>
            <Button
              className="min-h-[44px] px-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={startCreating}
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
              <Plus className="w-4 h-4 mr-2" />
              Create First Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusAdministration;