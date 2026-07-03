import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';

const ChatPage = () => {
  const { user, token } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch conversations on component mount
  useEffect(() => {
    if (user && token) {
      fetchConversations();
    }
  }, [user, token]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new private messages
    socket.on('new-private-message', (messageData) => {
      console.log('New private message received:', messageData);
      
      // Add message to current chat if active
      if (activeChat?.chatId === messageData.chatId) {
        setMessages(prev => [...prev, {
          _id: messageData._id,
          text: messageData.text,
          senderId: messageData.senderId,
          createdAt: messageData.createdAt,
          isOwn: false,
          isRead: false
        }]);
      }
      
      // Update conversation list
      updateConversationWithNewMessage(messageData);
    });

    // Listen for new global messages
    socket.on('new-global-message', (messageData) => {
      console.log('New global message received:', messageData);
      
      if (activeChat?.type === 'global') {
        setMessages(prev => [...prev, {
          _id: messageData._id,
          text: messageData.text,
          senderId: messageData.senderId,
          sender: messageData.sender,
          createdAt: messageData.createdAt,
          isOwn: false
        }]);
      }
      
      updateConversationWithNewMessage(messageData);
    });

    // Listen for message sent confirmation
    socket.on('message-sent', (messageData) => {
      console.log('Message sent confirmation:', messageData);
      
      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg._id === messageData.tempId ? { ...messageData, isOwn: true } : msg
      ));
    });

    // Listen for message errors
    socket.on('message-error', ({ error, tempId }) => {
      console.error('Message error:', error);
      // Remove temp message on error
      if (tempId) {
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    });

    // Listen for typing indicators
    socket.on('user-typing', ({ fromUserId, chatId, isTyping }) => {
      if (activeChat?.chatId === chatId) {
        setTypingUsers(prev => ({ ...prev, [fromUserId]: isTyping }));
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [fromUserId]: false }));
        }, 3000);
      }
    });

    // Listen for read receipts
    socket.on('messages-read', ({ chatId, readBy, messageIds }) => {
      if (activeChat?.chatId === chatId) {
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        ));
      }
    });

    // Listen for user online/offline
    socket.on('user-online', ({ userId }) => {
      updateUserStatus(userId, true);
    });

    socket.on('user-offline', ({ userId }) => {
      updateUserStatus(userId, false);
    });

    return () => {
      socket.off('new-private-message');
      socket.off('new-global-message');
      socket.off('message-sent');
      socket.off('message-error');
      socket.off('user-typing');
      socket.off('messages-read');
      socket.off('user-online');
      socket.off('user-offline');
    };
  }, [socket, activeChat]);

  const updateUserStatus = (userId, isOnline) => {
    setConversations(prev => prev.map(conv => {
      if (conv.user?._id === userId) {
        return { ...conv, user: { ...conv.user, status: isOnline ? 'online' : 'offline' } };
      }
      return conv;
    }));
  };

  const updateConversationWithNewMessage = (messageData) => {
    setConversations(prevConversations => {
      const updated = prevConversations.map(conv => {
        if (conv.chatId === messageData.chatId) {
          return {
            ...conv,
            lastMessage: {
              text: messageData.text,
              timestamp: messageData.createdAt,
              isOwn: messageData.senderId === user?._id
            },
            unreadCount: messageData.senderId !== user?._id ? (conv.unreadCount || 0) + 1 : 0
          };
        }
        return conv;
      }).sort((a, b) => {
        const aTime = a.lastMessage?.timestamp || 0;
        const bTime = b.lastMessage?.timestamp || 0;
        return new Date(bTime) - new Date(aTime);
      });
      return updated;
    });
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      console.log('Fetching conversations from:', `${API_URL}/api/chats`);
      const response = await fetch(`${API_URL}/api/chats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Conversations response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Conversations data:', result);
        const conversationsData = result.data || result;
        
        // Add user status from socket
        const conversationsWithStatus = conversationsData.map(conv => ({
          ...conv,
          user: {
            ...conv.user,
            status: conv.user?._id && onlineUsers.has(conv.user._id) ? 'online' : 'offline'
          }
        }));
        
        setConversations(conversationsWithStatus);
      } else {
        const errorData = await response.json();
        console.error('Error fetching conversations:', errorData);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      console.log('Fetching messages for chat:', chatId);
      const response = await fetch(`${API_URL}/api/chats/${chatId}?page=1&limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Messages response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Messages data:', result);
        const messagesData = result.data?.messages || result.messages || [];
        
        // Format messages for display
        const formattedMessages = messagesData.map(msg => ({
          _id: msg._id,
          text: msg.text,
          senderId: msg.senderId,
          sender: msg.sender,
          createdAt: msg.createdAt,
          isOwn: msg.senderId === user?._id,
          isRead: msg.isRead || false,
          isDeleted: msg.isDeleted || false
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        if (formattedMessages.length > 0 && socket && isConnected) {
          const unreadMessageIds = formattedMessages
            .filter(msg => !msg.isOwn && !msg.isRead)
            .map(msg => msg._id);
          
          if (unreadMessageIds.length > 0) {
            socket.emit('mark-read', { chatId, messageIds: unreadMessageIds });
          }
        }
        
        return formattedMessages;
      } else {
        const errorData = await response.json();
        console.error('Error fetching messages:', errorData);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (chatId, text, receiverId = null) => {
    console.debug('ChatPage.sendMessage', { chatId, text, receiverId, socketExists: !!socket, isConnected });
    if (!socket || !isConnected) {
      console.warn('Socket not connected - falling back to REST send', { socketExists: !!socket, isConnected });
      try {
        // Fallback to REST API if socket unavailable
        await chatService.sendMessage(chatId, text);
        return;
      } catch (err) {
        console.error('Fallback REST send failed', err);
        return;
      }
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage = {
      _id: tempId,
      text: text,
      senderId: user._id,
      sender: { firstName: user.firstName, lastName: user.lastName, photoUrl: user.photoUrl },
      createdAt: new Date().toISOString(),
      isOwn: true,
      isRead: false,
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Check if it's a private message or global
    if (activeChat?.type === 'private' && receiverId) {
      socket.emit('private-message', { 
        toUserId: receiverId, 
        text: text, 
        tempId: tempId 
      });
    } else if (activeChat?.type === 'global') {
      socket.emit('global-message', { 
        text: text, 
        tempId: tempId 
      });
    }
  };

  const sendTyping = (chatId, receiverId, isTyping) => {
    if (socket && isConnected && activeChat?.type === 'private' && receiverId) {
      if (isTyping) {
        socket.emit('typing-start', { toUserId: receiverId, chatId });
      } else {
        socket.emit('typing-end', { toUserId: receiverId, chatId });
      }
    }
  };

  const handleChatSelect = async (chat) => {
    if (activeChat?.chatId === chat.chatId) return;
    console.log('Selected chat:', chat);
    setActiveChat(chat);
    await fetchMessages(chat.chatId);
  };


  const handleBack = () => {
    setActiveChat(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Back Button */}
      {activeChat && (
        <button 
          onClick={handleBack}
          className="fixed top-4 left-4 z-10 md:hidden bg-white p-2 rounded-full shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Conversations Sidebar */}
      <div className={`${activeChat ? 'hidden md:block' : 'block'} w-full md:w-96`}>
        <ChatList 
          conversations={conversations}
          activeChat={activeChat}
          onSelectChat={handleChatSelect}
          currentUser={user}
          loading={loadingConversations}
        />
      </div>

      {/* Chat Area */}
      <div className={`${activeChat ? 'block' : 'hidden md:block'} flex-1`}>
        <ChatWindow 
          activeChat={activeChat}
          messages={messages}
          typingUsers={typingUsers}
          isLoading={isLoading}
          currentUser={user}
          onSendMessage={sendMessage}
          onSendTyping={sendTyping}
          isConnected={isConnected}
          onBack={handleBack}
        />
      </div>

      {/* User Profile Modal removed */}

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          Reconnecting...
        </div>
      )}
    </div>
  );
};

export default ChatPage;