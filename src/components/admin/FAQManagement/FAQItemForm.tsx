import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, HelpCircle } from 'lucide-react';

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQItem {
  id: string;
  category_id?: string;
  question: string;
  answer: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface FAQItemFormProps {
  item: FAQItem | null;
  categories: FAQCategory[];
  selectedCategoryId: string | null;
  onSave: (item: Partial<FAQItem>) => void;
  onClose: () => void;
}

const FAQItemForm: React.FC<FAQItemFormProps> = ({
  item,
  categories,
  selectedCategoryId,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category_id: '',
    is_featured: false,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        question: item.question,
        answer: item.answer,
        category_id: item.category_id || '',
        is_featured: item.is_featured,
        is_active: item.is_active
      });
    } else if (selectedCategoryId) {
      setFormData(prev => ({ ...prev, category_id: selectedCategoryId }));
    }
  }, [item, selectedCategoryId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }
    
    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving FAQ item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-popup sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-wedding-gold" />
              {item ? 'Edit FAQ Item' : 'Add New FAQ Item'}
            </DialogTitle>
            <DialogDescription>
              Create helpful content for your wedding guests
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uncategorized</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="e.g., What time should guests arrive?"
                className={errors.question ? 'border-red-500' : ''}
              />
              {errors.question && (
                <p className="text-sm text-red-500">{errors.question}</p>
              )}
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Provide a detailed answer..."
                rows={5}
                className={errors.answer ? 'border-red-500' : ''}
              />
              {errors.answer && (
                <p className="text-sm text-red-500">{errors.answer}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Tip: Be clear and concise. You can format this with rich text later.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Featured Question</Label>
                  <p className="text-xs text-muted-foreground">
                    Featured questions appear at the top of the FAQ list
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_featured: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive questions won't be shown to guests
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-wedding-gold hover:bg-wedding-gold/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {item ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FAQItemForm;