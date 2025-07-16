import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RSVPIntegration from '@/components/guest/RSVPIntegration';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'guest-1', email: 'guest@test.com' },
    profile: { 
      id: 'guest-1',
      role: 'guest', 
      first_name: 'Guest', 
      last_name: 'User',
      email: 'guest@test.com',
      phone: '+1234567890'
    },
    loading: false
  })
}));

// Mock Supabase client with RSVP data
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: getRSVPTableMockData(table),
            error: null
          })),
          order: jest.fn(() => Promise.resolve({
            data: Array.isArray(getRSVPTableMockData(table)) 
              ? getRSVPTableMockData(table) 
              : [getRSVPTableMockData(table)],
            error: null
          }))
        })),
        order: jest.fn(() => Promise.resolve({
          data: Array.isArray(getRSVPTableMockData(table)) 
            ? getRSVPTableMockData(table) 
            : [getRSVPTableMockData(table)],
          error: null
        })),
        insert: jest.fn(() => Promise.resolve({ 
          data: { id: 'new-rsvp-1', guest_id: 'guest-1' }, 
          error: null 
        })),
        update: jest.fn(() => Promise.resolve({ 
          data: { id: 'rsvp-1', guest_id: 'guest-1' }, 
          error: null 
        })),
        upsert: jest.fn(() => Promise.resolve({ 
          data: { id: 'rsvp-1', guest_id: 'guest-1' }, 
          error: null 
        }))
      }))
    }))
  }
}));

