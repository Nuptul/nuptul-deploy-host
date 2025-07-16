import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/ui/avatar-upload';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    display_name: profile?.display_name || '',
    phone: profile?.phone || '',
    mobile: profile?.mobile || '',
    avatar_url: profile?.avatar_url || '',
    address: profile?.address || '',
    state: profile?.state || '',
    postcode: profile?.postcode || '',
    country: profile?.country || '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
          variant: "default",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      display_name: profile?.display_name || '',
      phone: profile?.phone || '',
      mobile: profile?.mobile || '',
      avatar_url: profile?.avatar_url || '',
      address: profile?.address || '',
      state: profile?.state || '',
      postcode: profile?.postcode || '',
      country: profile?.country || '',
    });
    setIsEditing(false);
  };

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        mobile: profile.mobile || '',
        avatar_url: profile.avatar_url || '',
        address: profile.address || '',
        state: profile.state || '',
        postcode: profile.postcode || '',
        country: profile.country || '',
      });
    }
  }, [profile]);


  const handleAvatarUpdate = (url: string | null) => {
    setFormData(prev => ({ ...prev, avatar_url: url || '' }));
  };


  return (
    <div className="min-h-screen p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="wedding-heading">My Profile</CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a profile picture to help others recognize you
                </p>
              </div>
              
              <AvatarUpload
                currentAvatarUrl={formData.avatar_url}
                userId={user?.id || ''}
                onAvatarUpdate={handleAvatarUpdate}
                size="large"
                disabled={!isEditing}
                showRemoveOption={true}
              />
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP • Max 5MB
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="How you'd like to be displayed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your mobile number"
                  type="tel"
                />
              </div>
            </div>

            <Separator />

            {/* Address Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Address Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      placeholder="State"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Postcode"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>


            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="glass-button"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className="glass-button"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;