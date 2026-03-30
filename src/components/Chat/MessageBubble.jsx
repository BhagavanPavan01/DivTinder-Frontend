import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  const isTemp = message.isTemp;

  if (!message) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
        {!isOwn && message.sender && (
          <p className="text-xs text-gray-500 mb-1 ml-2">
            {message.sender.firstName}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-100 text-gray-900'
          } ${isTemp ? 'opacity-70' : ''}`}
        >
          <p className="text-sm break-words">{message.text}</p>
          <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
            isOwn ? 'text-purple-200' : 'text-gray-400'
          }`}>
            <span>
              {message.createdAt ? formatTime(message.createdAt) : 'Sending...'}
            </span>
            {isOwn && message.readBy?.length > 0 && (
              <span>✓✓</span>
            )}
            {isTemp && (
              <span className="animate-pulse">sending...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;