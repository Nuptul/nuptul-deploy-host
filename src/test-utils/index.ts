import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Test providers wrapper
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      BrowserRouter,
      {},
      React.createElement(
        ThemeProvider,
        { 
          attribute: 'class',
          defaultTheme: 'light',
          enableSystem: false,
          disableTransitionOnChange: true
        },
        children
      )
    )
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Utility to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: null,
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone_change: null,
  phone: null,
  confirmed_at: new Date().toISOString(),
  email_change_confirm_status: 0,
  banned_until: null,
  reauthentication_sent_at: null,
  user_metadata: {},
  app_metadata: { provider: 'email', providers: ['email'] },
  identities: [],
  factors: [],
};

// Mock auth context
export const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
};

// Mock toast context
export const mockToast = jest.fn();

// Hook testing wrapper
export const createHookWrapper = (providers: any[] = []) => {
  return ({ children }: { children: React.ReactNode }) => {
    let wrapper = children;
    
    providers.reverse().forEach(Provider => {
      wrapper = React.createElement(Provider, {}, wrapper);
    });
    
    return React.createElement(AllTheProviders, {}, wrapper);
  };
};