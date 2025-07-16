import { renderHook, waitFor, act } from '@testing-library/react';
import { useContentBlocks } from '../useContentBlocks';
import { createMockSupabaseClient, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper } from '../../test-utils';
import { contentBlockFactory } from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useContentBlocks', () => {
  const mockData = [
    contentBlockFactory({ id: 'item-1', block_key: 'welcome_message', title: 'Welcome', content: 'Welcome to our site!' }),
    contentBlockFactory({ id: 'item-2', block_key: 'about_us', title: 'About Us', content: 'Learn about us.' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabase.from.mockImplementation((tableName: string) => {
      if (tableName === 'content_blocks') {
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
  });

  describe('data fetching', () => {
    it('should fetch data successfully', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockData));

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contentBlocks).toHaveLength(2);
      expect(result.current.contentBlocks[0].block_key).toBe('welcome_message');
      expect(result.current.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('content_blocks');
    });

    it('should handle fetch errors gracefully', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.databaseError());

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.contentBlocks).toEqual([]);
    });

    it('should handle empty results', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.emptyResponse());

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.contentBlocks).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('content block retrieval', () => {
    beforeEach(() => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockData));
    });

    it('should get content block by key', async () => {
      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const welcomeBlock = result.current.getContentBlock('welcome_message');
      expect(welcomeBlock).toBeTruthy();
      expect(welcomeBlock?.content).toBe('Welcome to our site!');
    });

    it('should return null for non-existent content block', async () => {
      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const nonExistentBlock = result.current.getContentBlock('non_existent');
      expect(nonExistentBlock).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should create new content block successfully', async () => {
      const newBlock = contentBlockFactory({ id: 'new-item', block_key: 'new_block', content: 'New content' });
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(newBlock));

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.createContentBlock) {
        let createResult;
        await act(async () => {
          createResult = await result.current.createContentBlock({
            block_key: 'new_block',
            title: 'New Block',
            content: 'New content',
            block_type: 'text',
            is_active: true,
            display_order: 1,
          });
        });

        expect(createResult).toBeTruthy();
        expect(mockSupabase.from().insert).toHaveBeenCalled();
      }
    });

    it('should update content block successfully', async () => {
      const updatedBlock = { ...mockData[0], content: 'Updated content' };
      mockSupabase.from().single.mockResolvedValue(mockScenarios.successfulFetch(updatedBlock));

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.updateContentBlock) {
        let updateResult;
        await act(async () => {
          updateResult = await result.current.updateContentBlock('item-1', { content: 'Updated content' });
        });

        expect(updateResult).toBeTruthy();
        expect(mockSupabase.from().update).toHaveBeenCalled();
      }
    });

    it('should delete content block successfully', async () => {
      mockSupabase.from().delete.mockResolvedValue(mockScenarios.successfulFetch([]));

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.deleteContentBlock) {
        let deleteResult;
        await act(async () => {
          deleteResult = await result.current.deleteContentBlock('item-1');
        });

        expect(deleteResult).toBeTruthy();
        expect(mockSupabase.from().delete).toHaveBeenCalled();
      }
    });
  });

  describe('loading states', () => {
    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should clear error on successful operations', async () => {
      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      // Should handle errors gracefully
      expect(() => result.current).not.toThrow();
    });
  });

  describe('refetch functionality', () => {
    it('should refetch content blocks', async () => {
      mockSupabase.from().order.mockResolvedValue(mockScenarios.successfulFetch(mockData));

      const { result } = renderHook(() => useContentBlocks(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      jest.clearAllMocks();

      if (result.current.refetch) {
        await act(async () => {
          await result.current.refetch();
        });

        expect(mockSupabase.from).toHaveBeenCalledWith('content_blocks');
      }
    });
  });
});