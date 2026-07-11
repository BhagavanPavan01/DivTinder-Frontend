import { format } from 'date-fns';
import { useState } from 'react';

const MessageBubble = ({ message, currentUser, onDelete, onReply }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwn = message.senderId === currentUser?._id;

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 relative group`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div
        className={`relative max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm ${isOwn
          ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-[3px]'
          : 'bg-white text-[#111b21] rounded-tl-[3px]'
          }`}
      >
        {!message.isDeleted && (
          <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full bg-black/5 hover:bg-black/10 text-gray-500"
            >
              <svg viewBox="0 0 19 20" width="16" height="16" className="fill-current"><path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30">
                <button
                  onClick={() => { setShowMenu(false); if (onReply) onReply(message); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Reply
                </button>
                {isOwn && (
                  <button
                    onClick={() => { setShowMenu(false); if (onDelete) onDelete(message._id); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition"
                  >
                    Delete Message
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {/* Tail graphic for a slight WhatsApp finish */}
        <div className={`absolute top-0 w-3 h-3 ${isOwn ? '-right-2' : '-left-2'} overflow-hidden`}>
          {isOwn ? (
            <svg viewBox="0 0 8 13" width="8" height="13" className="fill-[#d9fdd3]">
              <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
            </svg>
          ) : (
            <svg viewBox="0 0 8 13" width="8" height="13" className="fill-white">
              <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" transform="scale(-1, 1) translate(-8, 0)" />
            </svg>
          )}
        </div>

        <div className="flex flex-col relative z-10">
          {message.isDeleted ? (
            <p className="text-[14.5px] italic text-[#667781] leading-relaxed break-words pb-3 pr-8 flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" className="opacity-70"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              This message was deleted
            </p>
          ) : (
            <>
              {message.replyTo && (
                <div className="bg-black/5 border-l-4 border-purple-500 rounded p-1.5 mb-1 mt-0.5 text-xs text-gray-700">
                  <span className="font-semibold text-purple-600 block mb-0.5">Replied message</span>
                  {message.replyToText || 'Original message'}
                </div>
              )}
              <p className="text-[14.5px] leading-relaxed break-words pb-3 pr-8 whitespace-pre-wrap">{message.text}</p>
            </>
          )}
          <div className="absolute right-0 bottom-0 flex items-center gap-1">
            <span className="text-[10px] text-[#667781] leading-none mb-0.5">
              {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : '...'}
            </span>
            {isOwn && !message.isDeleted && (
              <span className="text-[#53bdeb] ml-0.5 mb-0.5">
                {/* Simplified WhatsApp double check icon */}
                <svg viewBox="0 0 16 15" width="16" height="15" className={message.isRead ? "fill-[#53bdeb]" : "fill-[#8696a0]"}>
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;