import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from '@/components/admin/Analytics';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@test.com' },
    profile: { role: 'admin', first_name: 'Admin', last_name: 'User' },
    loading: false
  })
}));

// Mock chart libraries
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>
}));

// Mock Supabase client with analytics data
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: getTableMockData(table),
                error: null
              }))
            }))
          }))
        })),
        order: jest.fn(() => Promise.resolve({
          data: getTableMockData(table),
          error: null
        }))
      }))
    }))
  }
}));

function getTableMockData(table: string) {
  switch (table) {
    case 'messages':
      return [
        { id: 1, created_at: '2024-01-01', content: 'Hello', profiles: { first_name: 'John' } },
        { id: 2, created_at: '2024-01-02', content: 'Hi there', profiles: { first_name: 'Jane' } }
      ];
    case 'photos':
      return [
        { id: 1, created_at: '2024-01-01', file_name: 'photo1.jpg', profiles: { first_name: 'John' } },
        { id: 2, created_at: '2024-01-02', file_name: 'photo2.jpg', profiles: { first_name: 'Jane' } }
      ];
    case 'rsvps':
      return [
        { id: 1, created_at: '2024-01-01', rsvp_status: 'confirmed' },
        { id: 2, created_at: '2024-01-02', rsvp_status: 'declined' }
      ];
    case 'profiles':
      return [
        { id: 1, created_at: '2024-01-01', first_name: 'John', role: 'guest' },
        { id: 2, created_at: '2024-01-02', first_name: 'Jane', role: 'guest' }
      ];
    default:
      return [];
  }
}

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

describe('Analytics Integration Tests', () => {
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
    it('renders analytics dashboard and loads data without console errors', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/analytics/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for data-loaded attribute
      await waitFor(() => {
        const analyticsElement = screen.getByTestId('analytics-dashboard');
        expect(analyticsElement).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays all analytics sections after data loading', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/messages analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/photo analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/rsvp analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/user analytics/i)).toBeInTheDocument();
      });
    });

    it('renders charts correctly', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByTestId('line-chart')).toHaveLength(2); // Messages and photos over time
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument(); // RSVP status distribution
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument(); // User registration over time
      });
    });
  });

  describe('User Interactions', () => {
    it('handles date range filter interactions', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
      });

      const dateRangeSelect = screen.getByLabelText(/date range/i);
      await user.click(dateRangeSelect);

      // Select last 30 days
      await user.click(screen.getByText(/last 30 days/i));

      // Verify data is refreshed
      await waitFor(() => {
        const analyticsElement = screen.getByTestId('analytics-dashboard');
        expect(analyticsElement).toHaveAttribute('data-loaded', 'true');
      });
    });

    it('handles export functionality', async () => {
      render(
        <TestWrapper>
          <Analytics />
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

    it('handles metric card interactions', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        const metricCards = screen.getAllByTestId('metric-card');
        expect(metricCards.length).toBeGreaterThan(0);
      });

      const firstMetricCard = screen.getAllByTestId('metric-card')[0];
      await user.click(firstMetricCard);

      // Should show detailed view or drill-down
      await waitFor(() => {
        expect(screen.getByTestId('metric-detail-view')).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('integrates with multiple data sources correctly', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        // Verify data from messages table
        expect(screen.getByText(/2/)).toBeInTheDocument(); // Total messages
        
        // Verify data from photos table  
        expect(screen.getByText(/2/)).toBeInTheDocument(); // Total photos
        
        // Verify data from rsvps table
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/declined/i)).toBeInTheDocument();
        
        // Verify data from profiles table
        expect(screen.getByText(/2/)).toBeInTheDocument(); // Total users
      });
    });

    it('handles real-time data updates', async () => {
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toHaveAttribute('data-loaded', 'true');
      });

      // Simulate real-time update
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toHaveAttribute('data-updated', 'true');
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('handles large datasets efficiently', async () => {
      // Mock large dataset
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockImplementation((table: string) => ({
        select: () => ({
          eq: () => ({
            gte: () => ({
              lte: () => ({
                order: () => Promise.resolve({
                  data: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    created_at: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
                    ...getTableMockData(table)[0]
                  })),
                  error: null
                })
              })
            })
          }),
          order: () => Promise.resolve({
            data: Array.from({ length: 1000 }, (_, i) => ({
              id: i,
              created_at: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
              ...getTableMockData(table)[0]
            })),
            error: null
          })
        })
      }));

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 10000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large datasets within reasonable time (< 3 seconds)
      expect(renderTime).toBeLessThan(3000);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('properly cleans up resources on unmount', async () => {
      const { unmount } = render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should not cause memory leaks or errors
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles data fetch errors gracefully', async () => {
      // Mock an error response
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            gte: () => ({
              lte: () => ({
                order: () => Promise.resolve({ data: null, error: { message: 'Database error' } })
              })
            })
          })
        })
      });

      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error loading analytics/i)).toBeInTheDocument();
      });

      // Should not have thrown console errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles empty dataset gracefully', async () => {
      // Mock empty responses
      const mockSupabase = require('@/integrations/supabase/client').supabase;
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            gte: () => ({
              lte: () => ({
                order: () => Promise.resolve({ data: [], error: null })
              })
            })
          }),
          order: () => Promise.resolve({ data: [], error: null })
        })
      }));

      render(
        <TestWrapper>
          <Analytics />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
      });

      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});