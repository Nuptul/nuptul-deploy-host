import React, { useState, useEffect } from 'react';
import { Image, Eye, Check, X, Flag, Heart, MessageCircle, Download, Filter, Search, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPhoto {
  id: string;
  title?: string;
  description?: string;
  file_url: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    email: string;
    display_name?: string;
  };
  photo_likes: { id: string; user_id: string }[];
  photo_comments: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      first_name?: string;
      last_name?: string;
      display_name?: string;
    };
  }[];
  moderation_notes?: string;
  flagged_reason?: string;
}

interface PhotoModerationProps {
  photos: EnhancedPhoto[];
  onRefresh: () => void;
}

const PhotoModeration: React.FC<PhotoModerationProps> = ({ photos, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPhoto, setSelectedPhoto] = useState<EnhancedPhoto | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [realTimeStats, setRealTimeStats] = useState({
    lastUpdated: new Date(),
    pendingCount: 0,
    approvedToday: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    setupRealTimeUpdates();
    updateStats();
  }, [photos]);

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('photo-moderation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos'
        },
        (payload) => {
          
          setRealTimeStats(prev => ({
            ...prev,
            lastUpdated: new Date()
          }));
          onRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateStats = () => {
    const pending = photos.filter(p => !p.is_approved).length;
    const today = new Date().toDateString();
    const approvedToday = photos.filter(p => 
      p.is_approved && new Date(p.updated_at).toDateString() === today
    ).length;
    
    setRealTimeStats(prev => ({
      ...prev,
      pendingCount: pending,
      approvedToday
    }));
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${photo.profiles.first_name} ${photo.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && !photo.is_approved) ||
      (filterStatus === 'approved' && photo.is_approved) ||
      (filterStatus === 'flagged' && photo.flagged_reason);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return (b.photo_likes?.length || 0) - (a.photo_likes?.length || 0);
      case 'size':
        return (b.file_size || 0) - (a.file_size || 0);
      default:
        return 0;
    }
  });

  const approvePhoto = async (photoId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('photos')
        .update({ 
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId);

      if (error) throw error;
      
      toast({
        title: "Photo Approved",
        description: "Photo has been approved and is now visible to all users",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error approving photo:', error);
      toast({
        title: "Error",
        description: "Failed to approve photo",
        variant: "destructive"
      });
    }
  };

  const rejectPhoto = async (photoId: string, reason?: string) => {
    try {
      const { error } = await (supabase as any)
        .from('photos')
        .update({ 
          is_approved: false,
          flagged_reason: reason,
          moderation_notes: moderationNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId);

      if (error) throw error;
      
      toast({
        title: "Photo Rejected",
        description: reason ? `Photo rejected: ${reason}` : "Photo has been rejected",
        variant: "destructive"
      });
      
      setModerationNotes('');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting photo:', error);
      toast({
        title: "Error",
        description: "Failed to reject photo",
        variant: "destructive"
      });
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      
      toast({
        title: "Photo Deleted",
        description: "Photo has been permanently deleted",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    return bytes < 1024 * 1024 
      ? `${Math.round(bytes / 1024)}KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-glass-blue" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="text-sm font-semibold">{realTimeStats.pendingCount}</div>
          <div className="text-xs text-muted-foreground">Need Review</div>
        </div>
        <div className="glass-card p-3 text-center">
          <Check className="w-4 h-4 mx-auto text-glass-green mb-1" />
          <div className="text-sm font-semibold">{realTimeStats.approvedToday}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
        <div className="glass-card p-3 text-center">
          <Image className="w-4 h-4 mx-auto text-glass-purple mb-1" />
          <div className="text-sm font-semibold">{photos.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search photos, descriptions, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-secondary border-0 pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-between items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-xs text-muted-foreground">
            Last updated: {realTimeStats.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Enhanced Photo Grid */}
      <div className="space-y-2 h-80 overflow-y-auto">
        {filteredPhotos.slice(0, 12).map((photo) => (
          <div key={photo.id} className="glass-card p-3">
            <div className="flex space-x-3">
              {/* Photo Preview */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <img 
                  src={photo.file_url} 
                  alt={photo.title || 'Wedding photo'}
                  className="w-full h-full object-cover rounded-lg"
                />
                {!photo.is_approved && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Photo Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-wedding-navy truncate">
                      {photo.title || 'Untitled Photo'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      By {photo.profiles.first_name && photo.profiles.last_name
                        ? `${photo.profiles.first_name} ${photo.profiles.last_name}`
                        : photo.profiles.email
                      }
                    </p>
                    {photo.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={photo.is_approved ? 'default' : 'outline'}>
                      {photo.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                    {photo.flagged_reason && (
                      <Badge variant="destructive" className="text-xs">
                        Flagged
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Meta Info */}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(photo.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {photo.photo_likes?.length || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {photo.photo_comments?.length || 0}
                  </div>
                  {photo.file_size && (
                    <span>{formatFileSize(photo.file_size)}</span>
                  )}
                  {photo.width && photo.height && (
                    <span>{photo.width}×{photo.height}</span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-popup max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Photo Details</DialogTitle>
                    </DialogHeader>
                    {selectedPhoto && (
                      <div className="space-y-4">
                        <img 
                          src={selectedPhoto.file_url} 
                          alt={selectedPhoto.title || 'Wedding photo'}
                          className="w-full max-h-96 object-contain rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Title:</strong> {selectedPhoto.title || 'Untitled'}
                          </div>
                          <div>
                            <strong>Uploaded by:</strong> {selectedPhoto.profiles.first_name} {selectedPhoto.profiles.last_name}
                          </div>
                          <div>
                            <strong>Upload Date:</strong> {new Date(selectedPhoto.created_at).toLocaleString()}
                          </div>
                          <div>
                            <strong>Size:</strong> {formatFileSize(selectedPhoto.file_size)}
                          </div>
                          <div>
                            <strong>Dimensions:</strong> {selectedPhoto.width}×{selectedPhoto.height}
                          </div>
                          <div>
                            <strong>Likes:</strong> {selectedPhoto.photo_likes?.length || 0}
                          </div>
                        </div>
                        {selectedPhoto.description && (
                          <div>
                            <strong>Description:</strong>
                            <p className="mt-1 text-muted-foreground">{selectedPhoto.description}</p>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          {!selectedPhoto.is_approved && (
                            <Button 
                              onClick={() => approvePhoto(selectedPhoto.id)}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            onClick={() => rejectPhoto(selectedPhoto.id, 'Inappropriate content')}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                {!photo.is_approved && (
                  <Button 
                    size="sm" 
                    onClick={() => approvePhoto(photo.id)}
                    className="text-xs px-2 py-1"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredPhotos.length > 12 && (
          <div className="text-center text-xs text-muted-foreground">
            Showing 12 of {filteredPhotos.length} photos
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="glass-card p-3 space-y-2">
        <h4 className="text-sm font-medium text-wedding-navy">Moderation Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>Total Photos: {photos.length}</div>
            <div>Pending Review: {realTimeStats.pendingCount}</div>
            <div>Approved Today: {realTimeStats.approvedToday}</div>
          </div>
          <div className="space-y-1">
            <div>Total Size: {formatFileSize(photos.reduce((sum, p) => sum + (p.file_size || 0), 0))}</div>
            <div>Avg Likes: {photos.length > 0 ? Math.round(photos.reduce((sum, p) => sum + (p.photo_likes?.length || 0), 0) / photos.length) : 0}</div>
            <div>Last Activity: {realTimeStats.lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModeration;