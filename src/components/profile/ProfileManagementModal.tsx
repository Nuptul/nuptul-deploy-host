import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import EnhancedProfilePictureUpload from '@/components/ui/EnhancedProfilePictureUpload';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        mobile: profile.mobile || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        postcode: profile.postcode || '',
        country: profile.country || 'Australia'
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: 'Success!',
        description: 'Profile updated successfully',
        variant: 'default',
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpdate = (url: string | null) => {
    // The EnhancedProfilePictureUpload component handles the update automatically
    // This callback is just for any additional UI updates if needed
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(30px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/10">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Profile Settings
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-10 h-10 p-0 hover:bg-black/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-8">
              {/* Profile Picture Section */}
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 text-black">Profile Picture</h3>
                <div className="flex justify-center">
                  <EnhancedProfilePictureUpload
                    currentImageUrl={profile?.profile_picture_url || profile?.avatar_url}
                    userId={user?.id}
                    onImageUpdate={handleProfilePictureUpdate}
                    size="xl"
                    variant="glassmorphism"
                    showUploadButton={true}
                    showEditOverlay={true}
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-black">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-black">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-black">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className="bg-white/50 border-glass-blue/30"
                    placeholder="How you'd like to be displayed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100 border-gray-300"
                  />
                  <p className="text-sm text-gray-600">Email cannot be changed</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-black">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                      placeholder="(02) 1234 5678"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-black">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                      placeholder="0412 345 678"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-black">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-white/50 border-glass-blue/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-black">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-black">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                      placeholder="NSW"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-black">Postcode</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className="bg-white/50 border-glass-blue/30"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-black">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="bg-white/50 border-glass-blue/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-black/10">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white/50 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-glass-blue hover:bg-glass-blue/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileManagementModal;
