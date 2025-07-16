import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      // Get the token_hash and type from URL params
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('Email confirmation params:', { token_hash, type });

      if (!token_hash || !type) {
        throw new Error('Invalid confirmation link');
      }

      // Use the verify OTP method to confirm the email
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // User is now logged in after verification
        setStatus('success');
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed and you're now logged in!",
        });
        
        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        // Email confirmed but user needs to sign in
        setStatus('success');
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed! Please log in to continue.",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth?mode=signin');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to confirm email');
      
      toast({
        title: "Confirmation Error",
        description: error.message || "Failed to confirm email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    handleEmailConfirmation();
  };

  const handleGoToLogin = () => {
    navigate('/auth?mode=signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirming Your Email'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          
          <CardDescription className="mt-2">
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your email has been successfully confirmed. Redirecting you to login...'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You'll be redirected to the login page in a moment.
              </p>
              <Button 
                onClick={handleGoToLogin}
                className="w-full"
              >
                Go to Login Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                variant="default"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                If you continue to have issues, please contact support@nuptul.com
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;