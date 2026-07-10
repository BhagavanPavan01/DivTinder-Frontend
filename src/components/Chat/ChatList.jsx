import { format } from 'date-fns';
import Avatar from '../common/Avatar';

const ChatList = ({ conversations, activeChat, onSelectChat, currentUser, loading }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet. Start matching!
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conv) => {
        const otherUser = conv.participants?.find((p) => p._id !== currentUser?._id);
        const displayName = otherUser?.name || 'Unknown User';
        const lastMsg = conv.lastMessage?.text || 'No messages yet';
        const lastTime = conv.lastMessage?.createdAt
          ? format(new Date(conv.lastMessage.createdAt), 'hh:mm a')
          : '';

        const isActive = activeChat?.chatId === conv.chatId;

        return (
          <div
            key={conv.chatId}
            className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            onClick={() => onSelectChat(conv)}
          >
            <Avatar
              src={otherUser?.avatar}
              name={displayName}
              size="md"
              className="mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800 truncate">{displayName}</h3>
                <span className="text-xs text-gray-400">{lastTime}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {conv.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;