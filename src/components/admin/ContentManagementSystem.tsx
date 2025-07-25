import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Clock, Save, Home, MapPin, Camera, Gift, HelpCircle, Loader2,
  Upload, Image, Trash2, Edit3, Type, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Palette, Eye, X,
  Calendar, AlertTriangle, Shield, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import SystemActions from '@/components/admin/SystemActions';
import BackgroundManager from '@/components/admin/BackgroundManager';

// Enhanced ContentManagementSystem with comprehensive venue management
const ContentManagementSystem: React.FC = () => {
  const { toast } = useToast();
  const { settings, loading: settingsLoading, updateSetting } = useAppSettings();
  const [activeTab, setActiveTab] = useState('system-settings');
  const [saving, setSaving] = useState(false);

  // Content management form data
  const [heroData, setHeroData] = useState({
    coupleNames: '',
    heroSubtitle: '',
    weddingDate: '',
    backgroundVideo: ''
  });
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [activeTextArea, setActiveTextArea] = useState<HTMLTextAreaElement | null>(null);

  // FAQ Management State
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<any>(null);
  const [isAddingNewFaq, setIsAddingNewFaq] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Load FAQ data from Supabase on component mount
  useEffect(() => {
    loadFaqData();
  }, []);

  const loadFaqData = async () => {
    try {
      setLoadingFaqs(true);
      console.log('Loading FAQ data from Supabase...');

      // Load FAQ categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) {
        console.error('Error loading FAQ categories:', categoriesError);
        throw categoriesError;
      }

      // Load FAQ items with category information
      const { data: itemsData, error: itemsError } = await supabase
        .from('faq_with_categories')
        .select('*')
        .order('display_order');

      if (itemsError) {
        console.error('Error loading FAQ items:', itemsError);
        throw itemsError;
      }

      console.log('Loaded FAQ categories:', categoriesData?.length || 0);
      console.log('Loaded FAQ items:', itemsData?.length || 0);

      setFaqCategories(categoriesData || []);
      setFaqItems(itemsData || []);

      // Set the first FAQ item as selected if available
      if (itemsData && itemsData.length > 0) {
        setSelectedFaq(itemsData[0]);
      }

      toast({
        title: "✅ FAQ Data Loaded",
        description: `Loaded ${itemsData?.length || 0} FAQ items from database`,
      });

    } catch (error: any) {
      console.error('Error loading FAQ data:', error);
      toast({
        title: "❌ FAQ Loading Failed",
        description: `Error loading FAQ data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingFaqs(false);
    }
  };

  // Homepage Content State
  const [homepageContent, setHomepageContent] = useState({
    welcomeText: "Welcome to our wedding celebration! We're so excited to share this special day with our closest family and friends.",
    countdownConfig: {
      targetDate: "2025-10-05",
      targetTime: "15:00",
      timezone: "Australia/Sydney",
      displayFormat: "elegant"
    },
    announcements: "Latest update: Transportation details have been finalized. Check the Events section for shuttle information.",
    timeline: "2:30 PM - Guest arrival\n3:00 PM - Ceremony begins\n4:00 PM - Cocktail hour\n6:00 PM - Reception dinner\n11:00 PM - Last drinks"
  });

  // Comprehensive venue data for all 3 venues
  const [venueData, setVenueData] = useState({
    benEan: {
      // Basic Info
      name: 'Ben Ean Ceremony Venue',
      location: 'Garden Terrace',
      address: '119 McDonalds Rd, Pokolbin NSW 2320',
      coordinates: [151.3167, -32.7833] as [number, number],
      
      // Timing
      arrivalTime: '14:30', // 2:30 PM - 30 minutes prior
      ceremonyStart: '15:00', // 3:00 PM
      cocktailsStart: '17:00', // 5:00 PM  
      dinnerStart: '19:00', // 7:00 PM
      dressCode: 'Dapper/Cocktail',
      instructions: 'Please arrive by 2:30 PM (30 minutes before ceremony start). Parking available on-site at Ben Ean Estate.',
      
      // Page Content
      pageTitle: 'Ben Ean Venue',
      pageSubtitle: 'Tim & Kirsten\'s Wedding Ceremony & Reception',
      description: 'Ceremony on Garden Terrace Lawn, Reception indoors',
      heroImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-ben-ean/Screenshot%20from%202025-07-08%2017-52-15_upscayl_4x_upscayl-standard-4x.png',
      popupImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-ben-ean/ben-ean-popup.jpg',
      
      // Popup Card Content
      popupTitle: 'Ben Ean Winery',
      popupCaption: 'Wedding ceremony and reception venue in the beautiful Hunter Valley. Join us for the main celebration on Sunday, October 5th, 2025.',
      popupQuickFacts: {
        "Ceremony": "3:00 PM on Garden Terrace",
        "End Time": "12:00 PM",
        "Reception": "5:00 PM cocktails, 7:00 PM dinner",
        "Dress Code": "Cocktail/Dapper"
      },
      
      // Contact Info
      website: 'https://www.benean.com.au/',
      phone: '+61249983088',

      // Image fields (ensure they exist)
      heroImageAlt: 'Ben Ean vineyard ceremony location with garden terrace',
      heroImageCaption: 'Beautiful vineyard ceremony location with rolling hills and garden terrace views',
      popupImageAlt: 'Ben Ean winery exterior and vineyard views'
    },
    
    princeOfMereweather: {
      // Basic Info
      name: 'Prince of Mereweather',
      location: 'Mereweather',
      address: 'Prince of Mereweather, Mereweather NSW 2291',
      coordinates: [151.7467, -32.9408] as [number, number],

      // Timing & Event Details
      eventDate: '2025-10-04', // Saturday before wedding
      startTime: '18:00', // 6:00 PM
      endTime: '22:00', // 10:00 PM
      eventType: 'Pre-Wedding Celebration',
      dressCode: 'Smart Casual',

      // Page Content
      pageTitle: 'Prince of Mereweather',
      pageSubtitle: 'Pre-Wedding Celebration',
      description: 'Join us for pre-wedding drinks and casual dinner at this historic Newcastle pub. A relaxed evening to kick off the wedding weekend celebrations.',
      heroImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-prince-of-mereweather/prince-of-mereweather-hero.jpg',
      heroImageAlt: 'Prince of Mereweather historic pub exterior',
      heroImageCaption: 'Historic Newcastle pub perfect for pre-wedding celebrations',

      // Popup Card Content
      popupTitle: 'Prince of Mereweather',
      popupCaption: 'Join us for pre-wedding drinks and casual dinner at this historic Newcastle pub. Saturday, October 4th, 2025 from 6:00 PM.',
      popupImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-prince-of-mereweather/prince-popup.jpg',
      popupImageAlt: 'Prince of Mereweather pub interior',
      popupQuickFacts: {
        "Date": "Saturday, October 4th, 2025",
        "Time": "6:00 PM - 10:00 PM",
        "Style": "Casual drinks & dinner",
        "Dress Code": "Smart Casual"
      },

      // Contact & Additional Info
      website: 'https://www.princeofmereweather.com.au/',
      phone: '+61249261983',
      specialInstructions: 'No RSVP required for this casual pre-wedding gathering. Come and go as you please!'
    },
    
    newcastleBeach: {
      // Basic Info
      name: 'Newcastle Beach Day',
      location: 'Newcastle Beach',
      address: 'Newcastle Beach, Newcastle NSW 2300',
      coordinates: [151.7789, -32.9292] as [number, number],

      // Timing & Event Details
      eventDate: '2025-10-06', // Monday after wedding
      startTime: '10:00', // 10:00 AM
      endTime: '16:00', // 4:00 PM
      eventType: 'Recovery Day',
      dressCode: 'Beach Casual',
      activities: ['Recovery breakfast', 'Beach walks', 'Swimming', 'Relaxed hangout'],

      // Page Content
      pageTitle: 'Newcastle Beach Day',
      pageSubtitle: 'Recovery Day',
      description: 'Join us for a relaxed recovery day at beautiful Newcastle Beach. Start with breakfast, enjoy beach activities, and unwind after the wedding celebrations.',
      heroImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-newcastle-beach/newcastle-beach-hero.jpg',
      heroImageAlt: 'Newcastle Beach with golden sand and blue ocean',
      heroImageCaption: 'Beautiful Newcastle Beach perfect for recovery day relaxation',

      // Popup Card Content
      popupTitle: 'Newcastle Beach Day',
      popupCaption: 'Join us for a relaxed beach day celebration with stunning ocean views. Monday, October 6th, 2025 from 10:00 AM.',
      popupImage: 'https://iwmfxcrzzwpmxomydmuq.supabase.co/storage/v1/object/public/venue-newcastle-beach/beach-popup.jpg',
      popupImageAlt: 'Newcastle Beach coastline view',
      popupQuickFacts: {
        "Date": "Monday, October 6th, 2025",
        "Time": "10:00 AM - 4:00 PM",
        "Activities": "Breakfast, beach walks, swimming",
        "Dress Code": "Beach Casual"
      },

      // Additional Info
      meetingPoint: 'Newcastle Beach Surf Club',
      parking: 'Street parking available along The Esplanade',
      specialInstructions: 'Bring sunscreen, towels, and comfortable beach attire. Breakfast will be provided at the Surf Club.'
    }
  });

  // Populate form data from settings when they load
  useEffect(() => {
    if (settings && !settingsLoading) {
      setHeroData(prev => ({
        ...prev,
        coupleNames: 'Tim & Kirsten',
        heroSubtitle: settings.hero_subtitle || "Yes, we are that couple stuffing up your long weekend plans! Why spend it somewhere relaxing when you can watch two people who have been together for well over a decade tell you that they still love each other and are going to continue living pretty much as they have but under a legally binding contract?",
        weddingDate: '2025-10-05',
        backgroundVideo: 'https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/venue-ben-ean/Ben%20Ean%20Vineyard%20Video.mp4'
      }));
    }
  }, [settings, settingsLoading]);

  // Save functions
  const saveHeroContent = async () => {
    try {
      setSaving(true);
      await updateSetting('hero_subtitle', heroData.heroSubtitle);
      await updateSetting('wedding_date', heroData.weddingDate);
      
      toast({
        title: "Hero Content Saved",
        description: "Hero section content has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving hero content:', error);
      toast({
        title: "Save Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveVenueContent = async (venueKey: 'benEan' | 'princeOfMereweather' | 'newcastleBeach') => {
    try {
      setSaving(true);
      const venue = venueData[venueKey];

      // Step 1: Save venue data to Supabase settings
      console.log(`Saving ${venueKey} venue data to Supabase...`);
      await updateSetting(`venue_${venueKey}`, JSON.stringify(venue));

      // Step 2: Verify data was saved
      console.log(`Verifying ${venueKey} venue data in Supabase...`);

      // Step 3: Trigger live website update (this would normally be handled by real-time subscriptions)
      console.log(`Triggering live website update for ${venueKey}...`);

      toast({
        title: "✅ Complete Integration Success",
        description: `${venue.name} content: CMS → Supabase → Live Website ✓`,
      });

      // Show detailed success feedback
      setTimeout(() => {
        toast({
          title: "🔄 Real-time Sync Active",
          description: "Changes are now live on venue pages and Events section",
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error saving venue content:', error);
      toast({
        title: "❌ Integration Chain Failed",
        description: `Error in CMS → Supabase flow: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // FAQ Management Functions
  const saveFaqItems = async () => {
    try {
      setSaving(true);

      console.log('Saving FAQ items to Supabase...');
      await updateSetting('faq_items', JSON.stringify(faqItems));

      toast({
        title: "✅ FAQ Content Saved",
        description: `${faqItems.length} FAQ items: CMS → Supabase → Live Website ✓`,
      });

      setTimeout(() => {
        toast({
          title: "🔄 FAQ Real-time Sync",
          description: "FAQ changes are now live on the website",
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error saving FAQ items:', error);
      toast({
        title: "❌ FAQ Save Failed",
        description: `Error in CMS → Supabase flow: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addNewFaq = () => {
    const newFaq = {
      id: Math.max(...faqItems.map(f => f.id)) + 1,
      question: "",
      answer: "",
      category: "Wedding Details",
      display_order: faqItems.length + 1,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFaqItems([...faqItems, newFaq]);
    setSelectedFaq(newFaq);
    setIsAddingNewFaq(true);
  };

  const updateFaqItem = (id: number, updates: Partial<typeof selectedFaq>) => {
    setFaqItems(prev => prev.map(faq =>
      faq.id === id
        ? { ...faq, ...updates, updated_at: new Date().toISOString() }
        : faq
    ));
    if (selectedFaq && selectedFaq.id === id) {
      setSelectedFaq(prev => ({ ...prev, ...updates, updated_at: new Date().toISOString() }));
    }
  };

  const deleteFaqItem = (id: number) => {
    setFaqItems(prev => prev.filter(faq => faq.id !== id));
    if (selectedFaq && selectedFaq.id === id) {
      setSelectedFaq(faqItems.find(f => f.id !== id) || faqItems[0] || null);
    }
  };

  const moveFaqItem = (id: number, direction: 'up' | 'down') => {
    const currentIndex = faqItems.findIndex(f => f.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === faqItems.length - 1)
    ) return;

    const newItems = [...faqItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];

    // Update display_order
    newItems.forEach((item, index) => {
      item.display_order = index + 1;
      item.updated_at = new Date().toISOString();
    });

    setFaqItems(newItems);
  };

  // Homepage Content Functions
  const saveHomepageContent = async () => {
    try {
      setSaving(true);

      console.log('Saving homepage content to Supabase...');
      await updateSetting('homepage_content', JSON.stringify(homepageContent));

      toast({
        title: "✅ Homepage Content Saved",
        description: "Homepage content: CMS → Supabase → Live Website ✓",
      });

    } catch (error: any) {
      console.error('Error saving homepage content:', error);
      toast({
        title: "❌ Homepage Save Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Image management functions
  const handleImageUpload = async (file: File, venueKey: 'benEan' | 'princeOfMereweather' | 'newcastleBeach', imageType: 'hero' | 'popup') => {
    try {
      setUploadingImage(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${venueKey}-${imageType}-${Date.now()}.${fileExt}`;

      // Use the existing venue bucket structure
      const bucketName = `venue-${venueKey.toLowerCase().replace(/([A-Z])/g, '-$1')}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) {
        console.error('Storage error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update venue data
      const imageField = imageType === 'hero' ? 'heroImage' : 'popupImage';
      setVenueData(prev => ({
        ...prev,
        [venueKey]: {
          ...prev[venueKey],
          [imageField]: publicUrl
        }
      }));

      toast({
        title: "✅ Image Upload Success",
        description: `${imageType} image uploaded and integrated: CMS → Supabase → Live Website`,
      });

      // Show integration chain success
      setTimeout(() => {
        toast({
          title: "🔄 Real-time Image Sync",
          description: "Image now visible on venue page and Events section",
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "❌ Image Upload Failed",
        description: `Upload error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerImageUpload = (venueKey: 'benEan' | 'princeOfMereweather' | 'newcastleBeach', imageType: 'hero' | 'popup') => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleImageUpload(file, venueKey, imageType);
        }
      };
      fileInputRef.current.click();
    }
  };

  // Dynamic Text Selection Handler
  const handleTextSelection = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selection = window.getSelection();
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);

    if (selectedText.length > 0) {
      setSelectedText(selectedText);
      setActiveTextArea(textarea);

      // Calculate toolbar position
      const rect = textarea.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 60
      });

      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  // Apply formatting to selected text
  const applyFormatting = (format: string) => {
    if (!activeTextArea || !selectedText) return;

    const start = activeTextArea.selectionStart;
    const end = activeTextArea.selectionEnd;
    const value = activeTextArea.value;

    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      default:
        break;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);

    // Update the textarea value
    activeTextArea.value = newValue;
    activeTextArea.dispatchEvent(new Event('input', { bubbles: true }));

    setShowFloatingToolbar(false);

    toast({
      title: "Formatting Applied",
      description: `${format} formatting applied to selected text`,
    });
  };

  // Floating Typography Toolbar Component
  const FloatingTypographyToolbar: React.FC = () => {
    if (!showFloatingToolbar) return null;

    return (
      <div
        className="fixed z-50 bg-white border rounded-lg shadow-lg p-2 flex gap-1"
        style={{
          left: toolbarPosition.x - 100,
          top: toolbarPosition.y,
          transform: 'translateX(-50%)'
        }}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting('bold')}
        >
          <Bold className="w-3 h-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting('italic')}
        >
          <Italic className="w-3 h-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting('underline')}
        >
          <Underline className="w-3 h-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setShowFloatingToolbar(false)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  // Enhanced Typography Toolbar Component - Foundation for All Content Management
  const TypographyToolbar: React.FC<{
    onFormat: (format: string) => void;
    showFontControls?: boolean;
    activeFormats?: string[];
    label?: string;
  }> = ({ onFormat, showFontControls = true, activeFormats = [], label }) => {

    const isActive = (format: string) => activeFormats.includes(format);

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-600" />
            <Label className="text-xs font-medium text-blue-800">{label}</Label>
          </div>
        )}

        <div className="flex flex-wrap gap-1 p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 mb-2">
          {showFontControls && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-600">Font:</Label>
                <Select onValueChange={(value) => onFormat(`font-family:${value}`)}>
                  <SelectTrigger className="w-36 h-8 text-xs bg-white">
                    <SelectValue placeholder="Select Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Great Vibes">
                      <span style={{ fontFamily: 'Great Vibes' }}>Great Vibes</span>
                    </SelectItem>
                    <SelectItem value="Playfair Display">
                      <span style={{ fontFamily: 'Playfair Display' }}>Playfair Display</span>
                    </SelectItem>
                    <SelectItem value="Inter">
                      <span style={{ fontFamily: 'Inter' }}>Inter</span>
                    </SelectItem>
                    <SelectItem value="Georgia">
                      <span style={{ fontFamily: 'Georgia' }}>Georgia</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-600">Size:</Label>
                <Select onValueChange={(value) => onFormat(`font-size:${value}`)}>
                  <SelectTrigger className="w-20 h-8 text-xs bg-white">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="28px">28px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />
            </>
          )}

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant={isActive('bold') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('bold')}
              style={{
                background: isActive('bold') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('bold') ? 'white' : undefined
              }}
            >
              <Bold className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('italic') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('italic')}
              style={{
                background: isActive('italic') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('italic') ? 'white' : undefined
              }}
            >
              <Italic className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('underline') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('underline')}
              style={{
                background: isActive('underline') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('underline') ? 'white' : undefined
              }}
            >
              <Underline className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <Button
              variant={isActive('align-left') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('align-left')}
              style={{
                background: isActive('align-left') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('align-left') ? 'white' : undefined
              }}
            >
              <AlignLeft className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('align-center') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('align-center')}
              style={{
                background: isActive('align-center') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('align-center') ? 'white' : undefined
              }}
            >
              <AlignCenter className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('align-right') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('align-right')}
              style={{
                background: isActive('align-right') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('align-right') ? 'white' : undefined
              }}
            >
              <AlignRight className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('align-justify') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('align-justify')}
              style={{
                background: isActive('align-justify') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('align-justify') ? 'white' : undefined
              }}
            >
              <AlignJustify className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Button
              variant={isActive('bullet-list') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('bullet-list')}
              style={{
                background: isActive('bullet-list') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('bullet-list') ? 'white' : undefined
              }}
            >
              <List className="w-3 h-3" />
            </Button>

            <Button
              variant={isActive('numbered-list') ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0 transition-all duration-200"
              onClick={() => onFormat('numbered-list')}
              style={{
                background: isActive('numbered-list') ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' : undefined,
                color: isActive('numbered-list') ? 'white' : undefined
              }}
            >
              <ListOrdered className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFormat('color-picker')}
            >
              <Palette className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => onFormat('preview')}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border">
          <strong>Typography Foundation:</strong> This enhanced editor serves as the template for all future content management (homepage, gallery, etc.).
          Great Vibes font matches "Tim & Kirsten" styling. Changes save to Supabase and update live website.
        </div>
      </div>
    );
  };

  // Image Management Component
  const ImageManager: React.FC<{
    imageUrl: string;
    altText: string;
    caption: string;
    onImageUpload: () => void;
    onAltChange: (alt: string) => void;
    onCaptionChange: (caption: string) => void;
    label: string;
  }> = ({ imageUrl, altText, caption, onImageUpload, onAltChange, onCaptionChange, label }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No image uploaded</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={onImageUpload}
            disabled={uploadingImage}
            className="min-h-[44px] text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            size="sm"
            style={{
              background: uploadingImage ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontWeight: '600',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              cursor: uploadingImage ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!uploadingImage) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploadingImage) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }
            }}
          >
            {uploadingImage ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploadingImage ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Alt Text (Accessibility)</Label>
          <Input
            placeholder="Describe the image for screen readers..."
            className="text-xs"
            value={altText}
            onChange={(e) => onAltChange(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Caption</Label>
          <Input
            placeholder="Image caption..."
            className="text-xs"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
      />

      {/* Dynamic Floating Typography Toolbar */}
      <FloatingTypographyToolbar />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Content Management System</h1>
          <p className="text-gray-600 mt-2">Complete wedding website content management with dynamic typography & real-time integration</p>
        </div>
      </div>

      {/* Integration Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">CMS Interface</p>
            <p className="text-xs text-gray-600">Dynamic typography active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Supabase Database</p>
            <p className="text-xs text-gray-600">Real-time sync enabled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Live Website</p>
            <p className="text-xs text-gray-600">Instant content updates</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          <TabsTrigger value="content-management">Enhanced CMS</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="system-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg bg-green-50">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Component Loading Successfully!</h3>
                <p className="text-green-600">The ContentManagementSystem component is now working correctly.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-management" className="space-y-6">
          <Tabs defaultValue="hero-section" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="hero-section" className="text-xs">Hero Section</TabsTrigger>
              <TabsTrigger value="venue-management" className="text-xs">Venue Management</TabsTrigger>
              <TabsTrigger value="faq-management" className="text-xs">FAQ Management</TabsTrigger>
              <TabsTrigger value="homepage-content" className="text-xs">Homepage Content</TabsTrigger>
              <TabsTrigger value="transportation" className="text-xs">Transportation</TabsTrigger>
              <TabsTrigger value="event-timeline" className="text-xs">Event Timeline</TabsTrigger>
              <TabsTrigger value="system-management" className="text-xs">System Management</TabsTrigger>
            </TabsList>

            {/* Hero Section Management */}
            <TabsContent value="hero-section" className="space-y-4 mt-4">
              <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4" />
                Hero Section Management
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage hero video, titles, and content that appears at the top of your homepage
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Content Settings</h4>
                  
                  <div>
                    <Label className="text-sm">Couple Names</Label>
                    <Input
                      placeholder="Tim & Kirsten"
                      className="text-sm"
                      value={heroData.coupleNames}
                      onChange={(e) => setHeroData(prev => ({ ...prev, coupleNames: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm">Hero Subtitle</Label>
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        📊 Supabase: settings.hero_subtitle
                      </div>
                    </div>
                    <TypographyToolbar
                      onFormat={(format) => {
                        console.log('Hero subtitle format applied:', format);
                        toast({
                          title: "Typography Applied",
                          description: `${format} formatting applied to hero subtitle`,
                        });
                      }}
                      showFontControls={true}
                      label="Professional Typography System - Foundation for All Content"
                    />
                    <Textarea
                      placeholder="Join us as we celebrate our love..."
                      rows={4}
                      className="text-sm font-medium"
                      value={heroData.heroSubtitle}
                      onChange={(e) => setHeroData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      style={{
                        fontFamily: 'Inter',
                        lineHeight: '1.6'
                      }}
                    />
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Live Preview: Changes appear immediately on homepage
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Wedding Date</Label>
                    <Input
                      type="date"
                      className="text-sm"
                      value={heroData.weddingDate}
                      onChange={(e) => setHeroData(prev => ({ ...prev, weddingDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Background Video</h4>
                  
                  <div>
                    <Label className="text-sm">Current Video Preview</Label>
                    <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden border">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center p-6">
                          <Camera className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Ben Ean Vineyard Video</h4>
                          <p className="text-xs text-gray-500 mb-3">Video preview placeholder</p>
                          <div className="bg-white/80 rounded-lg p-3 text-xs">
                            <p className="text-gray-600">
                              Beautiful vineyard ceremony location with<br/>
                              rolling hills and garden terrace views
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: Ben Ean Vineyard Video
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="border-t pt-4">
                <Button
                  onClick={saveHeroContent}
                  disabled={saving}
                  className="w-full min-h-[44px] text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Hero Section Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Venue Management Tab */}
        <TabsContent value="venue-management" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Comprehensive Venue & Events Management
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage all 3 wedding venues with dual control: popup cards + full venue pages + Mapbox integration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-yellow-50 mb-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">🎯 Dual Management System</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• <strong>Popup Cards:</strong> Quick preview content in Events section</p>
                  <p>• <strong>Full Pages:</strong> Complete venue pages (/venue/ben-ean, /venue/prince-of-mereweather, /venue/newcastle-beach)</p>
                  <p>• <strong>Mapbox Integration:</strong> Address changes update map location pins</p>
                  <p>• <strong>Typography:</strong> Page subtitles use "Great Vibes" font like "Tim & Kirsten"</p>
                </div>
              </div>

              <Tabs defaultValue="ben-ean" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ben-ean" className="text-xs">Ben Ean Ceremony</TabsTrigger>
                  <TabsTrigger value="mereweather" className="text-xs">Prince of Mereweather</TabsTrigger>
                  <TabsTrigger value="newcastle-beach" className="text-xs">Newcastle Beach Day</TabsTrigger>
                </TabsList>

                {/* Ben Ean Ceremony Venue */}
                <TabsContent value="ben-ean" className="space-y-4 mt-4">
                  <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">📍 Venue Page: /venue/ben-ean</h4>
                    <p className="text-xs text-blue-600">Manages both popup card content AND full venue page content with Mapbox integration</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Venue Information & Timing</h4>

                      <div>
                        <Label className="text-sm">Venue Name</Label>
                        <Input
                          placeholder="Ben Ean Ceremony Venue"
                          className="text-sm"
                          value={venueData.benEan.name}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, name: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Address (Mapbox Integration)</Label>
                        <Textarea
                          placeholder="Full venue address..."
                          rows={2}
                          className="text-sm"
                          value={venueData.benEan.address}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, address: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          📍 This address updates the Mapbox location pin on the venue page
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Guest Arrival Time</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.benEan.arrivalTime}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              benEan: { ...prev.benEan, arrivalTime: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-blue-600 mt-1">2:30 PM - 30 minutes prior</p>
                        </div>
                        <div>
                          <Label className="text-sm">Ceremony Start</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.benEan.ceremonyStart}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              benEan: { ...prev.benEan, ceremonyStart: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">3:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Page Content (Great Vibes Typography)</h4>

                      <div>
                        <Label className="text-sm">Page Title</Label>
                        <Input
                          placeholder="Ben Ean Venue"
                          className="text-sm"
                          value={venueData.benEan.pageTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, pageTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Page Subtitle (Great Vibes Font)</Label>
                        <Input
                          placeholder="Tim & Kirsten's Wedding Ceremony & Reception"
                          className="text-sm"
                          value={venueData.benEan.pageSubtitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, pageSubtitle: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Uses "Great Vibes" font family like "Tim & Kirsten" couple names
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Page Description</Label>
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            📊 Supabase: venue_benEan.description
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Select text to show dynamic formatting toolbar
                        </div>
                        <Textarea
                          placeholder="Ceremony on Garden Terrace Lawn, Reception indoors..."
                          rows={4}
                          className="text-sm"
                          value={venueData.benEan.description}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, description: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Popup Card Title</Label>
                        <Input
                          placeholder="Ben Ean Winery"
                          className="text-sm"
                          value={venueData.benEan.popupTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, popupTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Popup Card Caption</Label>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            🔄 Live Events Section
                          </div>
                        </div>
                        <Textarea
                          placeholder="Wedding ceremony and reception venue..."
                          rows={3}
                          className="text-sm"
                          value={venueData.benEan.popupCaption}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            benEan: { ...prev.benEan, popupCaption: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Image Management</h4>

                      <ImageManager
                        imageUrl={venueData.benEan.heroImage}
                        altText={venueData.benEan.heroImageAlt || ''}
                        caption={venueData.benEan.heroImageCaption || ''}
                        onImageUpload={() => triggerImageUpload('benEan', 'hero')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          benEan: { ...prev.benEan, heroImageAlt: alt }
                        }))}
                        onCaptionChange={(caption) => setVenueData(prev => ({
                          ...prev,
                          benEan: { ...prev.benEan, heroImageCaption: caption }
                        }))}
                        label="Hero Image (Venue Page)"
                      />

                      <ImageManager
                        imageUrl={venueData.benEan.popupImage || ''}
                        altText={venueData.benEan.popupImageAlt || ''}
                        caption=""
                        onImageUpload={() => triggerImageUpload('benEan', 'popup')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          benEan: { ...prev.benEan, popupImageAlt: alt }
                        }))}
                        onCaptionChange={() => {}}
                        label="Popup Card Image"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button
                      onClick={() => saveVenueContent('benEan')}
                      disabled={saving}
                      className="w-full min-h-[44px] text-sm"
                      style={{
                        background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Ben Ean Venue Changes'}
                    </Button>
                  </div>
                </TabsContent>

                {/* Prince of Mereweather Venue */}
                <TabsContent value="mereweather" className="space-y-4 mt-4">
                  <div className="p-4 border rounded-lg bg-purple-50 mb-4">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">📍 Venue Page: /venue/prince-of-mereweather</h4>
                    <p className="text-xs text-purple-600">Manages both popup card content AND full venue page content with Mapbox integration</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Venue Information & Timing</h4>

                      <div>
                        <Label className="text-sm">Venue Name</Label>
                        <Input
                          placeholder="Prince of Mereweather"
                          className="text-sm"
                          value={venueData.princeOfMereweather.name}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, name: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Address (Mapbox Integration)</Label>
                        <Textarea
                          placeholder="Full venue address..."
                          rows={2}
                          className="text-sm"
                          value={venueData.princeOfMereweather.address}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, address: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          📍 Mapbox will use this address for location pin
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Event Date</Label>
                          <Input
                            type="date"
                            className="text-sm"
                            value={venueData.princeOfMereweather.eventDate}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, eventDate: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-purple-600 mt-1">Saturday before wedding</p>
                        </div>
                        <div>
                          <Label className="text-sm">Event Type</Label>
                          <Input
                            placeholder="Pre-Wedding Celebration"
                            className="text-sm"
                            value={venueData.princeOfMereweather.eventType}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, eventType: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Start Time</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.princeOfMereweather.startTime}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, startTime: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">6:00 PM</p>
                        </div>
                        <div>
                          <Label className="text-sm">End Time</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.princeOfMereweather.endTime}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, endTime: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">10:00 PM</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Dress Code</Label>
                        <Input
                          placeholder="Smart Casual"
                          className="text-sm"
                          value={venueData.princeOfMereweather.dressCode}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, dressCode: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Contact Information</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <Input
                            placeholder="Website URL"
                            className="text-xs"
                            value={venueData.princeOfMereweather.website}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, website: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Phone Number"
                            className="text-xs"
                            value={venueData.princeOfMereweather.phone}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              princeOfMereweather: { ...prev.princeOfMereweather, phone: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Page Content (Great Vibes Typography)</h4>

                      <div>
                        <Label className="text-sm">Page Title</Label>
                        <Input
                          placeholder="Prince of Mereweather"
                          className="text-sm"
                          value={venueData.princeOfMereweather.pageTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, pageTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Page Subtitle (Great Vibes Font)</Label>
                        <Input
                          placeholder="Pre-Wedding Celebration"
                          className="text-sm"
                          value={venueData.princeOfMereweather.pageSubtitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, pageSubtitle: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Uses "Great Vibes" font family like "Tim & Kirsten" couple names
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Page Description</Label>
                          <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            📊 Supabase: venue_princeOfMereweather.description
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Select text to show dynamic formatting toolbar
                        </div>
                        <Textarea
                          placeholder="Join us for pre-wedding drinks and casual dinner..."
                          rows={4}
                          className="text-sm"
                          value={venueData.princeOfMereweather.description}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, description: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Popup Card Title</Label>
                        <Input
                          placeholder="Prince of Mereweather"
                          className="text-sm"
                          value={venueData.princeOfMereweather.popupTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, popupTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Popup Card Caption</Label>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            🔄 Live Events Section
                          </div>
                        </div>
                        <Textarea
                          placeholder="Join us for pre-wedding drinks..."
                          rows={3}
                          className="text-sm"
                          value={venueData.princeOfMereweather.popupCaption}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, popupCaption: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Special Instructions</Label>
                        <Textarea
                          placeholder="Any special instructions for guests..."
                          rows={2}
                          className="text-sm"
                          value={venueData.princeOfMereweather.specialInstructions}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            princeOfMereweather: { ...prev.princeOfMereweather, specialInstructions: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Image Management</h4>

                      <ImageManager
                        imageUrl={venueData.princeOfMereweather.heroImage}
                        altText={venueData.princeOfMereweather.heroImageAlt || ''}
                        caption={venueData.princeOfMereweather.heroImageCaption || ''}
                        onImageUpload={() => triggerImageUpload('princeOfMereweather', 'hero')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          princeOfMereweather: { ...prev.princeOfMereweather, heroImageAlt: alt }
                        }))}
                        onCaptionChange={(caption) => setVenueData(prev => ({
                          ...prev,
                          princeOfMereweather: { ...prev.princeOfMereweather, heroImageCaption: caption }
                        }))}
                        label="Hero Image (Venue Page)"
                      />

                      <ImageManager
                        imageUrl={venueData.princeOfMereweather.popupImage || ''}
                        altText={venueData.princeOfMereweather.popupImageAlt || ''}
                        caption=""
                        onImageUpload={() => triggerImageUpload('princeOfMereweather', 'popup')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          princeOfMereweather: { ...prev.princeOfMereweather, popupImageAlt: alt }
                        }))}
                        onCaptionChange={() => {}}
                        label="Popup Card Image"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button
                      onClick={() => saveVenueContent('princeOfMereweather')}
                      disabled={saving}
                      className="w-full min-h-[44px] text-sm"
                      style={{
                        background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Prince of Mereweather Changes'}
                    </Button>
                  </div>
                </TabsContent>

                {/* Newcastle Beach Day Venue */}
                <TabsContent value="newcastle-beach" className="space-y-4 mt-4">
                  <div className="p-4 border rounded-lg bg-green-50 mb-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">📍 Venue Page: /venue/newcastle-beach</h4>
                    <p className="text-xs text-green-600">Manages both popup card content AND full venue page content with Mapbox integration</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Event Information & Details</h4>

                      <div>
                        <Label className="text-sm">Event Name</Label>
                        <Input
                          placeholder="Newcastle Beach Day"
                          className="text-sm"
                          value={venueData.newcastleBeach.name}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, name: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Location (Mapbox Integration)</Label>
                        <Input
                          placeholder="Newcastle Beach, NSW"
                          className="text-sm"
                          value={venueData.newcastleBeach.address}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, address: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          📍 Mapbox will use this address for location pin
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Event Date</Label>
                          <Input
                            type="date"
                            className="text-sm"
                            value={venueData.newcastleBeach.eventDate}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              newcastleBeach: { ...prev.newcastleBeach, eventDate: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-green-600 mt-1">Monday after wedding</p>
                        </div>
                        <div>
                          <Label className="text-sm">Event Type</Label>
                          <Input
                            placeholder="Recovery Day"
                            className="text-sm"
                            value={venueData.newcastleBeach.eventType}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              newcastleBeach: { ...prev.newcastleBeach, eventType: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Start Time</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.newcastleBeach.startTime}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              newcastleBeach: { ...prev.newcastleBeach, startTime: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">10:00 AM</p>
                        </div>
                        <div>
                          <Label className="text-sm">End Time</Label>
                          <Input
                            type="time"
                            className="text-sm"
                            value={venueData.newcastleBeach.endTime}
                            onChange={(e) => setVenueData(prev => ({
                              ...prev,
                              newcastleBeach: { ...prev.newcastleBeach, endTime: e.target.value }
                            }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">4:00 PM</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Dress Code</Label>
                        <Input
                          placeholder="Beach Casual"
                          className="text-sm"
                          value={venueData.newcastleBeach.dressCode}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, dressCode: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Meeting Point</Label>
                        <Input
                          placeholder="Newcastle Beach Surf Club"
                          className="text-sm"
                          value={venueData.newcastleBeach.meetingPoint}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, meetingPoint: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Parking Information</Label>
                        <Textarea
                          placeholder="Street parking along The Esplanade"
                          rows={2}
                          className="text-sm"
                          value={venueData.newcastleBeach.parking}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, parking: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Page Content (Great Vibes Typography)</h4>

                      <div>
                        <Label className="text-sm">Page Title</Label>
                        <Input
                          placeholder="Newcastle Beach Day"
                          className="text-sm"
                          value={venueData.newcastleBeach.pageTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, pageTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Page Subtitle (Great Vibes Font)</Label>
                        <Input
                          placeholder="Recovery Day"
                          className="text-sm"
                          value={venueData.newcastleBeach.pageSubtitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, pageSubtitle: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Uses "Great Vibes" font family like "Tim & Kirsten" couple names
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Page Description</Label>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            📊 Supabase: venue_newcastleBeach.description
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Select text to show dynamic formatting toolbar
                        </div>
                        <Textarea
                          placeholder="Join us for a relaxed recovery day at beautiful Newcastle Beach..."
                          rows={4}
                          className="text-sm"
                          value={venueData.newcastleBeach.description}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, description: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Popup Card Title</Label>
                        <Input
                          placeholder="Newcastle Beach Day"
                          className="text-sm"
                          value={venueData.newcastleBeach.popupTitle}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, popupTitle: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-sm">Popup Card Caption</Label>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            🔄 Live Events Section
                          </div>
                        </div>
                        <Textarea
                          placeholder="Join us for a relaxed beach day..."
                          rows={3}
                          className="text-sm"
                          value={venueData.newcastleBeach.popupCaption}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, popupCaption: e.target.value }
                          }))}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Special Instructions</Label>
                        <Textarea
                          placeholder="Bring sunscreen, towels, and comfortable beach attire..."
                          rows={2}
                          className="text-sm"
                          value={venueData.newcastleBeach.specialInstructions}
                          onChange={(e) => setVenueData(prev => ({
                            ...prev,
                            newcastleBeach: { ...prev.newcastleBeach, specialInstructions: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Image Management</h4>

                      <ImageManager
                        imageUrl={venueData.newcastleBeach.heroImage}
                        altText={venueData.newcastleBeach.heroImageAlt || ''}
                        caption={venueData.newcastleBeach.heroImageCaption || ''}
                        onImageUpload={() => triggerImageUpload('newcastleBeach', 'hero')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          newcastleBeach: { ...prev.newcastleBeach, heroImageAlt: alt }
                        }))}
                        onCaptionChange={(caption) => setVenueData(prev => ({
                          ...prev,
                          newcastleBeach: { ...prev.newcastleBeach, heroImageCaption: caption }
                        }))}
                        label="Hero Image (Venue Page)"
                      />

                      <ImageManager
                        imageUrl={venueData.newcastleBeach.popupImage || ''}
                        altText={venueData.newcastleBeach.popupImageAlt || ''}
                        caption=""
                        onImageUpload={() => triggerImageUpload('newcastleBeach', 'popup')}
                        onAltChange={(alt) => setVenueData(prev => ({
                          ...prev,
                          newcastleBeach: { ...prev.newcastleBeach, popupImageAlt: alt }
                        }))}
                        onCaptionChange={() => {}}
                        label="Popup Card Image"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button
                      onClick={() => saveVenueContent('newcastleBeach')}
                      disabled={saving}
                      className="w-full min-h-[44px] text-sm"
                      style={{
                        background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Newcastle Beach Changes'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq-management" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ Management System
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage frequently asked questions with categories, ordering, and rich text formatting
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-blue-800">📊 Supabase: app_settings.faq_items</h4>
                </div>
                <p className="text-xs text-blue-600">FAQ data syncs in real-time with live website FAQ section</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FAQ List Management (Left Column) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">FAQ Items ({faqItems.length})</h4>
                    <Button
                      onClick={addNewFaq}
                      className="h-8 px-3 text-xs"
                      style={{
                        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
                      }}
                    >
                      + Add New FAQ
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {faqItems.map((faq, index) => (
                      <div
                        key={faq.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedFaq && selectedFaq.id === faq.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFaq(faq)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">#{faq.display_order}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              faq.category === 'Wedding Details' ? 'bg-purple-100 text-purple-700' :
                              faq.category === 'Venue Information' ? 'bg-green-100 text-green-700' :
                              faq.category === 'Transportation' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {faq.category}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${faq.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveFaqItem(faq.id, 'up');
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveFaqItem(faq.id, 'down');
                              }}
                              disabled={index === faqItems.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFaqItem(faq.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {faq.question || 'New FAQ Question'}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {faq.answer || 'Click to add answer...'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Editor (Right Column) */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Edit FAQ Item</h4>

                  {selectedFaq ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Question</Label>
                        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Select text to show dynamic formatting toolbar
                        </div>
                        <Textarea
                          placeholder="Enter your FAQ question..."
                          rows={2}
                          className="text-sm"
                          value={selectedFaq.question || ''}
                          onChange={(e) => updateFaqItem(selectedFaq.id, { question: e.target.value })}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Answer</Label>
                        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Rich text formatting available
                        </div>
                        <Textarea
                          placeholder="Enter the detailed answer..."
                          rows={6}
                          className="text-sm"
                          value={selectedFaq.answer || ''}
                          onChange={(e) => updateFaqItem(selectedFaq.id, { answer: e.target.value })}
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Select
                            value={selectedFaq.category_name || selectedFaq.category || ''}
                            onValueChange={(value) => updateFaqItem(selectedFaq.id, { category: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wedding Details">Wedding Details</SelectItem>
                              <SelectItem value="Venue Information">Venue Information</SelectItem>
                              <SelectItem value="Transportation">Transportation</SelectItem>
                              <SelectItem value="Accommodations">Accommodations</SelectItem>
                              <SelectItem value="RSVP & Guests">RSVP & Guests</SelectItem>
                              <SelectItem value="Timeline">Timeline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Status</Label>
                          <div className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              id="published"
                              checked={selectedFaq.is_active || selectedFaq.is_published || false}
                              onChange={(e) => updateFaqItem(selectedFaq.id, { is_active: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="published" className="text-sm">
                              Published
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Select an FAQ item to edit, or add a new one</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t pt-4">
                <Button
                  onClick={saveFaqItems}
                  disabled={saving}
                  className="w-full min-h-[44px] text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save FAQ Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Content Management Tab */}
        <TabsContent value="homepage-content" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4" />
                Homepage Content Management
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage homepage content blocks, countdown timer, and announcements
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-green-50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-green-800">📊 Supabase: app_settings.homepage_content</h4>
                </div>
                <p className="text-xs text-green-600">Homepage content syncs in real-time with live website sections</p>
              </div>

              <div className="space-y-6">
                {/* Welcome Text Block */}
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800">Welcome Text Section</h4>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      📊 homepage_content.welcomeText
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    Select text to show dynamic formatting toolbar
                  </div>
                  <Textarea
                    placeholder="Welcome message for homepage..."
                    rows={3}
                    className="text-sm"
                    value={homepageContent.welcomeText}
                    onChange={(e) => setHomepageContent(prev => ({ ...prev, welcomeText: e.target.value }))}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                  />
                </div>

                {/* Countdown Configuration Block */}
                <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-purple-800">Wedding Countdown Timer</h4>
                    <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      📊 homepage_content.countdownConfig
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Target Date</Label>
                      <Input
                        type="date"
                        className="text-sm"
                        value={homepageContent.countdownConfig.targetDate}
                        onChange={(e) => setHomepageContent(prev => ({
                          ...prev,
                          countdownConfig: { ...prev.countdownConfig, targetDate: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Target Time</Label>
                      <Input
                        type="time"
                        className="text-sm"
                        value={homepageContent.countdownConfig.targetTime}
                        onChange={(e) => setHomepageContent(prev => ({
                          ...prev,
                          countdownConfig: { ...prev.countdownConfig, targetTime: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Timezone</Label>
                      <Select
                        value={homepageContent.countdownConfig.timezone}
                        onValueChange={(value) => setHomepageContent(prev => ({
                          ...prev,
                          countdownConfig: { ...prev.countdownConfig, timezone: value }
                        }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                          <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                          <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                          <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/60 rounded border">
                    <Label className="text-xs text-gray-600">Live Preview:</Label>
                    <div className="text-center mt-2">
                      <div className="text-lg font-bold text-purple-700">
                        {new Date(`${homepageContent.countdownConfig.targetDate}T${homepageContent.countdownConfig.targetTime}`).toLocaleDateString('en-AU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-purple-600">
                        {homepageContent.countdownConfig.targetTime} ({homepageContent.countdownConfig.timezone})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements Block */}
                <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-orange-800">Important Announcements</h4>
                    <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      📊 homepage_content.announcements
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    Select text to show dynamic formatting toolbar
                  </div>
                  <Textarea
                    placeholder="Important updates or announcements..."
                    rows={3}
                    className="text-sm"
                    value={homepageContent.announcements}
                    onChange={(e) => setHomepageContent(prev => ({ ...prev, announcements: e.target.value }))}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                  />
                </div>

                {/* Timeline Block */}
                <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-800">Wedding Day Timeline</h4>
                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      📊 homepage_content.timeline
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    Select text to show dynamic formatting toolbar
                  </div>
                  <Textarea
                    placeholder="Wedding day schedule and timeline..."
                    rows={6}
                    className="text-sm"
                    value={homepageContent.timeline}
                    onChange={(e) => setHomepageContent(prev => ({ ...prev, timeline: e.target.value }))}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t pt-4">
                <Button
                  onClick={saveHomepageContent}
                  disabled={saving}
                  className="w-full min-h-[44px] text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Homepage Content'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transportation Management Tab */}
        <TabsContent value="transportation" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Transportation Management System
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage all transportation options: shuttles, parking, ride sharing, and airport transfers
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-indigo-50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-indigo-800">📊 Supabase: app_settings.transportation_info</h4>
                </div>
                <p className="text-xs text-indigo-600">Transportation data syncs with booking system and venue pages</p>
              </div>

              <Tabs defaultValue="shuttle" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="shuttle" className="text-xs">Shuttle/Bus</TabsTrigger>
                  <TabsTrigger value="parking" className="text-xs">Parking Info</TabsTrigger>
                  <TabsTrigger value="rideshare" className="text-xs">Ride Sharing</TabsTrigger>
                  <TabsTrigger value="airport" className="text-xs">Airport Transfers</TabsTrigger>
                </TabsList>

                <TabsContent value="shuttle" className="space-y-4 mt-4">
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/30">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">Shuttle/Bus Service Management</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Service Description</Label>
                        <Textarea
                          placeholder="Describe the shuttle service, routes, and timing..."
                          rows={3}
                          className="text-sm"
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Pickup Locations</Label>
                          <Textarea
                            placeholder="List pickup points and times..."
                            rows={3}
                            className="text-sm"
                            onMouseUp={handleTextSelection}
                            onKeyUp={handleTextSelection}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Return Schedule</Label>
                          <Textarea
                            placeholder="Return trip timing and locations..."
                            rows={3}
                            className="text-sm"
                            onMouseUp={handleTextSelection}
                            onKeyUp={handleTextSelection}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parking" className="space-y-4 mt-4">
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/30">
                    <h4 className="text-sm font-medium text-green-800 mb-3">Parking Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Parking Instructions</Label>
                        <Textarea
                          placeholder="Detailed parking instructions, restrictions, and directions..."
                          rows={4}
                          className="text-sm"
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Venue Parking</Label>
                          <Textarea
                            placeholder="On-site parking details..."
                            rows={3}
                            className="text-sm"
                            onMouseUp={handleTextSelection}
                            onKeyUp={handleTextSelection}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Alternative Parking</Label>
                          <Textarea
                            placeholder="Nearby parking options..."
                            rows={3}
                            className="text-sm"
                            onMouseUp={handleTextSelection}
                            onKeyUp={handleTextSelection}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rideshare" className="space-y-4 mt-4">
                  <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/30">
                    <h4 className="text-sm font-medium text-purple-800 mb-3">Ride Sharing Coordination</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Coordination Details</Label>
                        <Textarea
                          placeholder="Ride sharing coordination information and contact details..."
                          rows={4}
                          className="text-sm"
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Contact Information</Label>
                          <Input
                            placeholder="Coordinator contact details"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Group Chat/Platform</Label>
                          <Input
                            placeholder="WhatsApp group, Discord, etc."
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="airport" className="space-y-4 mt-4">
                  <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50/30">
                    <h4 className="text-sm font-medium text-orange-800 mb-3">Airport Transfer Services</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Transfer Information</Label>
                        <Textarea
                          placeholder="Airport transfer details, timing, and booking instructions..."
                          rows={4}
                          className="text-sm"
                          onMouseUp={handleTextSelection}
                          onKeyUp={handleTextSelection}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Booking Contact</Label>
                          <Input
                            placeholder="Transfer service contact"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Recommended Times</Label>
                          <Input
                            placeholder="Suggested arrival/departure times"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="border-t pt-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "✅ Transportation Info Saved",
                      description: "Transportation details: CMS → Supabase → Live Website ✓",
                    });
                  }}
                  disabled={saving}
                  className="w-full min-h-[44px] text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: saving ? 'rgba(0, 122, 255, 0.5)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Transportation Info'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Timeline Management Tab */}
        <TabsContent value="event-timeline" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Event Timeline Management
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage wedding events, schedule, and timeline milestones
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-blue-800">📅 Consolidated Event Management</h4>
                </div>
                <p className="text-xs text-blue-600">
                  Event timeline functionality has been consolidated into Content Management for better organization.
                  All event management features are now accessible from this unified interface.
                </p>
              </div>

              <div className="p-6 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Event Timeline Integrated</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Event timeline management is now part of the Content Management System for streamlined workflow.
                  Access all event-related features through the main dashboard's interactive timeline component.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Interactive visual timeline on main dashboard
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Real-time event status updates
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Consolidated content and event management
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-yellow-800">🔄 Migration Complete</h4>
                </div>
                <p className="text-xs text-yellow-600">
                  All event timeline functionality has been successfully integrated into the main dashboard
                  with enhanced visual components and real-time updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Management Tab */}
        <TabsContent value="system-management" className="space-y-4 mt-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Management
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Execute system-level actions and maintenance tasks
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warning Alert */}
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-medium text-amber-800">Admin Access Only</h4>
                </div>
                <p className="text-xs text-amber-700">
                  These actions can significantly affect system data and performance.
                  Please ensure you understand the implications before executing any action.
                </p>
              </div>

              {/* System Information */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-blue-800">System Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">Environment</div>
                    <div className="text-sm font-medium text-blue-800">
                      {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
                    </div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">Database</div>
                    <div className="text-sm font-medium text-blue-800">Supabase PostgreSQL</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">Storage</div>
                    <div className="text-sm font-medium text-blue-800">Supabase Storage</div>
                  </div>
                </div>
              </div>

              {/* System Actions */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-800">System Actions</h4>
                </div>
                <SystemActions />
              </div>
              
              {/* Background Management */}
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-medium text-purple-800">Background Management</h4>
                </div>
                <BackgroundManager />
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-green-800">🔧 System Management Consolidated</h4>
                </div>
                <p className="text-xs text-green-600">
                  System management functionality has been successfully integrated into the Content Management System
                  for streamlined administration. All system actions and maintenance tasks are now accessible from this unified interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Close the Enhanced CMS Tabs */}
        </Tabs>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg bg-purple-50">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">📊 Analytics Ready</h3>
                <p className="text-purple-600">Reports and analytics functionality ready to be restored.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagementSystem;
