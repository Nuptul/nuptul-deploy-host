import React, { useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallState {
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

interface CallInterfaceProps {
  callState: CallState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  callState,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  if (!callState.isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-[400] flex flex-col">
      {/* Call header */}
      <div className="p-6 text-center text-white">
        <h2 className="text-xl font-semibold">{callState.participantName}</h2>
        <p className="text-sm opacity-80">
          {callState.isConnected ? `${Math.floor(callState.duration / 60)}:${(callState.duration % 60).toString().padStart(2, '0')}` : 'Connecting...'}
        </p>
      </div>

      {/* Video area */}
      <div className="flex-1 relative">
        {callState.callType === 'video' && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white/30"
            />
          </>
        )}
      </div>

      {/* Call controls */}
      <div className="p-6 flex justify-center space-x-4">
        <Button
          onClick={onToggleAudio}
          variant="ghost"
          size="lg"
          className={`rounded-full w-16 h-16 ${!callState.isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
        >
          {callState.isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        
        {callState.callType === 'video' && (
          <Button
            onClick={onToggleVideo}
            variant="ghost"
            size="lg"
            className={`rounded-full w-16 h-16 ${!callState.isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {callState.isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
        )}
        
        <Button
          onClick={onEndCall}
          variant="ghost"
          size="lg"
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};