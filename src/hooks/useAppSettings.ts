import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppSettings {
  app_name: string;
  wedding_date: string;
  welcome_message: string;
  welcome_subtitle: string;
  hero_subtitle: string;
  countdown_message: string;
  gallery_title: string;
  gallery_description: string;
  rsvp_instructions: string;
  footer_message: string;
  about_section: string;
  contact_message: string;
  ceremony_time: string;
  arrival_time: string;
  bride_name: string;
  groom_name: string;
  external_gift_registry_url: string;
  hero_background_type: string;
  hero_background_url: string;
  hero_background_mobile_url: string;
  hero_overlay_opacity: string;
  hero_overlay_position: string;
  hero_video_autoplay: string;
  hero_video_muted: string;
  hero_video_loop: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  app_name: 'Tim & Kirsten',
  wedding_date: '2025-10-05T15:00:00+10:00', // 3:00 PM Australian timezone
  welcome_message: 'We Can\'t Wait to Celebrate With You!',
  welcome_subtitle: 'Your presence is the greatest gift we could ask for. Join us for a day filled with love, laughter, and unforgettable memories as we begin our new chapter together.',
  hero_subtitle: 'Yes, we are that couple stuffing up your long weekend plans! Why spend it somewhere relaxing when you can watch two people who have been together for well over a decade tell you that they still love each other and are going to continue living pretty much as they have but under a legally binding contract? There\'ll be top-shelf bevies, good tunes, and more love than you can poke a stick at.',
  countdown_message: 'Countdown to Forever',
  gallery_title: 'Our Wedding Gallery',
  gallery_description: 'Capturing our most precious moments',
  rsvp_instructions: 'Please RSVP by clicking the button below. We can\'t wait to celebrate with you!',
  footer_message: 'With love, Tim & Kirsten',
  about_section: 'Tim and Kirsten are excited to share their special day with family and friends at Ben Ean Winery in the beautiful Hunter Valley.',
  contact_message: 'For any questions about the wedding, please don\'t hesitate to reach out to us.',
  ceremony_time: '3:00 PM',
  arrival_time: '2:30 PM',
  bride_name: 'Kirsten',
  groom_name: 'Tim',
  external_gift_registry_url: 'https://mygiftregistry.com.au/id/tim-and-kirsten/',
  hero_background_type: 'video', // Changed to video to enable video by default
  hero_background_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Working sample video URL
  hero_background_mobile_url: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/backgrounds/default-wedding-mobile.jpg',
  hero_overlay_opacity: '0.7',
  hero_overlay_position: 'center',
  hero_video_autoplay: 'true',
  hero_video_muted: 'true',
  hero_video_loop: 'true'
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value || '';
        return acc;
      }, {} as Record<string, string>) || {};

      setSettings({
        app_name: settingsMap.app_name || DEFAULT_SETTINGS.app_name,
        wedding_date: settingsMap.wedding_date || DEFAULT_SETTINGS.wedding_date,
        welcome_message: settingsMap.welcome_message || DEFAULT_SETTINGS.welcome_message,
        welcome_subtitle: settingsMap.welcome_subtitle || DEFAULT_SETTINGS.welcome_subtitle,
        hero_subtitle: settingsMap.hero_subtitle || DEFAULT_SETTINGS.hero_subtitle,
        countdown_message: settingsMap.countdown_message || DEFAULT_SETTINGS.countdown_message,
        gallery_title: settingsMap.gallery_title || DEFAULT_SETTINGS.gallery_title,
        gallery_description: settingsMap.gallery_description || DEFAULT_SETTINGS.gallery_description,
        rsvp_instructions: settingsMap.rsvp_instructions || DEFAULT_SETTINGS.rsvp_instructions,
        footer_message: settingsMap.footer_message || DEFAULT_SETTINGS.footer_message,
        about_section: settingsMap.about_section || DEFAULT_SETTINGS.about_section,
        contact_message: settingsMap.contact_message || DEFAULT_SETTINGS.contact_message,
        ceremony_time: settingsMap.ceremony_time || DEFAULT_SETTINGS.ceremony_time,
        arrival_time: settingsMap.arrival_time || DEFAULT_SETTINGS.arrival_time,
        bride_name: settingsMap.bride_name || DEFAULT_SETTINGS.bride_name,
        groom_name: settingsMap.groom_name || DEFAULT_SETTINGS.groom_name,
        external_gift_registry_url: settingsMap.external_gift_registry_url || DEFAULT_SETTINGS.external_gift_registry_url,
        hero_background_type: settingsMap.hero_background_type || DEFAULT_SETTINGS.hero_background_type,
        hero_background_url: settingsMap.hero_background_url || DEFAULT_SETTINGS.hero_background_url,
        hero_background_mobile_url: settingsMap.hero_background_mobile_url || DEFAULT_SETTINGS.hero_background_mobile_url,
        hero_overlay_opacity: settingsMap.hero_overlay_opacity || DEFAULT_SETTINGS.hero_overlay_opacity,
        hero_overlay_position: settingsMap.hero_overlay_position || DEFAULT_SETTINGS.hero_overlay_position,
        hero_video_autoplay: settingsMap.hero_video_autoplay || DEFAULT_SETTINGS.hero_video_autoplay,
        hero_video_muted: settingsMap.hero_video_muted || DEFAULT_SETTINGS.hero_video_muted,
        hero_video_loop: settingsMap.hero_video_loop || DEFAULT_SETTINGS.hero_video_loop,
      });
    } catch (error) {
      console.error('Error loading app settings:', error);
      toast({
        title: "Error",
        description: "Failed to load app settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          setting_key: key, 
          setting_value: value 
        }, { 
          onConflict: 'setting_key' 
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Setting Updated",
        description: `${key.replace('_', ' ')} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    loadSettings
  };
};