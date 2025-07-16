import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FAQCategoryList from './FAQCategoryList';
import FAQItemList from './FAQItemList';
import FAQItemForm from './FAQItemForm';
import FAQReorderModal from './FAQReorderModal';
import * as faqApi from '@/lib/api/faq';

type FAQCategory = faqApi.FAQCategory;
type FAQItem = faqApi.FAQItem;

const FAQManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, itemsData] = await Promise.all([
        faqApi.getCategories(),
        faqApi.getFAQItems()
      ]);
      setCategories(categoriesData);
      setFaqItems(itemsData);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQ data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: Partial<FAQItem>) => {
    try {
      setLoading(true);
      if (editingItem) {
        await faqApi.updateFAQItem(editingItem.id, item);
        toast({
          title: "FAQ Updated",
          description: "The FAQ item has been updated successfully.",
        });
      } else {
        const newItem = {
          category_id: item.category_id || selectedCategory || undefined,
          question: item.question || '',
          answer: item.answer || '',
          display_order: faqItems.length,
          is_featured: item.is_featured || false,
          is_active: item.is_active !== false
        };
        await faqApi.createFAQItem(newItem);
        toast({
          title: "FAQ Created",
          description: "The new FAQ item has been created successfully.",
        });
      }
      await loadData(); // Reload data
      setShowItemForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving FAQ item:', error);
      toast({
        title: "Error",
        description: "Failed to save FAQ item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) {
      return;
    }
    
    try {
      setLoading(true);
      await faqApi.deleteFAQItem(id);
      await loadData(); // Reload data
      toast({
        title: "FAQ Deleted",
        description: "The FAQ item has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (items: FAQItem[]) => {
    try {
      setLoading(true);
      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index
      }));
      await faqApi.updateFAQOrder(updates);
      await loadData(); // Reload data
      toast({
        title: "Order Updated",
        description: "FAQ items have been reordered successfully.",
      });
    } catch (error) {
      console.error('Error reordering FAQ items:', error);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory
    ? faqItems.filter(item => item.category_id === selectedCategory)
    : faqItems;

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-wedding-gold" />
                FAQ Management
              </CardTitle>
              <CardDescription>
                Manage frequently asked questions for your wedding guests
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingItem(null);
                setShowItemForm(true);
              }}
              className="bg-wedding-gold hover:bg-wedding-gold/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-wedding-gold" />
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <FAQCategoryList
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onUpdateCategories={async () => await loadData()}
                />
              </div>

              {/* FAQ Items */}
              <div className="lg:col-span-3">
                <FAQItemList
                  items={filteredItems as any}
                  categories={categories}
                  onEdit={(item) => {
                    setEditingItem(item as any);
                    setShowItemForm(true);
                  }}
                  onDelete={handleDeleteItem}
                  onReorder={() => setShowReorderModal(true)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {showItemForm && (
        <FAQItemForm
          item={editingItem as any}
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Reorder Modal */}
      {showReorderModal && (
        <FAQReorderModal
          items={filteredItems as any}
          onSave={handleReorder}
          onClose={() => setShowReorderModal(false)}
        />
      )}
    </div>
  );
};

export default FAQManagement;