import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const eventHandlers = useRef(new Map());

  useEffect(() => {
    if (!token || !user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
      setError(err.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      console.log('Socket reconnected');
      setIsConnected(true);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, user]);

  const sendMessage = useCallback((toUserId, text, tempId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('private-message', { toUserId, text, tempId });
    }
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

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    sendTyping,
    markAsRead,
    onNewMessage,
    onMessageSent
  };
};