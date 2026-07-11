import { useState, useRef, useCallback, useEffect } from 'react';

const ChatInput = ({ chatId, receiverId, onSendMessage, onSendTyping, isConnected, replyingTo, onCancelReply }) => {
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
    <div className="flex flex-col w-full z-10 flex-shrink-0 bg-[#f0f2f5] border-t border-gray-200">
      {replyingTo && (
        <div className="flex items-center justify-between p-3 bg-black/5 mx-2 mt-2 rounded border-l-4 border-purple-500">
          <div className="flex flex-col text-sm pr-4">
            <span className="font-semibold text-purple-600">Replying to</span>
            <span className="text-gray-600 truncate">{replyingTo.text || 'Message'}</span>
          </div>
          <button onClick={onCancelReply} className="text-gray-500 hover:text-gray-800">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-2.5 flex items-center space-x-2 w-full">
        <button type="button" onClick={() => alert("Emoji picker coming soon!")} className="p-2 text-[#54656f] hover:bg-white/50 rounded-full transition-colors flex-shrink-0">
          <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
        </button>
        <button type="button" onClick={() => alert("File attachment upload interface ready to be connected to backend!")} className="p-2 text-[#54656f] hover:bg-white/50 rounded-full transition-colors flex-shrink-0">
          <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M19 12h-6v6h-2v-6H5v-2h6V4h2v6h6v2z"></path></svg>
        </button>

        <div className="flex-1 bg-white rounded-lg flex items-center border border-transparent focus-within:border-white shadow-sm overflow-hidden py-1 px-3 min-h-[40px]">
          <input
            type="text"
            value={text}
            onChange={onTextChange}
            placeholder={isConnected ? 'Type a message' : 'Connecting...'}
            disabled={!isConnected}
            className="w-full bg-transparent border-none outline-none text-[15px] text-[#111b21] placeholder:text-[#8696a0]"
          />
        </div>

        {text.trim() ? (
          <button
            type="submit"
            disabled={!isConnected}
            className="p-2 bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0 ml-1 flex items-center justify-center w-10 h-10 shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current" style={{ transform: 'translateX(2px)' }}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        ) : (
          <button type="button" className="p-2 text-[#54656f] hover:bg-white/50 rounded-full transition-colors flex-shrink-0 ml-1 w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path></svg>
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;