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
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(69, 183, 209, 0.12) 100%)',
            backdropFilter: 'blur(30px) saturate(2)',
            WebkitBackdropFilter: 'blur(30px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 50px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05)
            `
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
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
            backdropFilter: 'blur(30px) saturate(2)',
            WebkitBackdropFilter: 'blur(30px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 50px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05)
            `
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
        className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl"
        style={{
          background: mode === 'signup' 
            ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(69, 183, 209, 0.12) 100%)'
            : 'linear-gradient(135deg, rgba(69, 183, 209, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
          backdropFilter: 'blur(30px) saturate(2)',
          WebkitBackdropFilter: 'blur(30px) saturate(2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 20px 50px rgba(0, 0, 0, 0.15),
            inset 0 1px 1px rgba(255, 255, 255, 0.5),
            inset 0 -1px 1px rgba(0, 0, 0, 0.05)
          `,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <AuthHeader mode={mode} />
        
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
  );
};

export default AuthPage;