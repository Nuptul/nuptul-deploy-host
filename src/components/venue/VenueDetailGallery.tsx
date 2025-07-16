import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVenueImages } from '@/hooks/useVenueImages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface VenueDetailGalleryProps {
  venueId: string;
  venueName: string;
}

const VenueDetailGallery: React.FC<VenueDetailGalleryProps> = ({ venueId, venueName }) => {
  const { userRole } = useAuth();
  const { images, loading, uploading, uploadImage, deleteImage } = useVenueImages(venueId);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAdmin = userRole?.role === 'admin';
  const galleryImages = images.filter(img => img.image_type === 'gallery' || img.image_type === 'detail');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadImage(file, venueId, 'gallery');
    event.target.value = '';
  };

  const openLightbox = (imageUrl: string) => {
    const index = galleryImages.findIndex(img => img.image_url === imageUrl);
    setCurrentImageIndex(index);
    setLightboxImage(imageUrl);
  };

  const nextImage = () => {
    if (currentImageIndex < galleryImages.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setLightboxImage(galleryImages[nextIndex].image_url);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setLightboxImage(galleryImages[prevIndex].image_url);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    await deleteImage(imageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground font-dolly">
          {venueName} Gallery
        </h3>
        {isAdmin && (
          <label htmlFor="venue-gallery-upload">
            <Button 
              variant="default" 
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Image'}
              </span>
            </Button>
            <input
              id="venue-gallery-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Gallery Grid */}
      {galleryImages.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🏞️</div>
            <h4 className="text-lg font-semibold">No gallery images yet</h4>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Upload some beautiful images to showcase this venue!'
                : 'Check back soon for more images of this venue!'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image) => (
            <div 
              key={image.id} 
              className="glass-card overflow-hidden group hover:shadow-lg transition-all duration-300 relative"
            >
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.title || 'Venue image'}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => openLightbox(image.image_url)}
                  loading="lazy"
                />
                
                {/* Admin overlay */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {image.title && (
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-1">{image.title}</p>
                  {image.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-black/95 border-0">
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setLightboxImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Navigation arrows */}
              {galleryImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={nextImage}
                    disabled={currentImageIndex === galleryImages.length - 1}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <img
                src={lightboxImage}
                alt="Gallery image"
                className="w-full max-h-[80vh] object-contain"
              />

              {/* Image info */}
              {galleryImages[currentImageIndex] && (
                <div className="p-6 text-white">
                  {galleryImages[currentImageIndex].title && (
                    <h4 className="text-lg font-semibold mb-2">
                      {galleryImages[currentImageIndex].title}
                    </h4>
                  )}
                  {galleryImages[currentImageIndex].description && (
                    <p className="text-white/80">
                      {galleryImages[currentImageIndex].description}
                    </p>
                  )}
                  <p className="text-xs text-white/60 mt-2">
                    {currentImageIndex + 1} of {galleryImages.length}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VenueDetailGallery;