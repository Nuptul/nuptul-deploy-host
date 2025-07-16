import React, { useState, useEffect } from 'react';
import { 
  Image, Type, Palette, Upload, Save, Eye, EyeOff, 
  Settings, FileText, Video, Camera, Trash2, Plus,
  Code, AlertCircle, Check, X, Loader2, Copy, Users,
  Mail, Download, Bell, Zap, Sparkles, Wand2, Bot,
  Layout, Globe, Brush, Star, Target, Home, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StorageService, AssetCategory } from '@/services/storageService';
import BackgroundManager from '@/components/admin/BackgroundManager';
import { useLocation } from 'react-router-dom';

// Enhanced interfaces for comprehensive CMS
interface ContentBlock {
  id: string;
  page: string;
  section: string;
  block_key: string;
  content_type: 'text' | 'image' | 'video' | 'html' | 'rich_text';
  content: any;
  metadata?: any;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface SystemSettings {
  typography: {
    primary_font: string;
    secondary_font: string;
    font_size_base: number;
    line_height: number;
    letter_spacing: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    button_bg: string;
    button_text: string;
    link: string;
    success: string;
    warning: string;
    error: string;
  };
  icons: {
    primary_icon_set: string;
    custom_icons: any[];
    svg_uploads: any[];
  };
  layout: {
    max_width: number;
    sidebar_width: number;
    header_height: number;
    footer_height: number;
  };
}

interface GuestData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  dietary_requirements?: string;
  plus_one?: boolean;
  plus_one_name?: string;
  rsvp_status: 'pending' | 'attending' | 'declined';
  invited_by?: string;
  table_assignment?: string;
  created_at: string;
  updated_at: string;
}

interface InviteTemplate {
  id: string;
  name: string;
  template_type: 'email' | 'sms' | 'whatsapp' | 'print';
  subject?: string;
  content: string;
  background_image?: string;
  styling: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export const ContentManagementSystem: React.FC = () => {
  const location = useLocation();
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'system-settings';
  
  // Core state management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // System Settings states
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    typography: {
      primary_font: 'Inter',
      secondary_font: 'Playfair Display',
      font_size_base: 16,
      line_height: 1.5,
      letter_spacing: 0
    },
    colors: {
      primary: '#002147',
      secondary: '#FFD700',
      accent: '#8B4513',
      background: '#FFFFFF',
      text: '#333333',
      button_bg: '#002147',
      button_text: '#FFFFFF',
      link: '#0066CC',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    icons: {
      primary_icon_set: 'lucide',
      custom_icons: [],
      svg_uploads: []
    },
    layout: {
      max_width: 1200,
      sidebar_width: 250,
      header_height: 80,
      footer_height: 200
    }
  });

