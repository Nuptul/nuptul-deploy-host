import React, { useState } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Settings, Calendar, MessageCircle, Heart, Image } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MediaManagement from '@/components/admin/MediaManagement';
import RichTextEditor from '@/components/admin/RichTextEditor';

const AppSettingsManager: React.FC = () => {
  const { settings, loading, updateSetting, loadSettings } = useAppSettings();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      await updateSetting(key as keyof typeof settings, value);
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const SettingField: React.FC<{
    label: string;
    value: string;
    settingKey: string;
    type?: 'text' | 'textarea' | 'datetime-local' | 'url';
    placeholder?: string;
    rows?: number;
  }> = ({ label, value, settingKey, type = 'text', placeholder, rows = 3 }) => {
    const [localValue, setLocalValue] = useState(value);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const hasChanges = localValue !== value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    };

    const handleSaveLocal = async () => {
      if (hasChanges) {
        await handleSave(settingKey, localValue);
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={settingKey} className="text-sm font-medium">{label}</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            {type === 'textarea' ? (
              <Textarea
                id={settingKey}
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                className="resize-none"
              />
            ) : (
              <Input
                id={settingKey}
                type={type}
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
              />
            )}
          </div>
          <Button
            onClick={handleSaveLocal}
            disabled={!hasChanges || isSaving}
            variant={hasChanges ? 'default' : 'outline'}
            size="sm"
            className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Save className="w-4 h-4" />
            {hasChanges && <span className="ml-1 text-xs">Save</span>}
          </Button>
        </div>
      </div>
    );
  };

  const RichSettingField: React.FC<{
    label: string;
    value: string;
    settingKey: string;
    placeholder?: string;
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
  }> = ({ label, value, settingKey, placeholder, fontFamily = "Inter", fontSize = "16px", textColor = "#333333" }) => {
    const [localValue, setLocalValue] = useState(value);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = (newValue: string) => {
      setLocalValue(newValue);
    };

    const handleSaveLocal = async () => {
      await handleSave(settingKey, localValue);
    };

    return (
      <RichTextEditor
        label={label}
        value={localValue}
        onChange={handleChange}
        onSave={handleSaveLocal}
        placeholder={placeholder}
        fontFamily={fontFamily}
        fontSize={fontSize}
        textColor={textColor}
        className="space-y-2"
      />
    );
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading settings...</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-wedding-navy" />
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy">App Settings</h2>
          <p className="text-muted-foreground">Manage your wedding website content</p>
        </div>
      </div>

      {/* Main App Settings */}
      <GlassCard className="p-6">
        <div className="space-y-6">
          <SettingField
            label="App Name"
            value={settings.app_name}
            settingKey="app_name"
            placeholder="Tim & Kirsten"
          />
          
          <SettingField
            label="Wedding Date & Time"
            value={settings.wedding_date}
            settingKey="wedding_date"
            type="datetime-local"
          />
          
          <RichSettingField
            label="Hero Subtitle"
            value={settings.hero_subtitle}
            settingKey="hero_subtitle"
            placeholder="Join us for the celebration of our love story..."
            fontFamily="Playfair Display"
            fontSize="24px"
            textColor="#2C3E50"
          />
          
          <RichSettingField
            label="Welcome Message"
            value={settings.welcome_message}
            settingKey="welcome_message"
            placeholder="Welcome to our wedding website! We're so excited to share this special day with you."
            fontFamily="Inter"
            fontSize="18px"
            textColor="#2C3E50"
          />
          
          <RichSettingField
            label="Countdown Message"
            value={settings.countdown_message}
            settingKey="countdown_message"
            placeholder="We can't wait to see you at our celebration!"
            fontFamily="Inter"
            fontSize="16px"
            textColor="#2C3E50"
          />
          
          <RichSettingField
            label="Footer Message"
            value={settings.footer_message}
            settingKey="footer_message"
            placeholder="Made with love for our special day"
            fontFamily="Inter"
            fontSize="14px"
            textColor="#7F8C8D"
          />
        </div>
      </GlassCard>

      {/* Unified Media & Background Manager - Replaces old duplicate sections */}
      <div className="mt-8">
        <MediaManagement />
      </div>
    </div>
  );
};

export default AppSettingsManager;