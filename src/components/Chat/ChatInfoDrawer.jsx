import React from 'react';

const ChatInfoDrawer = ({ isOpen, onClose, chat, currentUser }) => {
    if (!isOpen || !chat) return null;

    const isGroup = chat.type === 'group';
    const otherUser = chat.user;

    return (
        <div className={`fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer Header */}
            <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-gray-50">
                <h3 className="font-semibold text-gray-800">
                    {isGroup ? 'Group Info' : 'Contact Info'}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                {isGroup ? (
                    /* GROUP LAYOUT */
                    <div className="w-full text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4 overflow-hidden border-2 border-white">
                            {chat.groupAvatar ? (
                                <img src={chat.groupAvatar} alt={chat.groupName} className="w-full h-full object-cover" />
                            ) : (
                                chat.groupName?.slice(0, 2).toUpperCase()
                            )}
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 leading-tight">
                            {chat.groupName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Group • {chat.participants?.length || 0} participants
                        </p>

                        <hr className="my-6 border-gray-100" />

                        {/* Participants list */}
                        <div className="text-left w-full">
                            <h5 className="font-semibold text-sm text-gray-700 mb-3">
                                Participants ({chat.participants?.length || 0})
                            </h5>

                            <div className="space-y-3">
                                {chat.participants?.map((member) => {
                                    const isAdmin = chat.groupAdmins?.includes(member._id) || chat.groupAdmin === member._id;
                                    const isSec = member._id === currentUser?._id;
                                    return (
                                        <div key={member._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden">
                                                    {member.photoUrl ? (
                                                        <img src={member.photoUrl} alt={member.firstName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.firstName?.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {member.firstName} {member.lastName} {isSec && '(You)'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {member.emailId}
                                                    </p>
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <span className="text-[9px] bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-150">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* PRIVATE CHAT LAYOUT */
                    otherUser && (
                        <div className="w-full text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4 overflow-hidden border-2 border-white">
                                {otherUser.photoUrl ? (
                                    <img src={otherUser.photoUrl} alt={`${otherUser.firstName} ${otherUser.lastName}`} className="w-full h-full object-cover" />
                                ) : (
                                    otherUser.firstName?.charAt(0)
                                )}
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 leading-tight">
                                {otherUser.firstName} {otherUser.lastName}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{otherUser.emailId}</p>

                            <hr className="my-6 border-gray-100" />

                            {/* Bio details list */}
                            <div className="text-left w-full space-y-4">
                                {otherUser.about && (
                                    <div>
                                        <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">About</h5>
                                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                                            {otherUser.about}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {otherUser.gender && (
                                        <div>
                                            <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Gender</h5>
                                            <p className="text-sm text-gray-700 mt-1 capitalize">{otherUser.gender}</p>
                                        </div>
                                    )}
                                    {otherUser.age && (
                                        <div>
                                            <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Age</h5>
                                            <p className="text-sm text-gray-700 mt-1">{otherUser.age} years</p>
                                        </div>
                                    )}
                                </div>

                                {otherUser.phoneNumber && (
                                    <div>
                                        <h5 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone</h5>
                                        <p className="text-sm text-gray-700 mt-1">{otherUser.phoneNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ChatInfoDrawer;
