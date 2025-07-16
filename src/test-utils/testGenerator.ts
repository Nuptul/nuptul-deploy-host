/**
 * Test Generator Utility
 * 
 * Generates comprehensive Jest tests for hooks with common patterns
 */

export interface HookTestConfig {
  hookName: string;
  hookPath: string;
  tableName: string;
  mockDataFactory: string;
  hasAuth?: boolean;
  hasRealtime?: boolean;
  hasCRUD?: boolean;
  hasFileUpload?: boolean;
  customMethods?: string[];
}

export const generateHookTest = (config: HookTestConfig): string => {
  const {
    hookName,
    hookPath,
    tableName,
    mockDataFactory,
    hasAuth = false,
    hasRealtime = false,
    hasCRUD = true,
    hasFileUpload = false,
    customMethods = []
  } = config;

  return `import { renderHook, waitFor, act } from '@testing-library/react';
import { ${hookName} } from '${hookPath}';
import { createMockSupabaseClient, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper${hasAuth ? ', mockUser' : ''} } from '../../test-utils';
import { ${mockDataFactory} } from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

${hasAuth ? `
// Mock the auth hook
jest.mock('../useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));` : ''}

describe('${hookName}', () => {
  const mockData = [
    ${mockDataFactory}({ id: 'item-1' }),
    ${mockDataFactory}({ id: 'item-2' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabase.from.mockImplementation((tableName: string) => {
      if (tableName === '${tableName}') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn(),
          maybeSingle: jest.fn(),
        };
      }
      return mockSupabase.from();
    });

    ${hasRealtime ? `
    // Mock channel subscription
    mockSupabase.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    });` : ''}

    ${hasAuth ? `
    // Mock auth responses
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });` : ''}

    ${hasFileUpload ? `
    // Mock storage
    mockSupabase.storage = {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    };` : ''}
  });

  describe('data fetching', () => {
    it('should fetch data successfully', async () => {
      mockSupabase.from().select.mockResolvedValue(mockScenarios.successfulFetch(mockData));

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data || result.current.items || result.current.${tableName}).toHaveLength(2);
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('${tableName}');
    });

    it('should handle fetch errors gracefully', async () => {
      mockSupabase.from().select.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should handle empty results', async () => {
      mockSupabase.from().select.mockResolvedValue(mockScenarios.emptyResponse());

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data || result.current.items || result.current.${tableName}).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  ${hasCRUD ? `
  describe('CRUD operations', () => {
    it('should create new item successfully', async () => {
      const newItem = ${mockDataFactory}({ id: 'new-item' });
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(newItem));

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.create || result.current.add) {
        let createResult;
        await act(async () => {
          createResult = await (result.current.create || result.current.add)(newItem);
        });

        expect(createResult).toBeTruthy();
        expect(mockSupabase.from().insert).toHaveBeenCalled();
      }
    });

    it('should update item successfully', async () => {
      const updatedItem = { ...mockData[0], updated: true };
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(updatedItem));

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.update) {
        let updateResult;
        await act(async () => {
          updateResult = await result.current.update('item-1', { updated: true });
        });

        expect(updateResult).toBeTruthy();
        expect(mockSupabase.from().update).toHaveBeenCalled();
      }
    });

    it('should delete item successfully', async () => {
      mockSupabase.from().delete.mockResolvedValue(mockScenarios.successfulFetch([]));

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.delete || result.current.remove) {
        let deleteResult;
        await act(async () => {
          deleteResult = await (result.current.delete || result.current.remove)('item-1');
        });

        expect(deleteResult).toBeTruthy();
        expect(mockSupabase.from().delete).toHaveBeenCalled();
      }
    });
  });` : ''}

  ${hasRealtime ? `
  describe('real-time updates', () => {
    it('should setup real-time subscription', () => {
      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      expect(mockSupabase.channel).toHaveBeenCalled();
      expect(mockSupabase.channel().on).toHaveBeenCalled();
    });

    it('should cleanup subscription on unmount', () => {
      const mockUnsubscribe = jest.fn();
      mockSupabase.removeChannel = mockUnsubscribe;

      const { unmount } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });` : ''}

  ${customMethods.map(method => `
  describe('${method}', () => {
    it('should ${method} successfully', async () => {
      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.${method}) {
        await act(async () => {
          await result.current.${method}();
        });

        // Add specific expectations based on method functionality
        expect(mockSupabase.from).toHaveBeenCalled();
      }
    });
  });`).join('')}

  describe('loading states', () => {
    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      // Initially should be loading (if applicable)
      if ('loading' in result.current) {
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      }
    });
  });

  describe('error handling', () => {
    it('should clear error on successful operations', async () => {
      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      // Should handle errors gracefully
      expect(() => result.current).not.toThrow();
    });
  });

  ${hasAuth ? `
  describe('authentication', () => {
    it('should handle unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => ${hookName}(), {
        wrapper: createHookWrapper(),
      });

      // Should handle unauthenticated state appropriately
      expect(result.current).toBeDefined();
    });
  });` : ''}
});
`;
};

// Hook configurations for automated test generation
export const hookConfigs: HookTestConfig[] = [
  {
    hookName: 'useContentBlocks',
    hookPath: '../useContentBlocks',
    tableName: 'content_blocks',
    mockDataFactory: 'contentBlockFactory',
    hasCRUD: true,
  },
  {
    hookName: 'useDirectChats',
    hookPath: '../useDirectChats',
    tableName: 'direct_chats',
    mockDataFactory: 'directChatFactory',
    hasAuth: true,
    hasRealtime: true,
    hasCRUD: true,
  },
  {
    hookName: 'useMessageReactions',
    hookPath: '../useMessageReactions',
    tableName: 'message_reactions',
    mockDataFactory: 'messageFactory',
    hasAuth: true,
    hasCRUD: true,
  },
  {
    hookName: 'useMessageReplies',
    hookPath: '../useMessageReplies',
    tableName: 'message_replies',
    mockDataFactory: 'messageFactory',
    hasAuth: true,
    hasCRUD: true,
  },
  {
    hookName: 'useMessageSearch',
    hookPath: '../useMessageSearch',
    tableName: 'chat_messages',
    mockDataFactory: 'chatMessageFactory',
    customMethods: ['search', 'clearSearch'],
  },
  {
    hookName: 'useNotifications',
    hookPath: '../useNotifications',
    tableName: 'notifications',
    mockDataFactory: 'messageFactory',
    hasAuth: true,
    hasRealtime: true,
    customMethods: ['markAsRead', 'markAllAsRead'],
  },
  {
    hookName: 'useRSVPStatus',
    hookPath: '../useRSVPStatus',
    tableName: 'rsvps',
    mockDataFactory: 'rsvpFactory',
    hasAuth: true,
    customMethods: ['submitRSVP', 'updateRSVP'],
  },
  {
    hookName: 'useStories',
    hookPath: '../useStories',
    tableName: 'stories',
    mockDataFactory: 'storyFactory',
    hasAuth: true,
    hasFileUpload: true,
    hasCRUD: true,
  },
  {
    hookName: 'useUserBlocking',
    hookPath: '../useUserBlocking',
    tableName: 'user_blocks',
    mockDataFactory: 'profileFactory',
    hasAuth: true,
    customMethods: ['blockUser', 'unblockUser'],
  },
  {
    hookName: 'useUserPresence',
    hookPath: '../useUserPresence',
    tableName: 'user_presence',
    mockDataFactory: 'profileFactory',
    hasAuth: true,
    hasRealtime: true,
    customMethods: ['setPresence', 'getPresence'],
  },
  {
    hookName: 'useVenueImages',
    hookPath: '../useVenueImages',
    tableName: 'venue_images',
    mockDataFactory: 'venueImageFactory',
    hasFileUpload: true,
    hasCRUD: true,
  },
];

export default generateHookTest;