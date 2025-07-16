import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, Edit2, Trash2, Check, X, FolderOpen, 
  ChevronRight, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as faqApi from '@/lib/api/faq';
import { useToast } from '@/hooks/use-toast';

type FAQCategory = faqApi.FAQCategory;

interface FAQCategoryListProps {
  categories: FAQCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onUpdateCategories: () => Promise<void>;
}

const FAQCategoryList: React.FC<FAQCategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onUpdateCategories
}) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEdit = (category: FAQCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setLoading(true);
    try {
      await faqApi.updateCategory(editingId, {
        name: editName,
        description: editDescription
      });
      await onUpdateCategories();
      setEditingId(null);
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? FAQ items in this category will become uncategorized.')) {
      return;
    }
    
    setLoading(true);
    try {
      await faqApi.deleteCategory(id);
      await onUpdateCategories();
      if (selectedCategory === id) {
        onSelectCategory(null);
      }
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      await faqApi.createCategory({
        name: newName,
        slug: newName.toLowerCase().replace(/\s+/g, '-'),
        description: newDescription,
        display_order: categories.length,
        is_active: true
      });
      await onUpdateCategories();
      setNewName('');
      setNewDescription('');
      setShowAddForm(false);
      toast({
        title: "Category Created",
        description: "The new category has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAddForm(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* All FAQs Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-all",
            "hover:bg-white/10",
            !selectedCategory && "bg-wedding-gold/20 border border-wedding-gold/30"
          )}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-wedding-gold" />
            <span className="text-sm font-medium">All FAQs</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Categories */}
        {categories.map((category) => (
          <div key={category.id}>
            {editingId === category.id ? (
              <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  className="h-8 text-sm"
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={loading || !editName.trim()}
                    className="h-7"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="h-7"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all group",
                  "hover:bg-white/10",
                  selectedCategory === category.id && "bg-wedding-gold/20 border border-wedding-gold/30"
                )}
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  <FolderOpen className="w-4 h-4 text-wedding-gold" />
                  <div>
                    <p className="text-sm font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </button>
            )}
          </div>
        ))}

        {/* Add Form */}
        {showAddForm && (
          <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-wedding-gold/30">
            <Label className="text-xs">New Category</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="h-8 text-sm"
            />
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddCategory}
                disabled={loading || !newName.trim()}
                className="h-7 bg-wedding-gold hover:bg-wedding-gold/90"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewDescription('');
                }}
                className="h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQCategoryList;