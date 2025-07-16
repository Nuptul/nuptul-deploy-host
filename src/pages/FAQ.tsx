import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { WeddingFAQCards } from '@/components/ui/wedding-faq-cards';
import { 
  HelpCircle, 
  MapPin, 
  Car, 
  Bus, 
  Shirt, 
  Baby, 
  Coffee, 
  Calendar,
  AlertCircle,
  Loader2,
  Bed,
  Gift,
  Phone,
  PartyPopper,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getPublicFAQs, incrementFAQViewCount } from '@/lib/api/faq';
import { useToast } from '@/hooks/use-toast';

// Icon mapping
const iconMap: Record<string, any> = {
  HelpCircle,
  MapPin,
  Car,
  Bus,
  Shirt,
  Baby,
  Coffee,
  Calendar,
  AlertCircle,
  Bed,
  Gift,
  Phone,
  PartyPopper
};

interface FAQGroup {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  items: Array<{
    id: string;
    question: string;
    answer: string;
    is_featured: boolean;
    view_count: number;
  }>;
}

const FAQ: React.FC = () => {
  const [faqGroups, setFaqGroups] = useState<FAQGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await getPublicFAQs();
      setFaqGroups(data);
      
      // Auto-expand featured items
      const featuredIds = data.flatMap(group => 
        group.items.filter((item: any) => item.is_featured).map((item: any) => item.id)
      );
      setExpandedItems(new Set(featuredIds));
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQs. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = async (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        // Track view count when expanding
        incrementFAQViewCount(id).catch(console.error);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-3 sm:px-5 pt-8 sm:pt-12 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-wedding-gold" />
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Find important venue update FAQ
  const venueUpdateFAQ = faqGroups
    .flatMap(g => g.items)
    .find(item => item.question.toLowerCase().includes('venue different'));

  return (
    <div className="min-h-screen px-3 sm:px-5 pt-8 sm:pt-12 pb-20">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl lg:wedding-heading font-semibold text-wedding-navy mb-2 sm:mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Everything you need to know about Tim & Kirsten's wedding
        </p>
      </div>

      {/* Featured FAQ Carousel */}
      {faqGroups.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <WeddingFAQCards
            items={faqGroups
              .flatMap(group => 
                group.items.map(item => ({
                  id: item.id,
                  question: item.question,
                  answer: item.answer,
                  category: group.slug === 'venue-transport' ? 'venue' : 
                           group.slug === 'accommodation' ? 'accommodation' :
                           group.slug === 'schedule-events' ? 'schedule' :
                           group.slug === 'food-photos' ? 'photography' :
                           group.slug === 'children-accessibility' ? 'general' : 'general',
                  views: item.view_count || 0
                }))
              )
              .filter(item => item.views > 10) // Show popular FAQs
              .slice(0, 8) // Limit to 8 cards for better performance
            }
            speed="slow"
            direction="left"
            className="mb-4"
          />
        </div>
      )}

      {/* Important Notice - Show if venue update FAQ exists */}
      {venueUpdateFAQ && (
        <GlassCard className="mb-6 sm:mb-8 p-4 sm:p-6 animate-fade-up border-l-4 border-amber-400" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-wedding-navy mb-2 text-sm sm:text-base">Important Venue Update</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Please note the venue has changed from The Edwards to Ben Ean due to the original venue going into liquidation in February 2025. 
                We've arranged coach transport to help with the change. Thank you for your understanding!
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* FAQ Groups */}
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {faqGroups.map((group, groupIndex) => {
          const Icon = iconMap[group.icon] || HelpCircle;
          
          return (
            <div key={group.slug} className="animate-fade-up" style={{ animationDelay: `${0.2 + (groupIndex * 0.1)}s` }}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-glass-blue/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-glass-blue" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-wedding-navy">{group.name}</h2>
                  {group.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{group.description}</p>
                  )}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-3 sm:space-y-4">
                {group.items.map((faq, index) => (
                  <GlassCard 
                    key={faq.id}
                    className="overflow-hidden animate-fade-up cursor-pointer"
                    style={{ animationDelay: `${0.3 + (index * 0.05)}s` }}
                  >
                    <div
                      onClick={() => toggleExpanded(faq.id)}
                      className="p-4 sm:p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-wedding-navy mb-1 leading-relaxed text-sm sm:text-base flex items-center gap-2">
                            {faq.is_featured && (
                              <span className="text-wedding-gold">⭐</span>
                            )}
                            {faq.question}
                          </h3>
                          {expandedItems.has(faq.id) && (
                            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm mt-3">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {faq.view_count > 50 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Viewed {faq.view_count} times
                        </p>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekend Events - Now dynamic from Schedule & Events category */}
      {faqGroups.some(g => g.slug === 'schedule-events' && g.items.length > 0) && (
        <GlassCard 
          className="mt-6 sm:mt-8 p-4 sm:p-6 animate-fade-up max-w-4xl mx-auto" 
          variant="secondary"
          style={{ animationDelay: '1.0s' }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-wedding-navy flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Weekend Events
          </h3>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="p-3 sm:p-4 bg-glass-green/10 rounded-lg">
              <p className="font-medium text-wedding-navy mb-1 text-sm sm:text-base">Saturday, October 4th, 2025</p>
              <p className="text-muted-foreground">
                <strong>Pre-wedding drinks:</strong> Prince of Mereweather pub, 4-8 PM
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Come have a drink and grab a meal if you're hungry!
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-glass-blue/10 rounded-lg">
              <p className="font-medium text-wedding-navy mb-1 text-sm sm:text-base">Monday, October 6th, 2025</p>
              <p className="text-muted-foreground">
                <strong>Recovery hangout:</strong> Newcastle Beach, from 11 AM
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Kiosk with good coffee and food - perfect for recovery!
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Contact Card */}
      <GlassCard 
        className="mt-4 sm:mt-6 p-4 sm:p-6 text-center animate-fade-up max-w-md mx-auto" 
        variant="frosted"
        style={{ animationDelay: '1.2s' }}
      >
        <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-glass-purple" />
        <h3 className="font-semibold mb-2 text-wedding-navy text-sm sm:text-base">Still have questions?</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Don't hesitate to reach out to Tim & Kirsten directly if you need any clarification!
        </p>
      </GlassCard>
    </div>
  );
};

export default FAQ;