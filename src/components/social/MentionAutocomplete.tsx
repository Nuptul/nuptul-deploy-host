import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import styles from '@/components/dashboard/dashboard.module.css';

interface User {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (userId: string, userName: string) => void;
  position: { top: number; left: number } | null;
  onClose?: () => void;
}

const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  value,
  onChange,
  onMention,
  position,
  onClose
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const textAfterAt = value.substring(lastAtSymbol + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      const term = spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex);
      setSearchTerm(term);
      searchUsers(term);
    } else {
      setSearchTerm('');
      setUsers([]);
    }
  }, [value]);

  const searchUsers = async (term: string) => {
    if (!term) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name, last_name, avatar_url')
        .or(`display_name.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
        .limit(8);

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name || `${profile.first_name} ${profile.last_name}`.trim(),
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url
      }));

      setUsers(formattedUsers);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const lastAtSymbol = value.lastIndexOf('@');
    const beforeAt = value.substring(0, lastAtSymbol);
    const textAfterAt = value.substring(lastAtSymbol + 1);
    const spaceIndex = textAfterAt.indexOf(' ');
    const afterMention = spaceIndex === -1 ? '' : textAfterAt.substring(spaceIndex);
    
    const newValue = `${beforeAt}@${user.display_name} ${afterMention}`;
    onChange(newValue);
    onMention?.(user.id, user.display_name);
    onClose?.();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (users.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % users.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (users[selectedIndex]) {
            handleSelectUser(users[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex, onClose]);

  if (!position || users.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`absolute z-50 ${styles.liquidGlassCard}`}
        style={{
          top: position.top,
          left: position.left,
          minWidth: '280px',
          maxWidth: '360px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(30px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
          border: '1px solid rgba(0, 122, 255, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2" style={{ 
              color: '#000000',
              fontFamily: '"Montserrat", sans-serif'
            }}>
              <Search className="w-3 h-3" style={{ color: '#007AFF' }} />
              Mention someone
            </h4>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3 h-3" style={{ color: '#6b7280' }} />
            </button>
          </div>

          {loading ? (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user, index) => (
                <motion.button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                    index === selectedIndex 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' 
                      : 'hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Avatar className="w-8 h-8 border border-white/50">
                    <AvatarImage src={user.avatar_url} alt={user.display_name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm" style={{ 
                      color: '#000000',
                      fontFamily: '"Montserrat", sans-serif'
                    }}>
                      {user.display_name}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      @{user.display_name.toLowerCase().replace(/\s+/g, '')}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!loading && searchTerm && users.length === 0 && (
            <div className="py-4 text-center text-sm" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MentionAutocomplete;