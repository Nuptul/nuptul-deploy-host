import { renderHook, waitFor } from '@testing-library/react';
import { useAppSettings } from '../useAppSettings';
import { createMockSupabaseClient, createMockData, mockScenarios } from '../../__mocks__/supabase';
import { createHookWrapper } from '../../test-utils';
import { appSettingsFactory } from '../../test-utils/factories';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useAppSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
  });

  describe('loadSettings', () => {
    it('should load settings successfully and return them', async () => {
      const mockSettings = [
        appSettingsFactory({ setting_key: 'app_name', setting_value: 'Test Wedding' }),
        appSettingsFactory({ setting_key: 'wedding_date', setting_value: '2025-10-05T15:00:00+10:00' }),
        appSettingsFactory({ setting_key: 'welcome_message', setting_value: 'Welcome to our wedding!' }),
      ];

      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.successfulFetch(mockSettings));

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      // Initially loading should be true
      expect(result.current.loading).toBe(true);

      // Wait for the hook to finish loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check that settings were loaded correctly
      expect(result.current.settings.app_name).toBe('Test Wedding');
      expect(result.current.settings.wedding_date).toBe('2025-10-05T15:00:00+10:00');
      expect(result.current.settings.welcome_message).toBe('Welcome to our wedding!');

      // Verify supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('app_settings');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('setting_key, setting_value');
    });

    it('should use default settings when no data is returned', async () => {
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.emptyResponse());

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fall back to default settings
      expect(result.current.settings.app_name).toBe('Tim & Kirsten');
      expect(result.current.settings.wedding_date).toBe('2025-10-05T15:00:00+10:00');
      expect(result.current.settings.welcome_message).toBe('We Can\'t Wait to Celebrate With You!');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.databaseError());

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should show error toast
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load app settings',
        variant: 'destructive',
      });

      // Should still have default settings
      expect(result.current.settings.app_name).toBe('Tim & Kirsten');
    });

    it('should handle partial settings data', async () => {
      const partialSettings = [
        appSettingsFactory({ setting_key: 'app_name', setting_value: 'Partial Wedding' }),
        // Missing other settings
      ];

      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.successfulFetch(partialSettings));

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should use custom setting for app_name but defaults for others
      expect(result.current.settings.app_name).toBe('Partial Wedding');
      expect(result.current.settings.welcome_message).toBe('We Can\'t Wait to Celebrate With You!');
    });
  });

  describe('updateSetting', () => {
    it('should update a setting successfully', async () => {
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.emptyResponse());
      mockSupabase.from().upsert.mockResolvedValueOnce(mockScenarios.successfulFetch([]));

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update a setting
      await result.current.updateSetting('app_name', 'New Wedding Name');

      // Verify upsert was called correctly
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        {
          setting_key: 'app_name',
          setting_value: 'New Wedding Name',
        },
        { onConflict: 'setting_key' }
      );

      // Verify success toast
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Setting Updated',
        description: 'app name has been updated successfully.',
      });

      // Verify local state was updated
      expect(result.current.settings.app_name).toBe('New Wedding Name');
    });

    it('should handle update errors', async () => {
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.emptyResponse());
      mockSupabase.from().upsert.mockResolvedValueOnce(mockScenarios.databaseError());

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Attempt to update a setting
      await result.current.updateSetting('app_name', 'Failed Update');

      // Verify error toast
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });

      // Verify local state was not updated
      expect(result.current.settings.app_name).toBe('Tim & Kirsten'); // Default value
    });

    it('should update multiple settings correctly', async () => {
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.emptyResponse());
      mockSupabase.from().upsert.mockResolvedValue(mockScenarios.successfulFetch([]));

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update multiple settings
      await result.current.updateSetting('app_name', 'First Update');
      await result.current.updateSetting('welcome_message', 'Second Update');

      // Verify both updates
      expect(result.current.settings.app_name).toBe('First Update');
      expect(result.current.settings.welcome_message).toBe('Second Update');
      expect(mockSupabase.from().upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadSettings function', () => {
    it('should reload settings when called manually', async () => {
      const initialSettings = [
        appSettingsFactory({ setting_key: 'app_name', setting_value: 'Initial Name' }),
      ];
      const updatedSettings = [
        appSettingsFactory({ setting_key: 'app_name', setting_value: 'Updated Name' }),
      ];

      mockSupabase.from().select
        .mockResolvedValueOnce(mockScenarios.successfulFetch(initialSettings))
        .mockResolvedValueOnce(mockScenarios.successfulFetch(updatedSettings));

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings.app_name).toBe('Initial Name');

      // Manually reload settings
      await result.current.loadSettings();

      expect(result.current.settings.app_name).toBe('Updated Name');
      expect(mockSupabase.from().select).toHaveBeenCalledTimes(2);
    });
  });

  describe('loading state', () => {
    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      // Initially should be loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('default settings coverage', () => {
    it('should contain all required default settings', async () => {
      mockSupabase.from().select.mockResolvedValueOnce(mockScenarios.emptyResponse());

      const { result } = renderHook(() => useAppSettings(), {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const { settings } = result.current;

      // Verify all required settings are present
      expect(settings.app_name).toBeDefined();
      expect(settings.wedding_date).toBeDefined();
      expect(settings.welcome_message).toBeDefined();
      expect(settings.welcome_subtitle).toBeDefined();
      expect(settings.hero_subtitle).toBeDefined();
      expect(settings.countdown_message).toBeDefined();
      expect(settings.gallery_title).toBeDefined();
      expect(settings.gallery_description).toBeDefined();
      expect(settings.rsvp_instructions).toBeDefined();
      expect(settings.footer_message).toBeDefined();
      expect(settings.about_section).toBeDefined();
      expect(settings.contact_message).toBeDefined();
      expect(settings.ceremony_time).toBeDefined();
      expect(settings.arrival_time).toBeDefined();
      expect(settings.bride_name).toBeDefined();
      expect(settings.groom_name).toBeDefined();
      expect(settings.external_gift_registry_url).toBeDefined();
      expect(settings.hero_background_type).toBeDefined();
      expect(settings.hero_background_url).toBeDefined();
      expect(settings.hero_background_mobile_url).toBeDefined();
      expect(settings.hero_overlay_opacity).toBeDefined();
      expect(settings.hero_overlay_position).toBeDefined();
      expect(settings.hero_video_autoplay).toBeDefined();
      expect(settings.hero_video_muted).toBeDefined();
      expect(settings.hero_video_loop).toBeDefined();
    });
  });
});