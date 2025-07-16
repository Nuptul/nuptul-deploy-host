import React, { useEffect, useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { supabase } from '@/integrations/supabase/client';
import { LayoutGrid } from '@/components/ui/layout-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart, Download, Share2 } from 'lucide-react';

interface GalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GalleryPhoto {
  id: string;
  title: string | null;
  backstory: string | null;
  image_url: string;
  is_published: boolean;
  created_at: string;
}

const GalleryPopup: React.FC<GalleryPopupProps> = ({ isOpen, onClose }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  
  useKeyboardShortcuts({ isOpen, onClose });

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching photos:', error);
        // Fallback to sample wedding photos
        setPhotos([
          {
            id: '1',
            title: 'Engagement Shoot',
            backstory: 'A beautiful sunset engagement session in the Hunter Valley vineyards.',
            image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2', 
            title: 'Wedding Ceremony',
            backstory: 'The magical moment when we said "I do" surrounded by our loved ones.',
            image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Reception Dancing',
            backstory: 'Dancing the night away with family and friends at our reception.',
            image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            title: 'Wedding Party',
            backstory: 'Our amazing wedding party who made our day so special.',
            image_url: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            title: 'Venue Details',
            backstory: 'Beautiful decorations and setup at our stunning venue.',
            image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            title: 'Cake Cutting',
            backstory: 'Cutting our beautiful wedding cake together.',
            image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop',
            is_published: true,
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setPhotos(data || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when popup opens
      document.body.classList.add('gallery-popup-open');
      fetchPhotos();
    } else {
      // Re-enable body scroll when popup closes
      document.body.classList.remove('gallery-popup-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('gallery-popup-open');
    };
  }, [isOpen]);

  const cards = photos.map((photo, index) => ({
    id: parseInt(photo.id),
    content: (
      <div className="text-white">
        <p className="font-bold text-xl md:text-3xl mb-4">
          {photo.title || 'Wedding Photo'}
        </p>
        <p className="font-normal text-base text-white/70 max-w-lg">
          {photo.backstory || 'A beautiful moment from our special day.'}
        </p>
        <div className="flex gap-3 mt-6">
          <Button 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => window.open(photo.image_url, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
          >
            <Heart className="w-4 h-4 mr-2" />
            Love
          </Button>
        </div>
      </div>
    ),
    className: index === 0 ? "md:col-span-2 md:row-span-2" : 
               index === 1 ? "col-span-1 row-span-1" :
               index === 2 ? "col-span-1 row-span-1" :
               index === 3 ? "md:col-span-2 md:row-span-1" :
               "col-span-1 row-span-1",
    thumbnail: photo.image_url,
  }));

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Enhanced backdrop overlay with proper z-index */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ 
          zIndex: 9999,
          display: 'block',
          pointerEvents: 'auto'
        }}
        onClick={onClose}
        role="button"
        aria-label="Close gallery"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
      />
      
      {/* Fixed positioned gallery popup - properly centered */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ 
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          style={{
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-title"
        >
          <Card className="h-full max-h-[90vh] border-0 bg-transparent">
            <CardHeader className="border-b border-white/20 bg-gradient-to-r from-wedding-gold/10 to-wedding-navy/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-wedding-gold/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-wedding-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-wedding-navy">
                      Wedding Gallery
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Beautiful moments from our special day
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 h-[calc(90vh-120px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-gold mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading photos...</p>
                  </div>
                </div>
              ) : photos.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Photos Yet</h3>
                    <p className="text-muted-foreground">Wedding photos will appear here soon!</p>
                  </div>
                </div>
              ) : (
                <LayoutGrid cards={cards} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default GalleryPopup;