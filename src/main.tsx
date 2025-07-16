import { createRoot } from 'react-dom/client'
import React from 'react'

// Apply critical RSVP fix BEFORE any other imports use Supabase
import './utils/fixUpsertIssues'

// Initialize security features immediately
import { initializeSecurity } from './utils/security'
initializeSecurity()

import App from './App.tsx'
import './index.css'
import SecurityHeaders from './components/security/SecurityHeaders'
import EnvironmentValidator from './components/security/EnvironmentValidator'

// Simple error boundary component
class SimpleErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontSize: '16px' }}>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <SimpleErrorBoundary>
    <EnvironmentValidator strict={false}>
      <SecurityHeaders />
      <App />
    </EnvironmentValidator>
  </SimpleErrorBoundary>
);
