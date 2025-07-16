import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  timestamp: Date;
}

export interface OutgoingCallData {
  callId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  callType: 'audio' | 'video';
  timestamp: Date;
  status: 'calling' | 'connecting' | 'ringing';
}

interface CallNotificationSystemProps {
  incomingCall?: IncomingCallData;
  outgoingCall?: OutgoingCallData;
  onAcceptCall?: (callId: string) => void;
  onRejectCall?: (callId: string) => void;
  onEndCall?: (callId: string) => void;
  isCallActive?: boolean;
  className?: string;
}

const CallNotificationSystem: React.FC<CallNotificationSystemProps> = ({
  incomingCall,
  outgoingCall,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  isCallActive = false,
  className = ''
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ringtone
  useEffect(() => {
    if (incomingCall && !audioRef.current) {
      audioRef.current = new Audio('/sounds/ringtone.mp3'); // Add ringtone file
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [incomingCall]);

  // Handle ringtone
  useEffect(() => {
    if (incomingCall && audioRef.current && !isCallActive) {
      setIsRinging(true);
      audioRef.current.play().catch(console.error);
    } else if (audioRef.current) {
      setIsRinging(false);
      audioRef.current.pause();
    }
  }, [incomingCall, isCallActive]);

  // Call duration timer
  useEffect(() => {
    if (isCallActive && (incomingCall || outgoingCall)) {
      setCallDuration(0);
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive, incomingCall, outgoingCall]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle accept call
  const handleAccept = () => {
    if (incomingCall && onAcceptCall) {
      onAcceptCall(incomingCall.callId);
      setIsRinging(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Handle reject call
  const handleReject = () => {
    if (incomingCall && onRejectCall) {
      onRejectCall(incomingCall.callId);
      setIsRinging(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Handle end call
  const handleEndCall = () => {
    const callId = incomingCall?.callId || outgoingCall?.callId;
    if (callId && onEndCall) {
      onEndCall(callId);
    }
  };

  // Incoming call notification
  if (incomingCall && !isCallActive) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-sm w-full mx-4">
            {/* Incoming call header */}
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-2">
                {incomingCall.callType === 'video' ? (
                  <><Video className="w-3 h-3 mr-1" /> Video Call</>
                ) : (
                  <><Phone className="w-3 h-3 mr-1" /> Voice Call</>
                )}
              </Badge>
              <p className="text-sm text-gray-500">Incoming call</p>
            </div>

            {/* Caller info */}
            <div className="text-center mb-6">
              <motion.div
                animate={isRinging ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="relative inline-block mb-4"
              >
                <Avatar className="w-20 h-20 ring-4 ring-blue-500 ring-opacity-50">
                  <AvatarImage src={incomingCall.callerAvatar} />
                  <AvatarFallback className="text-lg">
                    {incomingCall.callerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Pulse effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.3],
                    opacity: [0.7, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full bg-blue-500"
                />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {incomingCall.callerName}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(incomingCall.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-6">
              {/* Reject button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </motion.button>

              {/* Accept button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg"
                animate={isRinging ? { 
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.7)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                    "0 0 0 0 rgba(34, 197, 94, 0)"
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {incomingCall.callType === 'video' ? (
                  <Video className="w-7 h-7 text-white" />
                ) : (
                  <Phone className="w-7 h-7 text-white" />
                )}
              </motion.button>
            </div>

            {/* Additional options */}
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <VolumeX className="w-4 h-4 mr-1" />
                Mute
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                Message
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Outgoing call notification
  if (outgoingCall && !isCallActive) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border p-6 max-w-sm w-full mx-4">
            {/* Outgoing call header */}
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-2">
                {outgoingCall.callType === 'video' ? (
                  <><Video className="w-3 h-3 mr-1" /> Video Call</>
                ) : (
                  <><Phone className="w-3 h-3 mr-1" /> Voice Call</>
                )}
              </Badge>
              <p className="text-sm text-gray-500 capitalize">
                {outgoingCall.status}...
              </p>
            </div>

            {/* Recipient info */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative inline-block mb-4"
              >
                <Avatar className="w-20 h-20 ring-4 ring-blue-500 ring-opacity-50">
                  <AvatarImage src={outgoingCall.recipientAvatar} />
                  <AvatarFallback className="text-lg">
                    {outgoingCall.recipientName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Animated border */}
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500"
                />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {outgoingCall.recipientName}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(outgoingCall.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* End call button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </motion.button>
            </div>

            {/* Call status indicators */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <span>{outgoingCall.status}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Active call mini indicator
  if (isCallActive && (incomingCall || outgoingCall)) {
    const callData = incomingCall || outgoingCall;
    const participantName = incomingCall?.callerName || outgoingCall?.recipientName || 'Unknown';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed top-4 right-4 z-40 ${className}`}
      >
        <div className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">{participantName}</span>
          <Badge variant="secondary" className="text-xs bg-white/20 text-white">
            {formatDuration(callDuration)}
          </Badge>
          
          <Button
            size="sm"
            onClick={handleEndCall}
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 p-0 ml-2"
          >
            <PhoneOff className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default CallNotificationSystem;