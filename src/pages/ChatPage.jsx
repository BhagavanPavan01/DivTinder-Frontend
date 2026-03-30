import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatWindow, setShowChatWindow] = useState(true);
  const { joinPrivateChat, joinGlobalChat } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userId) {
      // Open chat with specific user
      openChatWithUser(userId);
    }
  }, [userId, user]);

  const openChatWithUser = async (userId) => {
    try {
      const response = await chatService.getPrivateChat(userId);
      const chatData = response.data;
      setSelectedChat({
        chatId: chatData.chatId,
        type: 'private',
        user: chatData.participants?.find(p => p._id !== user?._id)
      });
      setShowChatWindow(true);
      joinPrivateChat(userId);
    } catch (error) {
      console.error('Failed to open chat:', error);
      if (error.response?.status === 403) {
        alert('You can only chat with your connections');
        navigate('/connections');
      }
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowChatWindow(true);
    
    if (chat.type === 'private') {
      joinPrivateChat(chat.user?._id);
    } else {
      joinGlobalChat();
    }
  };

  const handleCloseChat = () => {
    setShowChatWindow(false);
    setSelectedChat(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-100">
      <div className="container mx-auto h-full py-8 px-4">
        <div className="flex h-full gap-4">
          {/* Chat List Sidebar */}
          <div className="w-96 h-full">
            <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChat?.chatId} />
          </div>
          
          {/* Chat Window */}
          {showChatWindow && selectedChat && (
            <div className="flex-1 h-full">
              <ChatWindow chat={selectedChat} onClose={handleCloseChat} />
            </div>
          )}
          
          {/* Empty State */}
          {!showChatWindow && (
            <div className="flex-1 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Chat</h3>
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;