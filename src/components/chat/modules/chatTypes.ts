export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

export interface Message {
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

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  isTyping?: boolean;
}

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  callType: 'audio' | 'video';
  participantId?: string;
  participantName?: string;
  duration: number;
  isConnected: boolean;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export interface InstantMessengerProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
  isMobile?: boolean;
  isCenter?: boolean;
  isDashboardActive?: boolean;
}