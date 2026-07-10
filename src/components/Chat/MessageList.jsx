import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, isLoading, currentUser, typingUsers }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto flex items-center justify-center text-gray-400">
                <p>No messages yet. Say hello!</p>
            </div>
        );
    }

    // Group messages by date if needed (optional)

    const isTyping = Object.values(typingUsers).some((v) => v === true);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
                <MessageBubble key={msg._id} message={msg} currentUser={currentUser} />
            ))}
            {isTyping && (
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <span>Someone is typing</span>
                    <span className="animate-pulse">...</span>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;