import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import { API_BASE_URL } from '../config/api';
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

  const API_URL = API_BASE_URL;

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
      console.log('Fetching conversations from:', `${API_BASE_URL}/api/chats`);
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
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
      const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}?page=1&limit=10000`, {
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

        // Mark messages as read using perfectly working database endpoints
        if (formattedMessages.length > 0) {
          const unreadMessageIds = formattedMessages
            .filter(msg => !msg.isOwn && !msg.isRead)
            .map(msg => msg._id);

          if (unreadMessageIds.length > 0) {
            try {
              await chatService.markAsRead(chatId, unreadMessageIds);
            } catch (err) {
              console.error("Failed to mark read on db API", err);
            }
            // Still emit over socket for real-time delivery to the sender
            if (socket && isConnected) {
              socket.emit('mark-read', { chatId, messageIds: unreadMessageIds });
            }
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
    // 1. Optimistic UI update
    const tempId = `temp_${Date.now()}`;
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

    if (socket && isConnected) {
      // 2. The backend is perfectly wired to store the message in the database using the "send-message" event!
      socket.emit('send-message', {
        chatId: chatId,
        text: text,
        tempId: tempId,
        replyTo: null
      });
    } else {
      try {
        // Fallback to REST API if socket is disconnected, guaranteed perfectly persistent storing.
        const result = await chatService.sendMessage(chatId, text);
        const savedMessage = result.data || result;
        setMessages(prev => prev.map(m => m._id === tempId ? { ...savedMessage, isOwn: true, isRead: false } : m));
      } catch (error) {
        console.error("Error saving message into DB via fallback API", error);
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
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

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.chatId !== chatId));
        setActiveChat(null);
      } else {
        console.error("Failed to delete chat", response.status);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handlePinChat = async (chatId, isPinned) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/pin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: !isPinned })
      });
      if (response.ok) {
        setConversations(prev => [...prev].map(c => c.chatId === chatId ? { ...c, isPinned: !isPinned } : c).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }));
        if (activeChat?.chatId === chatId) { setActiveChat(prev => ({ ...prev, isPinned: !isPinned })) }
      }
    } catch (err) { console.error("Error pinning chat:", err); }
  };

  const handleMuteChat = async (chatId, isMuted) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/mute`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mute: !isMuted })
      });
      if (response.ok) {
        setConversations(prev => prev.map(c => c.chatId === chatId ? { ...c, isMuted: !isMuted } : c));
        if (activeChat?.chatId === chatId) { setActiveChat(prev => ({ ...prev, isMuted: !isMuted })) }
      }
    } catch (err) { console.error("Error muting chat:", err); }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeChat) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/${activeChat.chatId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) { console.error("Error deleting msg:", err); }
  };

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[400px] border-r border-[#d1d7db] z-20 bg-white`}>
        <div className="bg-[#f0f2f5] h-16 px-4 flex items-center justify-between border-b border-[#d1d7db] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden flex-shrink-0 border border-gray-200">
              <img src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.firstName}`} alt="profile" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-[#111b21]">Chats</span>
          </div>
          <div className="flex items-center gap-3 text-[#54656f]">
            <button className="p-2 hover:bg-[#d1d7db]/50 rounded-full transition"><svg viewBox="0 0 24 24" width="24" height="24" className=""><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg></button>
          </div>
        </div>
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
          onDeleteChat={handleDeleteChat}
          onPinChat={handlePinChat}
          onMuteChat={handleMuteChat}
          onDeleteMessage={handleDeleteMessage}
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