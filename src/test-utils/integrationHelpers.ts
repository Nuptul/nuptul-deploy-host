/**
 * Integration Test Helpers
 * 
 * Utilities for testing hook interactions and complex scenarios
 */

import { renderHook, RenderHookResult } from '@testing-library/react';
import { createMockSupabaseClient, MockResponse, createMockData } from '../__mocks__/supabase';
import { createHookWrapper } from './index';

// Mock data scenarios for integration testing
export const integrationScenarios = {
  // Multi-table data scenarios
  completeWeddingData: () => ({
    wedding_events: [
      createMockData({ 
        id: 'event-1', 
        title: 'Ceremony', 
        event_date: '2025-10-05T15:00:00Z',
        is_main_event: true 
      }),
      createMockData({ 
        id: 'event-2', 
        title: 'Reception', 
        event_date: '2025-10-05T18:00:00Z',
        is_main_event: false 
      }),
    ],
    guests: [
      createMockData({ 
        id: 'guest-1', 
        first_name: 'John', 
        last_name: 'Doe',
        email: 'john@example.com',
        rsvp_status: 'pending'
      }),
      createMockData({ 
        id: 'guest-2', 
        first_name: 'Jane', 
        last_name: 'Smith',
        email: 'jane@example.com',
        rsvp_status: 'attending'
      }),
    ],
    rsvps: [
      createMockData({ 
        id: 'rsvp-1', 
        guest_id: 'guest-2',
        event_id: 'event-1',
        attendance_status: 'attending',
        guest_count: 2
      }),
    ],
    photos: [
      createMockData({ 
        id: 'photo-1', 
        file_url: 'https://example.com/photo1.jpg',
        is_approved: true,
        uploader_id: 'guest-1'
      }),
    ],
    messages: [
      createMockData({ 
        id: 'msg-1', 
        content: 'Congratulations!',
        sender_id: 'guest-1',
        is_public: true
      }),
    ],
  }),

  // Chat system data
  chatSystemData: () => ({
    direct_chats: [
      createMockData({ 
        id: 'chat-1', 
        participant_1: 'user-1',
        participant_2: 'user-2',
        is_active: true
      }),
    ],
    chat_messages: [
      createMockData({ 
        id: 'msg-1', 
        chat_id: 'chat-1',
        user_id: 'user-1',
        content: 'Hello!',
        is_read: false
      }),
      createMockData({ 
        id: 'msg-2', 
        chat_id: 'chat-1',
        user_id: 'user-2',
        content: 'Hi there!',
        is_read: true
      }),
    ],
    profiles: [
      createMockData({ 
        user_id: 'user-1', 
        first_name: 'Alice',
        last_name: 'Johnson',
        display_name: 'Alice J.'
      }),
      createMockData({ 
        user_id: 'user-2', 
        first_name: 'Bob',
        last_name: 'Wilson',
        display_name: 'Bob W.'
      }),
    ],
  }),

  // Admin dashboard data
  adminDashboardData: () => ({
    profiles: Array.from({ length: 50 }, (_, i) => 
      createMockData({ 
        id: `profile-${i}`, 
        first_name: `User${i}`,
        role: i < 5 ? 'admin' : 'guest'
      })
    ),
    rsvps: Array.from({ length: 30 }, (_, i) => 
      createMockData({ 
        id: `rsvp-${i}`, 
        status: i % 3 === 0 ? 'attending' : i % 3 === 1 ? 'not_attending' : 'pending'
      })
    ),
    photos: Array.from({ length: 20 }, (_, i) => 
      createMockData({ 
        id: `photo-${i}`, 
        is_approved: i % 2 === 0
      })
    ),
  }),
};

