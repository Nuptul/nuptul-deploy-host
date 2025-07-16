import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock hooks that will be tested
jest.mock('@/hooks/useWeddingData', () => ({
  useWeddingData: jest.fn()
}));

jest.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: jest.fn()
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks/useAppSettings', () => ({
  useAppSettings: jest.fn()
}));

jest.mock('@/hooks/useRSVPStatus', () => ({
  useRSVPStatus: jest.fn()
}));

jest.mock('@/hooks/useUserPresence', () => ({
  useUserPresence: jest.fn()
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        insert: jest.fn(() => Promise.resolve({ data: { id: 'new-id' }, error: null })),
        update: jest.fn(() => Promise.resolve({ data: { id: 'updated-id' }, error: null }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({ subscribe: jest.fn() })),
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'user-1', email: 'user@test.com' } }, 
        error: null 
      }))
    }
  }
}));

// Test wrapper with all providers
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
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Test component that uses multiple hooks for integration testing
const HookIntegrationTestComponent: React.FC = () => {
  const useWeddingData = require('@/hooks/useWeddingData').useWeddingData;
  const useDashboardData = require('@/hooks/useDashboardData').useDashboardData;
  const useAuth = require('@/hooks/useAuth').useAuth;
  const useAppSettings = require('@/hooks/useAppSettings').useAppSettings;
  const useRSVPStatus = require('@/hooks/useRSVPStatus').useRSVPStatus;
  const useUserPresence = require('@/hooks/useUserPresence').useUserPresence;

  const weddingData = useWeddingData();
  const dashboardData = useDashboardData();
  const auth = useAuth();
  const appSettings = useAppSettings();
  const rsvpStatus = useRSVPStatus();
  const userPresence = useUserPresence();

  const [integrationState, setIntegrationState] = React.useState({
    dataLoaded: false,
    dataUpdated: false,
    errorOccurred: false
  });

  React.useEffect(() => {
    // Simulate data loading completion
    if (auth.user && !auth.loading && weddingData.events) {
      setIntegrationState(prev => ({ ...prev, dataLoaded: true }));
    }
  }, [auth.user, auth.loading, weddingData.events]);

  React.useEffect(() => {
    // Simulate data updates
    if (dashboardData.stats && rsvpStatus.status) {
      setIntegrationState(prev => ({ ...prev, dataUpdated: true }));
    }
  }, [dashboardData.stats, rsvpStatus.status]);

  React.useEffect(() => {
    // Handle errors from any hook
    if (weddingData.error || dashboardData.error || rsvpStatus.error) {
      setIntegrationState(prev => ({ ...prev, errorOccurred: true }));
    }
  }, [weddingData.error, dashboardData.error, rsvpStatus.error]);

  return (
    <div data-testid="hook-integration-component" 
         data-loaded={integrationState.dataLoaded}
         data-updated={integrationState.dataUpdated}
         data-error={integrationState.errorOccurred}>
      
      {/* Auth Status */}
      <div data-testid="auth-status">
        {auth.loading ? 'Loading auth...' : auth.user ? `Logged in as ${auth.user.email}` : 'Not logged in'}
      </div>

      {/* Wedding Data Status */}
      <div data-testid="wedding-data-status">
        {weddingData.loading ? 'Loading wedding data...' : 
         weddingData.events ? `${weddingData.events.length} events loaded` : 'No events'}
      </div>

      {/* Dashboard Data Status */}
      <div data-testid="dashboard-data-status">
        {dashboardData.loading ? 'Loading dashboard...' : 
         dashboardData.stats ? `Stats: ${JSON.stringify(dashboardData.stats)}` : 'No stats'}
      </div>

      {/* RSVP Status */}
      <div data-testid="rsvp-status">
        RSVP Status: {rsvpStatus.status || 'Unknown'}
      </div>

      {/* User Presence */}
      <div data-testid="user-presence">
        Online Users: {userPresence.onlineUsers?.length || 0}
      </div>

      {/* App Settings */}
      <div data-testid="app-settings">
        Theme: {appSettings.theme || 'Default'}
      </div>

      {/* Integration Controls */}
      <button 
        data-testid="refresh-data"
        onClick={() => {
          weddingData.refetch?.();
          dashboardData.refetch?.();
        }}
      >
        Refresh Data
      </button>

      <button 
        data-testid="update-rsvp"
        onClick={() => {
          rsvpStatus.updateStatus?.('confirmed');
        }}
      >
        Update RSVP
      </button>

      <button 
        data-testid="update-settings"
        onClick={() => {
          appSettings.updateTheme?.('dark');
        }}
      >
        Update Theme
      </button>
    </div>
  );
};

