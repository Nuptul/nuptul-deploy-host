import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InstantMessenger from '@/components/chat/InstantMessenger';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@test.com' },
    profile: { 
      id: 'user-1',
      role: 'guest', 
      first_name: 'Test', 
      last_name: 'User',
      email: 'user@test.com',
      avatar_url: 'https://example.com/avatar.jpg'
    },
    loading: false
  })
}));

// Mock instant messenger hook
jest.mock('@/hooks/useInstantMessenger', () => ({
  useInstantMessenger: () => ({
    isOpen: true,
    activeChat: 'chat-1',
    chats: [
      {
        id: 'chat-1',
        type: 'direct',
        name: 'Jane Doe',
        participants: ['user-1', 'user-2'],
        lastMessage: {
          id: 'msg-1',
          content: 'Hello there!',
          sender_id: 'user-2',
          created_at: '2024-01-01T10:00:00Z'
        },
        unreadCount: 2
      }
    ],
    messages: [
      {
        id: 'msg-1',
        content: 'Hello there!',
        sender_id: 'user-2',
        chat_id: 'chat-1',
        created_at: '2024-01-01T10:00:00Z',
        type: 'text',
        status: 'sent',
        reactions: [],
        replies: []
      },
      {
        id: 'msg-2',
        content: 'Hi! How are you?',
        sender_id: 'user-1',
        chat_id: 'chat-1',
        created_at: '2024-01-01T10:01:00Z',
        type: 'text',
        status: 'delivered',
        reactions: [],
        replies: []
      }
    ],
    sendMessage: jest.fn(),
    deleteMessage: jest.fn(),
    openChat: jest.fn(),
    closeChat: jest.fn(),
    startVideoCall: jest.fn(),
    startAudioCall: jest.fn(),
    uploadMedia: jest.fn(),
    addReaction: jest.fn(),
    replyToMessage: jest.fn(),
    markAsRead: jest.fn(),
    typing: { 'user-2': true },
    onlineUsers: ['user-1', 'user-2'],
    loading: false,
    error: null
  })
}));

// Mock WebRTC APIs
Object.defineProperty(window, 'navigator', {
  value: {
    mediaDevices: {
      getUserMedia: jest.fn(() => Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }]
      })),
      getDisplayMedia: jest.fn(() => Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }]
      }))
    }
  },
  writable: true
});

global.RTCPeerConnection = jest.fn(() => ({
  createOffer: jest.fn(() => Promise.resolve({})),
  createAnswer: jest.fn(() => Promise.resolve({})),
  setLocalDescription: jest.fn(() => Promise.resolve()),
  setRemoteDescription: jest.fn(() => Promise.resolve()),
  addIceCandidate: jest.fn(() => Promise.resolve()),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        })),
        insert: jest.fn(() => Promise.resolve({ data: { id: 'new-msg' }, error: null })),
        update: jest.fn(() => Promise.resolve({ data: { id: 'msg-1' }, error: null })),
        delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ 
          data: { path: 'chat-media/file.jpg' }, 
          error: null 
        })),
        getPublicUrl: jest.fn(() => ({ 
          data: { publicUrl: 'https://example.com/file.jpg' } 
        }))
      }))
    },
    channel: jest.fn(() => ({
      on: jest.fn(() => ({ subscribe: jest.fn() })),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      send: jest.fn()
    }))
  }
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(() => 'toast-id'),
    dismiss: jest.fn()
  }
}));

