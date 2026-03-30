import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Chat = ({ isOpen, onClose, initialChatId, initialUserId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isOpen) {
      const newSocket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('new-message', (message) => {
        if (selectedChat?.chatId === message.chatId) {
          setMessages(prev => [...prev, message]);
          // Mark as read if viewing this chat
          newSocket.emit('mark-read', { chatId: message.chatId });
        }
        // Update chat list
        fetchChats();
      });

      newSocket.on('user-typing', (data) => {
        if (selectedChat?.chatId === data.chatId) {
          setUserTyping(data.isTyping);
        }
      });

      newSocket.on('messages-read', (data) => {
        if (selectedChat?.chatId === data.chatId) {
          setMessages(prev => prev.map(msg => 
            data.messageIds?.includes(msg._id) ? { ...msg, isRead: true } : msg
          ));
        }
      });

      newSocket.on('message-deleted', (data) => {
        if (selectedChat?.chatId === data.chatId) {
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId ? { ...msg, text: 'This message was deleted', isDeleted: true } : msg
          ));
        }
        fetchChats();
      });

      newSocket.on('user-online', (data) => {
        setOnlineStatus(prev => ({ ...prev, [data.userId]: true }));
      });

      newSocket.on('user-offline', (data) => {
        setOnlineStatus(prev => ({ ...prev, [data.userId]: false }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen, selectedChat?.chatId]);

  // Join chat room when selecting a chat
  useEffect(() => {
    if (socket && selectedChat?.chatId) {
      socket.emit('join-chat-room', selectedChat.chatId);
      // Mark messages as read
      socket.emit('mark-read', { chatId: selectedChat.chatId });
      
      // Check online status of other user
      if (selectedChat.user?._id) {
        socket.emit('get-user-status', selectedChat.user._id);
      }
      
      return () => {
        socket.emit('leave-chat-room', selectedChat.chatId);
      };
    }
  }, [socket, selectedChat?.chatId]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!typing && e.target.value.trim()) {
      setTyping(true);
      socket?.emit('typing-start', { 
        chatId: selectedChat?.chatId,
        toUserId: selectedChat?.user?._id
      });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (typing) {
        setTyping(false);
        socket?.emit('typing-end', { 
          chatId: selectedChat?.chatId,
          toUserId: selectedChat?.user?._id
        });
      }
    }, 1000);
  };

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      setError(null);
      
      const response = await api.get("/chats");
      console.log("Chats response:", response.data);
      
      if (response.data.success) {
        setChats(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError(error.response?.data?.error || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Fetch specific chat messages
  const fetchChatMessages = async (chatId) => {
    setLoading(true);
    try {
      const response = await api.get(`/chats/${chatId}`);
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
        setSelectedChat(prev => ({
          ...prev,
          ...response.data.data
        }));
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(error.response?.data?.error || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);
    
    // Stop typing indicator
    if (typing) {
      socket?.emit('typing-end', { 
        chatId: selectedChat?.chatId,
        toUserId: selectedChat?.user?._id
      });
      setTyping(false);
    }

    // Optimistic update
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      text: messageText,
      senderId: currentUser._id,
      createdAt: new Date(),
      isRead: false,
      isOwn: true,
      sending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);

    try {
      // Use socket for real-time if available, fallback to REST API
      if (socket && socket.connected) {
        socket.emit('send-message', {
          chatId: selectedChat.chatId,
          text: messageText,
          tempId: tempMessage._id
        });
        
        socket.once('message-sent', (data) => {
          if (data.tempId === tempMessage._id) {
            setMessages(prev => prev.map(msg => 
              msg._id === tempMessage._id ? { ...data, isOwn: true } : msg
            ));
          }
        });
        
        socket.once('message-error', (data) => {
          if (data.tempId === tempMessage._id) {
            setMessages(prev => prev.map(msg => 
              msg._id === tempMessage._id ? { ...msg, failed: true, error: data.error } : msg
            ));
            setNewMessage(messageText);
            alert(data.error);
          }
        });
      } else {
        // Fallback to REST API
        const response = await api.post(`/chats/${selectedChat.chatId}/messages`, {
          text: messageText
        });

        if (response.data.success) {
          setMessages(prev => prev.map(msg => 
            msg._id === tempMessage._id ? response.data.data : msg
          ));
        }
      }
      
      // Update chat list
      fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id 
          ? { ...msg, failed: true, error: error.response?.data?.error }
          : msg
      ));
      setNewMessage(messageText);
      alert(error.response?.data?.error || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete chat (archive)
  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(chat => chat.chatId !== chatId));
      if (selectedChat?.chatId === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert(error.response?.data?.error || "Failed to delete chat");
    }
  };

  // Pin/Unpin chat
  const togglePinChat = async (chatId, isPinned) => {
    try {
      await api.put(`/chats/${chatId}/pin`, { pin: !isPinned });
      fetchChats();
    } catch (error) {
      console.error("Error pinning chat:", error);
      alert(error.response?.data?.error || "Failed to pin chat");
    }
  };

  // Mute/Unmute chat
  const toggleMuteChat = async (chatId, isMuted) => {
    try {
      await api.put(`/chats/${chatId}/mute`, { mute: !isMuted });
      fetchChats();
    } catch (error) {
      console.error("Error muting chat:", error);
      alert(error.response?.data?.error || "Failed to mute chat");
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/chats/${selectedChat.chatId}/messages/${messageId}`);
      if (socket) {
        socket.emit('delete-message', {
          chatId: selectedChat.chatId,
          messageId: messageId
        });
      }
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, text: 'This message was deleted', isDeleted: true } : msg
      ));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert(error.response?.data?.error || "Failed to delete message");
    }
  };

  // Create or get private chat
  const createOrGetChat = async (userId) => {
    setLoading(true);
    try {
      const response = await api.post(`/chats/private/${userId}`);
      
      if (response.data.success) {
        const chatData = response.data.data;
        
        const newChat = {
          chatId: chatData.chatId,
          type: chatData.type,
          user: chatData.user,
          lastMessage: null,
          unreadCount: 0,
          updatedAt: new Date(),
          connectionStatus: chatData.connectionStatus
        };
        
        setSelectedChat(newChat);
        setMessages(chatData.messages || []);
        
        setChats(prev => {
          const exists = prev.find(c => c.chatId === chatData.chatId);
          if (!exists) {
            return [newChat, ...prev];
          }
          return prev;
        });
        
        if (isMobileView) {
          setShowChatList(false);
        }
        
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      if (error.response?.data?.code === 'NOT_CONNECTED') {
        alert("You can only chat with your accepted connections");
      } else {
        setError(error.response?.data?.error || "Failed to create chat");
      }
    } finally {
      setLoading(false);
    }
  };

  // Select a chat
  const selectChat = async (chat) => {
    setSelectedChat(chat);
    await fetchChatMessages(chat.chatId);
    
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  // Format time
  const formatMessageTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffMins = Math.floor((now - messageDate) / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const formatChatDate = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate >= today) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate >= yesterday) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Load chats when component opens
  useEffect(() => {
    if (isOpen) {
      fetchChats();
      if (inputRef.current) {
        setTimeout(() => inputRef.current.focus(), 100);
      }
    }
  }, [isOpen, fetchChats]);

  // Handle initial chat selection
  useEffect(() => {
    if (isOpen && chats.length > 0 && initialChatId) {
      const chat = chats.find(c => c.chatId === initialChatId);
      if (chat) selectChat(chat);
    }
  }, [chats, initialChatId, isOpen]);

  // Handle initial user chat
  useEffect(() => {
    if (isOpen && initialUserId && !selectedChat) {
      createOrGetChat(initialUserId);
    }
  }, [initialUserId, isOpen]);

  // Filter chats
  const filteredChats = chats.filter(chat => {
    if (!chat.user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (chat.user.firstName?.toLowerCase() || '').includes(searchLower) ||
      (chat.user.lastName?.toLowerCase() || '').includes(searchLower) ||
      (chat.lastMessage?.text?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-[90vh] sm:max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            {(isMobileView && !showChatList && selectedChat) && (
              <button 
                onClick={() => setShowChatList(true)} 
                className="hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                ← Back
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {!showChatList && selectedChat ? selectedChat.user?.firstName : 'DivTinder Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!showChatList && selectedChat && (
              <>
                <button 
                  onClick={() => togglePinChat(selectedChat.chatId, selectedChat.isPinned)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-all"
                  title={selectedChat.isPinned ? "Unpin chat" : "Pin chat"}
                >
                  📌
                </button>
                <button 
                  onClick={() => setShowMenu(selectedChat.chatId)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  ⋮
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              className="hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chat Menu Dropdown */}
        {showMenu === selectedChat?.chatId && (
          <div className="absolute right-4 top-16 bg-white rounded-lg shadow-xl border z-50 w-48">
            <button
              onClick={() => {
                togglePinChat(selectedChat.chatId, selectedChat.isPinned);
                setShowMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <span>{selectedChat?.isPinned ? '📌 Unpin' : '📌 Pin'}</span>
            </button>
            <button
              onClick={() => {
                toggleMuteChat(selectedChat.chatId, selectedChat.isMuted);
                setShowMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <span>{selectedChat?.isMuted ? '🔊 Unmute' : '🔇 Mute'}</span>
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(selectedChat.chatId);
                setShowMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <span>🗑 Delete Chat</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm === selectedChat?.chatId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Chat?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete the chat history. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(selectedChat.chatId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Chat List Sidebar */}
          {(showChatList || !isMobileView) && (
            <div className={`${isMobileView ? 'w-full' : 'w-80'} border-r bg-gray-50 flex flex-col`}>
              <div className="p-3 bg-white border-b">
                <input
                  type="text"
                  placeholder="Search or start new chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingChats ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]"></div>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-5xl mb-3">💬</div>
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Connect with people to start chatting</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.chatId}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-all ${
                        selectedChat?.chatId === chat.chatId ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={chat.user?.photoUrl || `https://ui-avatars.com/api/?name=${chat.user?.firstName}+${chat.user?.lastName}&background=random&color=fff&size=50`}
                          alt={chat.user?.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${chat.user?.firstName}+${chat.user?.lastName}&background=random&color=fff&size=50`;
                          }}
                        />
                        {onlineStatus[chat.user?._id] && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => selectChat(chat)}
                      >
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">
                            {chat.user?.firstName} {chat.user?.lastName}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {chat.lastMessage && formatChatDate(chat.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {chat.lastMessage?.isOwn && (
                            <span className="text-xs text-gray-400">You: </span>
                          )}
                          <p className="text-sm text-gray-500 truncate flex-1">
                            {chat.lastMessage?.isDeleted ? 'Message deleted' : (chat.lastMessage?.text || "No messages yet")}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-[#25D366] text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center ml-2">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(chat.chatId);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        ⋮
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          {(!showChatList || !isMobileView) && (
            <div className="flex-1 flex flex-col bg-[#E5DDD5]">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#075E54] text-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedChat.user?.photoUrl || `https://ui-avatars.com/api/?name=${selectedChat.user?.firstName}+${selectedChat.user?.lastName}&background=random&color=fff&size=40`}
                        alt={selectedChat.user?.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${selectedChat.user?.firstName}+${selectedChat.user?.lastName}&background=random&color=fff&size=40`;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">
                          {selectedChat.user?.firstName} {selectedChat.user?.lastName}
                        </h3>
                        <p className="text-xs text-green-300">
                          {userTyping ? 'Typing...' : (onlineStatus[selectedChat.user?._id] ? 'Online' : 'Offline')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(`/profile/${selectedChat.user?._id}`, '_blank')}
                      className="p-2 hover:bg-white/20 rounded-full transition-all"
                    >
                      ℹ️
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-2"
                    style={{
                      backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")',
                      backgroundRepeat: 'repeat'
                    }}
                  >
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                        <div className="text-5xl mb-3">💬</div>
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm mt-1">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className="relative max-w-[70%]">
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                msg.isOwn
                                  ? 'bg-[#DCF8C6] rounded-br-sm'
                                  : 'bg-white rounded-bl-sm shadow'
                              } ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
                            >
                              <p className="text-sm break-words">{msg.text}</p>
                              <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                                msg.isOwn ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                <span>{formatMessageTime(msg.createdAt)}</span>
                                {msg.isOwn && !msg.isDeleted && (
                                  <span>{msg.sending ? '⌛' : msg.isRead ? '✓✓' : '✓'}</span>
                                )}
                              </div>
                            </div>
                            {msg.isOwn && !msg.isDeleted && !msg.sending && (
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-200 rounded-full hover:bg-red-200"
                                title="Delete message"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-3 bg-[#075E54]">
                    <div className="flex gap-2 bg-white rounded-full px-4 py-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message"
                        className="flex-1 py-2 focus:outline-none bg-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className={`p-2 rounded-full transition-all ${
                          newMessage.trim() && !sendingMessage
                            ? 'text-[#25D366] hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {sendingMessage ? '⌛' : '📤'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-100">
                  <div className="text-8xl mb-4">💬</div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">DivTinder Chat</h3>
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;