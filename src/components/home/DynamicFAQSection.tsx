import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a type for the FAQ object for better type safety
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Enhanced FAQ card with glass morphism
const FAQCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="h-full liquid-glass p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer">
    <h3 className="font-semibold text-lg sm:text-xl mb-3 text-wedding-navy">
      {title}
    </h3>
    <p className="text-base leading-relaxed text-wedding-navy/80 flex-grow">
      {content}
    </p>
  </div>
);

const DynamicFAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRandomFAQs = async () => {
      try {
        console.log('DynamicFAQSection: Loading FAQs...');
        
        // First try to check if the table exists by querying it
        const { data: allFaqs, error } = await supabase
          .from('faq_items')
          .select('id, question, answer')
          .eq('is_active', true)
          .limit(10);
        
        if (error) {
          console.error('DynamicFAQSection: Supabase error:', error);
          
          // If table doesn't exist, create some mock FAQs
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.log('DynamicFAQSection: Table does not exist, using mock data');
            const mockFaqs = [
              {
                id: '1',
                question: 'What time should I arrive?',
                answer: 'Please arrive by 2:30 PM to allow for seating and parking.'
              },
              {
                id: '2', 
                question: 'What\'s the dress code?',
                answer: 'Dapper/Cocktail: Suits, dress chinos, button up shirt and optional tie. We love a pocket kerchief! Classy dress, pantsuit or jumpsuit.'
              },
              {
                id: '3',
                question: 'What if I have dietary restrictions?',
                answer: 'We have vegetarian, vegan, and gluten-free options available. Please let us know about any dietary restrictions when you RSVP.'
              },
              {
                id: '4',
                question: 'Can I bring a plus one?',
                answer: 'Plus-ones are indicated on your invitation. If your invitation says "and guest" you are welcome to bring someone.'
              }
            ];
            setFaqs(mockFaqs);
            return;
          }
          throw error;
        }
        
        console.log('DynamicFAQSection: Loaded FAQs:', allFaqs?.length || 0);
        if (allFaqs && allFaqs.length > 0) {
          // Shuffle the array and take the first 4
          const shuffled = [...allFaqs].sort(() => 0.5 - Math.random());
          const selectedFaqs = shuffled.slice(0, 4);
          
          setFaqs(selectedFaqs);
        } else {
          console.log('DynamicFAQSection: No FAQs found in database');
        }
      } catch (error) {
        console.error('DynamicFAQSection: Error loading FAQs:', error);
        // Even on error, provide some basic FAQs so the section isn't empty
        const fallbackFaqs = [
          {
            id: 'f1',
            question: 'What time should I arrive?',
            answer: 'Please arrive by 2:30 PM to allow for seating and parking.'
          },
          {
            id: 'f2',
            question: 'Where is the reception?',
            answer: 'The reception will be held at the same venue immediately following the ceremony.'
          }
        ];
        setFaqs(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    };
    loadRandomFAQs();
  }, []);

  // Skeleton loader for when FAQs are being fetched
  if (loading) {
    return (
      <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-up">
        <div className="h-8 bg-gray-300/20 rounded-md w-72 mx-auto mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300/20 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Do not render the section if there are no FAQs to show
  if (faqs.length === 0) {
    // Silently return null - fallback FAQs should always be available
    console.log('DynamicFAQSection: No FAQs to display');
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-up">
      <h2 className="text-center mb-6 sm:mb-8 font-bold text-2xl sm:text-3xl lg:text-4xl text-wedding-navy">
        Frequently Asked Questions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {faqs.map((faq) => (
          <FAQCard
            key={faq.id}
            title={faq.question}
            content={faq.answer}
          />
        ))}
      </div>
      
      <div className="text-center mt-8 sm:mt-10">
        <a 
          href="/faq" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-wedding-navy text-white rounded-xl transition-all duration-300 hover:bg-wedding-navy/90 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] group font-semibold"
        >
          <span>View All FAQs</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-xl">→</span>
        </a>
      </div>
    </div>
  );
};

export default DynamicFAQSection;