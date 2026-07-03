import { useEffect, useState } from 'react';
import { chatService } from '../../services/chatService';

const ChatList = ({ conversations: propConversations, activeChat, onSelectChat, currentUser, loading: propLoading }) => {
  const [localConversations, setLocalConversations] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isControlled = propConversations !== undefined;
  const conversations = isControlled ? propConversations : localConversations;
  const loading = isControlled ? propLoading : localLoading;

  useEffect(() => {
    if (isControlled) return;
    let mounted = true;
    (async () => {
      setLocalLoading(true);
      try {
        const res = await chatService.getChats();
        if (!mounted) return;
        const data = res.data || res;
        setLocalConversations(data || []);
      } catch (err) {
        console.error('ChatList: fetch chats failed', err);
        setLocalConversations([]);
      } finally {
        setLocalLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isControlled]);

  const filtered = conversations.filter(c => {
    if (!c.user) return false;
    const q = searchTerm.toLowerCase();
    return c.user.firstName.toLowerCase().includes(q) || (c.user.lastName || '').toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-900">Chats</h2>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-900">Chats</h2>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-5">
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          filtered.map(conv => (
            <div
              key={conv.chatId || conv._id}
              onClick={() => onSelectChat(conv)}
              className={`flex items-center p-3 cursor-pointer transition-colors border-b border-gray-100 ${activeChat?.chatId === conv.chatId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="relative mr-4 flex-shrink-0">
                <img src={conv.user?.photoUrl || '/default-avatar.png'} alt={conv.user?.firstName} className="w-12 h-12 rounded-full object-cover" onError={(e) => e.target.src = '/default-avatar.png'} />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conv.user?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-gray-900 truncate max-w-[180px]">{conv.user?.firstName} {conv.user?.lastName}</span>
                </div>
                <div className="text-sm text-gray-500 truncate">{conv.lastMessage?.text || 'No messages yet'}</div>
              </div>
              {conv.unreadCount > 0 && (<div className="ml-2 bg-green-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold px-1.5">{conv.unreadCount}</div>)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;