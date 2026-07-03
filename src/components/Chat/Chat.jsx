import { useState, useEffect } from 'react';
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

  useEffect(() => { fetch(); async function fetch(){ try{ const r = await chatService.getChats(); setConversations(r.data||r||[]); }catch(e){console.error(e);} } }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-private-message', (m) => {
      if (activeChat?.chatId === m.chatId) setMessages(prev=>[...prev,m]);
      // update conversations list
    });
    return () => { socket.off('new-private-message'); };
  }, [socket, activeChat]);

  const openChat = async (conv) => {
    setActiveChat(conv);
    setLoadingMessages(true);
    try {
      const res = await chatService.getMessages(conv.chatId,1,100);
      const msgs = (res.data?.messages || res.messages || res.data || res) || [];
      setMessages(msgs.map(m => ({ ...m, isOwn: m.senderId === user._id })));
    } catch (err) { console.error(err); setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  const sendMessage = async (chatId, text, receiverId) => {
    try {
      // optimistic UI
      const temp = { _id: `tmp_${Date.now()}`, text, senderId: user._id, createdAt: new Date().toISOString(), isOwn: true };
      setMessages(prev=>[...prev,temp]);
      if (isConnected && socket) {
        socket.emit('private-message', { toUserId: receiverId, text, chatId });
      } else {
        // fallback REST
        await chatService.sendMessage(chatId, text);
      }
    } catch (err) { console.error('sendMessage failed', err); }
  };

  const sendTyping = (chatId, receiverId, isTyping) => {
    if (!socket || !isConnected) return;
    socket.emit(isTyping ? 'typing-start' : 'typing-end', { toUserId: receiverId, chatId });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatList activeChat={activeChat} onSelectChat={openChat} currentUser={user} />
      <ChatWindow activeChat={activeChat} messages={messages} isLoading={loadingMessages} currentUser={user} onSendMessage={sendMessage} onSendTyping={sendTyping} isConnected={isConnected} onBack={()=>setActiveChat(null)} />
    </div>
  );
};

export default Chat;