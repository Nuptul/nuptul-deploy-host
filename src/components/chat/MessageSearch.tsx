import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquare, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { formatDistanceToNow } from 'date-fns';

interface MessageSearchProps {
  onSelectMessage?: (chatId: string, messageId: string) => void;
  className?: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  onSelectMessage, 
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { results, loading, error, search, clearSearch } = useMessageSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        search(query);
      } else {
        clearSearch();
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, clearSearch]);

  const handleClearSearch = () => {
    setQuery('');
    clearSearch();
    setIsSearching(false);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary-foreground px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 glass-secondary"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-destructive">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages found</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground px-1">
                Found {results.length} messages
              </p>
              {results.map((result) => (
                <Card 
                  key={result.id} 
                  className="glass-secondary hover:glass-primary cursor-pointer transition-all"
                  onClick={() => onSelectMessage?.(result.chat_id, result.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                          {result.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          in {result.chat_title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {highlightSearchTerm(result.content, query)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;