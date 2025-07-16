import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Palette,
  Download,
  Trash2,
  Save,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Camera,
  Lock,
  Database,
  HelpCircle,
  ExternalLink,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    rsvpUpdates: boolean;
    messageNotifications: boolean;
    photoUploads: boolean;
    reminderAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowMessaging: boolean;
    allowPhotoTagging: boolean;
    dataCollection: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    soundEffects: boolean;
  };
  language: string;
  timezone: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      rsvpUpdates: true,
      messageNotifications: true,
      photoUploads: true,
      reminderAlerts: true
    },
    privacy: {
      profileVisibility: 'friends',
      showEmail: false,
      showPhone: false,
      allowMessaging: true,
      allowPhotoTagging: true,
      dataCollection: true
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      soundEffects: true
    },
    language: 'en',
    timezone: 'America/New_York'
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, this would load from user preferences
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Save to localStorage (in a real app, this would save to database)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Apply theme changes
      applyTheme(settings.theme);
      
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasChanges(true);
  };

  const exportData = async () => {
    try {
      // In a real app, this would fetch user's data from the server
      const userData = {
        profile: profile,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-app-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    try {
      // In a real app, this would call the delete account API
      toast.success('Account deletion request submitted');
      // Redirect to home or logout
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-wedding-navy flex items-center">
                <SettingsIcon className="w-6 h-6 mr-2" />
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
          
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                onClick={saveSettings}
                disabled={loading}
                className="bg-wedding-navy hover:bg-wedding-navy/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile?.first_name || ''}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile?.last_name || ''}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile?.display_name || ''}
                      placeholder="How you want to be called"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateSettings('theme', value)}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-colors',
                            settings.theme === value
                              ? 'border-wedding-navy bg-wedding-navy/10 text-wedding-navy'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-sm font-medium">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => updateSettings('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Timezone</Label>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) => updateSettings('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Methods */}
                  <div>
                    <h3 className="font-medium mb-4">Notification Methods</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'email', label: 'Email Notifications', icon: Mail },
                        { key: 'push', label: 'Push Notifications', icon: Smartphone },
                        { key: 'sms', label: 'SMS Notifications', icon: MessageSquare },
                        { key: 'inApp', label: 'In-App Notifications', icon: Bell }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <Label htmlFor={key}>{label}</Label>
                          </div>
                          <Switch
                            id={key}
                            checked={settings.notifications[key as keyof typeof settings.notifications]}
                            onCheckedChange={(checked) => 
                              updateSettings(`notifications.${key}`, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Types */}
                  <div>
                    <h3 className="font-medium mb-4">What to be notified about</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'rsvpUpdates', label: 'RSVP Updates', description: 'When guests respond to invitations' },
                        { key: 'messageNotifications', label: 'New Messages', description: 'When someone sends you a message' },
                        { key: 'photoUploads', label: 'Photo Uploads', description: 'When new photos are shared' },
                        { key: 'reminderAlerts', label: 'Reminder Alerts', description: 'Important wedding date reminders' }
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-start justify-between">
                          <div>
                            <Label htmlFor={key}>{label}</Label>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                          <Switch
                            id={key}
                            checked={settings.notifications[key as keyof typeof settings.notifications]}
                            onCheckedChange={(checked) => 
                              updateSettings(`notifications.${key}`, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Profile Visibility</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'public', label: 'Public', description: 'Visible to everyone' },
                        { value: 'friends', label: 'Friends Only', description: 'Only wedding party and guests' },
                        { value: 'private', label: 'Private', description: 'Only visible to you' }
                      ].map(({ value, label, description }) => (
                        <div key={value} className="flex items-center justify-between">
                          <div>
                            <Label>{label}</Label>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={value}
                            checked={settings.privacy.profileVisibility === value}
                            onChange={(e) => updateSettings('privacy.profileVisibility', e.target.value)}
                            className="text-wedding-navy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'showEmail', label: 'Show Email Address', icon: Mail },
                        { key: 'showPhone', label: 'Show Phone Number', icon: Smartphone }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <Label htmlFor={key}>{label}</Label>
                          </div>
                          <Switch
                            id={key}
                            checked={settings.privacy[key as keyof typeof settings.privacy]}
                            onCheckedChange={(checked) => 
                              updateSettings(`privacy.${key}`, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-4">Interaction Permissions</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'allowMessaging', label: 'Allow Direct Messages', icon: MessageSquare },
                        { key: 'allowPhotoTagging', label: 'Allow Photo Tagging', icon: Camera },
                        { key: 'dataCollection', label: 'Allow Analytics Data Collection', icon: Database }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <Label htmlFor={key}>{label}</Label>
                          </div>
                          <Switch
                            id={key}
                            checked={settings.privacy[key as keyof typeof settings.privacy]}
                            onCheckedChange={(checked) => 
                              updateSettings(`privacy.${key}`, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Accessibility Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Visual Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reduce Motion</Label>
                          <p className="text-xs text-muted-foreground">Minimizes animations and transitions</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.reducedMotion}
                          onCheckedChange={(checked) => 
                            updateSettings('accessibility.reducedMotion', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>High Contrast</Label>
                          <p className="text-xs text-muted-foreground">Increases color contrast for better visibility</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.highContrast}
                          onCheckedChange={(checked) => 
                            updateSettings('accessibility.highContrast', checked)
                          }
                        />
                      </div>

                      <div>
                        <Label>Font Size</Label>
                        <Select
                          value={settings.accessibility.fontSize}
                          onValueChange={(value) => updateSettings('accessibility.fontSize', value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-4">Audio Settings</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {settings.accessibility.soundEffects ? (
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <Label>Sound Effects</Label>
                          <p className="text-xs text-muted-foreground">Play sounds for notifications and interactions</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.accessibility.soundEffects}
                        onCheckedChange={(checked) => 
                          updateSettings('accessibility.soundEffects', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Export Your Data</Label>
                      <p className="text-xs text-muted-foreground">
                        Download a copy of all your data including profile, messages, and photos
                      </p>
                    </div>
                    <Button variant="outline" onClick={exportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Change Password</Label>
                      <p className="text-xs text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="outline">
                      Not Enabled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Support & Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Help Center</Label>
                      <p className="text-xs text-muted-foreground">
                        Browse frequently asked questions and guides
                      </p>
                    </div>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Contact Support</Label>
                      <p className="text-xs text-muted-foreground">
                        Get help from our support team
                      </p>
                    </div>
                    <Button variant="outline">
                      Contact Us
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-red-600">Delete Account</Label>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete your account? This will permanently remove 
                            all your data including messages, photos, and profile information. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;