import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, UserX } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'admin' | 'couple';
  fallback?: React.ReactNode;
  enforceAuthentication?: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <Card className="glass-card w-full max-w-md mx-4">
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
        <p className="text-white/80">Verifying authentication...</p>
      </CardContent>
    </Card>
  </div>
);

const UnauthorizedAccess: React.FC<{ requiredRole?: string }> = ({ requiredRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
    <Card className="glass-card w-full max-w-md mx-4 border-red-500/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-red-400" />
        </div>
        <CardTitle className="text-white text-xl">Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {requiredRole 
              ? `This area requires ${requiredRole} privileges. Please contact an administrator if you believe this is an error.`
              : 'You do not have permission to access this resource.'
            }
          </AlertDescription>
        </Alert>
        <div className="flex items-center justify-center space-x-2 text-red-300">
          <UserX className="h-4 w-4" />
          <span className="text-sm">Unauthorized Access Attempt Logged</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AuthenticationRequired: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
    <Card className="glass-card w-full max-w-md mx-4 border-amber-500/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-amber-400" />
        </div>
        <CardTitle className="text-white text-xl">Sign In Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Alert className="border-amber-500/20 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            Please sign in to access this content. You'll be redirected to the authentication page.
          </AlertDescription>
        </Alert>
        <div className="flex items-center justify-center space-x-2 text-amber-300">
          <UserX className="h-4 w-4" />
          <span className="text-sm">Redirecting to sign in...</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

/**
 * OWASP-compliant authentication guard component
 * Implements role-based access control with secure fallbacks
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = 'guest', 
  fallback, 
  enforceAuthentication = true 
}) => {
  const { user, userRole, loading } = useAuth();

  // Show loading state while authentication is being verified
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if authentication is required and user is not authenticated
  if (enforceAuthentication && !user) {
    return fallback || <AuthenticationRequired />;
  }

  // Check role-based access control
  if (user && requiredRole !== 'guest') {
    const userRoleName = userRole?.role;

    // Admin access control
    if (requiredRole === 'admin' && userRoleName !== 'admin') {
      // Log unauthorized access attempt (in production, this would go to a security log)
      console.warn('[SECURITY] Unauthorized admin access attempt:', {
        userId: user.id,
        userEmail: user.email,
        attemptedRole: requiredRole,
        actualRole: userRoleName,
        timestamp: new Date().toISOString(),
      });
      
      return fallback || <UnauthorizedAccess requiredRole={requiredRole} />;
    }

    // Couple access control (admin + couple roles allowed)
    if (requiredRole === 'couple' && !['admin', 'couple'].includes(userRoleName || '')) {
      console.warn('[SECURITY] Unauthorized couple access attempt:', {
        userId: user.id,
        userEmail: user.email,
        attemptedRole: requiredRole,
        actualRole: userRoleName,
        timestamp: new Date().toISOString(),
      });
      
      return fallback || <UnauthorizedAccess requiredRole={requiredRole} />;
    }
  }

  // Access granted - render protected content
  return <>{children}</>;
};

export default AuthGuard;