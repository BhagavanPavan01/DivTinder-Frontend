import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow = ({ chat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { socket, sendTypingStart, sendTypingEnd, markMessagesRead, isTyping, joinPrivateChat, joinGlobalChat } = useChat();
  const { user } = useAuth();

  const otherUserId = chat?.type === 'private' ? chat.user?._id : null;

  useEffect(() => {
    if (chat) {
      loadMessages();
      
      // Join chat room
      if (chat.type === 'private' && otherUserId) {
        joinPrivateChat(otherUserId);
      } else if (chat.type === 'global') {
        joinGlobalChat();
      }
    }
  }, [chat]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.chatId === chat?.chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if chat is open
        if (message.senderId !== user?._id) {
          markMessagesRead(chat.chatId, [message._id]);
        }
      }
    };

    socket.on('new-private-message', handleNewMessage);
    socket.on('new-global-message', handleNewMessage);
    socket.on('message-sent', (message) => {
      if (message.chatId === chat?.chatId) {
        // Replace temp message if exists
        setMessages(prev => prev.map(m => 
          m.tempId === message.tempId ? message : m
        ));
      }
    });

    return () => {
      socket.off('new-private-message');
      socket.off('new-global-message');
      socket.off('message-sent');
    };
  }, [socket, chat, markMessagesRead, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(chat.chatId, page, 50);
      const newMessages = response.data || [];
      
      if (page === 1) {
        setMessages(newMessages.reverse());
      } else {
        setMessages(prev => [...newMessages.reverse(), ...prev]);
      }
      
      setHasMore(response.pagination?.pages > page);
      
      // Mark unread messages as read
      const unreadMessages = newMessages.filter(
        msg => msg.senderId !== user?._id && !msg.isRead
      );
      if (unreadMessages.length > 0) {
        markMessagesRead(chat.chatId, unreadMessages.map(m => m._id));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      loadMore();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (page > 1) {
      // Maintain scroll position after loading older messages
      const container = messagesContainerRef.current;
      if (container) {
        const previousHeight = container.scrollHeight;
        setTimeout(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - previousHeight;
        }, 100);
      }
    } else {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      text,
      sender: { _id: 'temp', firstName: 'You' },
      senderId: 'temp',
      createdAt: new Date(),
      tempId,
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    if (chat.type === 'private') {
      socket?.emit('private-message', {
        toUserId: otherUserId,
        text,
        tempId
      });
    } else {
      socket?.emit('global-message', {
        text,
        tempId
      });
    }
    
    scrollToBottom();
  };

  const handleTyping = (isTyping) => {
    if (chat.type === 'private' && otherUserId) {
      if (isTyping) {
        sendTypingStart(otherUserId, chat.chatId);
      } else {
        sendTypingEnd(otherUserId, chat.chatId);
      }
    }
  };

  if (!chat) return null;

  const isTypingNow = chat.type === 'private' && isTyping(chat.chatId, otherUserId);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {chat.type === 'global' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                chat.user?.firstName?.charAt(0).toUpperCase() || '?'
              )}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {chat.type === 'global' ? 'Global Chat' : `${chat.user?.firstName || 'User'} ${chat.user?.lastName || ''}`}
            </h2>
            {chat.type === 'private' && (
              <p className="text-xs text-gray-500">
                {isTypingNow ? 'Typing...' : 'Online'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loading && page === 1 && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble
            key={message._id || index}
            message={message}
            isOwn={message.senderId === user?._id || message.senderId === 'temp'}
          />
        ))}
        
        {isTypingNow && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs">typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;