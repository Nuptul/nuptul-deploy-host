import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, Send, Smile, Plus, Search, Phone, Video, Info, X, 
  Minimize2, Camera, Paperclip, Mic, MicOff, VideoOff, PhoneOff,
  Upload, ImageIcon, Film, FileText, MoreHorizontal, Volume2, VolumeX
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HapticFeedback } from '@/components/mobile/HapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDirectChats } from '@/hooks/useDirectChats';
import { useChatMessages } from '@/hooks/useChatMessages';
import { registerMessenger, MessengerOptions } from '@/utils/messengerUtils';

// Enhanced chat components
import MediaUploadModal from './MediaUploadModal';
import VideoCallInterface from './VideoCallInterface';
import EnhancedComposerBar from './EnhancedComposerBar';
import PresenceIndicator, { TypingIndicator, NetworkStatusIndicator } from './PresenceIndicator';
import CallNotificationSystem, { IncomingCallData, OutgoingCallData } from './CallNotificationSystem';
import WebRTCManager, { type CallState } from '@/utils/webrtc';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

interface Message {
  id: string;
  senderId: string;
  content?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaType?: string;
  callDuration?: number;
  callType?: 'audio' | 'video';
  reactions?: { emoji: string; userId: string }[];
  isRead?: boolean;
}

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
  url?: string;
}

interface VoiceMessage {
  id: string;
  blob: Blob;
  duration: number;
  url: string;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  isTyping?: boolean;
}

// CallState interface is imported from webrtc utils

interface InstantMessengerProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
  isMobile?: boolean;
  isCenter?: boolean; // New prop for center positioning
  isDashboardActive?: boolean; // New prop for dashboard interaction
}