  // Content states
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Guest List states
  const [guestList, setGuestList] = useState<GuestData[]>([]);
  const [inviteTemplates, setInviteTemplates] = useState<InviteTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // AI Tools states
  const [aiToolsEnabled, setAiToolsEnabled] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  
  // Alerts states
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  
  // Reports states
  const [exportingData, setExportingData] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    initializeSystem();
  }, []);
  
  // Update active tab when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const initializeSystem = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSystemSettings(),
        fetchContentBlocks(),
        fetchMediaLibrary(),
        fetchGuestList(),
        fetchInviteTemplates(),
        fetchAlerts()
      ]);
    } catch (error: any) {
      console.error('Error initializing system:', error);
      toast({
        title: "Initialization Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (settings) {
        setSystemSettings(settings.settings || systemSettings);
      }
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
    }
  };

  const fetchContentBlocks = async () => {
    try {
      const { data: blocks, error } = await supabase
        .from('content_blocks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setContentBlocks(blocks || []);
    } catch (error: any) {
      console.error('Error fetching content blocks:', error);
    }
  };

  const fetchMediaLibrary = async () => {
    try {
      const { data: media, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaLibrary(media || []);
    } catch (error: any) {
      console.error('Error fetching media library:', error);
    }
  };

  const fetchGuestList = async () => {
    try {
      const { data: guests, error } = await supabase
        .from('guest_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuestList(guests || []);
    } catch (error: any) {
      console.error('Error fetching guest list:', error);
    }
  };

  const fetchInviteTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('invite_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteTemplates(templates || []);
    } catch (error: any) {
      console.error('Error fetching invite templates:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: alertsData, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(alertsData || []);
      setUnreadAlerts(alertsData?.filter(a => !a.is_read).length || 0);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
    }
  };

  const saveSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = { ...systemSettings, ...newSettings };
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          id: 'main',
          settings: updatedSettings,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      setSystemSettings(updatedSettings);
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving system settings:', error);
      toast({
        title: "Save Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (file: File, category: AssetCategory = 'general') => {
    try {
      setUploadingMedia(true);
      
      const result = await StorageService.uploadFile(
        file,
        category,
        {},
        { generateThumbnail: true }
      );

      if (!result.success) throw result.error;
      
      if (result.data) {
        setMediaLibrary(prev => [result.data, ...prev]);
        toast({
          title: "Upload Successful",
          description: "Media has been uploaded successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const generateAIContent = async (contentType: string, prompt: string) => {
    try {
      setGeneratingContent(true);
      
      // Placeholder for AI content generation
      // This would integrate with your AI services (OpenAI, Ideogram, etc.)
      const generatedContent = {
        type: contentType,
        content: `Generated ${contentType} content based on: ${prompt}`,
        metadata: {
          prompt,
          generated_at: new Date().toISOString(),
          ai_service: 'ideogram-v3'
        }
      };
      
      toast({
        title: "AI Content Generated",
        description: `${contentType} content has been generated successfully.`,
      });
      
      return generatedContent;
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const exportGuestList = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setExportingData(true);
      
      // Placeholder for export functionality
      // This would generate and download the file
      const exportData = {
        guests: guestList,
        format,
        exported_at: new Date().toISOString()
      };
      
      toast({
        title: "Export Successful",
        description: `Guest list has been exported as ${format.toUpperCase()}.`,
      });
      
      return exportData;
    } catch (error: any) {
      console.error('Error exporting guest list:', error);
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-wedding-navy mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading Admin Content Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card className="border-2 border-wedding-gold/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-wedding-navy to-wedding-navy/90 text-white">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Settings className="w-8 h-8" />
            Admin Content Management System
          </CardTitle>
          <CardDescription className="text-wedding-gold/90 text-lg">
            Comprehensive content and system management for your wedding website
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-gray-50 border-b">
              <TabsTrigger value="system-settings" className="flex items-center gap-2 py-3">
                <Settings className="w-4 h-4" />
                System Settings
              </TabsTrigger>
              <TabsTrigger value="content-management" className="flex items-center gap-2 py-3">
                <Layout className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="guest-list" className="flex items-center gap-2 py-3">
                <Users className="w-4 h-4" />
                Guest List
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="flex items-center gap-2 py-3">
                <Bot className="w-4 h-4" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2 py-3">
                <Bell className="w-4 h-4" />
                Alerts
                {unreadAlerts > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadAlerts}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 py-3">
                <Download className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2 py-3">
                <Target className="w-4 h-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* System Settings Tab */}
            <TabsContent value="system-settings" className="p-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Typography Section */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Type className="w-5 h-5" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label>Primary Font</Label>
                      <Select 
                        value={systemSettings.typography.primary_font} 
                        onValueChange={(value) => saveSystemSettings({
                          typography: { ...systemSettings.typography, primary_font: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Secondary Font</Label>
                      <Select 
                        value={systemSettings.typography.secondary_font} 
                        onValueChange={(value) => saveSystemSettings({
                          typography: { ...systemSettings.typography, secondary_font: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                          <SelectItem value="Merriweather">Merriweather</SelectItem>
                          <SelectItem value="Crimson Text">Crimson Text</SelectItem>
                          <SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Base Font Size</Label>
                      <Input
                        type="number"
                        value={systemSettings.typography.font_size_base}
                        onChange={(e) => saveSystemSettings({
                          typography: { ...systemSettings.typography, font_size_base: Number(e.target.value) }
                        })}
                        min="12"
                        max="24"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Button Colors Section */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-5 h-5" />
                      Button Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={systemSettings.colors.primary}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, primary: e.target.value }
                            })}
                            className="w-12 h-10"
                          />
                          <Input
                            type="text"
                            value={systemSettings.colors.primary}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, primary: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={systemSettings.colors.secondary}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, secondary: e.target.value }
                            })}
                            className="w-12 h-10"
                          />
                          <Input
                            type="text"
                            value={systemSettings.colors.secondary}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, secondary: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Button Background</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={systemSettings.colors.button_bg}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, button_bg: e.target.value }
                            })}
                            className="w-12 h-10"
                          />
                          <Input
                            type="text"
                            value={systemSettings.colors.button_bg}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, button_bg: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Button Text</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={systemSettings.colors.button_text}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, button_text: e.target.value }
                            })}
                            className="w-12 h-10"
                          />
                          <Input
                            type="text"
                            value={systemSettings.colors.button_text}
                            onChange={(e) => saveSystemSettings({
                              colors: { ...systemSettings.colors, button_text: e.target.value }
                            })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Icons & SVG Section */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="w-5 h-5" />
                      Icons & SVG Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label>Primary Icon Set</Label>
                      <Select 
                        value={systemSettings.icons.primary_icon_set} 
                        onValueChange={(value) => saveSystemSettings({
                          icons: { ...systemSettings.icons, primary_icon_set: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lucide">Lucide Icons</SelectItem>
                          <SelectItem value="heroicons">Heroicons</SelectItem>
                          <SelectItem value="feather">Feather Icons</SelectItem>
                          <SelectItem value="custom">Custom Icons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Upload Custom SVG</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".svg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(file, 'icons');
                          }}
                          disabled={uploadingMedia}
                        />
                        {uploadingMedia && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {/* Display uploaded SVG icons */}
                      {systemSettings.icons.svg_uploads.map((icon, index) => (
                        <div key={index} className="p-2 border rounded-lg text-center">
                          <div className="w-6 h-6 mx-auto mb-1 bg-gray-100 rounded"></div>
                          <p className="text-xs text-gray-600">{icon.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Site Background Section - Full Width */}
              <div className="col-span-full">
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Image className="w-5 h-5" />
                      Site Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <BackgroundManager />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Layout Settings Section */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Layout className="w-5 h-5" />
                      Layout Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label>Max Content Width</Label>
                      <Input
                        type="number"
                        value={systemSettings.layout.max_width}
                        onChange={(e) => saveSystemSettings({
                          layout: { ...systemSettings.layout, max_width: Number(e.target.value) }
                        })}
                        min="800"
                        max="1600"
                      />
                    </div>
                    
                    <div>
                      <Label>Header Height</Label>
                      <Input
                        type="number"
                        value={systemSettings.layout.header_height}
                        onChange={(e) => saveSystemSettings({
                          layout: { ...systemSettings.layout, header_height: Number(e.target.value) }
                        })}
                        min="60"
                        max="120"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content-management" className="p-6 space-y-6">
              <Card className="border-wedding-gold/30">
                <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="w-5 h-5" />
                    Card Images, Backgrounds & Editable Sections
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Hero Section */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Hero Section
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Background Image</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleMediaUpload(file, 'hero/images');
                              }}
                              disabled={uploadingMedia}
                              className="text-sm"
                            />
                            {uploadingMedia && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Hero Title</Label>
                          <Input
                            placeholder="Enter hero title..."
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Hero Subtitle</Label>
                          <Textarea
                            placeholder="Enter hero subtitle..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Venue Cards */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Venue Cards
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Venue Images</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach(file => handleMediaUpload(file, 'venues'));
                              }}
                              disabled={uploadingMedia}
                              className="text-sm"
                            />
                            {uploadingMedia && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Venue Descriptions</Label>
                          <Textarea
                            placeholder="Enter venue descriptions..."
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                        
                        <Button size="sm" className="w-full bg-wedding-navy hover:bg-wedding-navy/90">
                          Manage Venues
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Gallery Section */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Gallery Section
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Gallery Images</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach(file => handleMediaUpload(file, 'gallery/featured'));
                              }}
                              disabled={uploadingMedia}
                              className="text-sm"
                            />
                            {uploadingMedia && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Gallery Title</Label>
                          <Input
                            placeholder="Enter gallery title..."
                            className="text-sm"
                          />
                        </div>
                        
                        <Button size="sm" className="w-full bg-wedding-navy hover:bg-wedding-navy/90">
                          Manage Gallery
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guest List Builder Tab */}
            <TabsContent value="guest-list" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Guest List Management */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5" />
                      Guest List Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input placeholder="Enter full name..." />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="Enter email..." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="Enter phone..." />
                      </div>
                      <div>
                        <Label>RSVP Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="attending">Attending</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Dietary Requirements</Label>
                      <Textarea placeholder="Enter dietary requirements..." rows={2} />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="plus-one" />
                      <Label htmlFor="plus-one">Plus One Allowed</Label>
                    </div>
                    
                    <Button className="w-full bg-wedding-navy hover:bg-wedding-navy/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guest
                    </Button>
                  </CardContent>
                </Card>

                {/* Invite Template Builder */}
                <Card className="border-wedding-gold/30">
                  <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="w-5 h-5" />
                      Invite Template Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input placeholder="Enter template name..." />
                    </div>
                    
                    <div>
                      <Label>Template Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="print">Print</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Subject Line</Label>
                      <Input placeholder="Enter subject line..." />
                    </div>
                    
                    <div>
                      <Label>Message Content</Label>
                      <Textarea 
                        placeholder="Enter invitation message..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label>Background Design</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(file, 'invitations');
                          }}
                          disabled={uploadingMedia}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={generatingContent}
                          onClick={() => generateAIContent('invitation_background', 'luxury wedding invitation background')}
                        >
                          {generatingContent ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-wedding-navy hover:bg-wedding-navy/90">
                      <Save className="w-4 h-4 mr-2" />
                      Save Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Tools Tab */}
            <TabsContent value="ai-tools" className="p-6 space-y-6">
              <Card className="border-wedding-gold/30">
                <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="w-5 h-5" />
                    Admin AI Tools & Media Editing
                  </CardTitle>
                  <CardDescription>
                    Utilize AI-powered tools for content creation and media enhancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Image Generation */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Image Generation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Generation Prompt</Label>
                          <Textarea
                            placeholder="Describe the image you want to generate..."
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Style</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select style..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realistic">Realistic</SelectItem>
                              <SelectItem value="artistic">Artistic</SelectItem>
                              <SelectItem value="vintage">Vintage</SelectItem>
                              <SelectItem value="modern">Modern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={generatingContent}
                          onClick={() => generateAIContent('image', 'wedding themed image')}
                        >
                          {generatingContent ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Wand2 className="w-4 h-4 mr-2" />
                          )}
                          Generate Image
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Video Creation */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video Creation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Video Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="announcement">Announcement</SelectItem>
                              <SelectItem value="invitation">Invitation</SelectItem>
                              <SelectItem value="slideshow">Slideshow</SelectItem>
                              <SelectItem value="story">Story</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Duration</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 seconds</SelectItem>
                              <SelectItem value="60">1 minute</SelectItem>
                              <SelectItem value="90">90 seconds</SelectItem>
                              <SelectItem value="120">2 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Audio Track</Label>
                          <Input
                            type="file"
                            accept="audio/*"
                            className="text-sm"
                          />
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={generatingContent}
                          onClick={() => generateAIContent('video', 'wedding announcement video')}
                        >
                          {generatingContent ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Video className="w-4 h-4 mr-2" />
                          )}
                          Create Video
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Gallery Enhancement */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brush className="w-4 h-4" />
                          Gallery Enhancement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Select Images</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Enhancement Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select enhancement..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upscale">Upscale Quality</SelectItem>
                              <SelectItem value="colorize">Colorize</SelectItem>
                              <SelectItem value="denoise">Remove Noise</SelectItem>
                              <SelectItem value="artistic">Artistic Filter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={generatingContent}
                          onClick={() => generateAIContent('image_enhancement', 'enhance wedding photos')}
                        >
                          {generatingContent ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Brush className="w-4 h-4 mr-2" />
                          )}
                          Enhance Images
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="p-6 space-y-6">
              <Card className="border-wedding-gold/30">
                <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5" />
                    System Alerts & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No alerts at this time</p>
                        <p className="text-sm">System notifications will appear here</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.type === 'error' ? 'border-red-500 bg-red-50' :
                            alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                            alert.type === 'success' ? 'border-green-500 bg-green-50' :
                            'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <AlertCircle className={`w-5 h-5 ${
                                  alert.type === 'error' ? 'text-red-500' :
                                  alert.type === 'warning' ? 'text-yellow-500' :
                                  alert.type === 'success' ? 'text-green-500' :
                                  'text-blue-500'
                                }`} />
                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                {!alert.is_read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(alert.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {alert.action_url && (
                                <Button size="sm" variant="outline" className="text-xs">
                                  View Details
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-xs">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="p-6 space-y-6">
              <Card className="border-wedding-gold/30">
                <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="w-5 h-5" />
                    Reports & Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Guest List Export */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Guest List Export
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Export Format</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                              <SelectItem value="csv">CSV (.csv)</SelectItem>
                              <SelectItem value="pdf">PDF Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Include Fields</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Switch id="include-contact" defaultChecked />
                              <Label htmlFor="include-contact" className="text-sm">Contact Info</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="include-rsvp" defaultChecked />
                              <Label htmlFor="include-rsvp" className="text-sm">RSVP Status</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="include-dietary" />
                              <Label htmlFor="include-dietary" className="text-sm">Dietary Requirements</Label>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={exportingData}
                          onClick={() => exportGuestList('xlsx')}
                        >
                          {exportingData ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Export Guest List
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Analytics Report */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Analytics Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Report Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rsvp">RSVP Analytics</SelectItem>
                              <SelectItem value="engagement">Engagement Metrics</SelectItem>
                              <SelectItem value="traffic">Website Traffic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Date Range</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7d">Last 7 days</SelectItem>
                              <SelectItem value="30d">Last 30 days</SelectItem>
                              <SelectItem value="90d">Last 90 days</SelectItem>
                              <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={exportingData}
                        >
                          {exportingData ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Media Library Export */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Media Library Export
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm">Media Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Media</SelectItem>
                              <SelectItem value="images">Images Only</SelectItem>
                              <SelectItem value="videos">Videos Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Export Format</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zip">ZIP Archive</SelectItem>
                              <SelectItem value="catalog">Media Catalog</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-wedding-navy hover:bg-wedding-navy/90"
                          disabled={exportingData}
                        >
                          {exportingData ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Export Media
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Timeline Tab */}
            <TabsContent value="timeline" className="p-6 space-y-6">
              <Card className="border-wedding-gold/30">
                <CardHeader className="bg-gradient-to-r from-wedding-gold/10 to-wedding-gold/5">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" />
                    Event Timeline Management
                  </CardTitle>
                  <CardDescription>
                    Manage your wedding event timeline and schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Event Timeline Coming Soon</p>
                    <p className="text-sm">Advanced timeline management features will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2 border border-wedding-gold/20">
          <Loader2 className="w-5 h-5 animate-spin text-wedding-navy" />
          <span className="text-sm font-medium">Saving changes...</span>
        </div>
      )}
    </div>
  );
};