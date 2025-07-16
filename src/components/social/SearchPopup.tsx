import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Users, 
  Hash, 
  MapPin, 
  Calendar,
  Heart,
  MessageCircle
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'hashtag' | 'venue';
  title: string;
  subtitle?: string;
  avatar?: string;
  preview?: string;
  created_at?: string;
}

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({
  isOpen,
  onClose,
  onResultClick
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with real Supabase search implementation
  const mockResults: SearchResult[] = [];

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock results based on query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filteredResults);
    setLoading(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'post': return <MessageCircle className="w-4 h-4" />;
      case 'hashtag': return <Hash className="w-4 h-4" />;
      case 'venue': return <MapPin className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getResultBadgeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'post': return 'bg-green-100 text-green-700';
      case 'hashtag': return 'bg-purple-100 text-purple-700';
      case 'venue': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search Wedding Social</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people, posts, hashtags, venues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wedding-gold mx-auto"></div>
              <p className="text-muted-foreground mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              {query ? (
                <>
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No results found for "{query}"</p>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Start typing to search...</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline">#weddingplanning</Badge>
                    <Badge variant="outline">#BenEan</Badge>
                    <Badge variant="outline">#venue</Badge>
                    <Badge variant="outline">#photography</Badge>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  onClick={() => onResultClick(result)}
                  className="w-full h-auto p-3 justify-start hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3 w-full">
                    {result.type === 'user' || result.type === 'post' || result.type === 'venue' ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={result.avatar} alt={result.title} />
                        <AvatarFallback>
                          {result.title.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getResultBadgeColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                    )}
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.title}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getResultBadgeColor(result.type)}`}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                      )}
                      {result.preview && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{result.preview}</p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPopup;