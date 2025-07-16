import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RSVPButtons } from '@/components/ui/RSVPButtons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface RSVPFormData {
  rsvp_status: 'attending' | 'not_attending';
  plus_one_name: string;
  plus_one_email: string;
  dietary_needs: string[];
  allergies: string[];
  special_requests: string;
  additional_guests: {
    first_name: string;
    last_name: string;
    email: string;
    relationship: string;
  }[];
  contact_updates: {
    phone: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    emergency_contact: string;
  };
}

interface RSVPIntegrationProps {
  guestId?: string;
  onRSVPSubmitted?: (data: RSVPFormData) => void;
  readonly?: boolean;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan', 
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Kosher',
  'Halal',
  'Low-sodium',
  'Keto',
  'Pescatarian'
];

const ALLERGY_OPTIONS = [
  'Nuts',
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat/Gluten',
  'Fish',
  'Sesame',
  'Sulfites',
  'Other'
];

const RSVPIntegration: React.FC<RSVPIntegrationProps> = ({ 
  guestId, 
  onRSVPSubmitted,
  readonly = false 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<any>(null);
  const [formData, setFormData] = useState<RSVPFormData>({
    rsvp_status: 'attending',
    plus_one_name: '',
    plus_one_email: '',
    dietary_needs: [],
    allergies: [],
    special_requests: '',
    additional_guests: [],
    contact_updates: {
      phone: '',
      address: '',
      suburb: '',
      state: '',
      postcode: '',
      emergency_contact: ''
    }
  });

  useEffect(() => {
    if (guestId) {
      fetchGuestData();
    } else if (user) {
      fetchCurrentUserGuest();
    }
  }, [guestId, user]);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', guestId)
        .single();

      if (error) throw error;
      
      setCurrentGuest(data);
      
      // Pre-populate form with existing data
      setFormData(prev => ({
        ...prev,
        rsvp_status: data.rsvp_status || 'attending',
        plus_one_name: data.plus_one_name || '',
        plus_one_email: data.plus_one_email || '',
        dietary_needs: data.dietary_requirements || [],
        allergies: data.allergies || [],
        special_requests: data.special_accommodations || '',
        contact_updates: {
          phone: data.mobile || '',
          address: data.address || '',
          suburb: data.address_suburb || '',
          state: data.state || '',
          postcode: data.postcode || '',
          emergency_contact: data.emergency_contact || ''
        }
      }));
    } catch (error) {
      console.error('Error fetching guest data:', error);
      toast.error('Failed to load guest information');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserGuest = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentGuest(data);
        setFormData(prev => ({
          ...prev,
          rsvp_status: data.rsvp_status || 'attending',
          plus_one_name: data.plus_one_name || '',
          plus_one_email: data.plus_one_email || '',
          dietary_needs: data.dietary_requirements || [],
          allergies: data.allergies || [],
          special_requests: data.special_accommodations || '',
          contact_updates: {
            phone: data.mobile || '',
            address: data.address || '',
            suburb: data.address_suburb || '',
            state: data.state || '',
            postcode: data.postcode || '',
            emergency_contact: data.emergency_contact || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching current user guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRSVP = async () => {
    try {
      setSubmitting(true);
      
      const targetGuestId = guestId || currentGuest?.id;
      if (!targetGuestId && !user?.id) {
        toast.error('No guest record found');
        return;
      }

      // Update guest record with RSVP data
      const updateData = {
        rsvp_status: formData.rsvp_status, // Already using 'attending' or 'not_attending'
        rsvp_responded_at: new Date().toISOString(),
        plus_one_name: formData.plus_one_name || null,
        plus_one_email: formData.plus_one_email || null,
        dietary_requirements: formData.dietary_needs,
        allergies: formData.allergies,
        special_accommodations: formData.special_requests || null,
        mobile: formData.contact_updates.phone,
        address: formData.contact_updates.address,
        address_suburb: formData.contact_updates.suburb,
        state: formData.contact_updates.state,
        postcode: formData.contact_updates.postcode,
        emergency_contact: formData.contact_updates.emergency_contact
      };

      let updateQuery;
      if (targetGuestId) {
        // Update by profile ID
        updateQuery = supabase
          .from('profiles')
          .update(updateData)
          .eq('id', targetGuestId);
      } else {
        // Update by user_id (current user)
        updateQuery = supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user?.id);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) throw updateError;

      // Add additional guests to the system
      if (formData.additional_guests.length > 0) {
        const newGuestInserts = formData.additional_guests
          .filter(guest => guest.first_name && guest.last_name && guest.email)
          .map(guest => ({
            first_name: guest.first_name,
            last_name: guest.last_name,
            email: guest.email,
            rsvp_status: 'attending', // Using database format
            rsvp_responded_at: new Date().toISOString(),
            relationship_to_couple: guest.relationship,
            added_by_guest: targetGuestId || user?.id
          }));

        if (newGuestInserts.length > 0) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newGuestInserts);

          if (insertError) throw insertError;
          
          toast.success(`Added ${newGuestInserts.length} additional guest(s) to the list`);
        }
      }

      // Archive guest if they declined
      if (formData.rsvp_status === 'not_attending') {
        const archiveQuery = targetGuestId 
          ? supabase.from('profiles').update({ 
              is_archived: true,
              archived_at: new Date().toISOString(),
              archive_reason: 'Declined RSVP'
            }).eq('id', targetGuestId)
          : supabase.from('profiles').update({ 
              is_archived: true,
              archived_at: new Date().toISOString(),
              archive_reason: 'Declined RSVP'
            }).eq('user_id', user?.id);
        
        await archiveQuery;
      }

      // Log RSVP change in history
      const finalGuestId = targetGuestId || currentGuest?.id;
      if (finalGuestId) {
        try {
          await supabase
            .from('rsvp_history')
            .insert([{
              guest_id: finalGuestId,
              old_status: currentGuest?.rsvp_status || 'pending',
              new_status: formData.rsvp_status,
              change_method: 'online_form',
              change_reason: 'Guest RSVP submission'
            }]);
        } catch (historyError) {
          console.log('Note: Could not create RSVP history (table may not exist):', historyError.message);
        }

        // Send confirmation communication log
        try {
          await supabase
            .from('guest_communications')
            .insert([{
              guest_id: finalGuestId,
              communication_type: 'email',
              subject: `RSVP ${formData.rsvp_status === 'attending' ? 'Confirmation' : 'Decline'} Received`,
              content: `Guest ${formData.rsvp_status} their invitation${formData.plus_one_name ? ` with plus one: ${formData.plus_one_name}` : ''}`,
              direction: 'inbound',
              status: 'received'
            }]);
        } catch (commError) {
          console.log('Note: Could not create communication log (table may not exist):', commError.message);
        }
      }

      toast.success(
        formData.rsvp_status === 'attending' 
          ? 'RSVP confirmed! We\'re excited to celebrate with you!' 
          : 'RSVP received. Thank you for letting us know.'
      );

      if (onRSVPSubmitted) {
        onRSVPSubmitted(formData);
      }

      // Update current guest state immediately to reflect the response
      setCurrentGuest(prev => ({
        ...prev,
        rsvp_status: formData.rsvp_status,
        rsvp_responded_at: new Date().toISOString(),
        plus_one_name: formData.plus_one_name || null,
        plus_one_email: formData.plus_one_email || null,
        dietary_requirements: formData.dietary_needs,
        allergies: formData.allergies,
        special_accommodations: formData.special_requests || null,
        mobile: formData.contact_updates.phone,
        address: formData.contact_updates.address,
        address_suburb: formData.contact_updates.suburb,
        state: formData.contact_updates.state,
        postcode: formData.contact_updates.postcode,
        emergency_contact: formData.contact_updates.emergency_contact
      }));

      // Refresh guest data from database
      if (guestId) {
        await fetchGuestData();
      } else {
        await fetchCurrentUserGuest();
      }

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast.error('Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addAdditionalGuest = () => {
    setFormData(prev => ({
      ...prev,
      additional_guests: [
        ...prev.additional_guests,
        { first_name: '', last_name: '', email: '', relationship: '' }
      ]
    }));
  };

  const removeAdditionalGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_guests: prev.additional_guests.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalGuest = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additional_guests: prev.additional_guests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
          <p className="text-[#7a736b] mt-4">Loading RSVP information...</p>
        </div>
      </GlassCard>
    );
  }

  const isAlreadyResponded = currentGuest?.rsvp_responded_at || readonly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Heart className="w-12 h-12 text-wedding-gold mx-auto" />
          <h2 className="text-2xl font-bold text-[#2d3f51]">
            {isAlreadyResponded ? 'Your RSVP Response' : 'Please Respond'}
          </h2>
          <p className="text-[#7a736b]">
            {isAlreadyResponded 
              ? `You responded on ${new Date(currentGuest.rsvp_responded_at).toLocaleDateString()}`
              : 'Help us plan the perfect celebration by sharing your details'
            }
          </p>
          {currentGuest?.rsvp_deadline && (
            <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
              <Clock className="w-4 h-4" />
              Please respond by {new Date(currentGuest.rsvp_deadline).toLocaleDateString()}
            </div>
          )}
        </motion.div>
      </GlassCard>

      {/* RSVP Status */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Will you be attending?
          </h3>
          
          <RSVPButtons
            value={formData.rsvp_status}
            onChange={(value) => setFormData(prev => ({ ...prev, rsvp_status: value }))}
            disabled={isAlreadyResponded}
            size="large"
          />
        </div>
      </GlassCard>

      {/* Conditional sections based on RSVP status */}
      <AnimatePresence>
        {formData.rsvp_status === 'attending' && (
          <>
            {/* Plus One Section */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Plus One Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plus_one_name">Partner/Guest Name</Label>
                      <Input
                        id="plus_one_name"
                        value={formData.plus_one_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, plus_one_name: e.target.value }))}
                        placeholder="Full name"
                        disabled={isAlreadyResponded}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plus_one_email">Partner/Guest Email</Label>
                      <Input
                        id="plus_one_email"
                        type="email"
                        value={formData.plus_one_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, plus_one_email: e.target.value }))}
                        placeholder="email@example.com"
                        disabled={isAlreadyResponded}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Dietary Requirements */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Dietary Preferences & Allergies
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium">Dietary Needs</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {DIETARY_OPTIONS.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dietary-${option}`}
                              checked={formData.dietary_needs.includes(option)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    dietary_needs: [...prev.dietary_needs, option]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    dietary_needs: prev.dietary_needs.filter(item => item !== option)
                                  }));
                                }
                              }}
                              disabled={isAlreadyResponded}
                            />
                            <Label htmlFor={`dietary-${option}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Allergies</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {ALLERGY_OPTIONS.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`allergy-${option}`}
                              checked={formData.allergies.includes(option)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    allergies: [...prev.allergies, option]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    allergies: prev.allergies.filter(item => item !== option)
                                  }));
                                }
                              }}
                              disabled={isAlreadyResponded}
                            />
                            <Label htmlFor={`allergy-${option}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Additional Guests */}
            {!isAlreadyResponded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Additional Guests
                      </h3>
                      <Button
                        onClick={addAdditionalGuest}
                        variant="outline"
                        size="sm"
                        className="text-wedding-navy border-wedding-navy"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Guest
                      </Button>
                    </div>
                    
                    <p className="text-sm text-[#7a736b]">
                      Need to add more guests to your party? We'll add them to our guest list.
                    </p>
                    
                    <AnimatePresence>
                      {formData.additional_guests.map((guest, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="p-4 border border-gray-200 rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Guest {index + 1}</h4>
                            <Button
                              onClick={() => removeAdditionalGuest(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="First Name"
                              value={guest.first_name}
                              onChange={(e) => updateAdditionalGuest(index, 'first_name', e.target.value)}
                            />
                            <Input
                              placeholder="Last Name"
                              value={guest.last_name}
                              onChange={(e) => updateAdditionalGuest(index, 'last_name', e.target.value)}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={guest.email}
                              onChange={(e) => updateAdditionalGuest(index, 'email', e.target.value)}
                            />
                            <Input
                              placeholder="Relationship (Friend, Family, etc.)"
                              value={guest.relationship}
                              onChange={(e) => updateAdditionalGuest(index, 'relationship', e.target.value)}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Contact Updates */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </h3>
          <p className="text-sm text-[#7a736b]">
            Help us keep in touch and ensure we have your latest details.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Phone Number</Label>
              <Input
                id="contact_phone"
                value={formData.contact_updates.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact_updates: { ...prev.contact_updates, phone: e.target.value }
                }))}
                placeholder="Your phone number"
                disabled={isAlreadyResponded}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.contact_updates.emergency_contact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact_updates: { ...prev.contact_updates, emergency_contact: e.target.value }
                }))}
                placeholder="Name and phone number"
                disabled={isAlreadyResponded}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="contact_address">Street Address</Label>
            <Input
              id="contact_address"
              value={formData.contact_updates.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_updates: { ...prev.contact_updates, address: e.target.value }
              }))}
              placeholder="Enter your full address"
              disabled={isAlreadyResponded}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contact_suburb">Suburb</Label>
              <Input
                id="contact_suburb"
                value={formData.contact_updates.suburb}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact_updates: { ...prev.contact_updates, suburb: e.target.value }
                }))}
                placeholder="Enter suburb"
                disabled={isAlreadyResponded}
              />
            </div>
            <div>
              <Label htmlFor="contact_state">State/Province</Label>
              <Input
                id="contact_state"
                value={formData.contact_updates.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact_updates: { ...prev.contact_updates, state: e.target.value }
                }))}
                placeholder="Enter state/province"
                disabled={isAlreadyResponded}
              />
            </div>
            <div>
              <Label htmlFor="contact_postcode">Postcode/Zip Code</Label>
              <Input
                id="contact_postcode"
                value={formData.contact_updates.postcode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact_updates: { ...prev.contact_updates, postcode: e.target.value }
                }))}
                placeholder="Enter postcode/zip"
                disabled={isAlreadyResponded}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Special Requests */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#2d3f51] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Special Requests or Notes
          </h3>
          
          <Textarea
            value={formData.special_requests}
            onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
            placeholder="Any special accommodations, questions, or messages for us..."
            rows={4}
            disabled={readonly}
          />
        </div>
      </GlassCard>

      {/* Submit Button */}
      {!isAlreadyResponded && (
        <GlassCard className="p-6">
          <div className="text-center space-y-4">
            <Button
              onClick={handleSubmitRSVP}
              disabled={submitting}
              className={`w-full md:w-auto px-8 py-3 text-lg ${
                formData.rsvp_status === 'attending'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  {formData.rsvp_status === 'attending' ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm My Attendance
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Submit My Decline
                    </>
                  )}
                </>
              )}
            </Button>
            
            <p className="text-sm text-[#7a736b]">
              {formData.rsvp_status === 'attending' 
                ? "We can't wait to celebrate with you!" 
                : "Thank you for letting us know. We'll miss you!"
              }
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default RSVPIntegration;