import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboardPopup from '@/components/dashboard/AdminDashboardPopup';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@test.com' },
    profile: { role: 'admin', first_name: 'Admin', last_name: 'User' },
    loading: false
  })
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { totalGuests: 45, confirmedRSVPs: 38, pendingRSVPs: 7 },
            error: null
          }))
        }))
      }))
    }))
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

describe('AdminDashboardPopup Integration Tests', () => {
  let consoleError: jest.SpyInstance;
  const user = userEvent.setup();

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Component Rendering and Data Loading', () => {
    it('renders admin dashboard and loads data without console errors', async () => {
      const mockOnClose = jest.fn();
      
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={mockOnClose} />
        </TestWrapper>
      );

      // Wait for component to load and data to be fetched
      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for data-loaded attribute or loading completion
      await waitFor(() => {
        const dashboardElement = screen.getByRole('dialog', { name: /admin dashboard/i });
        expect(dashboardElement).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays admin stats correctly after data loading', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument(); // Total guests
        expect(screen.getByText('38')).toBeInTheDocument(); // Confirmed RSVPs
        expect(screen.getByText('7')).toBeInTheDocument(); // Pending RSVPs
      });
    });
  });

  describe('User Interactions', () => {
    it('handles close button interaction', async () => {
      const mockOnClose = jest.fn();
      
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={mockOnClose} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('switches between dashboard views', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Test view switching
      const metricsButton = screen.getByRole('button', { name: /metrics/i });
      await user.click(metricsButton);

      await waitFor(() => {
        expect(screen.getByTestId('live-metrics')).toBeInTheDocument();
      });

      const guestListButton = screen.getByRole('button', { name: /guest list/i });
      await user.click(guestListButton);

      await waitFor(() => {
        expect(screen.getByTestId('central-guest-list')).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('integrates with LiveMetrics component correctly', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      // Switch to metrics view
      await waitFor(() => {
        const metricsButton = screen.getByRole('button', { name: /metrics/i });
        fireEvent.click(metricsButton);
      });

      // Verify LiveMetrics component receives and displays data
      await waitFor(() => {
        const metricsComponent = screen.getByTestId('live-metrics');
        expect(metricsComponent).toBeInTheDocument();
        expect(metricsComponent).toHaveAttribute('data-loaded', 'true');
      });
    });

    it('integrates with CentralGuestList component correctly', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      // Switch to guest list view
      await waitFor(() => {
        const guestListButton = screen.getByRole('button', { name: /guest list/i });
        fireEvent.click(guestListButton);
      });

      // Verify CentralGuestList component receives and displays data
      await waitFor(() => {
        const guestListComponent = screen.getByTestId('central-guest-list');
        expect(guestListComponent).toBeInTheDocument();
        expect(guestListComponent).toHaveAttribute('data-loaded', 'true');
      });
    });
  });

  describe('Error Handling and Loading States', () => {
    it('handles loading state correctly', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      // Initially should show loading state
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();
      });
    });

    it('gracefully handles data fetch errors', async () => {
      // Mock an error response
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Failed to fetch' } })
          })
        })
      });

      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      });

      // Should not have thrown console errors
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Accessibility', () => {
    it('meets accessibility requirements', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby');
      });
    });

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPopup onClose={jest.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /metrics/i })).toHaveFocus();
    });
  });
});