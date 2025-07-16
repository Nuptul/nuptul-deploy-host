import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Edit, FileText, Variable, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'invitation' | 'reminder' | 'update' | 'thank_you';
}

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

const EmailSystemManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadEmailStats();
  }, []);

  const loadTemplates = async () => {
    // Simulate loading email templates (in real app, would come from database)
    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Wedding Invitation',
        subject: 'You\'re Invited to {{COUPLE_NAMES}}\'s Wedding!',
        content: `Dear {{GUEST_NAME}},

We are thrilled to invite you to celebrate our wedding!

Event Details:
Date: {{WEDDING_DATE}}
Time: {{WEDDING_TIME}}
Venue: {{VENUE_NAME}}
Address: {{VENUE_ADDRESS}}

{{CUSTOM_MESSAGE}}

Please RSVP by {{RSVP_DEADLINE}} via our wedding app.

With love,
{{COUPLE_NAMES}}`,
        variables: ['GUEST_NAME', 'COUPLE_NAMES', 'WEDDING_DATE', 'WEDDING_TIME', 'VENUE_NAME', 'VENUE_ADDRESS', 'CUSTOM_MESSAGE', 'RSVP_DEADLINE'],
        type: 'invitation'
      },
      {
        id: '2',
        name: 'RSVP Reminder',
        subject: 'RSVP Reminder - {{COUPLE_NAMES}}\'s Wedding',
        content: `Hi {{GUEST_NAME}},

We hope you're as excited as we are for our upcoming wedding on {{WEDDING_DATE}}!

We haven't received your RSVP yet and would love to know if you'll be joining us. Please respond by {{RSVP_DEADLINE}} so we can finalize our plans.

You can RSVP quickly through our wedding app: {{RSVP_LINK}}

Thanks!
{{COUPLE_NAMES}}`,
        variables: ['GUEST_NAME', 'COUPLE_NAMES', 'WEDDING_DATE', 'RSVP_DEADLINE', 'RSVP_LINK'],
        type: 'reminder'
      }
    ];
    setTemplates(mockTemplates);
    if (mockTemplates.length > 0) {
      setSelectedTemplate(mockTemplates[0]);
    }
  };

  const loadEmailStats = () => {
    // Simulate email statistics
    setEmailStats({
      sent: 145,
      delivered: 142,
      opened: 98,
      clicked: 23,
      bounced: 3
    });
  };

  const handleVariableUpdate = (variable: string, value: string) => {
    setPreviewData(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const processTemplate = (template: string, data: Record<string, string>) => {
    let processed = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || `{{${key}}}`);
    });
    return processed;
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return;

    setLoading(true);
    try {
      // In a real app, this would call your email service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Test Email Sent",
        description: `Test email sent successfully to ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      // In a real app, this would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Template Saved",
        description: "Email template saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto" style={{ maxHeight: '580px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-wedding-navy" />
          <h3 className="font-semibold text-wedding-navy">Email System</h3>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedTemplate.id} 
            onValueChange={(value) => {
              const template = templates.find(t => t.id === value);
              if (template) setSelectedTemplate(template);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email Statistics */}
      {emailStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <Send className="w-4 h-4 mx-auto text-glass-blue mb-1" />
              <div className="text-lg font-semibold">{emailStats.sent}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <CheckCircle className="w-4 h-4 mx-auto text-glass-green mb-1" />
              <div className="text-lg font-semibold">{emailStats.delivered}</div>
              <div className="text-xs text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <Eye className="w-4 h-4 mx-auto text-glass-purple mb-1" />
              <div className="text-lg font-semibold">{emailStats.opened}</div>
              <div className="text-xs text-muted-foreground">Opened</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <Variable className="w-4 h-4 mx-auto text-glass-pink mb-1" />
              <div className="text-lg font-semibold">{emailStats.clicked}</div>
              <div className="text-xs text-muted-foreground">Clicked</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <AlertCircle className="w-4 h-4 mx-auto text-red-500 mb-1" />
              <div className="text-lg font-semibold">{emailStats.bounced}</div>
              <div className="text-xs text-muted-foreground">Bounced</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Editor */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">
            <Edit className="w-3 h-3 mr-1" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="test">
            <TestTube className="w-3 h-3 mr-1" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={selectedTemplate.name}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject Line</label>
              <Input
                value={selectedTemplate.subject}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email Content</label>
              <Textarea
                value={selectedTemplate.content}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                className="min-h-32"
              />
            </div>

            <div className="flex justify-between">
              <div>
                <span className="text-sm font-medium">Available Variables:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={saveTemplate}>
                <FileText className="w-3 h-3 mr-1" />
                Save Template
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Variable Values for Preview:</div>
            <div className="grid grid-cols-2 gap-3">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable}>
                  <label className="text-xs text-muted-foreground">{variable}</label>
                  <Input
                    placeholder={`Enter ${variable.toLowerCase()}`}
                    value={previewData[variable] || ''}
                    onChange={(e) => handleVariableUpdate(variable, e.target.value)}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Email Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs font-medium">Subject: </span>
                <span className="text-xs">{processTemplate(selectedTemplate.subject, previewData)}</span>
              </div>
              <div className="bg-muted/50 p-3 rounded text-xs whitespace-pre-wrap">
                {processTemplate(selectedTemplate.content, previewData)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Test Email Address</label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={sendTestEmail} 
              disabled={!testEmail || loading}
              className="w-full"
            >
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
              ) : (
                <Send className="w-3 h-3 mr-2" />
              )}
              Send Test Email
            </Button>

            <div className="text-xs text-muted-foreground">
              The test email will be sent with sample data for all variables.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailSystemManagement;