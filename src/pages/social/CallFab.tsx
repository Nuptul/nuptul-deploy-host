import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Phone, 
  PhoneOff, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Users,
  UserPlus,
  MessageSquare,
  MoreVertical,
  Minimize2,
  Maximize2,
  X,
  Settings,
  Share
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isOnline: boolean;
  joinedAt: string;
}

interface CallFabProps {
  isVisible?: boolean;
  onStartVideoCall?: () => void;
  onStartAudioCall?: () => void;
  onJoinCall?: (callId: string) => void;
  onEndCall?: () => void;
  className?: string;
}

const CallFab: React.FC<CallFabProps> = ({
  isVisible = true,
  onStartVideoCall,
  onStartAudioCall,
  onJoinCall,
  onEndCall,
  className = ''
}) => {
  const { onlineUsers } = usePresence();
  const { profile } = useAuth();
  
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Mock participants for demo
  const [participants, setParticipants] = useState<CallParticipant[]>([
    {
      id: 'host',
      name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'You',
      avatar: profile?.avatar_url,
      isHost: true,
      isMuted: false,
      isVideoOn: true,
      isOnline: true,
      joinedAt: new Date().toISOString()
    }
  ]);

  const handleStartCall = (type: 'video' | 'audio') => {
    setCallType(type);
    setIsInCall(true);
    setIsVideoOn(type === 'video');
    
    if (type === 'video') {
      onStartVideoCall?.();
    } else {
      onStartAudioCall?.();
    }

    // Start call duration timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Cleanup timer when component unmounts or call ends
    return () => clearInterval(timer);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setIsMinimized(false);
    setCallDuration(0);
    setParticipants([]);
    onEndCall?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const inviteToCall = (userId: string) => {
    const user = onlineUsers.find(u => u.user_id === userId);
    if (user && !participants.find(p => p.id === userId)) {
      const newParticipant: CallParticipant = {
        id: userId,
        name: user.name,
        avatar: user.avatar,
        isHost: false,
        isMuted: false,
        isVideoOn: callType === 'video',
        isOnline: true,
        joinedAt: new Date().toISOString()
      };
      setParticipants(prev => [...prev, newParticipant]);
    }
  };

  if (!isVisible) return null;

  // Floating Action Button (when not in call)
  if (!isInCall) {
    return (
      <div className={`fixed bottom-32 right-4 z-50 ${className}`}>
        <div className="flex flex-col gap-3">
          {/* Video Call Button */}
          <Button
            size="lg"
            onClick={() => handleStartCall('video')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            aria-label="Start video call"
          >
            <Video className="w-6 h-6" />
          </Button>
          
          {/* Audio Call Button */}
          <Button
            size="lg"
            onClick={() => handleStartCall('audio')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            aria-label="Start audio call"
          >
            <Phone className="w-6 h-6" />
          </Button>

          {/* Online indicator */}
          {onlineUsers.length > 1 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-white/95 backdrop-blur-sm text-wedding-navy self-center shadow-lg border border-white/30"
            >
              💍 {onlineUsers.length - 1} online
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Call Interface (when in call)
  return (
    <Card 
      className={`fixed z-50 border border-white/20 shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-24' 
          : 'bottom-4 right-4 w-96 h-[500px]'
      } ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 33, 71, 0.9) 100%)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
      }}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Call Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {callType === 'video' ? (
                <Video className="w-5 h-5 text-blue-400" />
              ) : (
                <Phone className="w-5 h-5 text-green-400" />
              )}
              <div>
                <p className="text-white font-medium text-sm">
                  {callType === 'video' ? 'Video Call' : 'Voice Call'}
                </p>
                <p className="text-gray-300 text-xs">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0 text-gray-300 hover:text-white hover:bg-white/10"
              aria-label={isMinimized ? 'Maximize call' : 'Minimize call'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndCall}
              className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
              aria-label="End call"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Participants Grid */}
            <div className="flex-1 mb-4 overflow-hidden">
              <div className={`grid gap-2 h-full ${
                participants.length === 1 ? 'grid-cols-1' :
                participants.length <= 4 ? 'grid-cols-2' :
                'grid-cols-2 grid-rows-2'
              }`}>
                {participants.slice(0, 4).map((participant) => (
                  <div 
                    key={participant.id}
                    className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    {/* Participant info overlay */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-medium truncate">
                          {participant.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {participant.isMuted && (
                            <MicOff className="w-3 h-3 text-red-400" />
                          )}
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs">Host</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* More participants indicator */}
                {participants.length > 4 && (
                  <div className="bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                      <p className="text-white text-xs">+{participants.length - 4} more</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invite Section */}
            {onlineUsers.length > participants.length && (
              <div className="mb-4">
                <p className="text-gray-300 text-xs mb-2">Invite to call:</p>
                <div className="flex gap-2 overflow-x-auto">
                  {onlineUsers
                    .filter(user => !participants.find(p => p.id === user.user_id))
                    .slice(0, 5)
                    .map((user) => (
                    <Button
                      key={user.user_id}
                      variant="ghost"
                      size="sm"
                      onClick={() => inviteToCall(user.user_id)}
                      className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 whitespace-nowrap"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{user.name.split(' ')[0]}</span>
                      <UserPlus className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Mute Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          {/* Video Toggle Button */}
          {callType === 'video' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full ${
                !isVideoOn 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          )}

          {/* Speaker Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeaker}
            className={`w-12 h-12 rounded-full ${
              !isSpeakerOn 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* End Call Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndCall}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>

          {!isMinimized && (
            <>
              {/* Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Open chat"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              {/* Share Screen Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Share screen"
              >
                <Share className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallFab;