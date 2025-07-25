import React, { useState, useEffect } from 'react';
import { 
  Folder, FolderOpen, File, Image as ImageIcon, Video, 
  Music, FileText, Upload, Trash2, Download, Move,
  Search, Filter, Grid, List, ChevronRight, ChevronDown,
  Plus, Edit2, Copy, ExternalLink, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StorageService, StorageBucket, AssetCategory } from '@/services/storageService';
import { Progress } from '@/components/ui/progress';

interface FolderStructure {
  name: string;
  path: string;
  children?: FolderStructure[];
  fileCount?: number;
}

interface MediaFile {
  id: string;
  filename: string;
  storage_bucket: StorageBucket;
  storage_path: string;
  public_url?: string;
  file_type: string;
  file_size: number;
  created_at: string;
  metadata?: any;
  tags?: string[];
}

export const AssetManager: React.FC = () => {
  const [currentBucket, setCurrentBucket] = useState<StorageBucket>('public-assets');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<FolderStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('hero/images');
  
  const { toast } = useToast();

  // Define folder structure for each bucket
  const bucketStructure: Record<StorageBucket, FolderStructure[]> = {
    'public-assets': [
      {
        name: 'branding',
        path: 'branding',
        children: [
          { name: 'logos', path: 'branding/logos' },
          { name: 'icons', path: 'branding/icons' }
        ]
      },
      {
        name: 'hero',
        path: 'hero',
        children: [
          { name: 'images', path: 'hero/images' },
          { name: 'videos', path: 'hero/videos' }
        ]
      },
      {
        name: 'venues',
        path: 'venues'
      },
      {
        name: 'gallery',
        path: 'gallery',
        children: [
          { name: 'wedding', path: 'gallery/wedding' },
          { name: 'couple', path: 'gallery/couple' },
          { name: 'featured', path: 'gallery/featured' }
        ]
      }
    ],
    'user-content': [
      {
        name: 'profiles',
        path: 'profiles'
      },
      {
        name: 'social',
        path: 'social'
      },
      {
        name: 'uploads',
        path: 'uploads'
      }
    ],
    'admin-assets': [
      {
        name: 'cms',
        path: 'cms',
        children: [
          { name: 'drafts', path: 'cms/drafts' },
          { name: 'staging', path: 'cms/staging' }
        ]
      },
      {
        name: 'documents',
        path: 'documents'
      },
      {
        name: 'backups',
        path: 'backups'
      }
    ]
  };

  useEffect(() => {
    loadFiles();
  }, [currentBucket, currentPath, searchTerm]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('media_library')
        .select('*')
        .eq('storage_bucket', currentBucket)
        .order('created_at', { ascending: false });

      if (currentPath) {
        query = query.like('storage_path', `${currentPath}/%`);
      }

      if (searchTerm) {
        query = query.or(`filename.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    let completed = 0;

    for (const file of fileArray) {
      try {
        const result = await StorageService.uploadFile(
          file,
          selectedCategory,
          { folder: currentPath },
          {
            onProgress: (progress) => {
              setUploadProgress(Math.round((completed + progress) / fileArray.length));
            }
          }
        );

        if (!result.success) throw result.error;
        completed++;
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setShowUploadDialog(false);
    setUploadProgress(0);
    loadFiles();
    
    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${completed} of ${fileArray.length} files`,
    });
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) return;

    const confirmDelete = window.confirm(`Delete ${selectedFiles.length} file(s)?`);
    if (!confirmDelete) return;

    let deleted = 0;
    for (const fileId of selectedFiles) {
      const file = files.find(f => f.id === fileId);
      if (!file) continue;

      const result = await StorageService.deleteFile(
        file.storage_bucket,
        file.storage_path
      );

      if (result.success) deleted++;
    }

    setSelectedFiles([]);
    loadFiles();
    
    toast({
      title: "Files Deleted",
      description: `Successfully deleted ${deleted} file(s)`,
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const renderFolderTree = (folders: FolderStructure[], level = 0) => {
    return folders.map((folder) => (
      <div key={folder.path} style={{ marginLeft: level * 20 }}>
        <button
          className={`flex items-center gap-2 p-2 hover:bg-accent rounded w-full text-left ${
            currentPath === folder.path ? 'bg-accent' : ''
          }`}
          onClick={() => setCurrentPath(folder.path)}
        >
          <Folder className="w-4 h-4" />
          <span className="text-sm">{folder.name}</span>
          {folder.fileCount && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {folder.fileCount}
            </Badge>
          )}
        </button>
        {folder.children && renderFolderTree(folder.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-2">Storage Bucket</Label>
          <Select value={currentBucket} onValueChange={(v) => setCurrentBucket(v as StorageBucket)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public-assets">Public Assets</SelectItem>
              <SelectItem value="user-content">User Content</SelectItem>
              <SelectItem value="admin-assets">Admin Assets</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground mb-2">Folders</Label>
          {renderFolderTree(bucketStructure[currentBucket])}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Asset Manager</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentBucket}</span>
              {currentPath && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{currentPath}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>

            <Button
              className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setShowUploadDialog(true)}
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {selectedFiles.length > 0 && (
              <Button
                className="min-h-[44px] px-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleDeleteFiles}
                style={{
                  background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(255, 59, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #D70015 0%, #A50000 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 59, 48, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 59, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedFiles.length})
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No files in this folder</p>
            <Button
              className="mt-4 min-h-[44px] px-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setShowUploadDialog(true)}
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className={`cursor-pointer transition-all ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  if (selectedFiles.includes(file.id)) {
                    setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                  } else {
                    setSelectedFiles([...selectedFiles, file.id]);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-2 bg-muted rounded flex items-center justify-center">
                    {file.file_type.startsWith('image/') && file.public_url ? (
                      <img
                        src={file.public_url}
                        alt={file.filename}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        {getFileIcon(file.file_type)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs truncate font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'bg-accent' : ''
                }`}
                onClick={() => {
                  if (selectedFiles.includes(file.id)) {
                    setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                  } else {
                    setSelectedFiles([...selectedFiles, file.id]);
                  }
                }}
              >
                {getFileIcon(file.file_type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                {file.public_url && (
                  <Button
                    className="min-h-[44px] min-w-[44px] p-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.public_url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                      backdropFilter: 'blur(20px) saturate(1.8)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontWeight: '600',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to {currentBucket} / {currentPath || 'root'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AssetCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero/images">Hero Images</SelectItem>
                  <SelectItem value="hero/videos">Hero Videos</SelectItem>
                  <SelectItem value="venues">Venue Images</SelectItem>
                  <SelectItem value="gallery/featured">Gallery Featured</SelectItem>
                  <SelectItem value="branding/logos">Logos</SelectItem>
                  <SelectItem value="branding/icons">Icons</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Files</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                  }
                }}
                className="cursor-pointer"
              />
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};