// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

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

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('user-online', ({ userId }) => {
      setOnlineUsers(prev => new Map(prev).set(userId, true));
    });

    newSocket.on('user-offline', ({ userId }) => {
      setOnlineUsers(prev => new Map(prev).set(userId, false));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};