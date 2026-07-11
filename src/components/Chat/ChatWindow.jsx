import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatInfoDrawer from './ChatInfoDrawer';

const ChatWindow = ({
  activeChat,
  messages,
  isLoading,
  currentUser,
  onSendMessage,
  onSendTyping,
  isConnected,
  onBack,
  typingUsers,
  onDeleteChat,
  onPinChat,
  onMuteChat,
  onDeleteMessage,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-l border-gray-200 h-full">
        <div className="text-gray-400 mb-4 scale-150">💻</div>
        <p className="text-xl text-gray-500 font-light">Select a chat to start messaging</p>
        <p className="text-sm text-gray-400 mt-2">End-to-end connections</p>
      </div>
    );
  }

  const isGroup = activeChat.type === 'group';
  const otherUser = isGroup ? null : (activeChat.user || activeChat.participants?.find((p) => p._id !== currentUser?._id));
  const receiverId = isGroup ? null : otherUser?._id;

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-50 relative">
      <div className={`flex flex-col flex-1 h-full transition-all duration-300 ${showInfo ? 'mr-80' : ''}`}>
        <ChatHeader
          chat={activeChat}
          currentUser={currentUser}
          onBack={onBack}
          isConnected={isConnected}
          onAvatarClick={() => setShowInfo(!showInfo)}
          onDeleteChat={onDeleteChat}
          onPinChat={onPinChat}
          onMuteChat={onMuteChat}
        />
        <MessageList
          messages={messages}
          isLoading={isLoading}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onDeleteMessage={onDeleteMessage}
          onReply={setReplyingTo}
        />
        <ChatInput
          chatId={activeChat.chatId}
          receiverId={receiverId}
          onSendMessage={(chatId, text, recId) => {
            onSendMessage(chatId, text, recId, replyingTo);
            setReplyingTo(null);
          }}
          onSendTyping={onSendTyping}
          isConnected={isConnected}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {showInfo && (
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 absolute right-0 h-full z-10 shadow-lg transform transition-transform duration-300">
          <ChatInfoDrawer isOpen={true} chat={activeChat} currentUser={currentUser} onClose={() => setShowInfo(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;