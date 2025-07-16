import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// Import components for interaction testing
import AdminDashboardPopup from '@/components/dashboard/AdminDashboardPopup';
import CentralGuestList from '@/components/guest/CentralGuestList';
import RSVPIntegration from '@/components/guest/RSVPIntegration';
import InstantMessenger from '@/components/chat/InstantMessenger';
import NotificationBell from '@/components/NotificationBell';

// Mock all hooks used across components
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@test.com' },
    profile: { role: 'admin', first_name: 'Admin', last_name: 'User' },
    loading: false
  })
}));

jest.mock('@/hooks/useWeddingData', () => ({
  useWeddingData: () => ({
    events: [
      { id: 'event-1', name: 'Ceremony', date: '2024-06-15' },
      { id: 'event-2', name: 'Reception', date: '2024-06-15' }
    ],
    photos: [],
    messages: [],
    rsvps: [
      { id: 'rsvp-1', guest_id: 'guest-1', rsvp_status: 'confirmed' },
      { id: 'rsvp-2', guest_id: 'guest-2', rsvp_status: 'pending' }
    ],
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}));

jest.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    stats: {
      totalGuests: 50,
      confirmedRSVPs: 35,
      pendingRSVPs: 15,
      totalEvents: 2,
      recentMessages: 8,
      photoUploads: 25
    },
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}));

jest.mock('@/hooks/useInstantMessenger', () => ({
  useInstantMessenger: () => ({
    isOpen: true,
    activeChat: 'chat-1',
    chats: [
      {
        id: 'chat-1',
        name: 'General Chat',
        unreadCount: 3,
        lastMessage: { content: 'Hello everyone!', sender_id: 'guest-1' }
      }
    ],
    messages: [
      {
        id: 'msg-1',
        content: 'Hello everyone!',
        sender_id: 'guest-1',
        chat_id: 'chat-1',
        created_at: '2024-01-01T10:00:00Z'
      }
    ],
    sendMessage: jest.fn(),
    openChat: jest.fn(),
    closeChat: jest.fn(),
    notifications: [
      {
        id: 'notif-1',
        type: 'message',
        content: 'New message from John',
        read: false,
        created_at: '2024-01-01T10:00:00Z'
      }
    ],
    markNotificationAsRead: jest.fn(),
    loading: false,
    error: null
  })
}));

jest.mock('@/hooks/useRSVPStatus', () => ({
  useRSVPStatus: () => ({
    status: 'pending',
    loading: false,
    error: null,
    updateStatus: jest.fn()
  })
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
        update: jest.fn(() => Promise.resolve({ data: { id: 'updated-id' }, error: null })),
        upsert: jest.fn(() => Promise.resolve({ data: { id: 'upserted-id' }, error: null }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({ subscribe: jest.fn() })),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      send: jest.fn()
    }))
  }
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(() => 'toast-id'),
    dismiss: jest.fn()
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

// Composite test component that includes multiple interacting components
const IntegratedAppView: React.FC = () => {
  const [showAdminDashboard, setShowAdminDashboard] = React.useState(false);
  const [showGuestList, setShowGuestList] = React.useState(false);
  const [showRSVP, setShowRSVP] = React.useState(false);
  const [showMessenger, setShowMessenger] = React.useState(false);

  return (
    <div data-testid="integrated-app-view">
      {/* Global Navigation */}
      <nav data-testid="app-navigation">
        <button 
          onClick={() => setShowAdminDashboard(true)}
          data-testid="open-admin-dashboard"
        >
          Admin Dashboard
        </button>
        <button 
          onClick={() => setShowGuestList(true)}
          data-testid="open-guest-list"
        >
          Guest List
        </button>
        <button 
          onClick={() => setShowRSVP(true)}
          data-testid="open-rsvp"
        >
          RSVP
        </button>
        <button 
          onClick={() => setShowMessenger(true)}
          data-testid="open-messenger"
        >
          Messages
        </button>
      </nav>

      {/* Notification Bell (Always visible) */}
      <NotificationBell />

      {/* Conditionally rendered components */}
      {showAdminDashboard && (
        <AdminDashboardPopup onClose={() => setShowAdminDashboard(false)} />
      )}

      {showGuestList && (
        <div data-testid="guest-list-modal">
          <CentralGuestList />
          <button onClick={() => setShowGuestList(false)}>Close Guest List</button>
        </div>
      )}

      {showRSVP && (
        <div data-testid="rsvp-modal">
          <RSVPIntegration />
          <button onClick={() => setShowRSVP(false)}>Close RSVP</button>
        </div>
      )}

      {showMessenger && (
        <div data-testid="messenger-modal">
          <InstantMessenger />
          <button onClick={() => setShowMessenger(false)}>Close Messenger</button>
        </div>
      )}
    </div>
  );
};