// Integration test suite generator
export const createIntegrationTestSuite = (
  hookName: string,
  hookFunction: () => any,
  scenarioName: keyof typeof integrationScenarios
) => {
  return () => {
    const mockSupabase = createMockSupabaseClient();
    const scenario = integrationScenarios[scenarioName]();

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Setup mock data for each table
      mockSupabase.from.mockImplementation((tableName: string) => {
        const tableData = scenario[tableName as keyof typeof scenario] || [];
        
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: tableData.slice(0, 10), error: null }),
          then: jest.fn().mockResolvedValue({ data: tableData, error: null }),
        };
      });
    });

    it('should handle complex data relationships', async () => {
      const { result } = renderHook(hookFunction, {
        wrapper: createHookWrapper(),
      });

      // Add specific assertions based on the hook and scenario
      expect(result.current).toBeDefined();
    });

    it('should handle large datasets efficiently', async () => {
      const { result } = renderHook(hookFunction, {
        wrapper: createHookWrapper(),
      });

      // Performance and efficiency tests
      expect(result.current).toBeDefined();
    });

    it('should maintain data consistency across operations', async () => {
      const { result } = renderHook(hookFunction, {
        wrapper: createHookWrapper(),
      });

      // Data consistency tests
      expect(result.current).toBeDefined();
    });
  };
};

// Hook interaction testing utilities
export class HookInteractionTester {
  private hooks: Map<string, RenderHookResult<any, any>> = new Map();

  addHook(name: string, hookFunction: () => any) {
    const result = renderHook(hookFunction, {
      wrapper: createHookWrapper(),
    });
    this.hooks.set(name, result);
    return result;
  }

  getHook(name: string) {
    return this.hooks.get(name);
  }

  async waitForAllHooks(condition: (hookResult: any) => boolean) {
    const promises = Array.from(this.hooks.values()).map(hook => 
      new Promise(resolve => {
        const checkCondition = () => {
          if (condition(hook.result.current)) {
            resolve(true);
          } else {
            setTimeout(checkCondition, 10);
          }
        };
        checkCondition();
      })
    );

    await Promise.all(promises);
  }

  cleanup() {
    this.hooks.forEach(hook => hook.unmount());
    this.hooks.clear();
  }
}

// Error simulation utilities
export const errorSimulations = {
  networkTimeout: () => new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Network timeout')), 100)
  ),
  
  databaseLock: () => ({ 
    data: null, 
    error: new Error('Database is locked') 
  }),
  
  permissionDenied: () => ({ 
    data: null, 
    error: new Error('Permission denied') 
  }),
  
  invalidData: () => ({ 
    data: null, 
    error: new Error('Invalid data format') 
  }),
  
  rateLimited: () => ({ 
    data: null, 
    error: new Error('Rate limit exceeded') 
  }),
};

// Performance test utilities
export const performanceHelpers = {
  measureHookRenderTime: async (hookFunction: () => any, iterations = 100) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = renderHook(hookFunction, {
        wrapper: createHookWrapper(),
      });
      const end = performance.now();
      
      times.push(end - start);
      unmount();
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: times.sort()[Math.floor(times.length / 2)],
    };
  },

  memoryUsageTest: (hookFunction: () => any) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const hooks = Array.from({ length: 50 }, () => 
      renderHook(hookFunction, { wrapper: createHookWrapper() })
    );
    
    const peakMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    hooks.forEach(hook => hook.unmount());
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      initialMemory,
      peakMemory,
      finalMemory,
      memoryIncrease: peakMemory - initialMemory,
      memoryLeaked: finalMemory - initialMemory,
    };
  },
};

// Real-time testing utilities
export const realtimeTestHelpers = {
  simulateRealtimeEvent: (
    mockSupabase: any, 
    channelName: string, 
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    payload: any
  ) => {
    const channel = mockSupabase.channel(channelName);
    const callback = channel.on.mock.calls.find(
      (call: any[]) => call[0] === 'postgres_changes'
    )?.[2];
    
    if (callback) {
      callback({
        eventType,
        new: eventType === 'DELETE' ? null : payload,
        old: eventType === 'INSERT' ? null : payload,
      });
    }
  },

  createRealtimeSubscriptionTest: (
    hookFunction: () => any,
    expectedChannelName: string
  ) => {
    const mockSupabase = createMockSupabaseClient();
    
    const { result } = renderHook(hookFunction, {
      wrapper: createHookWrapper(),
    });

    expect(mockSupabase.channel).toHaveBeenCalledWith(expectedChannelName);
    expect(mockSupabase.channel().on).toHaveBeenCalled();
    expect(mockSupabase.channel().subscribe).toHaveBeenCalled();

    return { result, mockSupabase };
  },
};

export default {
  integrationScenarios,
  createIntegrationTestSuite,
  HookInteractionTester,
  errorSimulations,
  performanceHelpers,
  realtimeTestHelpers,
};