import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            handleStopTyping();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);

        if (!isTyping && e.target.value) {
            setIsTyping(true);
            if (onTyping) onTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                if (onTyping) onTyping(false);
            }
        }, 1000);
    };

    const handleStopTyping = () => {
        if (isTyping) {
            setIsTyping(false);
            if (onTyping) onTyping(false);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        rows="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-400"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-all duration-200 ${
                        message.trim()
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatInput;