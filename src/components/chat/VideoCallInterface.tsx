import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  MessageSquare, 
  Settings,
  Camera,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WebRTCManager, { CallState } from '@/utils/webrtc';

interface VideoCallInterfaceProps {
  isOpen: boolean;
  callState: CallState;
  remoteUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  webRTCManager: WebRTCManager;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  isOpen,
  callState,
  remoteUser,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  webRTCManager
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState('00:00');
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Update call duration
  useEffect(() => {
    if (callState.isActive) {
      const interval = setInterval(() => {
        setCallDuration(webRTCManager.getCallDuration());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [callState.isActive, webRTCManager]);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
    
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.localStream, callState.remoteStream]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
  };

  // Get call status text
  const getCallStatus = (): string => {
    if (callState.isIncoming && !callState.isActive) return 'Incoming call';
    if (callState.isOutgoing && !callState.isActive) return 'Calling...';
    if (callState.isActive) return `Connected • ${callDuration}`;
    return 'Connecting...';
  };

  // Get connection quality color
  const getQualityColor = (): string => {
    switch (connectionQuality) {
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden w-64">
          <div className="relative">
            {callState.type === 'video' && callState.remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-36 object-cover"
              />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={remoteUser?.avatar} />
                  <AvatarFallback className="text-white bg-white/20">
                    {remoteUser?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {/* Local video overlay */}
            {callState.type === 'video' && callState.localStream && (
              <div className="absolute top-2 right-2 w-16 h-12 bg-black rounded overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Expand button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm truncate">{remoteUser?.name}</p>
                <p className="text-xs text-gray-500">{callDuration}</p>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onToggleMute}
                  className={`p-1 ${callState.isMuted ? 'text-red-500' : 'text-gray-600'}`}
                >
                  {callState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEndCall}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full screen view
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
        onMouseMove={handleMouseMove}
      >
        {/* Main video area */}
        <div className="flex-1 relative">
          {callState.type === 'video' && callState.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
            />
          ) : (
            // Audio call or no video
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center">
              <Avatar className="w-32 h-32 mb-6">
                <AvatarImage src={remoteUser?.avatar} />
                <AvatarFallback className="text-4xl text-white bg-white/20">
                  {remoteUser?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-3xl font-semibold text-white mb-2">
                {remoteUser?.name}
              </h2>
              
              <div className="flex items-center gap-2 text-white/80">
                <div className={`w-2 h-2 rounded-full ${getQualityColor().replace('text-', 'bg-')}`} />
                <span className="text-lg">{getCallStatus()}</span>
              </div>
            </div>
          )}
          
          {/* Local video overlay for video calls */}
          {callState.type === 'video' && callState.localStream && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {!callState.isVideoEnabled && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white/60" />
                </div>
              )}
            </div>
          )}
          
          {/* Connection quality indicator */}
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              <div className={`w-2 h-2 rounded-full mr-2 ${getQualityColor().replace('text-', 'bg-')}`} />
              {connectionQuality === 'good' ? 'HD' : connectionQuality === 'fair' ? 'SD' : 'Poor'}
            </Badge>
          </div>
        </div>

        {/* Controls overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
            >
              {/* Call info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {remoteUser?.name}
                </h3>
                <p className="text-white/80">{getCallStatus()}</p>
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center justify-center gap-4">
                {/* Mute button */}
                <Button
                  size="lg"
                  onClick={onToggleMute}
                  className={`rounded-full w-14 h-14 ${
                    callState.isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {callState.isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </Button>
                
                {/* Video toggle (only for video calls) */}
                {callState.type === 'video' && (
                  <Button
                    size="lg"
                    onClick={onToggleVideo}
                    className={`rounded-full w-14 h-14 ${
                      !callState.isVideoEnabled 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {callState.isVideoEnabled ? (
                      <Video className="w-6 h-6 text-white" />
                    ) : (
                      <VideoOff className="w-6 h-6 text-white" />
                    )}
                  </Button>
                )}
                
                {/* End call button */}
                <Button
                  size="lg"
                  onClick={onEndCall}
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </Button>
                
                {/* Speaker toggle (mobile) */}
                <Button
                  size="lg"
                  onClick={onToggleSpeaker}
                  className={`rounded-full w-14 h-14 ${
                    callState.isSpeakerEnabled 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {callState.isSpeakerEnabled ? (
                    <Volume2 className="w-6 h-6 text-white" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white" />
                  )}
                </Button>
                
                {/* Minimize button */}
                <Button
                  size="lg"
                  onClick={() => setIsMinimized(true)}
                  className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/30"
                >
                  <Minimize className="w-6 h-6 text-white" />
                </Button>
              </div>
              
              {/* Additional controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                
                {callState.type === 'video' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Switch Camera
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Share Screen
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallInterface;