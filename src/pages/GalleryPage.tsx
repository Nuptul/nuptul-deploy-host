import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, Edit, Trash2, Eye, EyeOff, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryPhoto {
  id: string;
  title: string | null;
  backstory: string | null;
  image_url: string;
  image_path: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface PhotoFormData {
  title: string;
  backstory: string;
  is_published: boolean;
}

interface GalleryProps {
  isPopup?: boolean;
  onClose?: () => void;
}

const GalleryPage: React.FC<GalleryProps> = ({ isPopup = false, onClose }) => {
  const { userRole } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    backstory: '',
    is_published: false
  });
  const [uploading, setUploading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const isAdmin = userRole?.role === 'admin';

  useEffect(() => {
    fetchPhotos();
  }, [isAdmin]);

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load gallery photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to gallery bucket
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Insert photo record
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          image_url: publicUrl,
          image_path: filePath,
          display_order: photos.length,
          is_published: false
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded successfully');
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({
          title: formData.title || null,
          backstory: formData.backstory || null,
          is_published: formData.is_published
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      toast.success('Photo updated successfully');
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    }
  };

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('gallery')
        .remove([photo.image_path]);

      // Delete from database
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const openEditDialog = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || '',
      backstory: photo.backstory || '',
      is_published: photo.is_published
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isPopup ? 'h-full' : 'min-h-screen'} bg-gradient-to-br from-background to-muted/20 p-4 ${isPopup ? 'pt-4' : 'pt-20'}`}>
      {isPopup && onClose && (
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-wedding-navy">Wedding Gallery</h1>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className={`max-w-7xl mx-auto space-y-6 ${isPopup ? 'max-h-[calc(90vh-120px)] overflow-y-auto' : ''}`}>
        {/* Header */}
        <div className="p-6 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 154, 0, 0.15) 0%, rgba(78, 205, 196, 0.1) 50%, rgba(155, 89, 182, 0.12) 100%)',
          backdropFilter: 'blur(30px) saturate(2)',
          WebkitBackdropFilter: 'blur(30px) saturate(2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{
                fontSize: '32px',
                fontFamily: '"Great Vibes", cursive',
                fontWeight: '400',
                color: '#000000'
              }}>
                Tim & Kirsten's Gallery
              </h1>
              <p style={{
                fontSize: '16px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontFamily: '"Montserrat", sans-serif',
                marginTop: '8px'
              }}>
                Our journey together in pictures
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                <label htmlFor="photo-upload">
                  <button 
                    disabled={uploading}
                    className="cursor-pointer px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.9) 0%, rgba(78, 205, 196, 0.8) 50%, rgba(255, 107, 107, 0.85) 100%)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(10px) saturate(2)',
                      WebkitBackdropFilter: 'blur(10px) saturate(2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                      fontFamily: '"Montserrat", sans-serif',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      minHeight: '48px'
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="p-12 text-center rounded-3xl" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
            backdropFilter: 'blur(20px) saturate(2)',
            WebkitBackdropFilter: 'blur(20px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
          }}>
            <div className="space-y-4">
              <div className="text-6xl">📸</div>
              <h3 style={{
                fontSize: '20px',
                fontFamily: '"Bodoni Moda", serif',
                fontWeight: '600',
                color: '#000000'
              }}>No photos yet</h3>
              <p style={{
                fontSize: '15px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontFamily: '"Montserrat", sans-serif'
              }}>
                {isAdmin 
                  ? 'Upload some beautiful memories to share with your guests!'
                  : 'Check back soon for beautiful photos from Tim & Kirsten!'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="overflow-hidden group rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  backdropFilter: 'blur(20px) saturate(2)',
                  WebkitBackdropFilter: 'blur(20px) saturate(2)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                }}
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Gallery photo'}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setLightboxPhoto(photo)}
                    loading="lazy"
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={photo.is_published ? "default" : "secondary"}>
                        {photo.is_published ? (
                          <Eye className="w-3 h-3 mr-1" />
                        ) : (
                          <EyeOff className="w-3 h-3 mr-1" />
                        )}
                        {photo.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={() => openEditDialog(photo)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 100%)',
                          backdropFilter: 'blur(10px) saturate(2)',
                          WebkitBackdropFilter: 'blur(10px) saturate(2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          minWidth: '36px',
                          minHeight: '36px'
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                      </button>
                      <button
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleDeletePhoto(photo)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 154, 0, 0.8) 100%)',
                          backdropFilter: 'blur(10px) saturate(2)',
                          WebkitBackdropFilter: 'blur(10px) saturate(2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          minWidth: '36px',
                          minHeight: '36px'
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                      </button>
                    </div>
                  )}
                </div>
                {photo.title && (
                  <div className="p-4">
                    <h3 className="line-clamp-2" style={{
                      fontFamily: '"Bodoni Moda", serif',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000'
                    }}>{photo.title}</h3>
                    {photo.backstory && (
                      <p className="mt-1 line-clamp-2" style={{
                        fontSize: '13px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontFamily: '"Montserrat", sans-serif'
                      }}>
                        {photo.backstory}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Photo Dialog */}
        {isAdmin && editingPhoto && (
          <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
            <DialogContent className="max-w-2xl" style={{
              background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.95) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 107, 107, 0.92) 100%)',
              backdropFilter: 'blur(30px) saturate(2)',
              WebkitBackdropFilter: 'blur(30px) saturate(2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '24px'
            }}>
              <DialogHeader>
                <DialogTitle>Edit Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={editingPhoto.image_url}
                    alt="Photo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Add a title for this photo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Backstory</label>
                    <Textarea
                      value={formData.backstory}
                      onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                      placeholder="Tell the story behind this photo (Markdown supported)"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <label className="text-sm font-medium">Published</label>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleUpdatePhoto} 
                      className="flex-1 min-h-[48px] rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(69, 183, 209, 0.9) 0%, rgba(78, 205, 196, 0.8) 50%, rgba(255, 107, 107, 0.85) 100%)',
                        color: '#FFFFFF',
                        backdropFilter: 'blur(10px) saturate(2)',
                        WebkitBackdropFilter: 'blur(10px) saturate(2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                        fontFamily: '"Montserrat", sans-serif',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setEditingPhoto(null)}
                      className="px-6 min-h-[48px] rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                        color: '#000000',
                        backdropFilter: 'blur(20px) saturate(2)',
                        WebkitBackdropFilter: 'blur(20px) saturate(2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                        fontFamily: '"Montserrat", sans-serif'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Lightbox */}
        {lightboxPhoto && (
          <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <img
                  src={lightboxPhoto.image_url}
                  alt={lightboxPhoto.title || 'Gallery photo'}
                  className="w-full max-h-[80vh] object-contain"
                />
                {(lightboxPhoto.title || lightboxPhoto.backstory) && (
                  <div className="p-6 text-white">
                    {lightboxPhoto.title && (
                      <h3 className="text-xl font-semibold mb-2">{lightboxPhoto.title}</h3>
                    )}
                    {lightboxPhoto.backstory && (
                      <p className="text-white/80 leading-relaxed">{lightboxPhoto.backstory}</p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;