import { useState, useRef } from 'react';

const ChatInput = ({ activeChat, onSendMessage, onSendTyping, isConnected }) => {
  const [text, setText] = useState('');
  const typingRef = useRef(null);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const t = text.trim();
    setText('');
    try {
      await onSendMessage(activeChat.chatId, t, activeChat.user?._id);
    } catch (err) {
      console.error('Send failed', err);
      setText(t);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!activeChat || !onSendTyping) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    onSendTyping(activeChat.chatId, activeChat.user?._id, true);
    typingRef.current = setTimeout(() => {
      onSendTyping(activeChat.chatId, activeChat.user?._id, false);
    }, 1000);
  };

  return (
    <form onSubmit={send} className="bg-white border-t border-gray-200 p-4">
      <div className="flex gap-3">
        <input value={text} onChange={handleChange} disabled={!activeChat} placeholder={!activeChat ? 'Select a chat' : `Message ${activeChat.user?.firstName || '...' }`} className="flex-1 px-4 py-2 border border-gray-300 rounded-full" />
        <button type="submit" disabled={!text.trim() || !activeChat} className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 21L21 12L2 3V10L15 12L2 14V21Z" fill="currentColor"/></svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput;