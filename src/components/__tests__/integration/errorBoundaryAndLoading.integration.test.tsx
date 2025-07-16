import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Mock components that might throw errors
const ThrowingComponent: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error(errorMessage);
    }
  }, [shouldThrow, errorMessage]);

  return <div data-testid="throwing-component">Component rendered successfully</div>;
};

const AsyncThrowingComponent: React.FC<{ shouldThrow?: boolean; delay?: number }> = ({ 
  shouldThrow = false, 
  delay = 1000 
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldThrow) {
        setError(new Error('Async error occurred'));
      } else {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldThrow, delay]);

  if (error) {
    throw error;
  }

  if (loading) {
    return <div data-testid="loading-indicator">Loading...</div>;
  }

  return <div data-testid="async-component">Async component loaded</div>;
};

const LoadingStateComponent: React.FC<{ loadingTime?: number; failAfter?: number }> = ({ 
  loadingTime = 2000, 
  failAfter 
}) => {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'error'>('loading');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (failAfter && loadingTime >= failAfter) {
        setState('error');
      } else {
        setState('loaded');
      }
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [loadingTime, failAfter]);

  return (
    <div 
      data-testid="loading-state-component"
      data-loaded={state === 'loaded'}
      data-error={state === 'error'}
    >
      {state === 'loading' && <div data-testid="loading-spinner">Loading...</div>}
      {state === 'loaded' && <div data-testid="loaded-content">Content loaded successfully</div>}
      {state === 'error' && <div data-testid="error-content">Failed to load content</div>}
    </div>
  );
};

// Component that simulates network-dependent loading
const NetworkDependentComponent: React.FC<{ networkDelay?: number; shouldFail?: boolean }> = ({ 
  networkDelay = 1500, 
  shouldFail = false 
}) => {
  const [state, setState] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [data, setData] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    setState('loading');
    
    try {
      await new Promise(resolve => setTimeout(resolve, networkDelay));
      
      if (shouldFail) {
        throw new Error('Network request failed');
      }
      
      setData({ users: 10, messages: 25, photos: 15 });
      setState('loaded');
    } catch (error) {
      setState('error');
    }
  }, [networkDelay, shouldFail]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div 
      data-testid="network-dependent-component"
      data-loaded={state === 'loaded'}
      data-error={state === 'error'}
    >
      {state === 'loading' && (
        <div data-testid="network-loading">
          <div>Fetching data from server...</div>
          <div role="progressbar" aria-label="Loading progress" />
        </div>
      )}
      
      {state === 'loaded' && (
        <div data-testid="network-content">
          <div>Users: {data?.users}</div>
          <div>Messages: {data?.messages}</div>
          <div>Photos: {data?.photos}</div>
        </div>
      )}
      
      {state === 'error' && (
        <div data-testid="network-error">
          <div>Failed to load data</div>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}
    </div>
  );
};

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@test.com' },
    profile: { role: 'guest', first_name: 'Test', last_name: 'User' },
    loading: false
  })
}));

