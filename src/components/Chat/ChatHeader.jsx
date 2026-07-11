import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../common/Avatar';

const ChatHeader = ({ chat, currentUser, onBack, isConnected, onAvatarClick, onDeleteChat, onPinChat, onMuteChat }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isGroup = chat.type === 'group';
    const otherUser = isGroup ? null : (chat.user || chat.participants?.find((p) => p._id !== currentUser?._id));
    const name = isGroup ? chat.groupName : (
        otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Unknown'
    );
    const avatarUrl = isGroup ? chat.groupAvatar : (otherUser?.photoUrl || otherUser?.avatar);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = () => {
        setIsMenuOpen(false);
        if (onDeleteChat) {
            onDeleteChat(chat.chatId);
        }
    };

    const handlePin = () => {
        setIsMenuOpen(false);
        if (onPinChat) onPinChat(chat.chatId, chat.isPinned);
    };

    const handleMute = () => {
        setIsMenuOpen(false);
        if (onMuteChat) onMuteChat(chat.chatId, chat.isMuted);
    };

    return (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 z-10 w-full">
            <div className="flex items-center space-x-3 overflow-hidden">
                <button onClick={onBack} className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1 pr-3 transition-colors flex-1 min-w-0"
                    onClick={onAvatarClick}
                >
                    <Avatar src={avatarUrl} name={name} size="md" className="w-[42px] h-[42px] flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-gray-800 text-[16px] leading-tight truncate">{name}</h3>
                        {!isGroup && (
                            <span className={`text-[13px] truncate ${otherUser?.status === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                                {otherUser?.status === 'online' ? 'online' : 'offline'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 relative">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <div ref={menuRef}>
                    <button
                        className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 origin-top-right">
                            <button
                                onClick={() => { setIsMenuOpen(false); onAvatarClick(); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                                Contact Info
                            </button>
                            <button
                                onClick={handlePin}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                                {chat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                            </button>
                            <button
                                onClick={handleMute}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                                {chat.isMuted ? 'Unmute Chat' : 'Mute Chat'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium border-t border-gray-100"
                            >
                                Delete Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;