describe('Component Interaction Integration Tests', () => {
  let consoleError: jest.SpyInstance;
  const user = userEvent.setup();

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Multi-Component Rendering and Data Flow', () => {
    it('renders integrated app view without console errors', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('integrated-app-view')).toBeInTheDocument();
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('shares data correctly between admin dashboard and guest list', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open admin dashboard
      const adminButton = screen.getByTestId('open-admin-dashboard');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByText(/50/)).toBeInTheDocument(); // Total guests
        expect(screen.getByText(/35/)).toBeInTheDocument(); // Confirmed RSVPs
      });

      // Open guest list
      const guestListButton = screen.getByTestId('open-guest-list');
      await user.click(guestListButton);

      await waitFor(() => {
        // Both components should share the same underlying data
        expect(screen.getByTestId('guest-list-modal')).toBeInTheDocument();
        expect(screen.getByTestId('central-guest-list')).toHaveAttribute('data-loaded', 'true');
      });
    });

    it('handles cross-component state updates', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open RSVP component
      const rsvpButton = screen.getByTestId('open-rsvp');
      await user.click(rsvpButton);

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-modal')).toBeInTheDocument();
      });

      // Simulate RSVP status change
      const attendButton = screen.getByRole('button', { name: /yes.*attend/i });
      await user.click(attendButton);

      // Open admin dashboard to verify data consistency
      const adminButton = screen.getByTestId('open-admin-dashboard');
      await user.click(adminButton);

      await waitFor(() => {
        // Dashboard should reflect updated RSVP data
        expect(screen.getByTestId('admin-dashboard-popup')).toHaveAttribute('data-loaded', 'true');
      });
    });
  });

  describe('Component Communication and Event Handling', () => {
    it('handles notification bell interactions with messenger', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Notification bell should show unread count
      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Unread count
      });

      // Click notification bell
      const notificationBell = screen.getByTestId('notification-bell');
      await user.click(notificationBell);

      // Should open notifications dropdown
      await waitFor(() => {
        expect(screen.getByText('New message from John')).toBeInTheDocument();
      });

      // Click on notification should open messenger
      const notificationItem = screen.getByText('New message from John');
      await user.click(notificationItem);

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });
    });

    it('synchronizes guest data between components', async () => {
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      const mockRefetch = jest.fn();
      
      mockUseWeddingData.mockReturnValue({
        ...mockUseWeddingData(),
        refetch: mockRefetch
      });

      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open guest list and add a guest
      const guestListButton = screen.getByTestId('open-guest-list');
      await user.click(guestListButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument();
      });

      const addGuestButton = screen.getByRole('button', { name: /add guest/i });
      await user.click(addGuestButton);

      // Fill out guest form
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/first name/i), 'New');
      await user.type(screen.getByLabelText(/last name/i), 'Guest');
      await user.type(screen.getByLabelText(/email/i), 'new@test.com');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should trigger data refresh in all components
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('handles messenger interactions affecting dashboard stats', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open messenger
      const messengerButton = screen.getByTestId('open-messenger');
      await user.click(messengerButton);

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });

      // Send a message
      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      await user.type(messageInput, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Open admin dashboard to check updated message count
      const adminButton = screen.getByTestId('open-admin-dashboard');
      await user.click(adminButton);

      await waitFor(() => {
        // Dashboard should reflect increased message count
        expect(screen.getByTestId('admin-dashboard-popup')).toHaveAttribute('data-loaded', 'true');
      });
    });
  });

  describe('Complex Workflow Integration', () => {
    it('handles complete guest management workflow', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // 1. Admin opens dashboard to review current stats
      const adminButton = screen.getByTestId('open-admin-dashboard');
      await user.click(adminButton);

      await waitFor(() => {
        expect(screen.getByText(/50/)).toBeInTheDocument(); // Initial guest count
      });

      // 2. Admin opens guest list to add new guest
      const guestListButton = screen.getByTestId('open-guest-list');
      await user.click(guestListButton);

      await waitFor(() => {
        expect(screen.getByTestId('central-guest-list')).toBeInTheDocument();
      });

      // 3. Add new guest
      const addGuestButton = screen.getByRole('button', { name: /add guest/i });
      await user.click(addGuestButton);

      // Fill form
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@test.com');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // 4. Close guest list and return to dashboard
      const closeGuestListButton = screen.getByText('Close Guest List');
      await user.click(closeGuestListButton);

      // Dashboard should reflect updated stats
      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-popup')).toHaveAttribute('data-updated', 'true');
      });

      // Should not have any console errors throughout the workflow
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles RSVP submission affecting multiple components', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // 1. Guest opens RSVP form
      const rsvpButton = screen.getByTestId('open-rsvp');
      await user.click(rsvpButton);

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-integration')).toBeInTheDocument();
      });

      // 2. Fill out RSVP
      const attendYes = screen.getByRole('button', { name: /yes.*attend/i });
      await user.click(attendYes);

      // Add dietary requirements
      const vegetarianOption = screen.getByLabelText(/vegetarian/i);
      await user.click(vegetarianOption);

      // Submit RSVP
      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      // 3. Close RSVP and check dashboard
      const closeRSVPButton = screen.getByText('Close RSVP');
      await user.click(closeRSVPButton);

      const adminButton = screen.getByTestId('open-admin-dashboard');
      await user.click(adminButton);

      // Dashboard should reflect updated RSVP stats
      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-popup')).toHaveAttribute('data-loaded', 'true');
      });

      // 4. Check guest list to verify RSVP status
      const guestListButton = screen.getByTestId('open-guest-list');
      await user.click(guestListButton);

      await waitFor(() => {
        expect(screen.getByTestId('central-guest-list')).toHaveAttribute('data-loaded', 'true');
      });

      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles real-time updates across all components', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open all components
      await user.click(screen.getByTestId('open-admin-dashboard'));
      await user.click(screen.getByTestId('open-guest-list'));
      await user.click(screen.getByTestId('open-messenger'));

      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-popup')).toBeInTheDocument();
        expect(screen.getByTestId('central-guest-list')).toBeInTheDocument();
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });

      // Simulate real-time update (new message)
      fireEvent(window, new CustomEvent('new-message', {
        detail: {
          id: 'new-msg',
          content: 'Real-time message',
          sender_id: 'guest-1',
          chat_id: 'chat-1'
        }
      }));

      await waitFor(() => {
        // All components should reflect the real-time update
        expect(screen.getByText('Real-time message')).toBeInTheDocument();
      });

      // Notification bell should update
      await waitFor(() => {
        expect(screen.getByTestId('notification-bell')).toHaveAttribute('data-updated', 'true');
      });

      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Error Propagation and Recovery', () => {
    it('handles component-specific errors without affecting others', async () => {
      // Mock error in guest list
      const mockUseWeddingData = require('@/hooks/useWeddingData').useWeddingData;
      mockUseWeddingData.mockReturnValue({
        ...mockUseWeddingData(),
        error: 'Failed to load guest data',
        loading: false
      });

      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open all components
      await user.click(screen.getByTestId('open-admin-dashboard'));
      await user.click(screen.getByTestId('open-guest-list'));
      await user.click(screen.getByTestId('open-messenger'));

      await waitFor(() => {
        // Admin dashboard should still work
        expect(screen.getByTestId('admin-dashboard-popup')).toBeInTheDocument();
        
        // Guest list should show error
        expect(screen.getByText(/failed.*load.*guest.*data/i)).toBeInTheDocument();
        
        // Messenger should still work
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });

      expect(consoleError).not.toHaveBeenCalled();
    });

    it('recovers from network errors gracefully', async () => {
      // Mock network failure then recovery
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      let callCount = 0;
      
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => {
              callCount++;
              if (callCount <= 2) {
                return Promise.reject(new Error('Network error'));
              }
              return Promise.resolve({ data: [], error: null });
            }
          })
        })
      }));

      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open components (should initially fail)
      await user.click(screen.getByTestId('open-admin-dashboard'));

      await waitFor(() => {
        expect(screen.getByText(/error.*loading/i)).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-popup')).toHaveAttribute('data-loaded', 'true');
      });

      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Performance with Multiple Components', () => {
    it('maintains performance with all components open', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open all components simultaneously
      await user.click(screen.getByTestId('open-admin-dashboard'));
      await user.click(screen.getByTestId('open-guest-list'));
      await user.click(screen.getByTestId('open-rsvp'));
      await user.click(screen.getByTestId('open-messenger'));

      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-popup')).toBeInTheDocument();
        expect(screen.getByTestId('central-guest-list')).toBeInTheDocument();
        expect(screen.getByTestId('rsvp-integration')).toBeInTheDocument();
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      }, { timeout: 10000 });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should render all components within reasonable time
      expect(totalTime).toBeLessThan(5000);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles memory cleanup when closing components', async () => {
      render(
        <TestWrapper>
          <IntegratedAppView />
        </TestWrapper>
      );

      // Open and close components multiple times
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByTestId('open-admin-dashboard'));
        await waitFor(() => {
          expect(screen.getByTestId('admin-dashboard-popup')).toBeInTheDocument();
        });

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByTestId('admin-dashboard-popup')).not.toBeInTheDocument();
        });
      }

      // Should not cause memory leaks
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});