const InstantMessenger: React.FC<InstantMessengerProps> = ({ 
  isMinimized = false, 
  onMinimize, 
  onClose,
  className = "",
  isMobile = false,
  isCenter = false,
  isDashboardActive = false
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Chat state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Enhanced media state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<OutgoingCallData | null>(null);
  const [webRTCManager] = useState(() => new WebRTCManager());
  
  // Enhanced call state
  const [callState, setCallState] = useState(() => webRTCManager.currentCallState);
  
  // Missing state variables
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768 || isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  // Register messenger callbacks
  useEffect(() => {
    const handleOpen = (options?: MessengerOptions) => {
      if (options?.chatId) {
        setSelectedChatId(options.chatId);
      }
      if (options?.minimized === false && isMinimized && onMinimize) {
        onMinimize(); // Unminimize
      }
    };

    const handleVideoCall = (chatId: string) => {
      setSelectedChatId(chatId);
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        const participant = chat.participants.find(p => p.id !== user?.id);
        if (participant) {
          handleStartCall(participant.id, 'video');
        }
      }
    };

    const handleAudioCall = (chatId: string) => {
      setSelectedChatId(chatId);
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        const participant = chat.participants.find(p => p.id !== user?.id);
        if (participant) {
          handleStartCall(participant.id, 'audio');
        }
      }
    };

    registerMessenger({
      onOpen: handleOpen,
      onVideoCall: handleVideoCall,
      onAudioCall: handleAudioCall
    });
  }, [isMinimized, onMinimize, chats, user, handleStartCall]);

  // Real data from Supabase hooks
  const { chats: directChats, loading: chatsLoading, createDirectChat } = useDirectChats();
  const { messages: chatMessages, sendMessage, loading: messagesLoading } = useChatMessages(selectedChatId);

  // Get online users from profiles
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, display_name, avatar_url')
          .limit(10);

        if (!error && profiles) {
          const users = profiles.map(profile => ({
            id: profile.user_id,
            name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Guest',
            avatar: profile.avatar_url || '👤',
            status: 'online' as const,
            lastSeen: 'now'
          }));
          setOnlineUsers(users);
        }
      } catch (err) {
        console.error('Error fetching online users:', err);
      }
    };

    fetchOnlineUsers();
  }, []);

  // Convert direct chats to the expected format
  const chats: Chat[] = directChats.map(chat => ({
    id: chat.id,
    participants: chat.members?.map(member => ({
      id: member.user_id,
      name: member.profiles?.display_name || 
            `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim() || 'Guest',
      avatar: member.profiles?.avatar_url || '👤',
      status: 'online' as const,
      lastSeen: 'now'
    })) || [],
    lastMessage: chat.last_message ? {
      id: 'last',
      senderId: chat.last_message.user_id,
      content: chat.last_message.content || '',
      timestamp: new Date(chat.last_message.created_at),
      type: 'text' as const
    } : undefined,
    isActive: false,
    isTyping: false
  }));

  const currentMessages: Message[] = chatMessages.map(msg => ({
    id: msg.id,
    senderId: msg.user_id,
    content: msg.content || '',
    timestamp: new Date(msg.created_at),
    type: msg.media_type ? (msg.media_type as any) : 'text',
    mediaUrl: msg.media_url || undefined,
    isRead: msg.is_read
  }));

  // WebRTC Configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize WebRTC
  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via Supabase
        
      }
    };
    
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallState(prev => ({ ...prev, remoteStream: event.streams[0] }));
      }
    };
    
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setCallState(prev => ({ ...prev, isConnected: true }));
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        endCall();
      }
    };
    
    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  // Start call
  const startCall = async (callType: 'audio' | 'video', participantId: string) => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      const peerConnection = initializePeerConnection();
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
      
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      setCallState({
        isActive: true,
        isOutgoing: true,
        isIncoming: false,
        callType,
        participantId,
        participantName: onlineUsers.find(u => u.id === participantId)?.name,
        duration: 0,
        isConnected: false,
        localStream,
        isAudioEnabled: true,
        isVideoEnabled: callType === 'video'
      });
      
      // Send offer to participant via Supabase real-time
      // Implementation would go here
      
      toast({
        title: `Starting ${callType} call...`,
        description: `Calling ${onlineUsers.find(u => u.id === participantId)?.name}`,
      });
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Call Failed",
        description: "Could not access camera/microphone",
        variant: "destructive"
      });
    }
  };

  // End call
  const endCall = () => {
    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setCallState({
      isActive: false,
      isIncoming: false,
      isOutgoing: false,
      callType: 'audio',
      duration: 0,
      isConnected: false,
      isAudioEnabled: true,
      isVideoEnabled: true
    });
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  // Enhanced call handlers
  const handleStartCall = useCallback(async (userId: string, type: 'audio' | 'video') => {
    try {
      await webRTCManager.startCall(userId, type);
      const user = onlineUsers.find(u => u.id === userId);
      
      setOutgoingCall({
        callId: `call-${Date.now()}`,
        recipientId: userId,
        recipientName: user?.name || 'Unknown',
        recipientAvatar: user?.avatar,
        callType: type,
        timestamp: new Date(),
        status: 'calling'
      });
      
      setCallState(webRTCManager.currentCallState);
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Call Failed",
        description: "Could not start the call. Please check your permissions.",
        variant: "destructive"
      });
    }
  }, [webRTCManager, onlineUsers, toast]);
  
  const handleAcceptCall = async (callId: string) => {
    try {
      await webRTCManager.acceptCall();
      setCallState(webRTCManager.currentCallState);
      setIncomingCall(null);
      setShowVideoCall(true);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };
  
  const handleRejectCall = (callId: string) => {
    webRTCManager.endCall();
    setIncomingCall(null);
  };
  
  const handleEndCall = () => {
    webRTCManager.endCall();
    setCallState(webRTCManager.currentCallState);
    setIncomingCall(null);
    setOutgoingCall(null);
    setShowVideoCall(false);
  };
  
  const handleToggleMute = () => {
    webRTCManager.toggleMute();
    setCallState(webRTCManager.currentCallState);
  };
  
  const handleToggleVideo = () => {
    webRTCManager.toggleVideo();
    setCallState(webRTCManager.currentCallState);
  };
  
  const handleToggleSpeaker = () => {
    webRTCManager.toggleSpeaker();
    setCallState(webRTCManager.currentCallState);
  };

  // Enhanced send message with media support
  const handleEnhancedSend = async (message: string, files?: MediaFile[], voiceMessage?: VoiceMessage) => {
    if (!selectedChatId) return;
    
    try {
      if (voiceMessage) {
        // Handle voice message upload
        const fileName = `voice-${Date.now()}.wav`;
        const { data, error } = await supabase.storage
          .from('direct-chats')
          .upload(fileName, voiceMessage.blob);
          
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('direct-chats')
          .getPublicUrl(fileName);
          
        await sendMessage({
          content: `🎤 Voice message (${Math.floor(voiceMessage.duration / 60)}:${(voiceMessage.duration % 60).toString().padStart(2, '0')})`,
          media_url: urlData.publicUrl,
          media_type: 'audio'
        });
      }
      
      if (files && files.length > 0) {
        // Handle file uploads
        for (const mediaFile of files) {
          const fileName = `${Date.now()}-${mediaFile.file.name}`;
          const { data, error } = await supabase.storage
            .from('direct-chats')
            .upload(fileName, mediaFile.file);
            
          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from('direct-chats')
            .getPublicUrl(fileName);
            
          await sendMessage({
            content: message || mediaFile.file.name,
            media_url: urlData.publicUrl,
            media_type: mediaFile.type
          });
        }
      } else if (message.trim()) {
        // Handle text message
        await sendMessage({ content: message.trim() });
      }
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Typing indicator handler
  const handleTypingIndicator = (isTyping: boolean) => {
    setIsTyping(isTyping);
    // In a real implementation, you would send typing status via Supabase real-time
  };

  // Additional state management
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);
  
  // WebRTC state management
  useEffect(() => {
    const handleCallStateChange = () => {
      setCallState(webRTCManager.currentCallState);
    };
    
    // Listen for WebRTC state changes
    webRTCManager.on?.('stateChange', handleCallStateChange);
    
    return () => {
      webRTCManager.off?.('stateChange', handleCallStateChange);
    };
  }, [webRTCManager]);
  
  // Update call state when video call should be shown
  useEffect(() => {
    if (callState.isActive && (callState.type === 'video' || callState.isConnected)) {
      setShowVideoCall(true);
    } else {
      setShowVideoCall(false);
    }
  }, [callState.isActive, callState.type, callState.isConnected]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      webRTCManager.endCall();
    };
  }, [webRTCManager]);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  // Position calculation
  const getPositionClasses = () => {
    if (isCenter) {
      return isMobileView 
        ? 'fixed inset-4 z-[100]' 
        : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]';
    }
    
    const basePosition = isMobileView ? 'bottom-20 right-4' : 'bottom-16 right-6';
    return `fixed ${basePosition} z-[${isDashboardActive ? '50' : '200'}]`;
  };

  if (isMinimized) {
    const buttonPosition = getPositionClasses();
    const buttonClasses = isMobileView 
      ? 'rounded-full w-16 h-16 p-0' 
      : 'rounded-t-2xl rounded-b-none h-14 px-6';
    
    return (
      <div className={`${buttonPosition} ${className} ${isDashboardActive ? 'opacity-30' : ''}`}>
        <HapticFeedback type="light">
          <Button
            onClick={onMinimize}
            className={`glass-card bg-gradient-to-br from-wedding-navy/95 via-wedding-navy-light/90 to-wedding-navy/95 backdrop-blur-xl border border-white/30 text-wedding-cream shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${buttonClasses}`}
            style={{
              background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(52, 73, 94, 0.9) 50%, rgba(44, 62, 80, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(44, 62, 80, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2), 6px 6px 12px rgba(44, 62, 80, 0.15), -1px -1px 3px rgba(255, 255, 255, 0.1)'
            }}
          >
            <MessageCircle className={`${isMobileView ? 'w-7 h-7' : 'w-6 h-6 mr-3'} text-wedding-gold drop-shadow-sm`} />
            {!isMobileView && <span className="font-bold text-base font-dolly drop-shadow-sm">Instant Chat</span>}
            {chats.reduce((sum, chat) => sum + chat.unreadCount, 0) > 0 && (
              <div className={`bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white/30 ${
                isMobileView 
                  ? 'absolute -top-2 -right-2 w-6 h-6' 
                  : 'w-6 h-6 ml-3'
              }`}
               style={{
                 boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
               }}>
                {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </div>
            )}
          </Button>
        </HapticFeedback>
      </div>
    );
  }

  // Call overlay
  if (callState.isActive) {
    return (
      <VideoCallInterface
        isOpen={true}
        callState={callState}
        remoteUser={{
          id: callState.participantId || '',
          name: callState.participantName || 'Unknown',
          avatar: onlineUsers.find(u => u.id === callState.participantId)?.avatar
        }}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleSpeaker={handleToggleSpeaker}
        webRTCManager={webRTCManager}
      />
    );
  }

  // Main messenger interface
  const containerClasses = isCenter 
    ? `${getPositionClasses()} ${isMobileView ? 'w-full h-full' : 'w-96 h-[650px]'} flex flex-col overflow-hidden ${className} ${isDashboardActive ? 'opacity-60 pointer-events-none' : ''}`
    : `${getPositionClasses()} w-96 h-[650px] flex flex-col overflow-hidden ${className} ${isDashboardActive ? 'opacity-60 pointer-events-none' : ''}`;

  return (
    <div className={containerClasses}
         style={{
           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 242, 237, 0.92) 30%, rgba(255, 255, 255, 0.95) 100%)',
           backdropFilter: 'blur(25px)',
           borderRadius: isCenter ? '24px' : '24px 24px 0 0',
           border: '1px solid rgba(255, 255, 255, 0.4)',
           boxShadow: `
             0 25px 50px rgba(44, 62, 80, 0.25),
             0 8px 32px rgba(0, 0, 0, 0.15),
             inset 0 1px 0 rgba(255, 255, 255, 0.4),
             12px 12px 24px rgba(44, 62, 80, 0.1),
             -4px -4px 12px rgba(255, 255, 255, 0.6)
           `
         }}>
      
      {/* Header */}
      <div className="p-5 rounded-t-2xl flex items-center justify-between text-wedding-cream"
           style={{
             background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(52, 73, 94, 0.9) 50%, rgba(44, 62, 80, 0.95) 100%)',
             backdropFilter: 'blur(25px)',
             borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
             boxShadow: '0 4px 20px rgba(44, 62, 80, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
           }}>
        <div className="flex items-center space-x-4">
          <MessageCircle className="w-6 h-6 text-wedding-gold" />
          <div>
            <h3 className="font-bold text-lg font-dolly">
              {selectedChatId ? selectedChat?.participants.map(p => p.name.split(' ')[0]).join(', ') : 'Instant Messenger'}
            </h3>
            {selectedChatId && selectedChat && (
              <div className="text-sm opacity-90 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  selectedChat.participants[0]?.status === 'online' ? 'bg-green-500' : 
                  selectedChat.participants[0]?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                } shadow-sm`} />
                <span className="font-medium">
                  {selectedChat.participants[0]?.status === 'online' ? 'Active now' : selectedChat.participants[0]?.lastSeen}
                </span>
                {selectedChat.isTyping && (
                  <span className="text-xs animate-pulse">typing...</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {selectedChatId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-wedding-cream hover:bg-white/20 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110"
                onClick={() => {
                  const participant = selectedChat?.participants.find(p => p.id !== user?.id);
                  if (participant) handleStartCall(participant.id, 'audio');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '2px 2px 4px rgba(44, 62, 80, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1)'
                }}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-wedding-cream hover:bg-white/20 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110"
                onClick={() => {
                  const participant = selectedChat?.participants.find(p => p.id !== user?.id);
                  if (participant) handleStartCall(participant.id, 'video');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '2px 2px 4px rgba(44, 62, 80, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1)'
                }}
              >
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-wedding-cream hover:bg-white/20 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110"
            onClick={onMinimize}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '2px 2px 4px rgba(44, 62, 80, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1)'
            }}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-wedding-cream hover:bg-white/20 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '2px 2px 4px rgba(44, 62, 80, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.1)'
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedChatId ? (
        // Chat View
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{
            background: 'linear-gradient(135deg, rgba(245, 242, 237, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
            backdropFilter: 'blur(15px)'
          }}>
            {currentMessages.map((message, index) => {
              const isCurrentUser = message.senderId === user?.id;
              const showAvatar = index === 0 || currentMessages[index - 1].senderId !== message.senderId;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {selectedChat?.participants[0]?.avatar || '👤'}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-[#1877f2] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                    }`}
                  >
                    {message.type === 'text' && (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    {message.type === 'image' && (
                      <img src={message.mediaUrl} alt="Shared" className="max-w-full rounded" />
                    )}
                    {message.type === 'video' && (
                      <video src={message.mediaUrl} controls className="max-w-full rounded" />
                    )}
                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                  {isCurrentUser && showAvatar && <div className="w-6" />}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          <TypingIndicator
            isVisible={typingUsers.length > 0}
            userNames={typingUsers}
            className="px-4"
          />

          {/* Enhanced Composer Bar */}
          <EnhancedComposerBar
            value={messageText}
            onChange={setMessageText}
            onSend={handleEnhancedSend}
            onTyping={handleTypingIndicator}
            placeholder="Type a message..."
            disabled={messagesLoading}
            showMediaButtons={true}
            showVoiceRecording={true}
            onOpenMediaModal={() => setShowMediaModal(true)}
          />
        </>
      ) : (
        // Chat List View
        <div className="flex-1 overflow-y-auto">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 rounded-full border-gray-300 text-sm"
              />
            </div>
          </div>

          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Now</h3>
              <div className="flex space-x-2 overflow-x-auto">
                {onlineUsers.slice(0, 8).map(user => (
                  <button
                    key={user.id}
                    onClick={async () => {
                      try {
                        const chatId = await createDirectChat([user.id]);
                        setSelectedChatId(chatId);
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to create chat. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[50px]">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="divide-y divide-gray-200">
            {chatsLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1877f2] mx-auto"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a chat with someone above</p>
              </div>
            ) : (
              chats.map(chat => {
                const otherParticipant = chat.participants.find(p => p.id !== user?.id);
                const displayName = chat.participants.length > 2 
                  ? 'Group Chat' 
                  : otherParticipant?.name || 'Unknown';
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                          {otherParticipant?.avatar || '👤'}
                        </div>
                        <PresenceIndicator
                          status={otherParticipant?.status || 'offline'}
                          size="sm"
                          className="absolute -bottom-1 -right-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage.timestamp.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-[#1877f2] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Enhanced Components */}
      <MediaUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onUpload={(files) => {
          handleEnhancedSend('', files);
          setShowMediaModal(false);
        }}
        maxFiles={5}
        maxFileSize={50}
        allowedTypes={['image', 'video', 'audio', 'document']}
      />
      
      <VideoCallInterface
        isOpen={showVideoCall}
        callState={callState}
        remoteUser={selectedChat?.participants.find(p => p.id !== user?.id) ? {
          id: selectedChat.participants.find(p => p.id !== user?.id)!.id,
          name: selectedChat.participants.find(p => p.id !== user?.id)!.name,
          avatar: selectedChat.participants.find(p => p.id !== user?.id)!.avatar
        } : undefined}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleSpeaker={handleToggleSpeaker}
        webRTCManager={webRTCManager}
      />
      
      <CallNotificationSystem
        incomingCall={incomingCall}
        outgoingCall={outgoingCall}
        onAcceptCall={handleAcceptCall}
        onRejectCall={handleRejectCall}
        onEndCall={(callId) => handleEndCall()}
        isCallActive={callState.isActive}
      />
      
      <NetworkStatusIndicator />
    </div>
  );
};

export default InstantMessenger;