import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';

const ChatModal = ({ isOpen, onClose, user, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { socket, isConnected, sendMessage, onNewMessage, onMessageSent, markAsRead } = useSocket();

  // Load chat when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadChat();
    }
  }, [isOpen, user]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (message) => {
      if (message.chatId === chatId) {
        // Add new message to the END of the array (bottom)
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if chat is open
        if (message.senderId !== currentUserId) {
          markAsRead(chatId, [message._id]);
        }
      }
    };

    const handleMessageSent = (message) => {
      if (message.chatId === chatId) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => 
          m.tempId === message.tempId ? { ...message, isTemp: false } : m
        ));
        scrollToBottom();
      }
    };

    onNewMessage(handleNewMessage);
    onMessageSent(handleMessageSent);

    return () => {
      onNewMessage(null);
      onMessageSent(null);
    };
  }, [socket, chatId, currentUserId, onNewMessage, onMessageSent, markAsRead]);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await chatService.getPrivateChat(user._id);
      const chatData = response.data;
      setChatId(chatData.chatId);
      
      // Messages should already be in chronological order from backend
      // Oldest first, newest last
      const loadedMessages = chatData.messages || [];
      setMessages(loadedMessages);
      
      // Mark unread messages as read
      const unreadMessages = loadedMessages.filter(
        msg => msg.senderId !== currentUserId && !msg.isRead
      );
      if (unreadMessages?.length > 0) {
        await chatService.markAsRead(chatData.chatId, unreadMessages.map(m => m._id));
        markAsRead(chatData.chatId, unreadMessages.map(m => m._id));
      }
      
      // Scroll to bottom to show newest messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading chat:', error);
      
      if (error.status === 403 || error.code === 'NOT_CONNECTED') {
        setError('You can only chat with your connections. Please connect with this user first.');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(error.message || 'Failed to load chat. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    const tempId = Date.now().toString();
    setNewMessage('');
    setSending(true);
    setError(null);

    // Optimistic update - add to END of array (bottom)
    const tempMessage = {
      _id: tempId,
      text: messageText,
      sender: { firstName: 'You', lastName: '', _id: currentUserId },
      senderId: currentUserId,
      createdAt: new Date(),
      isRead: false,
      isTemp: true,
      tempId
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(chatId, messageText);
      
      if (socket && isConnected) {
        sendMessage(user._id, messageText, tempId);
      }
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...response.data, isTemp: false } : msg
      ));
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.status === 403 || error.code === 'NOT_CONNECTED') {
        setError('You are no longer connected with this user.');
        setTimeout(() => onClose(), 2000);
      } else {
        setError('Failed to send message. Please try again.');
      }
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-purple-200 text-xs">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 m-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages - Display in order (oldest top, newest bottom) */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 flex flex-col"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation with {user?.firstName}!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = !isOwn && (!messages[index - 1] || 
                  messages[index - 1]?.senderId !== message.senderId);
                
                return (
                  <div
                    key={message._id || index}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                      message.isTemp ? 'opacity-70' : ''
                    }`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
                      {!isOwn && showAvatar && message.sender && (
                        <div className="flex items-center space-x-2 mb-1 ml-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {message.sender.firstName?.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {message.sender.firstName}
                          </p>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                          isOwn ? 'text-purple-200' : 'text-gray-400'
                        }`}>
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn && message.readBy?.length > 0 && (
                            <span title="Read">✓✓</span>
                          )}
                          {message.isTemp && (
                            <span className="animate-pulse">sending...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${user?.firstName}...`}
                rows="1"
                disabled={sending || !!error}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-400"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !!error}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim() && !sending && !error
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;