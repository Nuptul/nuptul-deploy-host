import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundSettings {
  type: 'gradient' | 'image' | 'pattern' | 'video';
  imageUrl: string;
  videoUrl?: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  opacity: number;
}

const DEFAULT_BACKGROUND: BackgroundSettings = {
  type: 'gradient',
  imageUrl: 'https://i.ibb.co/0VQTdZfF/Chat-GPT-Image-Jul-8-2025-01-32-20-AM.png',
  gradientStart: 'hsl(40, 33%, 96%)',
  gradientEnd: 'hsl(40, 20%, 92%)',
  gradientDirection: '135deg',
  opacity: 1.0,
};

export const useGlobalBackground = () => {
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND);
  const [loading, setLoading] = useState(true);

  const loadAndApplyBackground = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'bg_type', 'bg_image_url', 'bg_video_url', 'bg_gradient_start', 
          'bg_gradient_end', 'bg_gradient_direction', 'bg_opacity'
        ]);

      if (data && data.length > 0) {
        const settings: Partial<BackgroundSettings> = {};
        data.forEach(setting => {
          switch (setting.setting_key) {
            case 'bg_type':
              settings.type = (setting.setting_value as 'gradient' | 'image' | 'pattern' | 'video') || 'gradient';
              break;
            case 'bg_image_url':
              settings.imageUrl = setting.setting_value || '';
              break;
            case 'bg_video_url':
              settings.videoUrl = setting.setting_value || '';
              break;
            case 'bg_gradient_start':
              settings.gradientStart = setting.setting_value || 'hsl(40, 33%, 96%)';
              break;
            case 'bg_gradient_end':
              settings.gradientEnd = setting.setting_value || 'hsl(40, 20%, 92%)';
              break;
            case 'bg_gradient_direction':
              settings.gradientDirection = setting.setting_value || '135deg';
              break;
            case 'bg_opacity':
              settings.opacity = parseFloat(setting.setting_value || '1.0');
              break;
          }
        });
        
        const finalSettings = { ...DEFAULT_BACKGROUND, ...settings };
        setBackgroundSettings(finalSettings);
        applyBackgroundToBody(finalSettings);
      } else {
        // No saved settings, apply default
        applyBackgroundToBody(DEFAULT_BACKGROUND);
      }
    } catch (error) {
      console.error('Error loading background settings:', error);
      // Apply default on error
      applyBackgroundToBody(DEFAULT_BACKGROUND);
    } finally {
      setLoading(false);
    }
  };

  const applyBackgroundToBody = (settings: BackgroundSettings) => {
    const body = document.body;
    
    // Remove any Tailwind background classes
    body.classList.remove('bg-background');
    
    // Clear any existing background styles
    body.style.backgroundColor = '';
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundAttachment = '';
    
    // Remove any existing global background style element
    const existingStyle = document.getElementById('global-background-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create a new style element for background
    const styleEl = document.createElement('style');
    styleEl.id = 'global-background-style';
    
    // Ensure body is fullscreen
    body.style.setProperty('min-height', '100vh', 'important');
    body.style.setProperty('width', '100vw', 'important');
    body.style.setProperty('margin', '0', 'important');
    body.style.setProperty('padding', '0', 'important');
    
    if (settings.type === 'video' && settings.videoUrl) {
      // For video backgrounds, we'll need to handle them differently
      // Videos can't be set as CSS background, so we'll apply a fallback
      body.style.setProperty('background-color', 'hsl(40 33% 94%)', 'important');
      // The actual video will be handled by a VideoBackground component
    } else if (settings.type === 'image' && settings.imageUrl) {
      // Create soft pastel gradient overlay like the screenshot
      const pastelGradient = `linear-gradient(135deg, 
        rgba(173, 216, 230, 0.65) 0%,    /* Soft blue */
        rgba(221, 160, 221, 0.55) 20%,   /* Plum */
        rgba(255, 182, 193, 0.50) 35%,   /* Light pink */
        rgba(255, 218, 185, 0.45) 50%,   /* Peach */
        rgba(255, 192, 203, 0.50) 65%,   /* Pink */
        rgba(176, 224, 230, 0.55) 80%,   /* Powder blue */
        rgba(173, 216, 230, 0.65) 100%   /* Back to soft blue */
      )`;
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        // Use style element for highest specificity
        styleEl.textContent = `
          body {
            background-image: ${pastelGradient}, url("${settings.imageUrl}") !important;
            background-size: cover, cover !important;
            background-position: center center, center center !important;
            background-repeat: no-repeat, no-repeat !important;
            background-attachment: fixed, fixed !important;
            background-blend-mode: multiply !important;
            background-color: transparent !important;
          }
        `;
        document.head.appendChild(styleEl);
      };
      img.onerror = () => {
        console.error('Failed to load background image:', settings.imageUrl);
        // Apply pastel gradient as fallback
        styleEl.textContent = `
          body {
            background-image: ${pastelGradient} !important;
            background-size: cover !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
            background-color: transparent !important;
          }
        `;
        document.head.appendChild(styleEl);
      };
      img.src = settings.imageUrl;
    } else if (settings.type === 'gradient') {
      body.style.setProperty('background-image', `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`, 'important');
      body.style.setProperty('background-size', 'auto', 'important');
      body.style.setProperty('background-position', 'auto', 'important');
      body.style.setProperty('background-repeat', 'auto', 'important');
      body.style.setProperty('background-attachment', 'auto', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
    } else {
      // Default background color
      body.style.setProperty('background-color', 'hsl(40 33% 94%)', 'important');
    }
    
    // Apply opacity through a pseudo-element approach or filter if needed
    if (settings.opacity < 1.0) {
      body.style.setProperty('opacity', settings.opacity.toString(), 'important');
    } else {
      body.style.opacity = '';
    }
  };

  // Listen for background changes from BackgroundManager
  const handleBackgroundUpdate = (newSettings: BackgroundSettings) => {
    setBackgroundSettings(newSettings);
    applyBackgroundToBody(newSettings);
  };

  useEffect(() => {
    loadAndApplyBackground();

    // Listen for background changes from BackgroundManager
    const handleBackgroundChanged = () => {
      loadAndApplyBackground();
    };

    window.addEventListener('backgroundChanged', handleBackgroundChanged);

    return () => {
      window.removeEventListener('backgroundChanged', handleBackgroundChanged);
    };
  }, []);

  return {
    backgroundSettings,
    loading,
    applyBackground: handleBackgroundUpdate,
    reloadBackground: loadAndApplyBackground
  };
};