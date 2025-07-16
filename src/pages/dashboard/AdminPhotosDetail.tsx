import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePhotos } from '@/hooks/useWeddingData';

interface PhotoDetail {
  id: string;
  title?: string;
  description?: string;
  file_url: string;
  is_approved: boolean;
  created_at: string;
  profiles: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

const AdminPhotosDetail: React.FC = () => {
  const navigate = useNavigate();
  const { status } = useParams<{ status: 'pending' | 'approved' }>();
  const [photos, setPhotos] = useState<PhotoDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [status]);

  const fetchPhotos = async () => {
    try {
      const isApproved = status === 'approved';
      
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles(display_name, first_name, last_name)
        `)
        .eq('is_approved', isApproved)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []) as PhotoDetail[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (photoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_approved: !currentStatus })
        .eq('id', photoId);

      if (error) throw error;
      
      // Refresh the photos list
      fetchPhotos();
    } catch (error) {
      console.error('Error updating photo status:', error);
    }
  };

  const getDisplayName = (profiles: any) => {
    return profiles?.display_name || 
           `${profiles?.first_name || ''} ${profiles?.last_name || ''}`.trim() || 
           'Anonymous User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/photos')}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#7a736b]" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3f51] capitalize">
            {status} Photos
          </h1>
          <p className="text-sm text-[#7a736b]">
            {status === 'pending' ? 'Review photos awaiting approval' : 'Manage approved photos'}
          </p>
        </div>
        <Badge variant={status === 'approved' ? 'default' : 'destructive'} className="ml-auto">
          {photos.length} Photos
        </Badge>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto"></div>
        </div>
      ) : photos.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">
            No {status} photos found.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <GlassCard key={photo.id} className="p-4 space-y-4">
              {/* Photo Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.file_url}
                  alt={photo.title || 'Wedding photo'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo Details */}
              <div className="space-y-2">
                {photo.title && (
                  <h3 className="font-semibold text-[#2d3f51] truncate">{photo.title}</h3>
                )}
                
                <div className="flex items-center justify-between text-sm text-[#7a736b]">
                  <span>By {getDisplayName(photo.profiles)}</span>
                  <span>{formatDate(photo.created_at)}</span>
                </div>

                {photo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={photo.is_approved ? "destructive" : "default"}
                  onClick={() => handleToggleApproval(photo.id, photo.is_approved)}
                  className="flex-1"
                >
                  {photo.is_approved ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unapprove
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPhotosDetail;