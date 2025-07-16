import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GripVertical, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

interface FAQReorderModalProps {
  items: FAQItem[];
  onSave: (items: FAQItem[]) => void;
  onClose: () => void;
}

const FAQReorderModal: React.FC<FAQReorderModalProps> = ({
  items,
  onSave,
  onClose
}) => {
  const [orderedItems, setOrderedItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Sort items by display_order initially
    const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
    setOrderedItems(sorted);
  }, [items]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(orderedItems);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index
    }));

    setOrderedItems(updatedItems);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(orderedItems);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-popup sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Reorder FAQ Items</DialogTitle>
          <DialogDescription>
            Drag and drop to reorder how FAQ items appear to your guests
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[50vh] overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="faq-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {orderedItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            glass-card p-3 flex items-center gap-3
                            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-wedding-gold' : ''}
                            ${!item.is_active ? 'opacity-60' : ''}
                          `}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.question}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.answer}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{index + 1}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-wedding-gold hover:bg-wedding-gold/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FAQReorderModal;