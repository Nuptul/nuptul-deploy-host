// WebRTC utilities for video/audio calling
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  type: 'audio' | 'video';
  remoteUserId?: string;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  startTime?: Date;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
  from: string;
  to: string;
  callType: 'audio' | 'video';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp: Date;
}

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callState: CallState = {
    isActive: false,
    isIncoming: false,
    isOutgoing: false,
    type: 'audio',
    isMuted: false,
    isVideoEnabled: false,
    isSpeakerEnabled: true
  };
  
  private readonly config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  private onCallStateChange?: (state: CallState) => void;
  private onSignalSend?: (signal: CallSignal) => void;

  constructor(
    onCallStateChange?: (state: CallState) => void,
    onSignalSend?: (signal: CallSignal) => void
  ) {
    this.onCallStateChange = onCallStateChange;
    this.onSignalSend = onSignalSend;
  }

  // Initialize peer connection
  private initializePeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config);

    pc.onicecandidate = (event) => {
      if (event.candidate && this.callState.remoteUserId) {
        this.sendSignal({
          type: 'ice-candidate',
          from: 'current-user', // Replace with actual user ID
          to: this.callState.remoteUserId,
          callType: this.callState.type,
          candidate: event.candidate,
          timestamp: new Date()
        });
      }
    };

    pc.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.updateCallState({ remoteStream: this.remoteStream });
    };

    pc.onconnectionstatechange = () => {
      // Log connection state changes for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('WebRTC Connection state:', pc.connectionState);
      }
      
      // Handle connection failures
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.endCall();
      }
    };

    return pc;
  }

  // Start outgoing call
  async startCall(userId: string, type: 'audio' | 'video' = 'audio'): Promise<void> {
    try {
      this.callState.remoteUserId = userId;
      this.callState.type = type;
      this.callState.isOutgoing = true;
      this.callState.isActive = true;
      this.callState.startTime = new Date();

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });

      this.updateCallState({ 
        localStream: this.localStream,
        isVideoEnabled: type === 'video'
      });

      // Initialize peer connection
      this.peerConnection = this.initializePeerConnection();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send call request signal
      this.sendSignal({
        type: 'call-request',
        from: 'current-user', // Replace with actual user ID
        to: userId,
        callType: type,
        offer,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error starting call:', error);
      this.endCall();
      throw error;
    }
  }

  // Accept incoming call
  async acceptCall(signal: CallSignal): Promise<void> {
    try {
      this.callState.remoteUserId = signal.from;
      this.callState.type = signal.callType;
      this.callState.isIncoming = true;
      this.callState.isActive = true;
      this.callState.startTime = new Date();

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: signal.callType === 'video'
      });

      this.updateCallState({ 
        localStream: this.localStream,
        isVideoEnabled: signal.callType === 'video'
      });

      // Initialize peer connection
      this.peerConnection = this.initializePeerConnection();

      // Add local stream
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Set remote description
      if (signal.offer) {
        await this.peerConnection.setRemoteDescription(signal.offer);
      }

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send accept signal
      this.sendSignal({
        type: 'call-accept',
        from: 'current-user', // Replace with actual user ID
        to: signal.from,
        callType: signal.callType,
        answer,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error accepting call:', error);
      this.endCall();
      throw error;
    }
  }

  // Handle incoming signal
  async handleSignal(signal: CallSignal): Promise<void> {
    try {
      switch (signal.type) {
        case 'call-request':
          // Incoming call - notify UI to show incoming call dialog
          this.updateCallState({
            isIncoming: true,
            remoteUserId: signal.from,
            type: signal.callType
          });
          break;

        case 'call-accept':
          if (this.peerConnection && signal.answer) {
            await this.peerConnection.setRemoteDescription(signal.answer);
          }
          break;

        case 'call-reject':
        case 'call-end':
          this.endCall();
          break;

        case 'ice-candidate':
          if (this.peerConnection && signal.candidate) {
            await this.peerConnection.addIceCandidate(signal.candidate);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }

  // End call
  endCall(): void {
    // Clean up streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Send end call signal if there's an active call
    if (this.callState.isActive && this.callState.remoteUserId) {
      this.sendSignal({
        type: 'call-end',
        from: 'current-user', // Replace with actual user ID
        to: this.callState.remoteUserId,
        callType: this.callState.type,
        timestamp: new Date()
      });
    }

    // Reset call state
    this.callState = {
      isActive: false,
      isIncoming: false,
      isOutgoing: false,
      type: 'audio',
      isMuted: false,
      isVideoEnabled: false,
      isSpeakerEnabled: true
    };

    this.updateCallState(this.callState);
  }

  // Toggle audio mute
  toggleMute(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.updateCallState({ isMuted: !audioTrack.enabled });
      }
    }
  }

  // Toggle video
  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.updateCallState({ isVideoEnabled: videoTrack.enabled });
      }
    }
  }

  // Toggle speaker (mobile)
  toggleSpeaker(): void {
    this.updateCallState({ isSpeakerEnabled: !this.callState.isSpeakerEnabled });
  }

  // Get call duration
  getCallDuration(): string {
    if (!this.callState.startTime) return '00:00';
    
    const now = new Date();
    const duration = Math.floor((now.getTime() - this.callState.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Private methods
  private updateCallState(updates: Partial<CallState>): void {
    this.callState = { ...this.callState, ...updates };
    this.onCallStateChange?.(this.callState);
  }

  private sendSignal(signal: CallSignal): void {
    this.onSignalSend?.(signal);
  }

  // Getters
  get currentCallState(): CallState {
    return { ...this.callState };
  }

  get isCallActive(): boolean {
    return this.callState.isActive;
  }
}

export default WebRTCManager;