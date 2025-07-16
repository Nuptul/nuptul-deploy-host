import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/lib/auth-validation';
import { KeyRound } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset link sent!",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-glass-blue" />
        </div>
        <h2 className="text-2xl mb-2" style={{
          fontFamily: '"Bodoni Moda", serif',
          fontWeight: '600',
          color: '#000000'
        }}>
          Reset Password
        </h2>
        <p className="text-base" style={{
          color: 'rgba(0, 0, 0, 0.6)',
          fontFamily: '"Montserrat", sans-serif'
        }}>
          Enter your email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full min-h-[52px] rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 50%, rgba(255, 107, 107, 0.85) 100%)',
            color: '#FFFFFF',
            backdropFilter: 'blur(10px) saturate(2)',
            WebkitBackdropFilter: 'blur(10px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            fontFamily: '"Montserrat", sans-serif',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          className="w-full min-h-[48px] rounded-xl font-medium text-base transition-all duration-200 transform hover:scale-[1.02]"
          onClick={onBack}
          style={{
            background: 'transparent',
            color: '#007AFF',
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Back to Sign In
        </button>
      </form>
    </div>
  );
};