import Avatar from '../common/Avatar';

const ChatHeader = ({ chat, currentUser, onBack, isConnected }) => {
    const otherUser = chat.participants?.find((p) => p._id !== currentUser?._id);
    const name = otherUser?.name || 'Unknown';

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
                <button onClick={onBack} className="md:hidden p-1 rounded hover:bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <Avatar src={otherUser?.avatar} name={name} size="md" />
                <div>
                    <h3 className="font-semibold text-gray-800">{name}</h3>
                    <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>
                        {isConnected ? '● Online' : '● Offline'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;