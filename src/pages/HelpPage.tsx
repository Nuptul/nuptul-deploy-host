import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const HelpPage: React.FC = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to support
    toast({
      title: "Support Request Sent",
      description: "We'll get back to you within 24 hours.",
      variant: "default",
    });
    setContactForm({ subject: '', message: '' });
  };

  const faqs = [
    {
      question: "How do I RSVP to the wedding?",
      answer: "Navigate to the RSVP page using the bottom navigation. Fill out your attendance details and any dietary requirements. You can update your RSVP anytime before the deadline."
    },
    {
      question: "Can I upload photos?",
      answer: "Yes! Go to the Gallery page and tap the upload button. Your photos will be reviewed before appearing in the main gallery. Make sure they follow our photo guidelines."
    },
    {
      question: "How do I view the wedding venues?",
      answer: "Tap on 'Venue' in the bottom navigation to see all wedding locations with maps, addresses, and important details about each venue."
    },
    {
      question: "What is the gift registry?",
      answer: "The gift registry shows items the couple would love to receive. You can mark items as purchased to help avoid duplicates."
    },
    {
      question: "How do I send messages to other guests?",
      answer: "Use the Messages section to connect with other wedding guests. You can share excitement, coordinate travel, or just chat!"
    },
    {
      question: "Can I change my profile information?",
      answer: "Yes! Click on your profile picture in the top right corner, then select 'My Profile' to update your information."
    },
    {
      question: "What if I can't attend anymore?",
      answer: "Please update your RSVP as soon as possible. Go to the RSVP page and change your attendance status. The couple will appreciate the early notice."
    },
    {
      question: "Are there any photo guidelines?",
      answer: "Please keep photos family-friendly and wedding-appropriate. Photos are moderated before appearing in the gallery. Avoid including people who might not want to be photographed."
    }
  ];

  return (
    <div className="min-h-screen p-3 sm:p-6 pt-16 sm:pt-20 pb-20">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* FAQ Section */}
        <Card className="glass-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl lg:wedding-heading font-semibold">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Find answers to common questions about using the wedding app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base min-h-[44px] py-3">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="glass-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl lg:wedding-heading font-semibold">Contact Support</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Can't find what you're looking for? Send us a message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm sm:text-base">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="What do you need help with?"
                  className="min-h-[44px] text-sm sm:text-base"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please describe your issue or question in detail..."
                  rows={4}
                  className="min-h-[120px] text-sm sm:text-base"
                  required
                />
              </div>
              
              <Button type="submit" className="glass-button w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="glass-card">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl lg:wedding-heading font-semibold">App Information</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Technical details and app version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="font-semibold text-sm sm:text-base">Version</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <Label className="font-semibold text-sm sm:text-base">Last Updated</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">January 2025</p>
              </div>
              <div>
                <Label className="font-semibold text-sm sm:text-base">Support Email</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">support@weddingapp.com</p>
              </div>
              <div>
                <Label className="font-semibold text-sm sm:text-base">Emergency Contact</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;