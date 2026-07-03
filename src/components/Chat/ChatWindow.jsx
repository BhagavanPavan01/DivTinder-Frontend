import { useEffect, useRef } from 'react';
import ChatInput from './ChatInput';

const MessageBubble = ({ msg, isOwn }) => (
  <div className={`my-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className={`${isOwn ? 'bg-green-500 text-white' : 'bg-white text-gray-900'} px-4 py-2 rounded-lg shadow max-w-[70%]`}>
      <div className="text-sm">{msg.text}</div>
      <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  </div>
);

const ChatWindow = ({ activeChat, messages = [], isLoading, currentUser, onSendMessage, onSendTyping, isConnected, onBack, typingUsers = {} }) => {
  const endRef = useRef(null);

  const otherUser = activeChat?.user;
  const isTyping = otherUser?._id && typingUsers[otherUser._id];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  if (!activeChat) return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h3 className="text-xl font-normal text-gray-800 mb-2">Select a chat to start messaging</h3>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-3 shadow-sm flex items-center">
        <button onClick={onBack} className="md:hidden p-2 mr-2">Back</button>
        <img src={activeChat.user?.photoUrl || '/default-avatar.png'} alt="av" className="w-10 h-10 rounded-full mr-3" />
        <div>
          <div className="font-semibold text-gray-900">{activeChat.user?.firstName} {activeChat.user?.lastName}</div>
          <div className="text-sm text-gray-500">
            {isTyping ? (
              <span className="text-green-500 font-medium animate-pulse">typing...</span>
            ) : (
              activeChat.user?.status === 'online' ? 'Online' : 'Offline'
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet</div>
        ) : (
          messages.map(m => (
            <MessageBubble key={m._id} msg={m} isOwn={m.senderId === currentUser?._id} />
          ))
        )}

        {isTyping && (
          <div className="my-2 flex justify-start">
            <div className="bg-white text-gray-400 px-4 py-2.5 rounded-lg shadow max-w-[70%] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <ChatInput activeChat={activeChat} onSendMessage={onSendMessage} onSendTyping={onSendTyping} isConnected={isConnected} />
    </div>
  );
};

export default ChatWindow;