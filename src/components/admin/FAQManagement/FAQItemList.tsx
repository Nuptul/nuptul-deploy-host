import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, Trash2, Eye, Star, StarOff, ArrowUpDown,
  ChevronDown, ChevronUp, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

interface FAQItemListProps {
  items: FAQItem[];
  categories: FAQCategory[];
  onEdit: (item: FAQItem) => void;
  onDelete: (id: string) => void;
  onReorder: () => void;
}

const FAQItemList: React.FC<FAQItemListProps> = ({
  items,
  categories,
  onEdit,
  onDelete,
  onReorder
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const handleToggleFeatured = async (item: FAQItem) => {
    onEdit({ ...item, is_featured: !item.is_featured });
  };

  const handleToggleActive = async (item: FAQItem) => {
    onEdit({ ...item, is_active: !item.is_active });
  };

  if (items.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">No FAQ items found</p>
            <p className="text-sm text-muted-foreground">
              Click "Add FAQ" to create your first question
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">FAQ Items ({items.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReorder}
          className="gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          Reorder
        </Button>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className={cn(
              "glass-card transition-all",
              !item.is_active && "opacity-60"
            )}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {item.is_featured && (
                        <Star className="w-4 h-4 text-wedding-gold fill-wedding-gold" />
                      )}
                      <h4 className="font-semibold text-wedding-navy">
                        {item.question}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(item.category_id)}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.view_count} views
                      </span>
                      {!item.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(item)}>
                          {item.is_featured ? (
                            <>
                              <StarOff className="w-4 h-4 mr-2" />
                              Remove from Featured
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Mark as Featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(item)}>
                          {item.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Answer (Expandable) */}
                {expandedItems.has(item.id) && (
                  <div className="pt-3 border-t">
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FAQItemList;