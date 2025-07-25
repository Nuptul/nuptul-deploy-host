import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
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
  PartyPopper
} from 'lucide-react';
import { getPublicFAQs } from '@/lib/api/faq';
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
  const { toast } = useToast();

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await getPublicFAQs();
      setFaqGroups(data);
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
                {group.items
                  .filter((faq, index, array) => {
                    // Remove duplicates by checking if this is the first occurrence of the question
                    return array.findIndex(item => item.question.toLowerCase().trim() === faq.question.toLowerCase().trim()) === index;
                  })
                  .map((faq, index) => (
                  <div
                    key={faq.id}
                    className="liquid-glass overflow-hidden animate-fade-up transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                    style={{ animationDelay: `${0.3 + (index * 0.05)}s` }}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-wedding-navy leading-relaxed text-sm sm:text-base flex items-center gap-2">
                          {faq.is_featured && (
                            <span className="text-wedding-gold">⭐</span>
                          )}
                          {faq.question}
                        </h3>
                        <p className="text-wedding-navy/80 leading-relaxed text-xs sm:text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekend Events - Now dynamic from Schedule & Events category */}
      {faqGroups.some(g => g.slug === 'schedule-events' && g.items.length > 0) && (
        <div 
          className="liquid-glass mt-6 sm:mt-8 p-4 sm:p-6 animate-fade-up max-w-4xl mx-auto" 
          style={{ animationDelay: '1.0s' }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-wedding-navy flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Weekend Events
          </h3>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="p-3 sm:p-4 bg-wedding-gold/10 rounded-lg">
              <p className="font-medium text-wedding-navy mb-1 text-sm sm:text-base">Saturday, October 4th, 2025</p>
              <p className="text-wedding-navy/80">
                <strong>Pre-wedding drinks:</strong> Prince of Mereweather pub, 4-8 PM
              </p>
              <p className="text-xs text-wedding-navy/70 mt-1 leading-relaxed">
                Come have a drink and grab a meal if you're hungry!
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-glass-blue/10 rounded-lg">
              <p className="font-medium text-wedding-navy mb-1 text-sm sm:text-base">Monday, October 6th, 2025</p>
              <p className="text-wedding-navy/80">
                <strong>Recovery hangout:</strong> Newcastle Beach, from 11 AM
              </p>
              <p className="text-xs text-wedding-navy/70 mt-1 leading-relaxed">
                Kiosk with good coffee and food - perfect for recovery!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Card */}
      <div 
        className="liquid-glass mt-4 sm:mt-6 p-4 sm:p-6 text-center animate-fade-up max-w-md mx-auto" 
        style={{ animationDelay: '1.2s' }}
      >
        <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-glass-blue" />
        <h3 className="font-semibold mb-2 text-wedding-navy text-sm sm:text-base">Still have questions?</h3>
        <p className="text-wedding-navy/80 text-xs sm:text-sm leading-relaxed">
          Don't hesitate to reach out to Tim & Kirsten directly if you need any clarification!
        </p>
      </div>
    </div>
  );
};

export default FAQ;