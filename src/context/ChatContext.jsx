import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversation list with new message
      setConversations(prevConversations => {
        const updated = prevConversations.map(conv => {
          if (conv._id === message.senderId || conv._id === message.receiverId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: message.senderId !== user._id ? (conv.unreadCount || 0) + 1 : 0
            };
          }
          return conv;
        }).sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || 0;
          const bTime = b.lastMessage?.createdAt || 0;
          return new Date(bTime) - new Date(aTime);
        });
        return updated;
      });
    });

    newSocket.on('typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [userId]: false }));
      }, 3000);
    });

    newSocket.on('messageRead', ({ messageId, userId: readerId }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId && !msg.readBy?.includes(readerId)
          ? { ...msg, readBy: [...(msg.readBy || []), readerId] }
          : msg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, user]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (receiverId, text) => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return;
    }

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      senderId: user._id,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
      readBy: []
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    socket.emit('sendMessage', { receiverId, text });
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await fetch(`${API_URL}/chat/mark-read/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (socket && isConnected) {
        socket.emit('markRead', { messageId });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const value = {
    socket,
    conversations,
    activeChat,
    messages,
    typingUsers,
    isConnected,
    fetchConversations,
    fetchMessages,
    setActiveChat,
    sendMessage,
    sendTyping,
    markAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};