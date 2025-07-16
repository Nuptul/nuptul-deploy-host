import React, { useState, useEffect } from 'react';
import { Image, Video, Trash2, Eye, Download, Search, Filter, Grid, List, Upload, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file_url: string;
  file_path: string;
  title: string | null;
  description: string | null;
  mime_type: string | null;
  file_size: number | null;
  is_approved: boolean | null;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
  };
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  pendingApproval: number;
  byBucket: { [key: string]: { count: number; size: number } };
}

const MediaManagement: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaFiles();
    fetchStorageStats();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      
      // Fetch from database (photos table)
      const { data: dbPhotos, error: dbError } = await (supabase as any)
        .from('photos')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Fetch directly from storage buckets
      const buckets = ['wedding-photos', 'social-posts', 'stories', 'user-profiles', 'gift-images'];
      const storageFiles: MediaFile[] = [];

      for (const bucketName of buckets) {
        try {
          const { data: files, error: storageError } = await supabase.storage
            .from(bucketName)
            .list('', { 
              limit: 1000,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (!storageError && files) {
            for (const file of files) {
              if (file.name && file.name !== '.emptyFolderPlaceholder') {
                const { data: publicURL } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(file.name);

                storageFiles.push({
                  id: `${bucketName}-${file.name}`,
                  file_url: publicURL.publicUrl,
                  file_path: `${bucketName}/${file.name}`,
                  title: file.name,
                  description: `File from ${bucketName} bucket`,
                  mime_type: file.metadata?.mimetype || 'unknown',
                  file_size: file.metadata?.size || 0,
                  is_approved: true, // Storage files are considered approved
                  created_at: file.created_at || new Date().toISOString(),
                  user_id: 'storage-file',
                  profiles: {
                    first_name: 'Storage',
                    last_name: 'File',
                    display_name: 'Storage File'
                  }
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Error fetching from bucket ${bucketName}:`, error);
        }
      }

      // Combine database and storage files
      const allFiles = [...(dbPhotos || []), ...storageFiles];
      setMediaFiles(allFiles);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      // Get storage bucket usage with better error handling
      const buckets = ['wedding-photos', 'social-posts', 'stories', 'user-profiles', 'gift-images', 'direct-chats'];
      const stats: StorageStats = {
        totalFiles: 0,
        totalSize: 0,
        pendingApproval: 0,
        byBucket: {}
      };

      const { data: bucketList } = await supabase.storage.listBuckets();
      
      if (bucketList) {
        for (const bucket of bucketList) {
          try {
            const { data: files, error } = await supabase.storage
              .from(bucket.name)
              .list('', { limit: 1000 });

            if (!error && files) {
              const bucketSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
              stats.byBucket[bucket.name] = {
                count: files.length,
                size: bucketSize
              };
              stats.totalFiles += files.length;
              stats.totalSize += bucketSize;
            }
          } catch (bucketError) {
            console.warn(`Error accessing bucket ${bucket.name}:`, bucketError);
            // Set default values for inaccessible buckets
            stats.byBucket[bucket.name] = {
              count: 0,
              size: 0
            };
          }
        }
      }

      // Get pending approval count from database
      const { count } = await (supabase as any)
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      stats.pendingApproval = count || 0;
      setStorageStats(stats);
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      // Set fallback stats
      setStorageStats({
        totalFiles: 0,
        totalSize: 0,
        pendingApproval: 0,
        byBucket: {}
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('photos')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo approved successfully",
      });
      
      fetchMediaFiles();
    } catch (error) {
      console.error('Error approving photo:', error);
      toast({
        title: "Error",
        description: "Failed to approve photo",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('photos')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo rejected",
      });
      
      fetchMediaFiles();
    } catch (error) {
      console.error('Error rejecting photo:', error);
      toast({
        title: "Error",
        description: "Failed to reject photo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('photos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete from storage
      const bucket = filePath.split('/')[0];
      const path = filePath.split('/').slice(1).join('/');
      
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
      
      fetchMediaFiles();
      fetchStorageStats();
    } catch (error) {
      console.error('Error deleting media file:', error);
      toast({
        title: "Error",
        description: "Failed to delete media file",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUserName = (file: MediaFile) => {
    if (file.profiles?.display_name) return file.profiles.display_name;
    if (file.profiles?.first_name && file.profiles?.last_name) {
      return `${file.profiles.first_name} ${file.profiles.last_name}`;
    }
    return 'Unknown User';
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = searchTerm === '' || 
      file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(file).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && file.is_approved === true) ||
      (filterStatus === 'pending' && file.is_approved === false) ||
      (filterStatus === 'rejected' && file.is_approved === null);
    
    const matchesType = filterType === 'all' ||
      (filterType === 'image' && file.mime_type?.startsWith('image/')) ||
      (filterType === 'video' && file.mime_type?.startsWith('video/'));

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Storage Statistics */}
      {storageStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-glass-blue" />
                <div>
                  <div className="text-lg font-semibold">{storageStats.totalFiles}</div>
                  <div className="text-xs text-muted-foreground">Total Files</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-glass-purple" />
                <div>
                  <div className="text-lg font-semibold">{formatFileSize(storageStats.totalSize)}</div>
                  <div className="text-xs text-muted-foreground">Storage Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-glass-pink" />
                <div>
                  <div className="text-lg font-semibold">{storageStats.pendingApproval}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-glass-green" />
                <div>
                  <div className="text-lg font-semibold">{mediaFiles.filter(f => f.is_approved).length}</div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Media Files */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
        {filteredFiles.map((file) => (
          <Card key={file.id} className={`glass-card ${viewMode === 'list' ? 'p-3' : ''}`}>
            {viewMode === 'grid' ? (
              <CardContent className="p-3">
                <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                  {file.mime_type?.startsWith('image/') ? (
                    <img 
                      src={file.file_url} 
                      alt={file.title || 'Photo'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium truncate">{file.title || 'Untitled'}</div>
                  <div className="text-xs text-muted-foreground">{getUserName(file)}</div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={file.is_approved ? 'default' : file.is_approved === false ? 'secondary' : 'destructive'}>
                      {file.is_approved ? 'Approved' : file.is_approved === false ? 'Pending' : 'Rejected'}
                    </Badge>
                    
                    <div className="flex gap-1">
                      {!file.is_approved && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(file.id)} className="h-6 w-6 p-0">
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleReject(file.id)} className="h-6 w-6 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(file.id, file.file_path)} className="h-6 w-6 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {file.mime_type?.startsWith('image/') ? (
                    <Image className="w-5 h-5 text-glass-blue" />
                  ) : (
                    <Video className="w-5 h-5 text-glass-purple" />
                  )}
                  
                  <div>
                    <div className="text-sm font-medium">{file.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">
                      {getUserName(file)} • {file.file_size ? formatFileSize(file.file_size) : 'Unknown size'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={file.is_approved ? 'default' : file.is_approved === false ? 'secondary' : 'destructive'}>
                    {file.is_approved ? 'Approved' : file.is_approved === false ? 'Pending' : 'Rejected'}
                  </Badge>
                  
                  <div className="flex gap-1">
                    {!file.is_approved && (
                      <Button size="sm" variant="outline" onClick={() => handleApprove(file.id)} className="h-6 w-6 p-0">
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleReject(file.id)} className="h-6 w-6 p-0">
                      <X className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(file.id, file.file_path)} className="h-6 w-6 p-0">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No media files found matching your filters
        </div>
      )}
    </div>
  );
};

export default MediaManagement;