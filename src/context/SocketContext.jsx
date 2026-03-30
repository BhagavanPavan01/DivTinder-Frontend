import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const eventHandlers = useRef(new Map());

  useEffect(() => {
    if (!token || !user) {
      console.log('No token or user, skipping socket connection');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    console.log('Connecting to socket...', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setIsConnected(false);
      setError(err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err.message);
      setError(err.message);
    });

    return () => {
      if (newSocket) {
        console.log('Disconnecting socket...');
        newSocket.disconnect();
      }
    };
  }, [token, user]);

  const sendMessage = useCallback((toUserId, text, tempId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('private-message', { toUserId, text, tempId });
      return true;
    }
    console.warn('Cannot send message: socket not connected');
    return false;
  }, [isConnected]);

  const sendGlobalMessage = useCallback((text, tempId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('global-message', { text, tempId });
      return true;
    }
    console.warn('Cannot send global message: socket not connected');
    return false;
  }, [isConnected]);

  const sendTyping = useCallback((toUserId, chatId, isTyping) => {
    if (socketRef.current && isConnected) {
      const event = isTyping ? 'typing-start' : 'typing-end';
      socketRef.current.emit(event, { toUserId, chatId });
    }
  }, [isConnected]);

  const markAsRead = useCallback((chatId, messageIds) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-read', { chatId, messageIds });
    }
  }, [isConnected]);

  const joinPrivateChat = useCallback((otherUserId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-private-chat', otherUserId);
    }
  }, [isConnected]);

  const joinGlobalChat = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-global-chat');
    }
  }, [isConnected]);

  const onNewMessage = useCallback((handler) => {
    if (!socketRef.current) return;
    
    if (handler) {
      const wrappedHandler = (data) => handler(data);
      eventHandlers.current.set('new-private-message', wrappedHandler);
      socketRef.current.on('new-private-message', wrappedHandler);
    } else {
      const handler = eventHandlers.current.get('new-private-message');
      if (handler) {
        socketRef.current.off('new-private-message', handler);
        eventHandlers.current.delete('new-private-message');
      }
    }
  }, []);

  const onGlobalMessage = useCallback((handler) => {
    if (!socketRef.current) return;
    
    if (handler) {
      const wrappedHandler = (data) => handler(data);
      eventHandlers.current.set('new-global-message', wrappedHandler);
      socketRef.current.on('new-global-message', wrappedHandler);
    } else {
      const handler = eventHandlers.current.get('new-global-message');
      if (handler) {
        socketRef.current.off('new-global-message', handler);
        eventHandlers.current.delete('new-global-message');
      }
    }
  }, []);

  const onMessageSent = useCallback((handler) => {
    if (!socketRef.current) return;
    
    if (handler) {
      const wrappedHandler = (data) => handler(data);
      eventHandlers.current.set('message-sent', wrappedHandler);
      socketRef.current.on('message-sent', wrappedHandler);
    } else {
      const handler = eventHandlers.current.get('message-sent');
      if (handler) {
        socketRef.current.off('message-sent', handler);
        eventHandlers.current.delete('message-sent');
      }
    }
  }, []);

  const onTyping = useCallback((handler) => {
    if (!socketRef.current) return;
    
    if (handler) {
      const wrappedHandler = (data) => handler(data);
      eventHandlers.current.set('user-typing', wrappedHandler);
      socketRef.current.on('user-typing', wrappedHandler);
    } else {
      const handler = eventHandlers.current.get('user-typing');
      if (handler) {
        socketRef.current.off('user-typing', handler);
        eventHandlers.current.delete('user-typing');
      }
    }
  }, []);

  const value = {
    socket,
    isConnected,
    error,
    sendMessage,
    sendGlobalMessage,
    sendTyping,
    markAsRead,
    joinPrivateChat,
    joinGlobalChat,
    onNewMessage,
    onGlobalMessage,
    onMessageSent,
    onTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};