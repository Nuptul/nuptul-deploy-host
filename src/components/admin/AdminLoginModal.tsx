import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [email, setEmail] = useState('admin@wedding.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signInAsAdmin, checking, createDevAdmin } = useAdminAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await signInAsAdmin(email, password);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleCreateDevAdmin = async () => {
    await createDevAdmin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-wedding-navy/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-wedding-navy" />
          </div>
          <CardTitle className="text-2xl font-bold text-wedding-navy">
            Admin Access
          </CardTitle>
          <CardDescription className="text-wedding-gold">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wedding.local"
                className={`glass-input ${errors.email ? 'border-red-500' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className={`glass-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={checking}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-wedding-navy hover:bg-wedding-navy/90"
                disabled={checking}
              >
                {checking ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Development Helper */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">
              Development Mode
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateDevAdmin}
              className="w-full text-xs"
            >
              Create Dev Admin User
            </Button>
          </div>

          {/* Default Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-1">
              Default Development Credentials:
            </p>
            <p className="text-xs text-blue-700">
              Email: admin@wedding.local<br />
              Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginModal;