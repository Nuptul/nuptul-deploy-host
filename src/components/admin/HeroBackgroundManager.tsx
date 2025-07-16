import React, { useState, useRef } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Image, Video, Eye, Smartphone, Monitor } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const HeroBackgroundManager: React.FC = () => {
  const { settings, updateSetting } = useAppSettings();
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, isMobile: boolean = false) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // For now, we'll use a placeholder URL
      // In a real implementation, this would upload to storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const settingKey = isMobile ? 'hero_background_mobile_url' : 'hero_background_url';
        updateSetting(settingKey, url);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload background image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackgroundTypeChange = (value: string) => {
    updateSetting('hero_background_type', value);
  };

  const handleOverlayOpacityChange = (value: number[]) => {
    updateSetting('hero_overlay_opacity', value[0].toString());
  };

  const handlePositionChange = (value: string) => {
    updateSetting('hero_overlay_position', value);
  };

  const handleVideoSettingChange = (key: string, value: boolean) => {
    updateSetting(key as keyof typeof settings, value.toString());
  };

  const overlayOpacity = parseFloat(settings.hero_overlay_opacity || '0.7');
  const currentBackgroundUrl = previewMode === 'mobile' && settings.hero_background_mobile_url 
    ? settings.hero_background_mobile_url 
    : settings.hero_background_url;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Image className="w-6 h-6 text-wedding-navy" />
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy">Hero Background Manager</h2>
          <p className="text-muted-foreground">Manage your hero section background and overlay settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <GlassCard className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="background-type">Background Type</Label>
              <Select value={settings.hero_background_type} onValueChange={handleBackgroundTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Background Upload */}
            <div className="space-y-2">
              <Label htmlFor="desktop-background">Desktop Background</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.hero_background_url}
                  onChange={(e) => updateSetting('hero_background_url', e.target.value)}
                  placeholder="Background URL"
                  className="flex-1"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={settings.hero_background_type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)}
                className="hidden"
              />
            </div>

            {/* Mobile Background Upload */}
            <div className="space-y-2">
              <Label htmlFor="mobile-background">Mobile Background (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.hero_background_mobile_url}
                  onChange={(e) => updateSetting('hero_background_mobile_url', e.target.value)}
                  placeholder="Mobile background URL"
                  className="flex-1"
                />
                <Button
                  onClick={() => mobileFileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={mobileFileInputRef}
                type="file"
                accept={settings.hero_background_type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                className="hidden"
              />
            </div>

            {/* Overlay Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overlay Opacity</Label>
                <span className="text-sm text-muted-foreground">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={handleOverlayOpacityChange}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Overlay Position */}
            <div className="space-y-2">
              <Label>Content Position</Label>
              <Select value={settings.hero_overlay_position} onValueChange={handlePositionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video Settings */}
            {settings.hero_background_type === 'video' && (
              <div className="space-y-4">
                <h4 className="font-medium">Video Settings</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoplay">Autoplay</Label>
                  <Switch
                    id="autoplay"
                    checked={settings.hero_video_autoplay === 'true'}
                    onCheckedChange={(checked) => handleVideoSettingChange('hero_video_autoplay', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="muted">Muted</Label>
                  <Switch
                    id="muted"
                    checked={settings.hero_video_muted === 'true'}
                    onCheckedChange={(checked) => handleVideoSettingChange('hero_video_muted', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="loop">Loop</Label>
                  <Switch
                    id="loop"
                    checked={settings.hero_video_loop === 'true'}
                    onCheckedChange={(checked) => handleVideoSettingChange('hero_video_loop', checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Preview Panel */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={`relative rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div className="aspect-video bg-muted">
                {currentBackgroundUrl ? (
                  settings.hero_background_type === 'video' ? (
                    <video
                      className="w-full h-full object-cover"
                      src={currentBackgroundUrl}
                      muted
                      loop
                      autoPlay
                    />
                  ) : (
                    <img
                      src={currentBackgroundUrl}
                      alt="Hero background preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p>No background selected</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay Preview */}
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity }}
                />
                
                {/* Content Preview */}
                <div className={`absolute inset-0 flex text-white text-center p-4 ${
                  settings.hero_overlay_position === 'center' ? 'items-center justify-center' :
                  settings.hero_overlay_position === 'top' ? 'items-start justify-center pt-8' :
                  settings.hero_overlay_position === 'bottom' ? 'items-end justify-center pb-8' :
                  settings.hero_overlay_position === 'left' ? 'items-center justify-start pl-8' :
                  settings.hero_overlay_position === 'right' ? 'items-center justify-end pr-8' :
                  'items-center justify-center'
                }`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-sm">
                    <div className="text-2xl mb-2">💕</div>
                    <div className="font-bold text-lg mb-1">{settings.app_name}</div>
                    <div className="text-sm opacity-90">Preview Content</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default HeroBackgroundManager;