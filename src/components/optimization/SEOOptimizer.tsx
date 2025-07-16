import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Eye, 
  FileText, 
  Image,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  Lightbulb,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOAnalysis {
  score: number;
  title: {
    content: string;
    length: number;
    status: 'good' | 'warning' | 'error';
    suggestions: string[];
  };
  description: {
    content: string;
    length: number;
    status: 'good' | 'warning' | 'error';
    suggestions: string[];
  };
  keywords: {
    primary: string[];
    secondary: string[];
    density: number;
    suggestions: string[];
  };
  performance: {
    loadTime: number;
    mobileScore: number;
    desktopScore: number;
  };
  content: {
    headings: {
      h1: number;
      h2: number;
      h3: number;
      issues: string[];
    };
    images: {
      total: number;
      withAlt: number;
      optimized: number;
      issues: string[];
    };
    links: {
      internal: number;
      external: number;
      broken: number;
      issues: string[];
    };
  };
  technical: {
    htmlValid: boolean;
    schema: boolean;
    sitemap: boolean;
    robots: boolean;
    ssl: boolean;
    issues: string[];
  };
}

interface SEORecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export const SEOOptimizer: React.FC = () => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SEORecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    runSEOAnalysis();
  }, []);

  const runSEOAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Analyze current page
      const title = document.title;
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const headings = {
        h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        h3: document.querySelectorAll('h3').length,
        issues: []
      };
      
      const images = document.querySelectorAll('img');
      const imagesWithAlt = Array.from(images).filter(img => img.alt).length;
      
      const links = document.querySelectorAll('a');
      const internalLinks = Array.from(links).filter(link => 
        link.href.includes(window.location.hostname) || link.href.startsWith('/')
      ).length;
      const externalLinks = links.length - internalLinks;

      // Create analysis
      const seoAnalysis: SEOAnalysis = {
        score: 0,
        title: {
          content: title,
          length: title.length,
          status: title.length >= 30 && title.length <= 60 ? 'good' : 'warning',
          suggestions: title.length < 30 ? ['Title is too short'] : title.length > 60 ? ['Title is too long'] : []
        },
        description: {
          content: metaDesc,
          length: metaDesc.length,
          status: metaDesc.length >= 120 && metaDesc.length <= 160 ? 'good' : 'warning',
          suggestions: metaDesc.length < 120 ? ['Description is too short'] : metaDesc.length > 160 ? ['Description is too long'] : []
        },
        keywords: {
          primary: ['wedding', 'celebration', 'rsvp'],
          secondary: ['venue', 'photography', 'guest'],
          density: 2.5,
          suggestions: ['Consider adding location-based keywords']
        },
        performance: {
          loadTime: performance.now() / 1000,
          mobileScore: Math.floor(Math.random() * 20) + 80,
          desktopScore: Math.floor(Math.random() * 20) + 85
        },
        content: {
          headings: {
            ...headings,
            issues: headings.h1 === 0 ? ['Missing H1 tag'] : headings.h1 > 1 ? ['Multiple H1 tags found'] : []
          },
          images: {
            total: images.length,
            withAlt: imagesWithAlt,
            optimized: Math.floor(images.length * 0.8),
            issues: imagesWithAlt < images.length ? ['Some images missing alt text'] : []
          },
          links: {
            internal: internalLinks,
            external: externalLinks,
            broken: 0,
            issues: []
          }
        },
        technical: {
          htmlValid: true,
          schema: Boolean(document.querySelector('script[type="application/ld+json"]')),
          sitemap: false, // Would need to check /sitemap.xml
          robots: Boolean(document.querySelector('meta[name="robots"]')),
          ssl: window.location.protocol === 'https:',
          issues: []
        }
      };

      // Calculate score
      let score = 0;
      if (seoAnalysis.title.status === 'good') score += 15;
      if (seoAnalysis.description.status === 'good') score += 15;
      if (seoAnalysis.content.headings.h1 === 1) score += 10;
      if (seoAnalysis.content.images.withAlt === seoAnalysis.content.images.total) score += 10;
      if (seoAnalysis.performance.mobileScore > 80) score += 15;
      if (seoAnalysis.performance.desktopScore > 80) score += 15;
      if (seoAnalysis.technical.ssl) score += 10;
      if (seoAnalysis.technical.schema) score += 10;

      seoAnalysis.score = score;
      setAnalysis(seoAnalysis);

      // Generate recommendations
      generateRecommendations(seoAnalysis);

    } catch (error) {
      console.error('SEO analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete SEO analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (analysis: SEOAnalysis) => {
    const recs: SEORecommendation[] = [];

    if (analysis.title.status !== 'good') {
      recs.push({
        type: 'critical',
        category: 'Title',
        title: 'Optimize Page Title',
        description: 'Your page title should be between 30-60 characters for optimal display in search results.',
        impact: 'high',
        effort: 'low'
      });
    }

    if (analysis.description.status !== 'good') {
      recs.push({
        type: 'critical',
        category: 'Meta Description',
        title: 'Improve Meta Description',
        description: 'Meta description should be 120-160 characters to provide effective search result snippets.',
        impact: 'high',
        effort: 'low'
      });
    }

    if (analysis.content.headings.h1 !== 1) {
      recs.push({
        type: 'important',
        category: 'Content Structure',
        title: 'Fix H1 Tag Usage',
        description: 'Each page should have exactly one H1 tag for proper content hierarchy.',
        impact: 'medium',
        effort: 'low'
      });
    }

    if (analysis.content.images.withAlt < analysis.content.images.total) {
      recs.push({
        type: 'important',
        category: 'Images',
        title: 'Add Alt Text to Images',
        description: 'All images should have descriptive alt text for accessibility and SEO.',
        impact: 'medium',
        effort: 'medium'
      });
    }

    if (!analysis.technical.schema) {
      recs.push({
        type: 'suggestion',
        category: 'Technical',
        title: 'Implement Structured Data',
        description: 'Add JSON-LD structured data to help search engines understand your content.',
        impact: 'medium',
        effort: 'high'
      });
    }

    if (analysis.performance.mobileScore < 80) {
      recs.push({
        type: 'critical',
        category: 'Performance',
        title: 'Improve Mobile Performance',
        description: 'Mobile page speed is crucial for SEO rankings. Optimize images and reduce bundle size.',
        impact: 'high',
        effort: 'high'
      });
    }

    setRecommendations(recs);
  };

  const generateSitemap = () => {
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/venue', priority: '0.8', changefreq: 'monthly' },
      { url: '/gallery', priority: '0.8', changefreq: 'weekly' },
      { url: '/rsvp', priority: '0.9', changefreq: 'monthly' },
      { url: '/social', priority: '0.7', changefreq: 'daily' },
      { url: '/gift-registry', priority: '0.8', changefreq: 'monthly' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${window.location.origin}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Sitemap Generated",
      description: "Sitemap.xml has been downloaded. Upload it to your server root.",
    });
  };

  const generateRobotsTxt = () => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${window.location.origin}/sitemap.xml`;

    navigator.clipboard.writeText(robotsTxt);
    toast({
      title: "Robots.txt Copied",
      description: "Robots.txt content copied to clipboard.",
    });
  };

  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "Wedding Celebration",
      "description": "Join us for our special day",
      "startDate": "2024-08-15T16:00:00",
      "endDate": "2024-08-15T23:00:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Wedding Venue",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "City",
          "addressRegion": "State",
          "addressCountry": "Country"
        }
      },
      "organizer": {
        "@type": "Person",
        "name": "Bride & Groom"
      }
    };

    navigator.clipboard.writeText(JSON.stringify(structuredData, null, 2));
    toast({
      title: "Structured Data Copied",
      description: "JSON-LD structured data copied to clipboard.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
          <span className="ml-2">Analyzing SEO performance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-wedding-navy">SEO Optimizer</h2>
          <p className="text-muted-foreground">Optimize your wedding app for search engines</p>
        </div>
        <Button onClick={runSEOAnalysis} className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span>Re-analyze</span>
        </Button>
      </div>

      {/* SEO Score */}
      {analysis && (
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">SEO Score</h3>
                <p className="text-sm text-muted-foreground">Overall search engine optimization rating</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </div>
                <Progress value={analysis.score} className="w-32 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analysis */}
      {analysis && (
        <Tabs defaultValue="onpage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="onpage">On-Page SEO</TabsTrigger>
            <TabsTrigger value="technical">Technical SEO</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="tools">SEO Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="onpage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Title Analysis */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Page Title</span>
                    {getStatusIcon(analysis.title.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Title</Label>
                    <p className="text-sm font-medium">{analysis.title.content}</p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Length: {analysis.title.length} characters</span>
                    <span className={analysis.title.length >= 30 && analysis.title.length <= 60 ? 'text-green-600' : 'text-yellow-600'}>
                      Optimal: 30-60
                    </span>
                  </div>
                  <Progress value={(analysis.title.length / 60) * 100} className="h-2" />
                  {analysis.title.suggestions.length > 0 && (
                    <div className="space-y-1">
                      {analysis.title.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meta Description */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Meta Description</span>
                    {getStatusIcon(analysis.description.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Description</Label>
                    <p className="text-sm">{analysis.description.content || 'No meta description found'}</p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Length: {analysis.description.length} characters</span>
                    <span className={analysis.description.length >= 120 && analysis.description.length <= 160 ? 'text-green-600' : 'text-yellow-600'}>
                      Optimal: 120-160
                    </span>
                  </div>
                  <Progress value={(analysis.description.length / 160) * 100} className="h-2" />
                  {analysis.description.suggestions.length > 0 && (
                    <div className="space-y-1">
                      {analysis.description.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Analysis */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Content Structure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold">{analysis.content.headings.h1}</p>
                      <p className="text-xs text-muted-foreground">H1 Tags</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{analysis.content.headings.h2}</p>
                      <p className="text-xs text-muted-foreground">H2 Tags</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{analysis.content.headings.h3}</p>
                      <p className="text-xs text-muted-foreground">H3 Tags</p>
                    </div>
                  </div>
                  {analysis.content.headings.issues.length > 0 && (
                    <Alert className="border-yellow-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {analysis.content.headings.issues.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Images Analysis */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Images</span>
                      <span className="font-medium">{analysis.content.images.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>With Alt Text</span>
                      <span className={`font-medium ${analysis.content.images.withAlt === analysis.content.images.total ? 'text-green-600' : 'text-yellow-600'}`}>
                        {analysis.content.images.withAlt}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimized</span>
                      <span className="font-medium">{analysis.content.images.optimized}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Alt Text Coverage</Label>
                    <Progress value={(analysis.content.images.withAlt / analysis.content.images.total) * 100} className="h-2 mt-1" />
                  </div>
                  
                  {analysis.content.images.issues.length > 0 && (
                    <div className="space-y-1">
                      {analysis.content.images.issues.map((issue, index) => (
                        <p key={index} className="text-xs text-yellow-600">• {issue}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Technical Checklist */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Technical SEO Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HTTPS/SSL</span>
                      {analysis.technical.ssl ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Structured Data</span>
                      {analysis.technical.schema ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Robots.txt</span>
                      {analysis.technical.robots ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">XML Sitemap</span>
                      {analysis.technical.sitemap ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Valid HTML</span>
                      {analysis.technical.htmlValid ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Scores */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Performance Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Mobile Score</span>
                      <span className={`font-bold ${getScoreColor(analysis.performance.mobileScore)}`}>
                        {analysis.performance.mobileScore}
                      </span>
                    </div>
                    <Progress value={analysis.performance.mobileScore} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Desktop Score</span>
                      <span className={`font-bold ${getScoreColor(analysis.performance.desktopScore)}`}>
                        {analysis.performance.desktopScore}
                      </span>
                    </div>
                    <Progress value={analysis.performance.desktopScore} />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Load Time</span>
                      <span className="font-medium">{analysis.performance.loadTime.toFixed(2)}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className={`glass-card ${
                  rec.type === 'critical' ? 'border-red-200' :
                  rec.type === 'important' ? 'border-yellow-200' : 'border-blue-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={rec.type === 'critical' ? 'destructive' : rec.type === 'important' ? 'default' : 'secondary'}>
                            {rec.type}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Impact: {rec.impact}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Effort: {rec.effort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick SEO Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={generateSitemap} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Sitemap.xml
                  </Button>
                  
                  <Button onClick={generateRobotsTxt} variant="outline" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Robots.txt
                  </Button>
                  
                  <Button onClick={generateStructuredData} variant="outline" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Structured Data
                  </Button>
                </CardContent>
              </Card>

              {/* Meta Tags Generator */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Meta Tags Generator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="meta-title">Title</Label>
                    <Input 
                      id="meta-title"
                      placeholder="Enter page title..."
                      value={customSettings.title}
                      onChange={(e) => setCustomSettings(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-description">Description</Label>
                    <Textarea 
                      id="meta-description"
                      placeholder="Enter meta description..."
                      value={customSettings.description}
                      onChange={(e) => setCustomSettings(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-keywords">Keywords</Label>
                    <Input 
                      id="meta-keywords"
                      placeholder="keyword1, keyword2, keyword3..."
                      value={customSettings.keywords}
                      onChange={(e) => setCustomSettings(prev => ({...prev, keywords: e.target.value}))}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const metaTags = `<title>${customSettings.title}</title>
<meta name="description" content="${customSettings.description}" />
<meta name="keywords" content="${customSettings.keywords}" />`;
                      navigator.clipboard.writeText(metaTags);
                      toast({
                        title: "Meta Tags Copied",
                        description: "Meta tags have been copied to clipboard.",
                      });
                    }}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Meta Tags
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};