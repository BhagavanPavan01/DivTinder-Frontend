import { format } from 'date-fns';
import Avatar from '../common/Avatar';

const ChatList = ({ conversations, activeChat, onSelectChat, currentUser, loading }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
        <div className="text-4xl mb-3">💬</div>
        <p>No messages yet.</p>
        <p className="text-sm mt-1">Start connecting with people to chat!</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full bg-white">
      {conversations.map((conv) => {
        const isGroup = conv.type === 'group';
        const otherUser = isGroup ? null : (conv.user || conv.participants?.find((p) => p._id !== currentUser?._id));

        const displayName = isGroup ? conv.groupName : (
          otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Unknown User'
        );

        const avatarUrl = isGroup ? conv.groupAvatar : (otherUser?.photoUrl || otherUser?.avatar);

        const lastMsgText = conv.lastMessage?.text || 'No messages yet';

        let lastTimeStr = '';
        if (conv.lastMessage?.timestamp || conv.lastMessage?.createdAt) {
          const dt = new Date(conv.lastMessage.timestamp || conv.lastMessage.createdAt);
          lastTimeStr = format(dt, 'hh:mm a');
        }

        const isActive = activeChat?.chatId === conv.chatId;
        const unreadCount = conv.unreadCount || 0;

        return (
          <div
            key={conv.chatId}
            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-100' : 'bg-white'
              }`}
            onClick={() => onSelectChat(conv)}
          >
            <div className="relative">
              <Avatar
                src={avatarUrl}
                name={displayName}
                size="md"
                className="w-12 h-12 rounded-full border border-gray-200 object-cover"
              />
              {/* Online status indicator */}
              {!isGroup && otherUser?.status === 'online' && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="ml-3 flex-1 min-w-0 border-b border-gray-100 pb-2">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="font-semibold text-gray-900 truncate pr-2 text-[15px]">{displayName}</h3>
                <span className={`text-xs whitespace-nowrap ${unreadCount > 0 ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
                  {lastTimeStr}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {conv.lastMessage?.isOwn ? 'You: ' : ''}{lastMsgText}
                </p>
                {unreadCount > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;