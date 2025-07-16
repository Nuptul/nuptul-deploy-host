import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CentralGuestList from '@/components/guest/CentralGuestList';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'guest-1', email: 'guest@test.com' },
    profile: { role: 'guest', first_name: 'Guest', last_name: 'User' },
    loading: false
  })
}));

// Mock Supabase client with guest data
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: getGuestTableMockData(table),
            error: null
          }))
        })),
        order: jest.fn(() => Promise.resolve({
          data: getGuestTableMockData(table),
          error: null
        })),
        insert: jest.fn(() => Promise.resolve({ data: { id: 'new-guest-1' }, error: null })),
        update: jest.fn(() => Promise.resolve({ data: { id: 'guest-1' }, error: null })),
        delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'avatars/test.jpg' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } }))
      }))
    }
  }
}));

function getGuestTableMockData(table: string) {
  switch (table) {
    case 'guest_list':
    case 'profiles':
      return [
        {
          id: 'guest-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@test.com',
          role: 'guest',
          rsvp_status: 'confirmed',
          created_at: '2024-01-01',
          plus_one: true,
          dietary_restrictions: ['vegetarian'],
          phone: '+1234567890'
        },
        {
          id: 'guest-2', 
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@test.com',
          role: 'guest',
          rsvp_status: 'pending',
          created_at: '2024-01-02',
          plus_one: false,
          dietary_restrictions: [],
          phone: '+0987654321'
        }
      ];
    default:
      return [];
  }
}

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
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

describe('CentralGuestList Integration Tests', () => {
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
    it('renders guest list and loads data without console errors', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/guest list/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for data-loaded attribute
      await waitFor(() => {
        const guestListElement = screen.getByTestId('central-guest-list');
        expect(guestListElement).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays guest data correctly after loading', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('displays RSVP status badges correctly', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Functionality', () => {
    it('handles search input correctly', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search guests/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search guests/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('handles RSVP status filter', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/filter by status/i)).toBeInTheDocument();
      });

      const statusFilter = screen.getByText(/filter by status/i);
      await user.click(statusFilter);

      await user.click(screen.getByText(/confirmed/i));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('handles dietary restrictions filter', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/filter by diet/i)).toBeInTheDocument();
      });

      const dietFilter = screen.getByText(/filter by diet/i);
      await user.click(dietFilter);

      await user.click(screen.getByText(/vegetarian/i));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Guest Management Operations', () => {
    it('handles adding new guest', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add guest/i });
      await user.click(addButton);

      // Fill out the add guest form
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/first name/i), 'New');
      await user.type(screen.getByLabelText(/last name/i), 'Guest');
      await user.type(screen.getByLabelText(/email/i), 'new@test.com');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Verify success toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Guest added'));
      });
    });

    it('handles editing guest information', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click edit button for John Doe
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Modify the name
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Johnny');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify success toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Guest updated'));
      });
    });

    it('handles deleting guest', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click delete button for John Doe
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify success toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Guest deleted'));
      });
    });
  });

  describe('Data Export and Import', () => {
    it('handles guest list export', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should trigger export without errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles guest list import', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/import guests/i)).toBeInTheDocument();
      });

      // Should open import modal without errors
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Real-time Updates and Sync', () => {
    it('handles real-time guest updates', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('central-guest-list')).toHaveAttribute('data-loaded', 'true');
      });

      // Simulate real-time update
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('central-guest-list')).toHaveAttribute('data-updated', 'true');
      });
    });

    it('maintains component state during updates', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      // Set a search filter
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search guests/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search guests/i);
      await user.type(searchInput, 'John');

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        // Search input should maintain its value
        expect(searchInput).toHaveValue('John');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles data fetch errors gracefully', async () => {
      // Mock an error response
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: { message: 'Database error' } })
          })
        })
      });

      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error loading guests/i)).toBeInTheDocument();
      });

      // Should not have thrown console errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles empty guest list gracefully', async () => {
      // Mock empty response
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => Promise.resolve({ data: [], error: null })
        })
      }));

      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no guests found/i)).toBeInTheDocument();
      });

      expect(consoleError).not.toHaveBeenCalled();
    });

    it('validates guest form inputs correctly', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      // Open add guest form
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add guest/i });
        fireEvent.click(addButton);
      });

      // Try to submit without required fields
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Performance', () => {
    it('meets accessibility requirements', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        const guestList = screen.getByRole('table');
        expect(guestList).toHaveAttribute('aria-label');
        
        const searchInput = screen.getByPlaceholderText(/search guests/i);
        expect(searchInput).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <CentralGuestList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search guests/i)).toBeInTheDocument();
      });

      // Test tab navigation through the interface
      await user.tab();
      expect(screen.getByPlaceholderText(/search guests/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /add guest/i })).toHaveFocus();
    });
  });
});