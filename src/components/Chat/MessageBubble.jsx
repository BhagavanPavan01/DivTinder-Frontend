const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`my-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isOwn ? 'bg-green-500 text-white' : 'bg-white text-gray-900'} px-4 py-2 rounded-lg shadow max-w-[70%]`}>
        <div className="text-sm">{message.text}</div>
        <div className="text-xs text-gray-300 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