// Test wrapper with all providers and error boundary
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Error Boundary and Loading State Integration Tests', () => {
  let consoleError: jest.SpyInstance;
  const user = userEvent.setup();

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Error Boundary Functionality', () => {
    it('catches and displays component errors gracefully', async () => {
      render(
        <TestWrapper>
          <ThrowingComponent shouldThrow={true} errorMessage="Component crashed" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByText(/component crashed/i)).toBeInTheDocument();
      });

      // Error should be caught and not crash the app
      expect(screen.queryByTestId('throwing-component')).not.toBeInTheDocument();
    });

    it('displays error details and recovery options', async () => {
      render(
        <TestWrapper>
          <ThrowingComponent shouldThrow={true} errorMessage="Database connection failed" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /report error/i })).toBeInTheDocument();
      });
    });

    it('allows error recovery through retry mechanism', async () => {
      const ErrorRecoveryComponent: React.FC = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        const [retryCount, setRetryCount] = React.useState(0);

        React.useEffect(() => {
          // Auto-recover after first retry
          if (retryCount > 0) {
            setShouldThrow(false);
          }
        }, [retryCount]);

        return (
          <div>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              data-testid="manual-retry"
            >
              Manual Retry
            </button>
            <ThrowingComponent shouldThrow={shouldThrow} />
          </div>
        );
      };

      render(
        <TestWrapper>
          <ErrorRecoveryComponent />
        </TestWrapper>
      );

      // Should initially show error
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Should recover and show component
      await waitFor(() => {
        expect(screen.getByTestId('throwing-component')).toBeInTheDocument();
        expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
      });
    });

    it('handles async component errors', async () => {
      render(
        <TestWrapper>
          <AsyncThrowingComponent shouldThrow={true} delay={500} />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

      // Should catch async error
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByText(/async error occurred/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('provides error reporting functionality', async () => {
      const mockReportError = jest.fn();
      
      // Mock error reporting service
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      ) as jest.Mock;

      render(
        <TestWrapper>
          <ThrowingComponent shouldThrow={true} errorMessage="Critical error for reporting" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /report error/i })).toBeInTheDocument();
      });

      const reportButton = screen.getByRole('button', { name: /report error/i });
      await user.click(reportButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/error-report'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Critical error for reporting')
          })
        );
      });
    });
  });

  describe('Loading State Management', () => {
    it('displays loading indicators correctly', async () => {
      render(
        <TestWrapper>
          <LoadingStateComponent loadingTime={1500} />
        </TestWrapper>
      );

      // Should show loading spinner initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should complete loading and show content
      await waitFor(() => {
        expect(screen.getByTestId('loaded-content')).toBeInTheDocument();
        expect(screen.getByText('Content loaded successfully')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Loading indicator should be gone
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('handles loading timeouts and errors', async () => {
      render(
        <TestWrapper>
          <LoadingStateComponent loadingTime={2000} failAfter={1500} />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Should show error after timeout
      await waitFor(() => {
        expect(screen.getByTestId('error-content')).toBeInTheDocument();
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('provides accessible loading states', async () => {
      render(
        <TestWrapper>
          <NetworkDependentComponent networkDelay={1000} />
        </TestWrapper>
      );

      // Should have proper ARIA attributes
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Loading progress');

      // Should have descriptive loading text
      expect(screen.getByText('Fetching data from server...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('network-content')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles progressive loading with multiple states', async () => {
      const ProgressiveLoadingComponent: React.FC = () => {
        const [phase, setPhase] = React.useState(0);

        React.useEffect(() => {
          const phases = [
            () => setTimeout(() => setPhase(1), 500),  // Auth
            () => setTimeout(() => setPhase(2), 1000), // User data
            () => setTimeout(() => setPhase(3), 1500), // App data
            () => setTimeout(() => setPhase(4), 2000)  // Complete
          ];

          phases.forEach(phaseFunction => phaseFunction());
        }, []);

        return (
          <div data-testid="progressive-loading" data-phase={phase}>
            {phase === 0 && <div data-testid="auth-loading">Authenticating...</div>}
            {phase === 1 && <div data-testid="user-loading">Loading user data...</div>}
            {phase === 2 && <div data-testid="data-loading">Loading application data...</div>}
            {phase === 3 && <div data-testid="finalizing">Finalizing...</div>}
            {phase === 4 && <div data-testid="complete">Application ready!</div>}
          </div>
        );
      };

      render(
        <TestWrapper>
          <ProgressiveLoadingComponent />
        </TestWrapper>
      );

      // Should progress through loading phases
      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('user-loading')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByTestId('data-loading')).toBeInTheDocument();
      }, { timeout: 1500 });

      await waitFor(() => {
        expect(screen.getByTestId('complete')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Network Error Handling', () => {
    it('handles network failures gracefully', async () => {
      render(
        <TestWrapper>
          <NetworkDependentComponent networkDelay={1000} shouldFail={true} />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByTestId('network-loading')).toBeInTheDocument();

      // Should show error after network failure
      await waitFor(() => {
        expect(screen.getByTestId('network-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load data')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 2500 });
    });

    it('supports retry mechanism for network errors', async () => {
      let shouldFail = true;
      
      const RetryableNetworkComponent: React.FC = () => {
        const [retryCount, setRetryCount] = React.useState(0);
        
        // Succeed after first retry
        React.useEffect(() => {
          if (retryCount > 0) {
            shouldFail = false;
          }
        }, [retryCount]);

        return (
          <div>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              data-testid="trigger-retry"
            >
              Trigger Retry
            </button>
            <NetworkDependentComponent 
              key={retryCount} // Force re-mount on retry
              networkDelay={500} 
              shouldFail={shouldFail} 
            />
          </div>
        );
      };

      render(
        <TestWrapper>
          <RetryableNetworkComponent />
        </TestWrapper>
      );

      // Should initially fail
      await waitFor(() => {
        expect(screen.getByTestId('network-error')).toBeInTheDocument();
      }, { timeout: 1500 });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should succeed after retry
      await waitFor(() => {
        expect(screen.getByTestId('network-content')).toBeInTheDocument();
        expect(screen.getByText('Users: 10')).toBeInTheDocument();
      }, { timeout: 1500 });
    });

    it('handles partial data loading failures', async () => {
      const PartialFailureComponent: React.FC = () => {
        const [loadingStates, setLoadingStates] = React.useState({
          users: 'loading',
          messages: 'loading',
          photos: 'loading'
        });

        React.useEffect(() => {
          // Users load successfully
          setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, users: 'loaded' }));
          }, 500);

          // Messages fail to load
          setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, messages: 'error' }));
          }, 1000);

          // Photos load successfully
          setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, photos: 'loaded' }));
          }, 1500);
        }, []);

        return (
          <div data-testid="partial-failure-component">
            <div data-testid="users-section" data-state={loadingStates.users}>
              {loadingStates.users === 'loading' && 'Loading users...'}
              {loadingStates.users === 'loaded' && 'Users: 10'}
              {loadingStates.users === 'error' && 'Failed to load users'}
            </div>
            
            <div data-testid="messages-section" data-state={loadingStates.messages}>
              {loadingStates.messages === 'loading' && 'Loading messages...'}
              {loadingStates.messages === 'loaded' && 'Messages: 25'}
              {loadingStates.messages === 'error' && 'Failed to load messages'}
            </div>
            
            <div data-testid="photos-section" data-state={loadingStates.photos}>
              {loadingStates.photos === 'loading' && 'Loading photos...'}
              {loadingStates.photos === 'loaded' && 'Photos: 15'}
              {loadingStates.photos === 'error' && 'Failed to load photos'}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <PartialFailureComponent />
        </TestWrapper>
      );

      // Should show all loading initially
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
      expect(screen.getByText('Loading messages...')).toBeInTheDocument();
      expect(screen.getByText('Loading photos...')).toBeInTheDocument();

      // Users should load first
      await waitFor(() => {
        expect(screen.getByText('Users: 10')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Messages should fail
      await waitFor(() => {
        expect(screen.getByText('Failed to load messages')).toBeInTheDocument();
      }, { timeout: 1500 });

      // Photos should load
      await waitFor(() => {
        expect(screen.getByText('Photos: 15')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Users and photos should still be loaded despite messages failure
      expect(screen.getByText('Users: 10')).toBeInTheDocument();
      expect(screen.getByText('Photos: 15')).toBeInTheDocument();
    });
  });

  describe('Performance and Memory Management', () => {
    it('handles rapid component mounting/unmounting without memory leaks', async () => {
      const MountUnmountTest: React.FC = () => {
        const [showComponent, setShowComponent] = React.useState(true);
        const [mountCount, setMountCount] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setShowComponent(prev => !prev);
            setMountCount(prev => prev + 1);
          }, 100);

          // Stop after 10 cycles
          const timeout = setTimeout(() => {
            clearInterval(interval);
          }, 1000);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        }, []);

        return (
          <div data-testid="mount-unmount-test" data-mount-count={mountCount}>
            {showComponent && <LoadingStateComponent loadingTime={50} />}
          </div>
        );
      };

      render(
        <TestWrapper>
          <MountUnmountTest />
        </TestWrapper>
      );

      await waitFor(() => {
        const testElement = screen.getByTestId('mount-unmount-test');
        const mountCount = parseInt(testElement.getAttribute('data-mount-count') || '0');
        expect(mountCount).toBeGreaterThan(5);
      }, { timeout: 2000 });

      // Should not cause memory leaks or console errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles large error boundaries efficiently', async () => {
      const MultipleErrorBoundaryTest: React.FC = () => {
        return (
          <div data-testid="multiple-error-boundaries">
            {Array.from({ length: 20 }, (_, i) => (
              <ErrorBoundary key={i}>
                <ThrowingComponent 
                  shouldThrow={i % 5 === 0} // Every 5th component throws
                  errorMessage={`Error in component ${i}`}
                />
              </ErrorBoundary>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MultipleErrorBoundaryTest />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should have some successful components
        expect(screen.getAllByText('Component rendered successfully')).toHaveLength(16);
        
        // Should have some error boundaries triggered
        expect(screen.getAllByText(/something went wrong/i)).toHaveLength(4);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render efficiently even with multiple error boundaries
      expect(renderTime).toBeLessThan(2000);
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides accessible error messages', async () => {
      render(
        <TestWrapper>
          <ThrowingComponent shouldThrow={true} errorMessage="Accessibility test error" />
        </TestWrapper>
      );

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveAttribute('aria-live', 'assertive');
        expect(errorElement).toHaveTextContent(/accessibility test error/i);
      });
    });

    it('supports keyboard navigation in error states', async () => {
      render(
        <TestWrapper>
          <ThrowingComponent shouldThrow={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      // Should be able to tab to retry button
      await user.tab();
      expect(screen.getByRole('button', { name: /try again/i })).toHaveFocus();

      // Should be able to tab to report button
      await user.tab();
      expect(screen.getByRole('button', { name: /report error/i })).toHaveFocus();
    });

    it('provides appropriate loading announcements for screen readers', async () => {
      render(
        <TestWrapper>
          <LoadingStateComponent loadingTime={1000} />
        </TestWrapper>
      );

      // Should announce loading state
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingElement).toHaveTextContent(/loading/i);

      await waitFor(() => {
        const loadedElement = screen.getByRole('status');
        expect(loadedElement).toHaveTextContent(/loaded successfully/i);
      }, { timeout: 2000 });
    });
  });
});