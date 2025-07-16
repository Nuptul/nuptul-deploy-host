// Chat utility functions - connects to InstantMessenger system
import { logger } from './logger';

// Global messenger state management
let messengerInstance: any = null;

export const setMessengerInstance = (instance: any) => {
  messengerInstance = instance;
};

export const openChatThread = (userId: string) => {
  logger.info('Opening chat thread', { userId });
  
  if (messengerInstance && messengerInstance.openChat) {
    messengerInstance.openChat(userId);
  } else {
    // Fallback: dispatch custom event for chat opening
    window.dispatchEvent(new CustomEvent('openChat', { 
      detail: { userId, action: 'openThread' }
    }));
  }
};

export const startVoiceCall = (userId: string) => {
  logger.info('Starting voice call', { userId });
  
  if (messengerInstance && messengerInstance.startCall) {
    messengerInstance.startCall(userId, 'audio');
  } else {
    // Fallback: dispatch custom event for voice call
    window.dispatchEvent(new CustomEvent('startCall', { 
      detail: { userId, type: 'audio' }
    }));
  }
};

export const startVideoCall = (userId: string) => {
  logger.info('Starting video call', { userId });
  
  if (messengerInstance && messengerInstance.startCall) {
    messengerInstance.startCall(userId, 'video');
  } else {
    // Fallback: dispatch custom event for video call
    window.dispatchEvent(new CustomEvent('startCall', { 
      detail: { userId, type: 'video' }
    }));
  }
};

export const sendMedia = (file: File, userId: string) => {
  logger.info('Sending media', { userId, fileName: file.name, fileSize: file.size });
  
  if (messengerInstance && messengerInstance.sendMedia) {
    messengerInstance.sendMedia(file, userId);
  } else {
    // Fallback: dispatch custom event for media send
    window.dispatchEvent(new CustomEvent('sendMedia', { 
      detail: { userId, file }
    }));
  }
};

export const openMessenger = (options?: { center?: boolean; minimized?: boolean }) => {
  logger.info('Opening messenger interface', options);
  
  if (messengerInstance && messengerInstance.open) {
    messengerInstance.open(options);
  } else {
    // Fallback: dispatch custom event for messenger opening
    window.dispatchEvent(new CustomEvent('openMessenger', { 
      detail: options || { center: true }
    }));
  }
};