// Test wrapper with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('InstantMessenger Integration Tests', () => {
  let consoleError: jest.SpyInstance;
  const user = userEvent.setup();

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
  });

  describe('Component Rendering and Data Loading', () => {
    it('renders instant messenger and loads data without console errors', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for data-loaded attribute
      await waitFor(() => {
        const messengerElement = screen.getByTestId('instant-messenger');
        expect(messengerElement).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 5000 });

      // Assert no console errors occurred during rendering
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('displays chat list correctly', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
      });
    });

    it('displays active chat messages', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
        expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
      });
    });

    it('shows typing indicators correctly', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/typing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Sending and Interaction', () => {
    it('handles text message sending', async () => {
      const mockSendMessage = require('@/hooks/useInstantMessenger').useInstantMessenger().sendMessage;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type.*message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      await user.type(messageInput, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(mockSendMessage).toHaveBeenCalledWith({
        content: 'Test message',
        type: 'text',
        chat_id: 'chat-1'
      });
    });

    it('handles emoji reactions', async () => {
      const mockAddReaction = require('@/hooks/useInstantMessenger').useInstantMessenger().addReaction;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
      });

      // Right-click on message to show context menu
      const messageElement = screen.getByText('Hello there!');
      fireEvent.contextMenu(messageElement);

      await waitFor(() => {
        expect(screen.getByText(/add reaction/i)).toBeInTheDocument();
      });

      const reactionButton = screen.getByText('❤️');
      await user.click(reactionButton);

      expect(mockAddReaction).toHaveBeenCalledWith('msg-1', '❤️');
    });

    it('handles message replies', async () => {
      const mockReplyToMessage = require('@/hooks/useInstantMessenger').useInstantMessenger().replyToMessage;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
      });

      // Click reply button
      const replyButton = screen.getByRole('button', { name: /reply/i });
      await user.click(replyButton);

      await waitFor(() => {
        expect(screen.getByText(/replying to/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByPlaceholderText(/type.*reply/i);
      await user.type(messageInput, 'Reply message');

      const sendReplyButton = screen.getByRole('button', { name: /send.*reply/i });
      await user.click(sendReplyButton);

      expect(mockReplyToMessage).toHaveBeenCalledWith('msg-1', 'Reply message');
    });

    it('handles message deletion', async () => {
      const mockDeleteMessage = require('@/hooks/useInstantMessenger').useInstantMessenger().deleteMessage;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
      });

      // Right-click on user's own message
      const userMessage = screen.getByText('Hi! How are you?');
      fireEvent.contextMenu(userMessage);

      await waitFor(() => {
        expect(screen.getByText(/delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByText(/delete/i);
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/confirm.*delete/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockDeleteMessage).toHaveBeenCalledWith('msg-2');
    });
  });

  describe('Media Upload and File Sharing', () => {
    it('handles image upload', async () => {
      const mockUploadMedia = require('@/hooks/useInstantMessenger').useInstantMessenger().uploadMedia;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /attach/i })).toBeInTheDocument();
      });

      const attachButton = screen.getByRole('button', { name: /attach/i });
      await user.click(attachButton);

      await waitFor(() => {
        expect(screen.getByText(/upload.*image/i)).toBeInTheDocument();
      });

      // Mock file input
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/upload.*image/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(mockUploadMedia).toHaveBeenCalledWith(file, 'image');
      });
    });

    it('handles file upload validation', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      const attachButton = screen.getByRole('button', { name: /attach/i });
      await user.click(attachButton);

      // Try to upload oversized file
      const largeFile = new File(['x'.repeat(10000000)], 'large.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/upload.*image/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/file.*too.*large/i)).toBeInTheDocument();
      });
    });

    it('displays media previews correctly', async () => {
      // Mock message with media
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        messages: [
          {
            id: 'media-msg-1',
            content: '',
            sender_id: 'user-2',
            chat_id: 'chat-1',
            created_at: '2024-01-01T10:00:00Z',
            type: 'image',
            media_url: 'https://example.com/image.jpg',
            status: 'sent',
            reactions: [],
            replies: []
          }
        ]
      });

      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('img', { name: /message.*image/i })).toBeInTheDocument();
      });
    });
  });

  describe('Video and Audio Calling', () => {
    it('handles video call initiation', async () => {
      const mockStartVideoCall = require('@/hooks/useInstantMessenger').useInstantMessenger().startVideoCall;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /video.*call/i })).toBeInTheDocument();
      });

      const videoCallButton = screen.getByRole('button', { name: /video.*call/i });
      await user.click(videoCallButton);

      expect(mockStartVideoCall).toHaveBeenCalledWith('chat-1');
    });

    it('handles audio call initiation', async () => {
      const mockStartAudioCall = require('@/hooks/useInstantMessenger').useInstantMessenger().startAudioCall;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /audio.*call/i })).toBeInTheDocument();
      });

      const audioCallButton = screen.getByRole('button', { name: /audio.*call/i });
      await user.click(audioCallButton);

      expect(mockStartAudioCall).toHaveBeenCalledWith('chat-1');
    });

    it('displays call interface during active call', async () => {
      // Mock active video call state
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        activeCall: {
          id: 'call-1',
          type: 'video',
          chatId: 'chat-1',
          status: 'connected',
          localStream: { getTracks: () => [] },
          remoteStream: { getTracks: () => [] }
        }
      });

      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('video-call-interface')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /end.*call/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /camera/i })).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Features and Synchronization', () => {
    it('handles real-time message updates', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toHaveAttribute('data-loaded', 'true');
      });

      // Simulate real-time message arrival
      const newMessage = {
        id: 'new-msg-1',
        content: 'New real-time message',
        sender_id: 'user-2',
        chat_id: 'chat-1',
        created_at: new Date().toISOString(),
        type: 'text',
        status: 'sent'
      };

      // This would normally be triggered by Supabase real-time subscription
      fireEvent(window, new CustomEvent('new-message', { detail: newMessage }));

      await waitFor(() => {
        expect(screen.getByText('New real-time message')).toBeInTheDocument();
      });
    });

    it('handles user presence updates', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('presence-indicator')).toBeInTheDocument();
      });

      // Should show online status
      expect(screen.getByTestId('presence-indicator')).toHaveClass('online');
    });

    it('handles typing indicator updates', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/typing/i)).toBeInTheDocument();
      });

      // Simulate stopping typing
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        typing: {}
      });

      // Re-render to reflect typing state change
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/typing/i)).not.toBeInTheDocument();
      });
    });

    it('marks messages as read automatically', async () => {
      const mockMarkAsRead = require('@/hooks/useInstantMessenger').useInstantMessenger().markAsRead;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });

      // Should automatically mark messages as read when chat is opened
      expect(mockMarkAsRead).toHaveBeenCalledWith('chat-1');
    });
  });

  describe('Chat Management and Navigation', () => {
    it('handles chat switching', async () => {
      const mockOpenChat = require('@/hooks/useInstantMessenger').useInstantMessenger().openChat;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });

      // Click on chat to open it
      const chatItem = screen.getByText('Jane Doe');
      await user.click(chatItem);

      expect(mockOpenChat).toHaveBeenCalledWith('chat-1');
    });

    it('handles chat search functionality', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search.*chats/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search.*chats/i);
      await user.type(searchInput, 'Jane');

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('handles messenger minimize/maximize', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /minimize/i })).toBeInTheDocument();
      });

      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      await user.click(minimizeButton);

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toHaveClass('minimized');
      });
    });

    it('handles messenger close', async () => {
      const mockCloseChat = require('@/hooks/useInstantMessenger').useInstantMessenger().closeChat;
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockCloseChat).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles connection errors gracefully', async () => {
      // Mock connection error
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        error: 'Connection failed',
        loading: false
      });

      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/connection.*failed/i)).toBeInTheDocument();
      });

      // Should not throw console errors
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('handles empty chat state', async () => {
      // Mock empty chat state
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        chats: [],
        messages: [],
        activeChat: null
      });

      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no.*chats/i)).toBeInTheDocument();
      });
    });

    it('recovers from message send failures', async () => {
      const mockSendMessage = jest.fn().mockRejectedValue(new Error('Send failed'));
      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        sendMessage: mockSendMessage
      });

      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      const messageInput = screen.getByPlaceholderText(/type.*message/i);
      await user.type(messageInput, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/failed.*to.*send/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('handles large message history efficiently', async () => {
      // Mock large message history
      const largeMessageHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        sender_id: i % 2 === 0 ? 'user-1' : 'user-2',
        chat_id: 'chat-1',
        created_at: new Date(Date.now() - i * 60000).toISOString(),
        type: 'text',
        status: 'sent',
        reactions: [],
        replies: []
      }));

      const mockUseInstantMessenger = require('@/hooks/useInstantMessenger').useInstantMessenger;
      mockUseInstantMessenger.mockReturnValue({
        ...mockUseInstantMessenger(),
        messages: largeMessageHistory
      });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toHaveAttribute('data-loaded', 'true');
      }, { timeout: 10000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large message history within reasonable time
      expect(renderTime).toBeLessThan(5000);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('properly cleans up resources on unmount', async () => {
      const { unmount } = render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('instant-messenger')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should not cause memory leaks or errors
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    it('meets accessibility requirements', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        const messenger = screen.getByTestId('instant-messenger');
        expect(messenger).toHaveAttribute('role', 'application');
        expect(messenger).toHaveAttribute('aria-label');
        
        const chatList = screen.getByRole('list', { name: /chat.*list/i });
        expect(chatList).toBeInTheDocument();
        
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        expect(messageInput).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <InstantMessenger />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type.*message/i)).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();
      expect(screen.getByText('Jane Doe')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText(/type.*message/i)).toHaveFocus();

      // Test keyboard shortcuts
      await user.keyboard('{Enter}');
      
      // Should not throw errors with keyboard interaction
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});