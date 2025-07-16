import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeddingDetails, WeddingDetails, WeddingDetailsInput } from '../useWeddingDetails';
import { createMockSupabaseClient, mockScenarios } from '../../../__mocks__/supabase';
import { createHookWrapper } from '../../../test-utils';
import { createMockData } from '../../../__mocks__/supabase';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('useWeddingDetails', () => {
  const mockWeddingDetails: WeddingDetails[] = [
    {
      ...createMockData(),
      id: 'details-1',
      wedding_id: 'wedding-1',
      ceremony_date: '2025-10-05',
      ceremony_time: '15:00',
      ceremony_venue: 'St. Mary\'s Cathedral',
      ceremony_address: '123 Church St, City',
      reception_venue: 'Grand Ballroom',
      dress_code: 'Formal',
      theme: 'Rustic Elegance',
      budget: 50000,
      guest_count: 150,
      plus_ones_allowed: true,
      rsvp_deadline: '2025-09-05',
      hashtag: '#TimAndKirsten',
    } as WeddingDetails,
    {
      ...createMockData(),
      id: 'details-2',
      wedding_id: 'wedding-2',
      ceremony_date: '2025-11-15',
      ceremony_venue: 'Beach Resort',
      theme: 'Beach Wedding',
      budget: 30000,
      guest_count: 75,
    } as WeddingDetails,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabase.from.mockImplementation((tableName: string) => {
      if (tableName === 'wedding_details') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          single: jest.fn(),
        };
      }
      return mockSupabase.from();
    });

    // Mock channel subscription
    mockSupabase.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    });
  });

  describe('fetchWeddingDetails', () => {
    it('should fetch all wedding details successfully', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.weddingDetails).toHaveLength(2);
      expect(result.current.weddingDetails[0].ceremony_venue).toBe('St. Mary\'s Cathedral');
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('wedding_details');
    });

    it('should fetch wedding details filtered by wedding ID', async () => {
      const filteredDetails = [mockWeddingDetails[0]];
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(filteredDetails));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.fetchWeddingDetails('wedding-1');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.weddingDetails).toHaveLength(1);
      expect(result.current.currentDetails).toEqual(filteredDetails[0]);
      expect(result.current.weddingDetails[0].wedding_id).toBe('wedding-1');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('wedding_id', 'wedding-1');
    });

    it('should handle fetch errors', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.weddingDetails).toEqual([]);
    });

    it('should handle empty results', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.emptyResponse());

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.weddingDetails).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createWeddingDetails', () => {
    const newDetailsInput: WeddingDetailsInput = {
      wedding_id: 'wedding-new',
      ceremony_date: '2025-12-20',
      ceremony_venue: 'New Venue',
      budget: 40000,
      guest_count: 100,
    };

    it('should create wedding details successfully', async () => {
      const createdDetails = { ...mockWeddingDetails[0], ...newDetailsInput, id: 'new-details-id' };
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(createdDetails));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      let createdResult;
      await act(async () => {
        createdResult = await result.current.createWeddingDetails(newDetailsInput);
      });

      expect(createdResult).toEqual(createdDetails);
      expect(result.current.weddingDetails).toContain(createdDetails);
      expect(result.current.currentDetails).toEqual(createdDetails);
      expect(mockSupabase.from).toHaveBeenCalledWith('wedding_details');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([
        expect.objectContaining({
          ...newDetailsInput,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      ]);
    });

    it('should handle create errors', async () => {
      mockSupabase.from().single.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      let createdResult;
      await act(async () => {
        createdResult = await result.current.createWeddingDetails(newDetailsInput);
      });

      expect(createdResult).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('updateWeddingDetails', () => {
    const updateData = {
      ceremony_venue: 'Updated Venue',
      budget: 60000,
    };

    beforeEach(() => {
      // Setup initial state
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));
    });

    it('should update wedding details successfully', async () => {
      const updatedDetails = { ...mockWeddingDetails[0], ...updateData };
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(updatedDetails));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // First fetch the initial data
      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      // Then update
      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateWeddingDetails('details-1', updateData);
      });

      expect(updateResult).toEqual(updatedDetails);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updated_at: expect.any(String),
        })
      );
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'details-1');
    });

    it('should update current details when updating current item', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Set up current details
      await act(async () => {
        await result.current.fetchWeddingDetails('wedding-1');
      });

      const updatedDetails = { ...mockWeddingDetails[0], ...updateData };
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(updatedDetails));

      await act(async () => {
        await result.current.updateWeddingDetails('details-1', updateData);
      });

      expect(result.current.currentDetails).toEqual(updatedDetails);
    });

    it('should handle update errors', async () => {
      mockSupabase.from().single.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateWeddingDetails('details-1', updateData);
      });

      expect(updateResult).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('deleteWeddingDetails', () => {
    beforeEach(() => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));
    });

    it('should delete wedding details successfully', async () => {
      mockSupabase.from().delete.mockResolvedValue(mockScenarios.successfulFetch([]));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // First fetch the initial data
      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteWeddingDetails('details-1');
      });

      expect(deleteResult).toBe(true);
      expect(result.current.weddingDetails).not.toContain(
        expect.objectContaining({ id: 'details-1' })
      );
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'details-1');
    });

    it('should clear current details when deleting current item', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Set up current details
      await act(async () => {
        await result.current.fetchWeddingDetails('wedding-1');
      });

      mockSupabase.from().delete.mockResolvedValue(mockScenarios.successfulFetch([]));

      await act(async () => {
        await result.current.deleteWeddingDetails('details-1');
      });

      expect(result.current.currentDetails).toBeNull();
    });

    it('should handle delete errors', async () => {
      mockSupabase.from().delete.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteWeddingDetails('details-1');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('subscribeToWeddingDetails', () => {
    it('should setup real-time subscription', () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      const unsubscribe = result.current.subscribeToWeddingDetails('wedding-1');

      expect(mockSupabase.channel).toHaveBeenCalledWith('wedding_details_wedding-1');
      expect(mockSupabase.channel().on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wedding_details',
          filter: 'wedding_id=eq.wedding-1',
        },
        expect.any(Function)
      );

      // Test unsubscribe
      unsubscribe();
      expect(mockSupabase.channel().unsubscribe).toHaveBeenCalled();
    });

    it('should handle real-time INSERT events', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Setup subscription and capture the callback
      let realtimeCallback: any;
      mockSupabase.channel().on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase.channel();
      });

      result.current.subscribeToWeddingDetails('wedding-1');

      // Simulate INSERT event
      const newDetails = { ...mockWeddingDetails[0], id: 'new-insert-id' };
      await act(async () => {
        realtimeCallback({
          eventType: 'INSERT',
          new: newDetails,
          old: null,
        });
      });

      expect(result.current.weddingDetails).toContain(newDetails);
    });

    it('should handle real-time UPDATE events', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Setup initial data
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));
      await act(async () => {
        await result.current.fetchWeddingDetails('wedding-1');
      });

      // Setup subscription
      let realtimeCallback: any;
      mockSupabase.channel().on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase.channel();
      });

      result.current.subscribeToWeddingDetails('wedding-1');

      // Simulate UPDATE event
      const updatedDetails = { ...mockWeddingDetails[0], ceremony_venue: 'Updated Venue' };
      await act(async () => {
        realtimeCallback({
          eventType: 'UPDATE',
          new: updatedDetails,
          old: mockWeddingDetails[0],
        });
      });

      const foundItem = result.current.weddingDetails.find(item => item.id === updatedDetails.id);
      expect(foundItem?.ceremony_venue).toBe('Updated Venue');
    });

    it('should handle real-time DELETE events', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Setup initial data
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));
      await act(async () => {
        await result.current.fetchWeddingDetails('wedding-1');
      });

      // Setup subscription
      let realtimeCallback: any;
      mockSupabase.channel().on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase.channel();
      });

      result.current.subscribeToWeddingDetails('wedding-1');

      // Simulate DELETE event
      await act(async () => {
        realtimeCallback({
          eventType: 'DELETE',
          new: null,
          old: mockWeddingDetails[0],
        });
      });

      expect(result.current.weddingDetails).not.toContain(
        expect.objectContaining({ id: mockWeddingDetails[0].id })
      );
    });
  });

  describe('utility methods', () => {
    it('should refresh wedding details', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.refreshWeddingDetails();
      });

      expect(result.current.weddingDetails).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('wedding_details');
    });

    it('should clear cache', () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // Set some initial state
      act(() => {
        result.current.clearCache();
      });

      expect(result.current.weddingDetails).toEqual([]);
      expect(result.current.currentDetails).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('loading states', () => {
    it('should manage loading state during fetch', async () => {
      let resolvePromise: any;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockSupabase.from().order.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      act(() => {
        result.current.fetchWeddingDetails();
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        resolvePromise(mockScenarios.successfulFetch(mockWeddingDetails));
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should manage loading state during create', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      const createPromise = act(async () => {
        await result.current.createWeddingDetails({
          wedding_id: 'test',
          ceremony_venue: 'Test Venue',
        });
      });

      expect(result.current.loading).toBe(true);

      await createPromise;

      expect(result.current.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error on successful operations', async () => {
      const { result } = renderHook(() => useWeddingDetails(), {
        wrapper: createHookWrapper(),
      });

      // First, cause an error
      mockSupabase.from().order.mockResolvedValue(mockScenarios.databaseError());
      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      expect(result.current.error).toBeTruthy();

      // Then, perform a successful operation
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockWeddingDetails));
      await act(async () => {
        await result.current.fetchWeddingDetails();
      });

      expect(result.current.error).toBeNull();
    });
  });
});