describe('Hook Integration Tests', () => {
  let consoleError: jest.SpyInstance;
  const user = userEvent.setup();

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup default mock implementations
    const mockUseAuth = require('@/hooks/useAuth').useAuth;
    const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
    const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;
    const mockUseAppSettings = require('@/hooks/useAppSettings').useAppSettings;
    const mockUseRSVPStatus = require('@/hooks/useRSVPStatus').useRSVPStatus;
    const mockUseUserPresence = require('@/hooks/useUserPresence').useUserPresence;

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'user@test.com' },
      profile: { role: 'guest', first_name: 'Test', last_name: 'User' },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    });

    mockUseWeddingData.mockReturnValue({
      events: [
        { id: 'event-1', name: 'Ceremony', date: '2024-06-15' },
        { id: 'event-2', name: 'Reception', date: '2024-06-15' }
      ],
      photos: [],
      messages: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    mockUseDashboardData.mockReturnValue({
      stats: {
        totalGuests: 50,
        confirmedRSVPs: 40,
        pendingRSVPs: 10
      },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    mockUseAppSettings.mockReturnValue({
      theme: 'light',
      backgroundType: 'aurora',
      performanceLevel: 'balanced',
      updateTheme: jest.fn(),
      updateSettings: jest.fn()
    });

    mockUseRSVPStatus.mockReturnValue({
      status: 'pending',
      loading: false,
      error: null,
      updateStatus: jest.fn()
    });

    mockUseUserPresence.mockReturnValue({
      onlineUsers: ['user-1', 'user-2', 'user-3'],
      isOnline: jest.fn(),
      setStatus: jest.fn()
    });
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Hook Data Flow Integration', () => {
    it('integrates multiple hooks without console errors', async () => {
      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      // Wait for all hooks to initialize
      await waitFor(() => {
        expect(screen.getByTestId('hook-integration-component')).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays data from all hooks correctly', async () => {
      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged in as user@test.com')).toBeInTheDocument();
        expect(screen.getByText('2 events loaded')).toBeInTheDocument();
        expect(screen.getByText(/Stats:.*totalGuests.*50/)).toBeInTheDocument();
        expect(screen.getByText('RSVP Status: pending')).toBeInTheDocument();
        expect(screen.getByText('Online Users: 3')).toBeInTheDocument();
        expect(screen.getByText('Theme: light')).toBeInTheDocument();
      });
    });

    it('handles hook interdependencies correctly', async () => {
      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        const component = screen.getByTestId('hook-integration-component');
        expect(component).toHaveAttribute('data-loaded', 'true');
        expect(component).toHaveAttribute('data-updated', 'true');
      });
    });
  });

  describe('Hook State Management Integration', () => {
    it('handles data refresh across multiple hooks', async () => {
      const mockWeddingRefetch = jest.fn();
      const mockDashboardRefetch = jest.fn();

      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;

      mockUseWeddingData.mockReturnValue({
        events: [],
        loading: false,
        error: null,
        refetch: mockWeddingRefetch
      });

      mockUseDashboardData.mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        refetch: mockDashboardRefetch
      });

      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByTestId('refresh-data');
      await user.click(refreshButton);

      expect(mockWeddingRefetch).toHaveBeenCalled();
      expect(mockDashboardRefetch).toHaveBeenCalled();
    });

    it('handles cross-hook state updates', async () => {
      const mockUpdateStatus = jest.fn();
      const mockUpdateTheme = jest.fn();

      const mockUseRSVPStatus = require('@/hooks/useRSVPStatus').useRSVPStatus;
      const mockUseAppSettings = require('@/hooks/useAppSettings').useAppSettings;

      mockUseRSVPStatus.mockReturnValue({
        status: 'pending',
        updateStatus: mockUpdateStatus
      });

      mockUseAppSettings.mockReturnValue({
        theme: 'light',
        updateTheme: mockUpdateTheme
      });

      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      const updateRSVPButton = screen.getByTestId('update-rsvp');
      await user.click(updateRSVPButton);
      expect(mockUpdateStatus).toHaveBeenCalledWith('confirmed');

      const updateThemeButton = screen.getByTestId('update-settings');
      await user.click(updateThemeButton);
      expect(mockUpdateTheme).toHaveBeenCalledWith('dark');
    });

    it('maintains hook state consistency during updates', async () => {
      const mockUseRSVPStatus = require('@/hooks/useRSVPStatus').useRSVPStatus;
      
      // Mock state change
      let currentStatus = 'pending';
      mockUseRSVPStatus.mockImplementation(() => ({
        status: currentStatus,
        updateStatus: (newStatus: string) => {
          currentStatus = newStatus;
        }
      }));

      const { rerender } = render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('RSVP Status: pending')).toBeInTheDocument();

      // Simulate status update
      act(() => {
        currentStatus = 'confirmed';
      });

      rerender(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('RSVP Status: confirmed')).toBeInTheDocument();
    });
  });

  describe('Hook Error Handling Integration', () => {
    it('handles errors from multiple hooks gracefully', async () => {
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;
      const mockUseRSVPStatus = require('@/hooks/useRSVPStatus').useRSVPStatus;

      mockUseWeddingData.mockReturnValue({
        events: null,
        loading: false,
        error: 'Failed to load wedding data'
      });

      mockUseDashboardData.mockReturnValue({
        stats: null,
        loading: false,
        error: 'Failed to load dashboard data'
      });

      mockUseRSVPStatus.mockReturnValue({
        status: null,
        loading: false,
        error: 'Failed to load RSVP status'
      });

      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        const component = screen.getByTestId('hook-integration-component');
        expect(component).toHaveAttribute('data-error', 'true');
      });

      // Should not throw console errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('recovers from individual hook failures', async () => {
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      
      // Start with error state
      mockUseWeddingData.mockReturnValue({
        events: null,
        loading: false,
        error: 'Network error'
      });

      const { rerender } = render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No events')).toBeInTheDocument();
      });

      // Simulate recovery
      mockUseWeddingData.mockReturnValue({
        events: [{ id: 'event-1', name: 'Ceremony', date: '2024-06-15' }],
        loading: false,
        error: null
      });

      rerender(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1 events loaded')).toBeInTheDocument();
      });
    });

    it('handles partial data loading gracefully', async () => {
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;

      // Wedding data loads successfully
      mockUseWeddingData.mockReturnValue({
        events: [{ id: 'event-1', name: 'Ceremony' }],
        loading: false,
        error: null
      });

      // Dashboard data still loading
      mockUseDashboardData.mockReturnValue({
        stats: null,
        loading: true,
        error: null
      });

      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1 events loaded')).toBeInTheDocument();
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      });
    });
  });

  describe('Hook Performance Integration', () => {
    it('handles concurrent hook operations efficiently', async () => {
      const startTime = performance.now();

      // Mock hooks with simulated delays
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;

      mockUseWeddingData.mockImplementation(() => {
        const [data, setData] = React.useState(null);
        React.useEffect(() => {
          setTimeout(() => setData([{ id: 'event-1', name: 'Ceremony' }]), 100);
        }, []);
        return { events: data, loading: !data, error: null };
      });

      mockUseDashboardData.mockImplementation(() => {
        const [data, setData] = React.useState(null);
        React.useEffect(() => {
          setTimeout(() => setData({ totalGuests: 50 }), 150);
        }, []);
        return { stats: data, loading: !data, error: null };
      });

      render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hook-integration-component')).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('optimizes re-renders during hook updates', async () => {
      let renderCount = 0;

      const RenderCountComponent = () => {
        renderCount++;
        return <HookIntegrationTestComponent />;
      };

      const { rerender } = render(
        <TestWrapper>
          <RenderCountComponent />
        </TestWrapper>
      );

      const initialRenderCount = renderCount;

      // Trigger multiple hook updates
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <RenderCountComponent />
          </TestWrapper>
        );
      }

      // Should not cause excessive re-renders
      expect(renderCount - initialRenderCount).toBeLessThan(10);
    });

    it('handles memory cleanup properly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hook-integration-component')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should not cause memory leaks or errors
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Real-time Hook Integration', () => {
    it('integrates real-time updates across hooks', async () => {
      const mockUseUserPresence = require('@/hooks/useUserPresence').useUserPresence;
      
      let onlineUsers = ['user-1', 'user-2'];
      mockUseUserPresence.mockImplementation(() => ({
        onlineUsers,
        setStatus: (userId: string, status: string) => {
          if (status === 'online' && !onlineUsers.includes(userId)) {
            onlineUsers = [...onlineUsers, userId];
          } else if (status === 'offline') {
            onlineUsers = onlineUsers.filter(id => id !== userId);
          }
        }
      }));

      const { rerender } = render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Online Users: 2')).toBeInTheDocument();

      // Simulate real-time presence update
      act(() => {
        onlineUsers = [...onlineUsers, 'user-3'];
      });

      rerender(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Online Users: 3')).toBeInTheDocument();
    });

    it('synchronizes data updates across multiple hooks', async () => {
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockUseDashboardData = require('@/hooks/useDashboardData').useDashboardData;

      let eventCount = 2;
      let guestCount = 50;

      mockUseWeddingData.mockImplementation(() => ({
        events: Array.from({ length: eventCount }, (_, i) => ({ id: `event-${i}`, name: `Event ${i}` })),
        loading: false,
        error: null
      }));

      mockUseDashboardData.mockImplementation(() => ({
        stats: { totalGuests: guestCount },
        loading: false,
        error: null
      }));

      const { rerender } = render(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('2 events loaded')).toBeInTheDocument();
      expect(screen.getByText(/totalGuests.*50/)).toBeInTheDocument();

      // Simulate synchronized updates
      act(() => {
        eventCount = 3;
        guestCount = 60;
      });

      rerender(
        <TestWrapper>
          <HookIntegrationTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('3 events loaded')).toBeInTheDocument();
      expect(screen.getByText(/totalGuests.*60/)).toBeInTheDocument();
    });
  });
});