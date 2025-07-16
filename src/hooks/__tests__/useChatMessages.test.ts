import { renderHook, waitFor, act } from '@testing-library/react';
import { useChatMessages } from '../useChatMessages';
import { createMockSupabaseClient, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper, mockUser } from '../../test-utils';
import { chatMessageFactory, profileFactory } from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the auth hook
jest.mock('../useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('useChatMessages', () => {
  const mockChatId = 'test-chat-id';
  const mockMessages = [
    chatMessageFactory({
      id: 'msg-1',
      chat_id: mockChatId,
      user_id: 'user-1',
      content: 'Hello!',
      created_at: new Date('2023-01-01T10:00:00Z').toISOString(),
    }),
    chatMessageFactory({
      id: 'msg-2',
      chat_id: mockChatId,
      user_id: 'user-2',
      content: 'Hi there!',
      created_at: new Date('2023-01-01T10:01:00Z').toISOString(),
    }),
  ];

  const mockProfiles = [
    profileFactory({
      user_id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'John Doe',
    }),
    profileFactory({
      user_id: 'user-2',
      first_name: 'Jane',
      last_name: 'Smith',
      display_name: 'Jane Smith',
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockSupabase.from.mockImplementation((tableName: string) => {
      if (tableName === 'chat_messages') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          neq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockMessages)),
        };
      }
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockProfiles)),
        };
      }
      if (tableName === 'direct_chats') {
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
        };
      }
      return mockSupabase.from();
    });

    // Mock channel subscription
    mockSupabase.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    });
  });

  describe('fetchMessages', () => {
    it('should fetch messages successfully with profiles', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Hello!');
      expect(result.current.messages[0].profiles?.display_name).toBe('John Doe');
      expect(result.current.messages[1].content).toBe('Hi there!');
      expect(result.current.messages[1].profiles?.display_name).toBe('Jane Smith');
      expect(result.current.error).toBeNull();
    });

    it('should handle empty chat ID', async () => {
      const { result } = renderHook(() => useChatMessages(null), {
        wrapper: createHookWrapper(),
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'chat_messages') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.databaseError()),
          };
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });

    it('should handle messages without profiles', async () => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'chat_messages') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockMessages)),
          };
        }
        if (tableName === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue(mockScenarios.emptyResponse()),
          };
        }
        return mockSupabase.from();
      });

      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].profiles).toBeUndefined();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'chat_messages') {
          return {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockMessages)),
          };
        }
        if (tableName === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue(mockScenarios.successfulFetch(mockProfiles)),
          };
        }
        if (tableName === 'direct_chats') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue(mockScenarios.successfulFetch([])),
          };
        }
        return mockSupabase.from();
      });
    });

    it('should send text message successfully', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage({ content: 'New message' });
      });

      expect(result.current.sending).toBe(false);
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        chat_id: mockChatId,
        user_id: mockUser.id,
        content: 'New message',
        media_url: null,
        media_type: null,
        media_thumbnail: null,
      });
    });

    it('should send file message successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock storage upload
      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ error: null }),
          getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
        })),
      };

      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage({ file: mockFile });
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('direct-chats');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        chat_id: mockChatId,
        user_id: mockUser.id,
        content: null,
        media_url: 'https://example.com/test.jpg',
        media_type: 'image',
        media_thumbnail: null,
      });
    });

    it('should handle video file upload', async () => {
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      
      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ error: null }),
          getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.mp4' } })),
        })),
      };

      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage({ file: mockFile });
      });

      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        chat_id: mockChatId,
        user_id: mockUser.id,
        content: null,
        media_url: 'https://example.com/test.mp4',
        media_type: 'video',
        media_thumbnail: 'https://example.com/test.mp4', // For videos, thumbnail is same as media_url
      });
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ error: new Error('Upload failed') }),
        })),
      };

      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.sendMessage({ file: mockFile });
        })
      ).rejects.toThrow('Upload failed');
    });

    it('should throw error for missing chat ID', async () => {
      const { result } = renderHook(() => useChatMessages(null), {
        wrapper: createHookWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.sendMessage({ content: 'Test' });
        })
      ).rejects.toThrow('Chat ID and user required');
    });

    it('should throw error for empty message', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.sendMessage({});
        })
      ).rejects.toThrow('Message content or file required');
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.markAsRead();
      });

      expect(mockSupabase.from().update).toHaveBeenCalledWith({ is_read: true });
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('chat_id', mockChatId);
      expect(mockSupabase.from().neq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('is_read', false);
    });

    it('should handle null chat ID', async () => {
      const { result } = renderHook(() => useChatMessages(null), {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.markAsRead();
      });

      // Should not call supabase when chat ID is null
      expect(mockSupabase.from().update).not.toHaveBeenCalled();
    });
  });

  describe('getMessageSenderName', () => {
    it('should return "You" for current user messages', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const userMessage = {
        ...chatMessageFactory(),
        user_id: mockUser.id,
      };

      const senderName = result.current.getMessageSenderName(userMessage);
      expect(senderName).toBe('You');
    });

    it('should return display name for other users', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const otherUserMessage = {
        ...chatMessageFactory(),
        user_id: 'other-user',
        profiles: {
          display_name: 'Other User',
          first_name: 'Other',
          last_name: 'User',
        },
      };

      const senderName = result.current.getMessageSenderName(otherUserMessage);
      expect(senderName).toBe('Other User');
    });

    it('should return full name when display name is not available', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const otherUserMessage = {
        ...chatMessageFactory(),
        user_id: 'other-user',
        profiles: {
          first_name: 'First',
          last_name: 'Last',
        },
      };

      const senderName = result.current.getMessageSenderName(otherUserMessage);
      expect(senderName).toBe('First Last');
    });

    it('should return "Guest" when no profile information is available', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const unknownUserMessage = {
        ...chatMessageFactory(),
        user_id: 'unknown-user',
        profiles: undefined,
      };

      const senderName = result.current.getMessageSenderName(unknownUserMessage);
      expect(senderName).toBe('Guest');
    });
  });

  describe('real-time subscription', () => {
    it('should setup subscription when chatId is provided', async () => {
      renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      expect(mockSupabase.channel).toHaveBeenCalledWith(`chat_${mockChatId}`);
      expect(mockSupabase.channel().on).toHaveBeenCalledTimes(2); // INSERT and UPDATE events
    });

    it('should not setup subscription when chatId is null', async () => {
      renderHook(() => useChatMessages(null), {
        wrapper: createHookWrapper(),
      });

      expect(mockSupabase.channel).not.toHaveBeenCalled();
    });

    it('should cleanup subscription on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      mockSupabase.removeChannel = mockUnsubscribe;

      const { unmount } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('refetch', () => {
    it('should provide refetch function that calls fetchMessages', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset call count
      jest.clearAllMocks();

      await act(async () => {
        await result.current.refetch();
      });

      // Should call fetchMessages again
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
    });
  });

  describe('loading and sending states', () => {
    it('should manage loading state correctly during fetch', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      // Should start with loading true
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should manage sending state correctly during send', async () => {
      const { result } = renderHook(() => useChatMessages(mockChatId), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.sending).toBe(false);

      const sendPromise = act(async () => {
        await result.current.sendMessage({ content: 'Test' });
      });

      await sendPromise;

      expect(result.current.sending).toBe(false);
    });
  });
});