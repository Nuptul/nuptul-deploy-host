import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Eye, 
  Upload, 
  RefreshCw,
  Palette,
  Type,
  Calendar,
  Clock,
  MapPin,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HomePageSettings {
  couple_names: string;
  welcome_message: string;
  wedding_date: string;
  wedding_time: string;
  ceremony_location: string;
  show_countdown: boolean;
  hero_background_url: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  font_primary: string;
  font_heading: string;
}

const HomePageManager: React.FC = () => {
  const [settings, setSettings] = useState<HomePageSettings>({
    couple_names: 'Tim & Kirsten',
    welcome_message: 'Join us as we celebrate our love and begin our forever journey together.',
    wedding_date: '2025-10-05',
    wedding_time: '15:00',
    ceremony_location: 'Ben Ean Pokolbin',
    show_countdown: true,
    hero_background_url: '',
    theme_primary_color: '#667eea',
    theme_secondary_color: '#FFD700',
    font_primary: 'Inter',
    font_heading: 'Playfair Display'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    setLoading(true);
    try {
      const { data: appSettings, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'couple_names',
          'welcome_message', 
          'wedding_date',
          'wedding_time',
          'ceremony_location',
          'show_countdown',
          'hero_background_url',
          'theme_primary_color',
          'theme_secondary_color',
          'font_primary',
          'font_heading'
        ]);

      if (error) throw error;

      if (appSettings) {
        const settingsMap: Record<string, string> = {};
        appSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });

        setSettings(prev => ({
          ...prev,
          couple_names: settingsMap.couple_names || prev.couple_names,
          welcome_message: settingsMap.welcome_message || prev.welcome_message,
          wedding_date: settingsMap.wedding_date || prev.wedding_date,
          wedding_time: settingsMap.wedding_time || prev.wedding_time,
          ceremony_location: settingsMap.ceremony_location || prev.ceremony_location,
          show_countdown: settingsMap.show_countdown === 'true',
          hero_background_url: settingsMap.hero_background_url || '',
          theme_primary_color: settingsMap.theme_primary_color || prev.theme_primary_color,
          theme_secondary_color: settingsMap.theme_secondary_color || prev.theme_secondary_color,
          font_primary: settingsMap.font_primary || prev.font_primary,
          font_heading: settingsMap.font_heading || prev.font_heading
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load current settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Convert settings to app_settings format
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? value.toString() : value
      }));

      // Upsert each setting
      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      toast.success('Home page settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof HomePageSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-wedding-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Home Page Management</h2>
          <p className="text-muted-foreground">
            Control exactly what guests see on your wedding website homepage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCurrentSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => window.open('/', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Inline Design Controls */}
      <Card className="bg-gradient-to-r from-wedding-purple/10 to-wedding-gold/10 border-wedding-purple/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Label htmlFor="theme-primary">Primary Color:</Label>
              <Input
                id="theme-primary"
                type="color"
                value={settings.theme_primary_color}
                onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                className="w-16 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Gold Accent:</span>
              <Input
                type="color"
                value={settings.theme_secondary_color}
                onChange={(e) => handleInputChange('theme_secondary_color', e.target.value)}
                className="w-16 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Label>Font:</Label>
              <select 
                value={settings.font_heading}
                onChange={(e) => handleInputChange('font_heading', e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="Playfair Display">Playfair Display</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Lora">Lora</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="couple-names">Couple Names</Label>
            <Input
              id="couple-names"
              value={settings.couple_names}
              onChange={(e) => handleInputChange('couple_names', e.target.value)}
              placeholder="Your names here..."
            />
          </div>

          <div>
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={settings.welcome_message}
              onChange={(e) => handleInputChange('welcome_message', e.target.value)}
              placeholder="Join us as we celebrate..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wedding-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Wedding Date
              </Label>
              <Input
                id="wedding-date"
                type="date"
                value={settings.wedding_date}
                onChange={(e) => handleInputChange('wedding_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wedding-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Wedding Time
              </Label>
              <Input
                id="wedding-time"
                type="time"
                value={settings.wedding_time}
                onChange={(e) => handleInputChange('wedding_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ceremony-location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ceremony Location
            </Label>
            <Input
              id="ceremony-location"
              value={settings.ceremony_location}
              onChange={(e) => handleInputChange('ceremony_location', e.target.value)}
              placeholder="Venue name and location"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-countdown"
              checked={settings.show_countdown}
              onCheckedChange={(checked) => handleInputChange('show_countdown', checked)}
            />
            <Label htmlFor="show-countdown">Show countdown timer on homepage</Label>
          </div>

          <div>
            <Label>Hero Background</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <span className="text-sm text-muted-foreground">
                {settings.hero_background_url ? `Current: ${settings.hero_background_url}` : 'No image selected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Content Blocks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage the sections that appear on your homepage
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'venue-info', label: 'Venue Information', enabled: true },
            { id: 'schedule-overview', label: 'Schedule Overview', enabled: true },
            { id: 'accommodation-info', label: 'Accommodation Info', enabled: true },
            { id: 'faq-preview', label: 'FAQ Preview', enabled: false },
            { id: 'gift-registry', label: 'Gift Registry', enabled: true },
            { id: 'travel-info', label: 'Travel Information', enabled: true }
          ].map((block) => (
            <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{block.label}</span>
              <div className="flex items-center gap-2">
                <Switch defaultChecked={block.enabled} />
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Add New Content Block
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HomePageManager;