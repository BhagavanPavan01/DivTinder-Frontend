import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import { API_BASE_URL } from '../../config/api';

const ChatModal = ({ isOpen, onClose, user, currentUserId }) => {
    const { token } = useAuth();
    const { socket, isConnected, onlineUsers } = useSocket();
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll messages list to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, otherUserTyping]);

    // Initialise chat session and load history
    useEffect(() => {
        const initChat = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                setError(null);

                // Fetch or create private chat
                const result = await chatService.getPrivateChat(user._id);
                const chatData = result.data || result;
                const activeChatId = chatData.chatId || chatData._id;

                if (!activeChatId) {
                    throw new Error('Received invalid chat session data');
                }

                setChatId(activeChatId);

                // Fetch messages history - try standard service first, then direct REST fallback
                let messagesData = [];
                try {
                    const res = await chatService.getMessages(activeChatId, 1, 100);
                    messagesData = res.data?.messages || res.messages || res.data || res;
                } catch (err) {
                    console.warn('chatService.getMessages fallback initiated', err);
                    const API_URL = API_BASE_URL;
                    const response = await fetch(`${API_URL}/api/chats/${activeChatId}?page=1&limit=100`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token') || token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const body = await response.json();
                        messagesData = body.data?.messages || body.messages || [];
                    } else {
                        throw new Error('Failed to fetch message history');
                    }
                }

                if (Array.isArray(messagesData)) {
                    setMessages(
                        messagesData.map((m) => ({
                            ...m,
                            isOwn: m.senderId === currentUserId || m.senderId?._id === currentUserId
                        }))
                    );
                }
            } catch (err) {
                console.error('ChatModal creation / messages retrieval failed:', err);
                setError('Failed to load chat history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            initChat();
        }
    }, [isOpen, user?._id, currentUserId, token]);

    // Escape key handler to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Socket event listeners
    useEffect(() => {
        if (!socket || !chatId) return;

        const handleNewMessage = (messageData) => {
            if (messageData.chatId === chatId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        _id: messageData._id,
                        text: messageData.text,
                        senderId: messageData.senderId,
                        createdAt: messageData.createdAt,
                        isOwn: messageData.senderId === currentUserId,
                        isRead: false
                    }
                ]);
                setOtherUserTyping(false);
            }
        };

        const handleMessageSent = (messageData) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageData.tempId ? { ...messageData, isOwn: true } : msg
                )
            );
        };

        const handleMessageError = ({ error, tempId }) => {
            console.error('Socket message placement failed:', error);
            if (tempId) {
                setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
            }
        };

        const handleUserTyping = ({ fromUserId, chatId: typingChatId, isTyping }) => {
            if (typingChatId === chatId && fromUserId !== currentUserId) {
                setOtherUserTyping(isTyping);
            }
        };

        socket.on('new-private-message', handleNewMessage);
        socket.on('message-sent', handleMessageSent);
        socket.on('message-error', handleMessageError);
        socket.on('user-typing', handleUserTyping);

        return () => {
            socket.off('new-private-message', handleNewMessage);
            socket.off('message-sent', handleMessageSent);
            socket.off('message-error', handleMessageError);
            socket.off('user-typing', handleUserTyping);
        };
    }, [socket, chatId, currentUserId]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!text.trim() || !chatId) return;

        const currentText = text.trim();
        setText('');

        // Emit typing end to socket
        if (socket && isConnected) {
            socket.emit('typing-end', { toUserId: user._id, chatId });
        }

        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const tempMessage = {
            _id: tempId,
            text: currentText,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
            isOwn: true,
            isRead: false,
            isTemp: true
        };

        setMessages((prev) => [...prev, tempMessage]);

        if (socket && isConnected) {
            socket.emit('private-message', {
                toUserId: user._id,
                text: currentText,
                tempId
            });
        } else {
            console.warn('Socket unavailable. Executing fallback HTTP message post.');
            try {
                await chatService.sendMessage(chatId, currentText);
            } catch (err) {
                console.error('Failed to send fallback chat message:', err);
                // Evict optimistic message chunk
                setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
                setError('Network error: Message could not be sent.');
                setTimeout(() => setError(null), 4000);
            }
        }
    };

    const handleInputChange = (e) => {
        setText(e.target.value);

        if (!socket || !isConnected || !chatId) return;

        // Send typing start notification
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing-start', { toUserId: user._id, chatId });
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing-end', { toUserId: user._id, chatId });
        }, 2000);
    };

    const isOnline = onlineUsers?.has(user?._id) || user?.status === 'online';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-lg h-[600px] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">

                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {user.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </div>
                            )}
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg leading-tight">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs text-white/80">
                                {isOnline ? 'Active Now' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/90 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 flex flex-col gap-3">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Securing message link...</p>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <span className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </span>
                            <p className="text-sm text-gray-600 font-medium">{error}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h4 className="text-gray-800 font-semibold mb-1">Start a conversation</h4>
                            <p className="text-xs text-gray-500">Say hello to {user.firstName}! Share profiles, discuss projects, or collaborate.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex flex-col max-w-[75%] ${msg.isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                                <div
                                    className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.isOwn
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    {msg.text}
                                </div>

                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {msg.isOwn && (
                                        <span className="ml-1 text-purple-500 font-medium">
                                            {msg.isTemp ? '•' : '✓'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {otherUserTyping && (
                        <div className="self-start flex flex-col items-start max-w-[75%]">
                            <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="bg-white border-t border-gray-100 p-4">
                    <form onSubmit={handleSend} className="flex gap-2.5 items-center">
                        <input
                            type="text"
                            value={text}
                            onChange={handleInputChange}
                            disabled={loading || !!error}
                            placeholder={`Message ${user.firstName || '...'}`}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-50 text-black placeholder:text-gray-400"
                        />

                        <button
                            type="submit"
                            disabled={loading || !text.trim() || !!error}
                            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl w-11 h-11 flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0 shadow-md shadow-pink-500/10 cursor-pointer"
                        >
                            <svg className="w-5 h-5 transform rotate-90 -translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5m0 0L5 12m7-7l7 7" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