function getRSVPTableMockData(table: string) {
  switch (table) {
    case 'rsvps':
      return {
        id: 'rsvp-1',
        guest_id: 'guest-1',
        rsvp_status: 'pending',
        plus_one_name: '',
        plus_one_email: '',
        dietary_needs: [],
        allergies: [],
        special_requests: '',
        additional_guests: [],
        contact_updates: {
          phone: '+1234567890',
          address: '123 Main St',
          emergency_contact: 'Emergency Contact'
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
    case 'rsvp_history':
      return [
        {
          id: 'history-1',
          rsvp_id: 'rsvp-1',
          action: 'created',
          old_status: null,
          new_status: 'pending',
          changed_at: '2024-01-01',
          changed_by: 'guest-1'
        }
      ];
    case 'guest_communications':
      return [
        {
          id: 'comm-1',
          guest_id: 'guest-1',
          type: 'rsvp_reminder',
          subject: 'RSVP Reminder',
          message: 'Please complete your RSVP',
          sent_at: '2024-01-01',
          status: 'sent'
        }
      ];
    case 'wedding_events':
      return [
        {
          id: 'event-1',
          name: 'Wedding Ceremony',
          date: '2024-06-15',
          time: '15:00',
          location: 'Church of St. Mary',
          description: 'Wedding ceremony'
        },
        {
          id: 'event-2',
          name: 'Reception',
          date: '2024-06-15',
          time: '18:00',
          location: 'Grand Ballroom',
          description: 'Wedding reception'
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

describe('RSVPIntegration Integration Tests', () => {
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
    it('renders RSVP form and loads data without console errors', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/rsvp/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for data-loaded attribute
      await waitFor(() => {
        const rsvpElement = screen.getByTestId('rsvp-integration');
        expect(rsvpElement).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays wedding events correctly', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Wedding Ceremony')).toBeInTheDocument();
        expect(screen.getByText('Reception')).toBeInTheDocument();
        expect(screen.getByText('Church of St. Mary')).toBeInTheDocument();
        expect(screen.getByText('Grand Ballroom')).toBeInTheDocument();
      });
    });

    it('pre-fills form with existing RSVP data', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      });
    });
  });

  describe('RSVP Form Functionality', () => {
    it('handles RSVP status selection', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/will you attend/i)).toBeInTheDocument();
      });

      // Select "Yes, I will attend"
      const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
      await user.click(attendYesButton);

      await waitFor(() => {
        expect(attendYesButton).toHaveClass('selected');
      });

      // Select "No, I cannot attend"
      const attendNoButton = screen.getByRole('button', { name: /no.*cannot/i });
      await user.click(attendNoButton);

      await waitFor(() => {
        expect(attendNoButton).toHaveClass('selected');
        expect(attendYesButton).not.toHaveClass('selected');
      });
    });

    it('handles plus-one information entry', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // First select attending
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      // Enable plus-one
      await waitFor(() => {
        const plusOneCheckbox = screen.getByLabelText(/bringing.*plus.*one/i);
        fireEvent.click(plusOneCheckbox);
      });

      // Fill plus-one details
      await waitFor(() => {
        expect(screen.getByLabelText(/plus.*one.*name/i)).toBeInTheDocument();
      });

      const plusOneNameInput = screen.getByLabelText(/plus.*one.*name/i);
      const plusOneEmailInput = screen.getByLabelText(/plus.*one.*email/i);

      await user.type(plusOneNameInput, 'Jane Doe');
      await user.type(plusOneEmailInput, 'jane@test.com');

      expect(plusOneNameInput).toHaveValue('Jane Doe');
      expect(plusOneEmailInput).toHaveValue('jane@test.com');
    });

    it('handles dietary requirements selection', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dietary requirements/i)).toBeInTheDocument();
      });

      // Select dietary options
      const vegetarianOption = screen.getByLabelText(/vegetarian/i);
      const glutenFreeOption = screen.getByLabelText(/gluten.*free/i);

      await user.click(vegetarianOption);
      await user.click(glutenFreeOption);

      expect(vegetarianOption).toBeChecked();
      expect(glutenFreeOption).toBeChecked();
    });

    it('handles special requests input', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/special requests/i)).toBeInTheDocument();
      });

      const specialRequestsInput = screen.getByLabelText(/special requests/i);
      await user.type(specialRequestsInput, 'Wheelchair accessible seating please');

      expect(specialRequestsInput).toHaveValue('Wheelchair accessible seating please');
    });
  });

  describe('Form Submission and Validation', () => {
    it('validates required fields before submission', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit.*rsvp/i })).toBeInTheDocument();
      });

      // Try to submit without selecting attendance status
      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select.*attendance/i)).toBeInTheDocument();
      });
    });

    it('submits RSVP successfully', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Fill out the form
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      // Add dietary requirement
      await waitFor(() => {
        const vegetarianOption = screen.getByLabelText(/vegetarian/i);
        fireEvent.click(vegetarianOption);
      });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      // Verify success toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('RSVP submitted'));
      });
    });

    it('handles form update for existing RSVP', async () => {
      // Mock existing RSVP
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockImplementation((table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: { 
                ...getRSVPTableMockData('rsvps'), 
                rsvp_status: 'confirmed',
                dietary_needs: ['vegetarian']
              },
              error: null
            })
          })
        }),
        update: () => Promise.resolve({ 
          data: { id: 'rsvp-1', rsvp_status: 'confirmed' }, 
          error: null 
        })
      }));

      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/update.*rsvp/i)).toBeInTheDocument();
      });

      // Change dietary requirements
      const glutenFreeOption = screen.getByLabelText(/gluten.*free/i);
      await user.click(glutenFreeOption);

      // Submit update
      const updateButton = screen.getByRole('button', { name: /update.*rsvp/i });
      await user.click(updateButton);

      // Verify success toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('RSVP updated'));
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('integrates with RSVP history tracking', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-history')).toBeInTheDocument();
      });

      // Should display RSVP history
      await waitFor(() => {
        expect(screen.getByText(/rsvp created/i)).toBeInTheDocument();
      });
    });

    it('integrates with guest communications', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-communications')).toBeInTheDocument();
      });

      // Should display communication history
      await waitFor(() => {
        expect(screen.getByText('RSVP Reminder')).toBeInTheDocument();
      });
    });

    it('handles real-time RSVP status updates', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-integration')).toHaveAttribute('data-loaded', 'true');
      });

      // Simulate real-time update
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-integration')).toHaveAttribute('data-updated', 'true');
      });
    });
  });

  describe('Contact Information Management', () => {
    it('handles contact information updates', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/phone/i);
      const addressInput = screen.getByLabelText(/address/i);

      // Update contact info
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1987654321');

      await user.clear(addressInput);
      await user.type(addressInput, '456 Oak Street');

      expect(phoneInput).toHaveValue('+1987654321');
      expect(addressInput).toHaveValue('456 Oak Street');
    });

    it('validates phone number format', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, 'invalid-phone');

      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
      });
    });

    it('validates email format for plus-one', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Select attending and enable plus-one
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      await waitFor(() => {
        const plusOneCheckbox = screen.getByLabelText(/bringing.*plus.*one/i);
        fireEvent.click(plusOneCheckbox);
      });

      // Enter invalid email
      await waitFor(() => {
        const plusOneEmailInput = screen.getByLabelText(/plus.*one.*email/i);
        fireEvent.change(plusOneEmailInput, { target: { value: 'invalid-email' } });
      });

      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles submission errors gracefully', async () => {
      // Mock submission error
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: getRSVPTableMockData('rsvps'), error: null })
          })
        }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Submission failed' } })
      }));

      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Fill and submit form
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      // Verify error toast
      const toast = require('sonner').toast;
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('failed'));
      });
    });

    it('handles loading state during submission', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Fill form
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      const submitButton = screen.getByRole('button', { name: /submit.*rsvp/i });
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      });
    });

    it('recovers from network errors', async () => {
      // Mock network error then success
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => {
              callCount++;
              if (callCount === 1) {
                return Promise.reject(new Error('Network error'));
              }
              return Promise.resolve({ data: getRSVPTableMockData('rsvps'), error: null });
            }
          })
        })
      }));

      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText(/error.*loading/i)).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-integration')).toHaveAttribute('data-loaded', 'true');
      });
    });
  });

  describe('Accessibility and Performance', () => {
    it('meets accessibility requirements', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        const form = screen.getByRole('form');
        expect(form).toHaveAttribute('aria-label');
        
        const fieldsets = screen.getAllByRole('group');
        fieldsets.forEach(fieldset => {
          expect(fieldset).toHaveAttribute('aria-labelledby');
        });
      });
    });

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes.*attend/i })).toBeInTheDocument();
      });

      // Test tab navigation through form elements
      await user.tab();
      expect(screen.getByRole('button', { name: /yes.*attend/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /no.*cannot/i })).toHaveFocus();
    });

    it('provides proper focus management', async () => {
      render(
        <TestWrapper>
          <RSVPIntegration />
        </TestWrapper>
      );

      // Enable plus-one section
      await waitFor(() => {
        const attendYesButton = screen.getByRole('button', { name: /yes.*attend/i });
        fireEvent.click(attendYesButton);
      });

      const plusOneCheckbox = screen.getByLabelText(/bringing.*plus.*one/i);
      await user.click(plusOneCheckbox);

      // Focus should move to plus-one name field
      await waitFor(() => {
        expect(screen.getByLabelText(/plus.*one.*name/i)).toHaveFocus();
      });
    });
  });
});