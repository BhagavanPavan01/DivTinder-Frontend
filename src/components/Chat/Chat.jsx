import { useState, useEffect, useCallback } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';

const Chat = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await chatService.getChats();
      const data = res?.data || res || [];
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch conversations failed:', err);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeChat?.chatId === msg.chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, { ...msg, isOwn: msg.senderId === user?._id }];
        });
      }
      fetchConversations();
    };

    const handleTypingStart = ({ userId, chatId }) => {
      if (activeChat?.chatId === chatId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      }
    };

    const handleTypingEnd = ({ userId, chatId }) => {
      if (activeChat?.chatId === chatId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: false }));
      }
    };

    socket.on('new-private-message', handleNewMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-end', handleTypingEnd);

    return () => {
      socket.off('new-private-message', handleNewMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-end', handleTypingEnd);
    };
  }, [socket, activeChat, user, fetchConversations]);

  const openChat = async (conv) => {
    setActiveChat(conv);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await chatService.getMessages(conv.chatId, 1, 100);
      const msgs = res?.data?.messages || res?.messages || res?.data || res || [];
      const messageList = Array.isArray(msgs) ? msgs : [];
      setMessages(
        messageList.map((m) => ({
          ...m,
          isOwn: m.senderId === user?._id,
        }))
      );
    } catch (err) {
      console.error('Fetch messages failed:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (chatId, text, receiverId, replyToMsg) => {
    if (!text?.trim()) return;

    const replyToData = replyToMsg ? {
      _id: replyToMsg._id,
      text: replyToMsg.text,
    } : null;

    const tempMessage = {
      _id: `tmp_${Date.now()}`,
      text: text.trim(),
      senderId: user._id,
      createdAt: new Date().toISOString(),
      isOwn: true,
      pending: true,
      replyTo: replyToMsg ? replyToMsg._id : null,
      replyToText: replyToMsg ? replyToMsg.text : null,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      if (isConnected && socket) {
        socket.emit('private-message', {
          toUserId: receiverId,
          text: text.trim(),
          chatId,
          replyTo: replyToMsg ? replyToMsg._id : null,
        });
      } else {
        await chatService.sendMessage(chatId, text.trim(), replyToMsg ? replyToMsg._id : null);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempMessage._id ? { ...m, pending: false } : m
        )
      );
      fetchConversations();
    } catch (err) {
      console.error('Send message failed:', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
    }
  };

  const sendTyping = (chatId, receiverId, isTyping) => {
    if (!socket || !isConnected) return;
    socket.emit(isTyping ? 'typing-start' : 'typing-end', {
      toUserId: receiverId,
      chatId,
    });
  };

  const handleBack = () => {
    setActiveChat(null);
    setMessages([]);
  };

  const deleteMessage = async (messageId) => {
    if (!activeChat) return;
    try {
      await chatService.deleteMessage(activeChat.chatId, messageId);
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, isDeleted: true, text: 'This message was deleted' } : msg
      ));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-1/3 border-r border-gray-200 min-w-[280px]">
        <ChatList
          conversations={conversations}
          activeChat={activeChat}
          onSelectChat={openChat}
          currentUser={user}
          loading={loadingConversations}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          isLoading={loadingMessages}
          currentUser={user}
          onSendMessage={sendMessage}
          onSendTyping={sendTyping}
          isConnected={isConnected}
          onBack={handleBack}
          typingUsers={typingUsers}
          onDeleteMessage={deleteMessage}
        />
      </div>
    </div>
  );
};

export default Chat;