import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

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
}) => {
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const receiverId = activeChat.participants?.find((p) => p._id !== currentUser?._id)?._id;

  return (
    <>
      <ChatHeader
        chat={activeChat}
        currentUser={currentUser}
        onBack={onBack}
        isConnected={isConnected}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUser={currentUser}
        typingUsers={typingUsers}
      />
      <ChatInput
        chatId={activeChat.chatId}
        receiverId={receiverId}
        onSendMessage={onSendMessage}
        onSendTyping={onSendTyping}
        isConnected={isConnected}
      />
    </>
  );
};

export default ChatWindow;