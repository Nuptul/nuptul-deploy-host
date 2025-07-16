import React, { useState, useEffect } from 'react';
import { Image, Upload, Eye, Save, Trash2, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackgroundSettings {
  type: 'gradient' | 'image' | 'pattern';
  imageUrl: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  opacity: number;
}

interface StorageBackground {
  name: string;
  url: string;
  id: string;
}

const BackgroundManager: React.FC = () => {
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'gradient',
    imageUrl: 'https://i.ibb.co/0VQTdZfF/Chat-GPT-Image-Jul-8-2025-01-32-20-AM.png',
    gradientStart: 'hsl(40, 33%, 96%)',
    gradientEnd: 'hsl(40, 20%, 92%)',
    gradientDirection: '135deg',
    opacity: 1.0,
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [storageBackgrounds, setStorageBackgrounds] = useState<StorageBackground[]>([]);
  const [loadingBackgrounds, setLoadingBackgrounds] = useState(false);
  const { toast } = useToast();

  const gradientPresets = [
    {
      name: 'Warm Wedding',
      start: 'hsl(40, 33%, 96%)',
      end: 'hsl(40, 20%, 92%)',
      direction: '135deg'
    },
    {
      name: 'Romantic Blush',
      start: 'hsl(330, 68%, 95%)',
      end: 'hsl(25, 45%, 92%)',
      direction: '135deg'
    },
    {
      name: 'Ocean Breeze',
      start: 'hsl(220, 68%, 95%)',
      end: 'hsl(200, 50%, 90%)',
      direction: '135deg'
    },
    {
      name: 'Forest Mist',
      start: 'hsl(142, 76%, 95%)',
      end: 'hsl(120, 20%, 88%)',
      direction: '135deg'
    },
    {
      name: 'Royal Evening',
      start: 'hsl(256, 68%, 95%)',
      end: 'hsl(280, 20%, 90%)',
      direction: '135deg'
    },
    {
      name: 'Golden Hour',
      start: 'hsl(45, 80%, 95%)',
      end: 'hsl(30, 60%, 88%)',
      direction: '135deg'
    }
  ];

  useEffect(() => {
    loadBackgroundSettings();
    // Add a small delay to ensure Supabase client is ready
    const timer = setTimeout(() => {
      loadStorageBackgrounds();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadBackgroundSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'bg_type', 'bg_image_url', 'bg_gradient_start', 
          'bg_gradient_end', 'bg_gradient_direction', 'bg_opacity'
        ]);

      if (data && data.length > 0) {
        const settings: Partial<BackgroundSettings> = {};
        data.forEach(setting => {
          switch (setting.setting_key) {
            case 'bg_type':
              settings.type = (setting.setting_value as 'gradient' | 'image' | 'pattern') || 'gradient';
              break;
            case 'bg_image_url':
              settings.imageUrl = setting.setting_value || '';
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
        
        setBackgroundSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error loading background settings:', error);
    }
  };

  const loadStorageBackgrounds = async () => {
    setLoadingBackgrounds(true);
    try {
      console.log('Loading backgrounds from cms-backgrounds bucket...');
      const { data, error } = await supabase.storage
        .from('cms-backgrounds')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Storage error:', error);
        throw error;
      }

      if (data) {
        console.log('Found backgrounds:', data.length);
        console.log('Raw data:', data);
        
        const backgrounds: StorageBackground[] = data
          .filter(file => file.name && !file.name.startsWith('.')) // Filter out hidden files
          .map(file => {
            const publicUrl = supabase.storage.from('cms-backgrounds').getPublicUrl(file.name).data.publicUrl;
            console.log(`Processing ${file.name} -> ${publicUrl}`);
            return {
              id: file.id || file.name,
              name: file.name,
              url: publicUrl
            };
          });
        
        console.log('Processed backgrounds:', backgrounds);
        setStorageBackgrounds(backgrounds);
      } else {
        console.log('No data returned from storage');
        setStorageBackgrounds([]);
      }
    } catch (error) {
      console.error('Error loading storage backgrounds:', error);
      toast({
        title: "Error",
        description: "Failed to load backgrounds from storage",
        variant: "destructive"
      });
    } finally {
      setLoadingBackgrounds(false);
    }
  };

  const applyBackgroundPreview = (settings: BackgroundSettings) => {
    if (!previewMode) return;
    
    const body = document.body;
    
    // Remove any Tailwind background classes
    body.classList.remove('bg-background');
    
    if (settings.type === 'image' && settings.imageUrl) {
      body.style.setProperty('background-image', `url(${settings.imageUrl})`, 'important');
      body.style.setProperty('background-size', 'cover', 'important');
      body.style.setProperty('background-position', 'center', 'important');
      body.style.setProperty('background-repeat', 'no-repeat', 'important');
      body.style.setProperty('background-attachment', 'fixed', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
    } else if (settings.type === 'gradient') {
      body.style.setProperty('background-image', `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`, 'important');
      body.style.setProperty('background-size', 'auto', 'important');
      body.style.setProperty('background-position', 'auto', 'important');
      body.style.setProperty('background-repeat', 'auto', 'important');
      body.style.setProperty('background-attachment', 'auto', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
    }
  };

  const applyBackgroundGlobally = (settings: BackgroundSettings) => {
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
    
    if (settings.type === 'image' && settings.imageUrl) {
      body.style.setProperty('background-image', `url(${settings.imageUrl})`, 'important');
      body.style.setProperty('background-size', 'cover', 'important');
      body.style.setProperty('background-position', 'center', 'important');
      body.style.setProperty('background-repeat', 'no-repeat', 'important');
      body.style.setProperty('background-attachment', 'fixed', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
    } else if (settings.type === 'gradient') {
      body.style.setProperty('background-image', `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`, 'important');
      body.style.setProperty('background-size', 'auto', 'important');
      body.style.setProperty('background-position', 'auto', 'important');
      body.style.setProperty('background-repeat', 'auto', 'important');
      body.style.setProperty('background-attachment', 'auto', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
    }
  };

  const uploadBackgroundImage = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-backgrounds')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cms-backgrounds')
        .getPublicUrl(fileName);

      const newSettings = { ...backgroundSettings, imageUrl: publicUrl, type: 'image' as const };
      setBackgroundSettings(newSettings);
      applyBackgroundPreview(newSettings);

      // Reload storage backgrounds to include the new upload
      await loadStorageBackgrounds();

      toast({
        title: "Image Uploaded",
        description: "Background image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const saveBackgroundSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'bg_type', setting_value: backgroundSettings.type },
        { setting_key: 'bg_image_url', setting_value: backgroundSettings.imageUrl },
        { setting_key: 'bg_gradient_start', setting_value: backgroundSettings.gradientStart },
        { setting_key: 'bg_gradient_end', setting_value: backgroundSettings.gradientEnd },
        { setting_key: 'bg_gradient_direction', setting_value: backgroundSettings.gradientDirection },
        { setting_key: 'bg_opacity', setting_value: backgroundSettings.opacity.toString() },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'setting_key' });
        
        if (error) {
          console.error('Error saving setting:', setting.setting_key, error);
          throw error;
        }
      }

      // Apply background globally (not just preview)
      console.log('Applying background globally:', backgroundSettings);
      applyBackgroundGlobally(backgroundSettings);
      
      // Force re-render to ensure background is applied
      window.dispatchEvent(new Event('backgroundChanged'));
      
      toast({
        title: "Background Saved",
        description: "Background settings have been applied globally",
      });
    } catch (error) {
      console.error('Error saving background settings:', error);
      toast({
        title: "Error",
        description: "Failed to save background settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof BackgroundSettings, value: any) => {
    const newSettings = { ...backgroundSettings, [key]: value };
    setBackgroundSettings(newSettings);
    applyBackgroundPreview(newSettings);
  };

  return (
    <div className="space-y-4">
      {/* Background Manager Header */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-glass-pink" />
          <span className="text-sm font-medium">Background Manager</span>
        </div>
        <Button
          size="sm"
          variant={previewMode ? "default" : "outline"}
          onClick={() => setPreviewMode(!previewMode)}
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          {previewMode ? 'Exit Preview' : 'Live Preview'}
        </Button>
      </div>

      {/* Background Type Selection */}
      <div className="glass-card p-3 space-y-3">
        <Label className="text-sm font-medium text-wedding-navy">Background Type</Label>
        <RadioGroup
          value={backgroundSettings.type}
          onValueChange={(value: 'gradient' | 'image' | 'pattern') => 
            handleSettingChange('type', value)
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gradient" id="gradient" />
            <Label htmlFor="gradient" className="text-xs">Gradient</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image" className="text-xs">Image</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pattern" id="pattern" />
            <Label htmlFor="pattern" className="text-xs">Pattern</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Gradient Settings */}
      {backgroundSettings.type === 'gradient' && (
        <div className="space-y-3">
          <div className="glass-card p-3 space-y-3">
            <Label className="text-sm font-medium text-wedding-navy">Gradient Settings</Label>
            
            {/* Gradient Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Start Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: backgroundSettings.gradientStart }}
                  />
                  <Input
                    type="text"
                    value={backgroundSettings.gradientStart}
                    onChange={(e) => handleSettingChange('gradientStart', e.target.value)}
                    className="flex-1 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: backgroundSettings.gradientEnd }}
                  />
                  <Input
                    type="text"
                    value={backgroundSettings.gradientEnd}
                    onChange={(e) => handleSettingChange('gradientEnd', e.target.value)}
                    className="flex-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Preview */}
            <div 
              className="h-16 rounded-lg border"
              style={{
                background: `linear-gradient(${backgroundSettings.gradientDirection}, ${backgroundSettings.gradientStart} 0%, ${backgroundSettings.gradientEnd} 100%)`
              }}
            />
          </div>

          {/* Gradient Presets */}
          <div className="glass-card p-3 space-y-3">
            <Label className="text-sm font-medium text-wedding-navy">Gradient Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    handleSettingChange('gradientStart', preset.start);
                    handleSettingChange('gradientEnd', preset.end);
                    handleSettingChange('gradientDirection', preset.direction);
                  }}
                  className="glass-card p-2 text-left hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="h-6 rounded mb-1"
                    style={{
                      background: `linear-gradient(${preset.direction}, ${preset.start} 0%, ${preset.end} 100%)`
                    }}
                  />
                  <div className="text-xs font-medium">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Settings */}
      {backgroundSettings.type === 'image' && (
        <div className="space-y-3">
          <div className="glass-card p-3 space-y-3">
            <Label className="text-sm font-medium text-wedding-navy">Image Settings</Label>
            
            {/* Current Image */}
            {backgroundSettings.imageUrl && (
              <div className="space-y-2">
                <Label className="text-xs">Current Background</Label>
                <div className="relative h-24 rounded-lg overflow-hidden border">
                  <img 
                    src={backgroundSettings.imageUrl} 
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Storage Backgrounds */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Select from Storage ({storageBackgrounds.length} images)</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadStorageBackgrounds}
                  disabled={loadingBackgrounds}
                  className="h-6 text-xs"
                >
                  Refresh
                </Button>
              </div>
              {loadingBackgrounds ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent" />
                  <span className="ml-2 text-xs text-muted-foreground">Loading backgrounds...</span>
                </div>
              ) : storageBackgrounds.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No backgrounds found in storage. Upload an image to get started.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {storageBackgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => handleSettingChange('imageUrl', bg.url)}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                        backgroundSettings.imageUrl === bg.url
                          ? 'border-wedding-gold'
                          : 'border-muted hover:border-wedding-gold/50'
                      }`}
                    >
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          console.error(`Failed to load image: ${bg.name}`, bg.url);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiNlMGUwZTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {backgroundSettings.imageUrl === bg.url && (
                        <div className="absolute inset-0 bg-wedding-gold/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-wedding-gold" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-xs text-white truncate">{bg.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload New Image */}
            <div className="space-y-2">
              <Label className="text-xs">Upload New Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadBackgroundImage(file);
                  }}
                  className="flex-1 text-xs"
                  disabled={uploading}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  className="text-xs"
                >
                  {uploading ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <Label className="text-xs">Or Enter Image URL</Label>
              <Input
                type="url"
                value={backgroundSettings.imageUrl}
                onChange={(e) => handleSettingChange('imageUrl', e.target.value)}
                className="text-xs"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Actions */}
      <div className="flex gap-2">
        <Button
          onClick={saveBackgroundSettings}
          disabled={saving}
          className="flex-1 text-xs"
        >
          {saving ? (
            <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent mr-1" />
          ) : (
            <Save className="w-3 h-3 mr-1" />
          )}
          Save Background
        </Button>
        <Button
          onClick={() => {
            const defaultSettings: BackgroundSettings = {
              type: 'gradient',
              imageUrl: 'https://i.ibb.co/0VQTdZfF/Chat-GPT-Image-Jul-8-2025-01-32-20-AM.png',
              gradientStart: 'hsl(40, 33%, 96%)',
              gradientEnd: 'hsl(40, 20%, 92%)',
              gradientDirection: '135deg',
              opacity: 1.0,
            };
            setBackgroundSettings(defaultSettings);
            applyBackgroundPreview(defaultSettings);
          }}
          variant="outline"
          className="text-xs"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default BackgroundManager;