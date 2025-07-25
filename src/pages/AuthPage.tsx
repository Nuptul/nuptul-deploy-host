import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/auth/SignInForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthMode = 'signin' | 'signup' | 'magic-link' | 'forgot-password';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');

  if (mode === 'magic-link') {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 py-6 sm:py-12">
        <div
          className="w-full max-w-md rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 50%, rgba(0, 102, 204, 0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(2)',
            WebkitBackdropFilter: 'blur(40px) saturate(2)',
            border: '1px solid rgba(0, 102, 204, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 102, 204, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            padding: '24px',
          }}
        >
          <MagicLinkForm onBack={() => setMode('signin')} />
        </div>
      </div>
    );
  }

  if (mode === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 py-6 sm:py-12">
        <div
          className="w-full max-w-md rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 50%, rgba(0, 102, 204, 0.05) 100%)',
            backdropFilter: 'blur(40px) saturate(2)',
            WebkitBackdropFilter: 'blur(40px) saturate(2)',
            border: '1px solid rgba(0, 102, 204, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 102, 204, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            padding: '24px',
          }}
        >
          <ForgotPasswordForm onBack={() => setMode('signin')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 py-6 sm:py-12">
      <div
        className="w-full max-w-2xl rounded-3xl transition-all duration-500"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 50%, rgba(0, 102, 204, 0.05) 100%)',
          backdropFilter: 'blur(40px) saturate(2)',
          WebkitBackdropFilter: 'blur(40px) saturate(2)',
          border: '1px solid rgba(0, 102, 204, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 102, 204, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          padding: '24px',
        }}
      >
        <AuthHeader mode={mode} />

        <div style={{ padding: '16px 0' }}>
          {mode === 'signup' ? (
            <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
          ) : (
            <SignInForm
              onSwitchToSignUp={() => setMode('signup')}
              onSwitchToMagicLink={() => setMode('magic-link')}
              onSwitchToForgotPassword={() => setMode('forgot-password')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;