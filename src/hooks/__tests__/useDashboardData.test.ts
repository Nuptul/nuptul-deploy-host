import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';
import { createMockSupabaseClient, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper } from '../../test-utils';
import { 
  profileFactory, 
  rsvpFactory, 
  photoFactory, 
  chatMessageFactory 
} from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useDashboardData', () => {
  const mockProfiles = [
    profileFactory({ id: 'profile-1', first_name: 'John', last_name: 'Doe' }),
    profileFactory({ id: 'profile-2', first_name: 'Jane', last_name: 'Smith' }),
  ];

  const mockRSVPs = [
    rsvpFactory({ id: 'rsvp-1', status: 'attending', guest_count: 2 }),
    rsvpFactory({ id: 'rsvp-2', status: 'not_attending', guest_count: 1 }),
  ];

  const mockPhotos = [
    photoFactory({ id: 'photo-1', file_url: 'https://example.com/photo1.jpg' }),
    photoFactory({ id: 'photo-2', file_url: 'https://example.com/photo2.jpg' }),
  ];

  const mockMessages = [
    chatMessageFactory({ id: 'msg-1', content: 'Hello!' }),
    chatMessageFactory({ id: 'msg-2', content: 'Welcome!' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock different table responses
    mockSupabase.from.mockImplementation((tableName: string) => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
      };

      switch (tableName) {
        case 'profiles':
          mockQuery.select.mockResolvedValue(mockScenarios.successfulFetch(mockProfiles));
          mockQuery.count.mockResolvedValue({ count: mockProfiles.length, error: null });
          return mockQuery;
        case 'rsvps':
          mockQuery.select.mockResolvedValue(mockScenarios.successfulFetch(mockRSVPs));
          mockQuery.count.mockResolvedValue({ count: mockRSVPs.length, error: null });
          return mockQuery;
        case 'photo_gallery':
          mockQuery.select.mockResolvedValue(mockScenarios.successfulFetch(mockPhotos));
          mockQuery.count.mockResolvedValue({ count: mockPhotos.length, error: null });
          return mockQuery;
        case 'chat_messages':
          mockQuery.select.mockResolvedValue(mockScenarios.successfulFetch(mockMessages));
          mockQuery.count.mockResolvedValue({ count: mockMessages.length, error: null });
          return mockQuery;
        default:
          mockQuery.select.mockResolvedValue(mockScenarios.emptyResponse());
          mockQuery.count.mockResolvedValue({ count: 0, error: null });
          return mockQuery;
      }
    });
  });

  it('should fetch dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that data was loaded
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();

    // Verify supabase calls were made
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from).toHaveBeenCalledWith('rsvps');
    expect(mockSupabase.from).toHaveBeenCalledWith('photo_gallery');
    expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
  });

  it('should handle fetch errors gracefully', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockResolvedValue(mockScenarios.databaseError()),
    }));

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('should handle empty data responses', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockResolvedValue({ count: 0, error: null }),
    }));

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should provide refetch functionality', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Call refetch
    if (result.current.refetch) {
      await result.current.refetch();
    }

    // Should make API calls again
    expect(mockSupabase.from).toHaveBeenCalled();
  });

  it('should maintain data integrity during multiple fetches', async () => {
    const { result, rerender } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstData = result.current.data;

    // Rerender component
    rerender();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Data should be consistent
    expect(result.current.data).toEqual(firstData);
  });

  it('should handle partial data failures', async () => {
    let callCount = 0;
    mockSupabase.from.mockImplementation((tableName: string) => {
      callCount++;
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        count: jest.fn(),
      };

      // First call succeeds, second fails
      if (callCount === 1) {
        mockQuery.count.mockResolvedValue({ count: 5, error: null });
      } else {
        mockQuery.count.mockResolvedValue(mockScenarios.databaseError());
      }

      return mockQuery;
    });

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle partial failure gracefully
    expect(result.current.error).toBeTruthy();
  });

  it('should have correct initial loading state', () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should clean up properly on unmount', () => {
    const { unmount } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    expect(() => unmount()).not.toThrow();
  });

  it('should handle concurrent data fetches', async () => {
    const { result: result1 } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    const { result: result2 } = renderHook(() => useDashboardData(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    // Both hooks should have consistent data
    expect(result1.current.data).toEqual(result2.current.data);
    expect(result1.current.error).toEqual(result2.current.error);
  });
});