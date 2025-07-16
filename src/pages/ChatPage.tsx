import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChatWindow from '@/components/chat/ChatWindow';
import ThreadList from '@/components/chat/ThreadList';
import { startVideoCall, startVoiceCall } from '@/utils/chatPlaceholders';
import { getLiquidGlassStyle, stylePresets } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface ChatThread {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: Array<{
    user_id: string;
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
  }>;
  last_message?: {
    id: string;
    content: string;
    message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

const ChatPage: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleThreadSelect = (thread: ChatThread) => {
    setSelectedThread(thread);
    // Hide sidebar on mobile when thread is selected
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleBack = () => {
    setSelectedThread(null);
    setShowSidebar(true);
  };

  const handleStartVideoCall = (threadId: string) => {
    startVideoCall(threadId);
  };

  const handleStartAudioCall = (threadId: string) => {
    startVoiceCall(threadId);
  };

  return (
    <div className="h-screen flex" style={{
      background: 'linear-gradient(135deg, #F8F5F0 0%, #F8BBD0 25%, #E8DAEF 50%, #DCEDC8 75%, #F8F5F0 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      {/* Thread List Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: showSidebar ? 0 : -300, 
          opacity: showSidebar ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        className={`${
          showSidebar ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-80 flex-shrink-0`}
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <ThreadList
          selectedThreadId={selectedThread?.id}
          onThreadSelect={handleThreadSelect}
          onStartVideoCall={handleStartVideoCall}
          onStartAudioCall={handleStartAudioCall}
          className="w-full"
        />
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`${
          showSidebar ? 'hidden' : 'flex'
        } lg:flex flex-1`}
      >
        <ChatWindow
          thread={selectedThread}
          onBack={handleBack}
          onStartVideoCall={handleStartVideoCall}
          onStartAudioCall={handleStartAudioCall}
          className="w-full"
        />
      </motion.div>
    </div>
  );
};

export default ChatPage;