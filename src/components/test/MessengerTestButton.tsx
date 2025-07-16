import React from 'react';
import { openMessenger, startVideoCall, startAudioCall } from '@/utils/messengerUtils';
import { IconMessage, IconVideo, IconPhone } from '@tabler/icons-react';

const MessengerTestButton: React.FC = () => {
  return (
    <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-2">
      <button
        onClick={() => openMessenger({ center: true })}
        className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: '500',
          color: '#007AFF'
        }}
      >
        <IconMessage size={20} stroke={1.5} />
        Open Messenger
      </button>
      
      <button
        onClick={() => openMessenger({ center: false, minimized: false })}
        className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: '500',
          color: '#007AFF'
        }}
      >
        <IconMessage size={20} stroke={1.5} />
        Open Corner
      </button>
    </div>
  );
};

export default MessengerTestButton;