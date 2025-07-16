import React, { useState, useEffect } from 'react';
import { Palette, Eye, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

const ThemeManager: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>({
    primary: 'hsl(210, 22%, 22%)', // Wedding navy
    secondary: 'hsl(40, 33%, 94%)', // Wedding cream  
    accent: 'hsl(220, 68%, 50%)', // Glass blue
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const presetThemes = [
    {
      name: 'Classic Wedding',
      colors: {
        primary: 'hsl(210, 22%, 22%)',
        secondary: 'hsl(40, 33%, 94%)',
        accent: 'hsl(220, 68%, 50%)',
      }
    },
    {
      name: 'Romantic Rose',
      colors: {
        primary: 'hsl(330, 68%, 60%)',
        secondary: 'hsl(25, 45%, 92%)',
        accent: 'hsl(340, 75%, 65%)',
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: 'hsl(142, 76%, 25%)',
        secondary: 'hsl(60, 20%, 95%)',
        accent: 'hsl(142, 76%, 47%)',
      }
    },
    {
      name: 'Royal Purple',
      colors: {
        primary: 'hsl(256, 68%, 35%)',
        secondary: 'hsl(280, 20%, 96%)',
        accent: 'hsl(256, 68%, 58%)',
      }
    }
  ];

  useEffect(() => {
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['theme_primary', 'theme_secondary', 'theme_accent']);

      if (data && data.length > 0) {
        const themeData: Partial<ThemeColors> = {};
        data.forEach(setting => {
          if (setting.setting_key === 'theme_primary' && setting.setting_value) {
            themeData.primary = setting.setting_value;
          }
          if (setting.setting_key === 'theme_secondary' && setting.setting_value) {
            themeData.secondary = setting.setting_value;
          }
          if (setting.setting_key === 'theme_accent' && setting.setting_value) {
            themeData.accent = setting.setting_value;
          }
        });
        
        setCurrentTheme(prev => ({ ...prev, ...themeData }));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const applyTheme = (theme: ThemeColors) => {
    if (previewMode) {
      // Apply theme to CSS variables for preview
      document.documentElement.style.setProperty('--wedding-navy', theme.primary.replace('hsl(', '').replace(')', ''));
      document.documentElement.style.setProperty('--wedding-cream', theme.secondary.replace('hsl(', '').replace(')', ''));
      document.documentElement.style.setProperty('--glass-blue-tint', theme.accent.replace('hsl(', '').replace(')', ''));
    }
  };

  const saveTheme = async () => {
    setSaving(true);
    try {
      const themeSettings = [
        { setting_key: 'theme_primary', setting_value: currentTheme.primary },
        { setting_key: 'theme_secondary', setting_value: currentTheme.secondary },
        { setting_key: 'theme_accent', setting_value: currentTheme.accent },
      ];

      for (const setting of themeSettings) {
        await supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'setting_key' });
      }

      // Apply theme permanently
      applyTheme(currentTheme);
      
      toast({
        title: "Theme Saved",
        description: "Your theme has been applied successfully",
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = () => {
    const defaultTheme = presetThemes[0].colors;
    setCurrentTheme(defaultTheme);
    if (previewMode) {
      applyTheme(defaultTheme);
    }
  };

  const handleColorChange = (colorType: keyof ThemeColors, value: string) => {
    const newTheme = { ...currentTheme, [colorType]: value };
    setCurrentTheme(newTheme);
    if (previewMode) {
      applyTheme(newTheme);
    }
  };

  return (
    <div className="space-y-4">
      {/* Theme Preview Toggle */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-glass-purple" />
          <span className="text-sm font-medium">Theme Manager</span>
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

      {/* Color Controls */}
      <div className="space-y-3">
        <div className="glass-card p-3 space-y-3">
          <Label className="text-sm font-medium text-wedding-navy">Custom Colors</Label>
          
          {/* Primary Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Primary Color</Label>
              <Badge variant="outline" className="text-xs">Main Brand</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <Input
                type="text"
                value={currentTheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 text-xs font-mono"
                placeholder="hsl(210, 22%, 22%)"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Secondary Color</Label>
              <Badge variant="outline" className="text-xs">Background</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: currentTheme.secondary }}
              />
              <Input
                type="text"
                value={currentTheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 text-xs font-mono"
                placeholder="hsl(40, 33%, 94%)"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Accent Color</Label>
              <Badge variant="outline" className="text-xs">Highlights</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: currentTheme.accent }}
              />
              <Input
                type="text"
                value={currentTheme.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="flex-1 text-xs font-mono"
                placeholder="hsl(220, 68%, 50%)"
              />
            </div>
          </div>
        </div>

        {/* Preset Themes */}
        <div className="glass-card p-3 space-y-3">
          <Label className="text-sm font-medium text-wedding-navy">Preset Themes</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setCurrentTheme(preset.colors);
                  if (previewMode) applyTheme(preset.colors);
                }}
                className="glass-card p-2 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={saveTheme}
            disabled={saving}
            className="flex-1 text-xs"
          >
            {saving ? (
              <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent mr-1" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            Save Theme
          </Button>
          <Button
            onClick={resetTheme}
            variant="outline"
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;