import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeddingEvents, useRSVPs, usePhotos, useMessages } from '../useWeddingData';
import { createMockSupabaseClient, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper, mockUser } from '../../test-utils';
import { weddingEventFactory, rsvpFactory, photoFactory, messageFactory } from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Wedding Data Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('useWeddingEvents', () => {
    const mockEvents = [
      weddingEventFactory({
        id: 'event-1',
        title: 'Wedding Ceremony',
        event_date: '2025-10-05T15:00:00Z',
        is_main_event: true,
      }),
      weddingEventFactory({
        id: 'event-2',
        title: 'Reception',
        event_date: '2025-10-05T18:00:00Z',
        is_main_event: false,
      }),
    ];

    beforeEach(() => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'wedding_events') {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockEvents)),
          };
        }
        return mockSupabase.from();
      });
    });

    it('should fetch events successfully', async () => {
      const { result } = renderHook(() => useWeddingEvents(), {
        wrapper: createHookWrapper(),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(2);
      expect(result.current.events[0].title).toBe('Wedding Ceremony');
      expect(result.current.events[1].title).toBe('Reception');
      expect(mockSupabase.from).toHaveBeenCalledWith('wedding_events');
    });

    it('should handle fetch errors gracefully', async () => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'wedding_events') {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.databaseError()),
          };
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useWeddingEvents(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual([]);
    });

    it('should refetch events when refetch is called', async () => {
      const { result } = renderHook(() => useWeddingEvents(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('wedding_events');
    });
  });

  describe('useRSVPs', () => {
    const mockRSVPs = [
      rsvpFactory({
        id: 'rsvp-1',
        user_id: 'user-1',
        event_id: 'event-1',
        status: 'attending',
        guest_count: 2,
      }),
      rsvpFactory({
        id: 'rsvp-2',
        user_id: 'user-2',
        event_id: 'event-1',
        status: 'not_attending',
        guest_count: 1,
      }),
    ];

    beforeEach(() => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'rsvps') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
            update: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(null)),
            // Default to returning all RSVPs
            then: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockRSVPs)),
          };
        }
        return mockSupabase.from();
      });
    });

    it('should fetch all RSVPs when no userId provided', async () => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'rsvps') {
          const mockQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
          // Mock the final promise resolution
          (mockQuery as any).then = jest.fn();
          (mockQuery as any).catch = jest.fn();
          Object.setPrototypeOf(mockQuery, Promise.prototype);
          Promise.resolve(mockScenarios.successfulFetch(mockRSVPs)).then(result => {
            if ((mockQuery as any).then.mock.calls.length > 0) {
              (mockQuery as any).then.mock.calls[0][0](result);
            }
          });
          return mockQuery;
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useRSVPs(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.rsvps).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('rsvps');
    });

    it('should filter RSVPs by userId when provided', async () => {
      const userRSVPs = [mockRSVPs[0]]; // Only first RSVP

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'rsvps') {
          const mockQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
          
          // Mock promise resolution
          (mockQuery as any).then = jest.fn();
          (mockQuery as any).catch = jest.fn();
          Object.setPrototypeOf(mockQuery, Promise.prototype);
          Promise.resolve(mockScenarios.successfulFetch(userRSVPs)).then(result => {
            if ((mockQuery as any).then.mock.calls.length > 0) {
              (mockQuery as any).then.mock.calls[0][0](result);
            }
          });
          
          return mockQuery;
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useRSVPs('user-1'), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.rsvps).toHaveLength(1);
      expect(result.current.rsvps[0].user_id).toBe('user-1');
    });

    it('should submit new RSVP successfully', async () => {
      // Mock no existing RSVP
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'rsvps') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(null)),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
            // For refetch after submit
            then: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockRSVPs)),
          };
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useRSVPs(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP('event-1', 'attending', 2, 'No restrictions', 'Excited!');
      });

      expect(submitResult).toEqual({ success: true });
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        event_id: 'event-1',
        status: 'attending',
        guest_count: 2,
        dietary_restrictions: 'No restrictions',
        message: 'Excited!',
      });
    });

    it('should update existing RSVP', async () => {
      const existingRSVP = { id: 'existing-rsvp-id' };

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'rsvps') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(existingRSVP)),
            update: jest.fn().mockReturnThis(),
            // Mock the update completion
            then: jest.fn((callback) => {
              if (callback) callback(mockScenarios.successfulFetch([]));
              return Promise.resolve(mockScenarios.successfulFetch(mockRSVPs));
            }),
          };
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useRSVPs(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP('event-1', 'not_attending');
      });

      expect(submitResult).toEqual({ success: true });
    });

    it('should handle authentication error during RSVP submission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useRSVPs(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP('event-1', 'attending');
      });

      expect(submitResult.error).toBeDefined();
      expect(submitResult.error.message).toBe('Not authenticated');
    });
  });

  describe('usePhotos', () => {
    const mockPhotos = [
      photoFactory({
        id: 'photo-1',
        user_id: 'user-1',
        title: 'Beautiful sunset',
        file_url: 'https://example.com/photo1.jpg',
        profiles: { display_name: 'John Doe' },
        photo_likes: [{ id: 'like-1', user_id: 'user-2' }],
        photo_comments: [],
      }),
    ];

    beforeEach(() => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'photos') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockPhotos)),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
          };
        }
        if (tableName === 'photo_likes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(null)),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
            delete: jest.fn().mockReturnThis(),
          };
        }
        return mockSupabase.from();
      });
    });

    it('should fetch photos successfully', async () => {
      const { result } = renderHook(() => usePhotos(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.photos).toHaveLength(1);
      expect(result.current.photos[0].title).toBe('Beautiful sunset');
      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
    });

    it('should like a photo successfully', async () => {
      const { result } = renderHook(() => usePhotos(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likePhoto('photo-1');
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('photo_likes');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        photo_id: 'photo-1',
        user_id: mockUser.id,
      });
    });

    it('should unlike a photo successfully', async () => {
      const { result } = renderHook(() => usePhotos(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.unlikePhoto('photo-1', mockUser.id);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('photo_likes');
      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });

    it('should upload photo successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock storage
      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
          getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
        })),
      };

      const { result } = renderHook(() => usePhotos(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadPhoto(mockFile, 'Test Photo', 'Description');
      });

      expect(uploadResult).toEqual({ success: true });
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('wedding-photos');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        title: 'Test Photo',
        description: 'Description',
        file_url: 'https://example.com/test.jpg',
        file_path: expect.stringContaining(mockUser.id),
        file_size: mockFile.size,
        mime_type: mockFile.type,
        is_approved: true,
      });
    });

    it('should handle upload error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ error: new Error('Upload failed') }),
        })),
      };

      const { result } = renderHook(() => usePhotos(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadPhoto(mockFile);
      });

      expect(uploadResult.error).toBeDefined();
    });
  });

  describe('useMessages', () => {
    const mockMessages = [
      messageFactory({
        id: 'msg-1',
        user_id: 'user-1',
        content: 'Congratulations!',
        profiles: { display_name: 'John Doe' },
        message_likes: [],
      }),
    ];

    beforeEach(() => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'messages') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockMessages)),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
          };
        }
        if (tableName === 'message_likes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(null)),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
          };
        }
        return mockSupabase.from();
      });

      // Mock real-time subscription
      mockSupabase.channel.mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      });
    });

    it('should fetch messages successfully', async () => {
      const { result } = renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Congratulations!');
      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
    });

    it('should post message successfully', async () => {
      const { result } = renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let postResult;
      await act(async () => {
        postResult = await result.current.postMessage('Hello everyone!');
      });

      expect(postResult).toEqual({ success: true });
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        content: 'Hello everyone!',
        is_public: true,
        user_id: mockUser.id,
      });
    });

    it('should like message successfully', async () => {
      const { result } = renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.likeMessage('msg-1');
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('message_likes');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        message_id: 'msg-1',
        user_id: mockUser.id,
      });
    });

    it('should setup real-time subscription', async () => {
      renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      expect(mockSupabase.channel).toHaveBeenCalledWith('messages');
      expect(mockSupabase.channel().on).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        expect.any(Function)
      );
    });

    it('should cleanup subscription on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      mockSupabase.removeChannel = mockUnsubscribe;

      const { unmount } = renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle authentication error during post', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useMessages(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let postResult;
      await act(async () => {
        postResult = await result.current.postMessage('Test');
      });

      expect(postResult.error).toBeDefined();
      expect(postResult.error.message).toBe('Not authenticated');
    });
  });
});