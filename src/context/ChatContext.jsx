import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState({});
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      console.log('No token or user, skipping socket connection');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    console.log('Connecting to socket...', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    newSocket.on('user-online', ({ userId }) => {
      console.log('User online:', userId);
      setOnlineUsers(prev => new Map(prev).set(userId, true));
    });

    newSocket.on('user-offline', ({ userId }) => {
      console.log('User offline:', userId);
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    newSocket.on('user-typing', ({ fromUserId, chatId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [`${chatId}_${fromUserId}`]: isTyping
      }));
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [`${chatId}_${fromUserId}`]: false
        }));
      }, 3000);
    });

    return () => {
      if (newSocket) {
        console.log('Disconnecting socket...');
        newSocket.disconnect();
      }
    };
  }, [token, user]);

  const sendPrivateMessage = (toUserId, text, tempId) => {
    if (socketRef.current) {
      socketRef.current.emit('private-message', { toUserId, text, tempId });
    }
  };

  const sendGlobalMessage = (text, tempId) => {
    if (socketRef.current) {
      socketRef.current.emit('global-message', { text, tempId });
    }
  };

  const sendTypingStart = (toUserId, chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing-start', { toUserId, chatId });
    }
  };

  const sendTypingEnd = (toUserId, chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing-end', { toUserId, chatId });
    }
  };

  const markMessagesRead = (chatId, messageIds) => {
    if (socketRef.current) {
      socketRef.current.emit('mark-read', { chatId, messageIds });
    }
  };

  const joinPrivateChat = (otherUserId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-private-chat', otherUserId);
    }
  };

  const joinGlobalChat = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-global-chat');
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    sendPrivateMessage,
    sendGlobalMessage,
    sendTypingStart,
    sendTypingEnd,
    markMessagesRead,
    joinPrivateChat,
    joinGlobalChat,
    isUserOnline: (userId) => onlineUsers.get(userId) || false,
    isTyping: (chatId, userId) => typingUsers[`${chatId}_${userId}`] || false
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};