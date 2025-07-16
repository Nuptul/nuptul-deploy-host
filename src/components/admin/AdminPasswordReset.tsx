import React, { useState } from 'react';
import { Shield, Key, Mail, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminPasswordResetProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    email: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

const AdminPasswordReset: React.FC<AdminPasswordResetProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'direct'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const generateStrongPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleEmailReset = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    setIsLoading(true);
    try {
      // Send password reset email using Supabase auth
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success(`Password reset email sent to ${user.email}`);
      
      // Log the admin action
      try {
        await supabase
          .from('admin_actions')
          .insert([{
            admin_user_id: (await supabase.auth.getUser()).data.user?.id,
            action_type: 'password_reset_email',
            target_user_id: user.id,
            details: {
              email: user.email,
              method: 'email_reset'
            }
          }]);
      } catch (logError) {
        console.log('Note: Could not log admin action (table may not exist):', logError);
      }

    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectReset = async () => {
    if (!user?.id) {
      toast.error('User ID not found');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Use Supabase admin to update user password directly
      if (!supabaseAdmin) {
        throw new Error('Admin access not available. Please use email reset method.');
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast.success('Password updated successfully');
      
      // Log the admin action
      try {
        await supabase
          .from('admin_actions')
          .insert([{
            admin_user_id: (await supabase.auth.getUser()).data.user?.id,
            action_type: 'password_reset_direct',
            target_user_id: user.id,
            details: {
              email: user.email,
              method: 'direct_reset'
            }
          }]);
      } catch (logError) {
        console.log('Note: Could not log admin action (table may not exist):', logError);
      }

      // Close dialog and reset form
      setNewPassword('');
      setConfirmPassword('');
      onClose();

    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setEmailSent(false);
    setResetMethod('email');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-popup max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-wedding-navy" />
            Admin Password Reset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wedding-navy flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.display_name?.[0] || user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-wedding-navy">
                  {user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                </div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Reset Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Choose Reset Method:</Label>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="resetMethod"
                  value="email"
                  checked={resetMethod === 'email'}
                  onChange={(e) => setResetMethod(e.target.value as 'email')}
                  className="text-wedding-navy"
                />
                <Mail className="w-5 h-5 text-wedding-navy" />
                <div>
                  <div className="font-medium">Email Reset Link</div>
                  <div className="text-sm text-gray-600">Send password reset email to user</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="resetMethod"
                  value="direct"
                  checked={resetMethod === 'direct'}
                  onChange={(e) => setResetMethod(e.target.value as 'direct')}
                  className="text-wedding-navy"
                />
                <Key className="w-5 h-5 text-wedding-navy" />
                <div>
                  <div className="font-medium">Direct Password Set</div>
                  <div className="text-sm text-gray-600">Set new password directly (admin only)</div>
                </div>
              </label>
            </div>
          </div>

          {/* Email Reset Method */}
          {resetMethod === 'email' && (
            <div className="space-y-4">
              {emailSent ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Email Sent Successfully</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Password reset instructions have been sent to {user?.email}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Email Reset Instructions</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      This will send a secure password reset link to the user's email address.
                      The user will be able to set their own new password.
                    </p>
                  </div>

                  <Button
                    onClick={handleEmailReset}
                    disabled={isLoading}
                    className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Email
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Direct Reset Method */}
          {resetMethod === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Admin Override</span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  You are setting a new password directly. Make sure to securely communicate 
                  the new password to the user.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateStrongPassword}
                      title="Generate strong password"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                {newPassword && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                        ✓ At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Contains uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Contains number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Passwords match
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleDirectReset}
                  disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                  className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Set New Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordReset;