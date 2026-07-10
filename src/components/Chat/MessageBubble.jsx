import { format } from 'date-fns';

const MessageBubble = ({ message, currentUser }) => {
  const isOwn = message.senderId === currentUser?._id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
      >
        <p className="text-sm break-words">{message.text}</p>
        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'} mt-1 block`}>
          {message.createdAt ? format(new Date(message.createdAt), 'hh:mm a') : 'Sending...'}
          {message.pending && <span className="ml-1">⏳</span>}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;