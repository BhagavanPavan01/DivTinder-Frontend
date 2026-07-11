import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, isLoading, currentUser, typingUsers, onDeleteMessage, onReply }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="w-48 h-12 bg-white/50 backdrop-blur-sm rounded-lg animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    const isTyping = Object.values(typingUsers).some((v) => v === true);

    return (
        <div
            className="flex-1 overflow-y-auto p-4 space-y-2 relative"
            style={{
                backgroundColor: '#efeae2',
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundRepeat: 'repeat'
            }}
        >
            {!messages || messages.length === 0 ? (
                <div className="flex items-center justify-center text-[#54656f] mt-10">
                    <span className="bg-[#FFEECD] px-4 py-2 rounded-lg text-sm shadow-sm text-center">
                        Messages are end-to-end encrypted. No one outside of this chat, not even divTinder, can read or listen to them.
                    </span>
                </div>
            ) : (
                messages.map((msg) => (
                    <MessageBubble key={msg._id} message={msg} currentUser={currentUser} onDelete={onDeleteMessage} onReply={onReply} />
                ))
            )}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-[#54656f] text-sm flex items-center gap-1">
                        typing <span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span><span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;