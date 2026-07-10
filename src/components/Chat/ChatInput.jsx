import { useState, useRef, useCallback, useEffect } from 'react';

const ChatInput = ({ chatId, receiverId, onSendMessage, onSendTyping, isConnected }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  // Debounced typing indicator – stops sending after 2s of inactivity
  const handleTyping = useCallback(
    (isTyping) => {
      if (!receiverId || !isConnected) return;
      onSendTyping(chatId, receiverId, isTyping);
    },
    [chatId, receiverId, onSendTyping, isConnected]
  );

  const onTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Notify typing start
    if (newText.length > 0 && !typingTimeoutRef.current) {
      handleTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!receiverId) {
      console.warn('No receiverId – cannot send message');
      return;
    }
    onSendMessage(chatId, text.trim(), receiverId);
    setText('');
    // Stop typing after sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    handleTyping(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        handleTyping(false);
      }
    };
  }, [handleTyping]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white flex items-end space-x-2">
      <input
        type="text"
        value={text}
        onChange={onTextChange}
        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        disabled={!isConnected}
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!text.trim() || !isConnected}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2 px-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;