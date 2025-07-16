// Mock data types
export interface MockData {
  id: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

// Mock response structure
export interface MockResponse<T> {
  data: T[] | T | null;
  error: Error | null;
  status: number;
  statusText: string;
}

// Storage mock for file uploads
const createStorageMock = () => ({
  from: jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
    getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://mock-url.com/file.jpg' } })),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    list: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
});

// Channel mock for real-time subscriptions
const createChannelMock = () => ({
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnValue(Promise.resolve()),
  unsubscribe: jest.fn().mockReturnValue(Promise.resolve()),
});

// Query builder mock
const createQueryBuilderMock = (mockData: MockData[] = []) => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    onConflict: jest.fn().mockReturnThis(),
  };

  // Default successful response
  const defaultResponse: MockResponse<MockData> = {
    data: mockData,
    error: null,
    status: 200,
    statusText: 'OK',
  };

  // Add promise resolution to query methods
  Object.keys(queryBuilder).forEach(key => {
    if (typeof queryBuilder[key as keyof typeof queryBuilder] === 'function') {
      const method = queryBuilder[key as keyof typeof queryBuilder] as any;
      method.mockResolvedValue = (response: MockResponse<any>) => {
        return Promise.resolve(response);
      };
    }
  });

  // Set default promise resolution
  queryBuilder.select.mockResolvedValue(defaultResponse);
  queryBuilder.insert.mockResolvedValue({ ...defaultResponse, data: mockData[0] || null });
  queryBuilder.update.mockResolvedValue({ ...defaultResponse, data: mockData[0] || null });
  queryBuilder.upsert.mockResolvedValue({ ...defaultResponse, data: mockData[0] || null });
  queryBuilder.delete.mockResolvedValue(defaultResponse);
  queryBuilder.single.mockResolvedValue({ ...defaultResponse, data: mockData[0] || null });
  queryBuilder.maybeSingle.mockResolvedValue({ ...defaultResponse, data: mockData[0] || null });

  return queryBuilder;
};

// Main Supabase client mock
export const createMockSupabaseClient = (initialData: Record<string, MockData[]> = {}) => {
  const mockClient = {
    from: jest.fn((tableName: string) => {
      const tableData = initialData[tableName] || [];
      return createQueryBuilderMock(tableData);
    }),
    storage: createStorageMock(),
    channel: jest.fn((channelName: string) => createChannelMock()),
    removeChannel: jest.fn(),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'mock-user-id' }, access_token: 'mock-token' } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-id' }, session: { access_token: 'mock-token' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return mockClient;
};

// Default mock client
export const mockSupabaseClient = createMockSupabaseClient();

// Helper to create mock data with common fields
export const createMockData = (overrides: Partial<MockData> = {}): MockData => ({
  id: `mock-id-${Date.now()}-${Math.random()}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Helper to create arrays of mock data
export const createMockDataArray = (count: number, overrides: Partial<MockData> = {}): MockData[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockData({ ...overrides, id: `mock-id-${index}` })
  );
};

// Error helpers
export const createMockError = (message: string = 'Mock error', code?: string) => ({
  message,
  code,
  details: 'Mock error details',
  hint: 'Mock error hint',
});

// Response helpers
export const createSuccessResponse = <T>(data: T): MockResponse<T> => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
});

export const createErrorResponse = (error: Error): MockResponse<null> => ({
  data: null,
  error,
  status: 400,
  statusText: 'Bad Request',
});

// Mock implementations for specific scenarios
export const mockScenarios = {
  // Successful data fetch
  successfulFetch: (data: MockData[]) => createSuccessResponse(data),
  
  // Empty data response
  emptyResponse: () => createSuccessResponse([]),
  
  // Network error
  networkError: () => createErrorResponse(new Error('Network error')),
  
  // Database error
  databaseError: () => createErrorResponse(new Error('Database error')),
  
  // Permission error
  permissionError: () => createErrorResponse(new Error('Permission denied')),
  
  // Validation error
  validationError: () => createErrorResponse(new Error('Validation failed')),
};

export default mockSupabaseClient;