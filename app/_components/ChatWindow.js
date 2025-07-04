'use client';

import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUser, FiCornerDownLeft, FiSend, FiX } from 'react-icons/fi';

export default function ChatWindow({
  selectedUser,
  messages = [],
  userId,
  newMessage,
  setNewMessage,
  sendMessage,
  setReplyToMessage,
  replyToMessage,
  hasMore,
  setPage,
  formatTimestamp,
}) {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change or selected user changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]);

  if (!selectedUser) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center text-gray-400 text-lg font-medium select-none p-4">
        <FiUser size={72} className="mb-4 opacity-30" />
        Select a user to start chatting
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-4 bg-white max-h-[85vh] md:max-h-full">
      {/* Header */}
      <header className="border-b pb-3 mb-5 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-2xl uppercase select-none flex-shrink-0"
          aria-label={`Avatar of ${selectedUser.name}`}
          title={selectedUser.name}
        >
          {selectedUser.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-800 truncate">{selectedUser.name}</h2>
          <p className="text-sm text-gray-500 truncate">{selectedUser.profession || 'N/A'}</p>
        </div>
      </header>

      {/* Messages */}
      <section
        className="flex-1 overflow-y-auto px-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100"
        style={{ scrollBehavior: 'smooth' }}
        aria-live="polite"
        aria-relevant="additions"
      >
        {hasMore && (
          <button
            className="text-blue-600 text-sm underline mb-2"
            onClick={() => setPage((prev) => prev + 1)}
            aria-label="Load more messages"
          >
            Load more messages
          </button>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === userId;
            const timestamp = formatTimestamp(msg.createdAt);

            const isSeenByOther = isOwnMessage && msg.seenBy?.includes(selectedUser.id);

            return (
              <motion.div
                key={msg.id || index}
                id={`msg-${msg.id}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`relative max-w-[75%] px-5 py-3 rounded-xl break-words whitespace-pre-wrap
                  ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white self-end ml-auto flex items-start gap-2'
                      : 'bg-gray-200 text-gray-900 self-start flex items-start gap-2'
                  }`}
                aria-label={`${isOwnMessage ? 'Sent message' : 'Received message'}: ${msg.text}`}
                tabIndex={0}
              >
                {/* Sender Avatar */}
                {!isOwnMessage && (
                  <div
                    className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-semibold text-sm uppercase select-none flex-shrink-0"
                    aria-hidden="true"
                    title={selectedUser.name}
                  >
                    {selectedUser.name.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col flex-grow">
                  {/* Reply snippet */}
                  {msg.replyToMessage && (
                    <div
                      className="mb-2 p-2 border-l-4 border-blue-400 bg-blue-100 text-blue-800 rounded-md text-sm cursor-pointer select-text"
                      onClick={() => {
                        const elem = document.getElementById(`msg-${msg.replyToMessage.id}`);
                        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      aria-label={`Reply to message: ${msg.replyToMessage.text}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          const elem = document.getElementById(`msg-${msg.replyToMessage.id}`);
                          if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      {msg.replyToMessage.text.length > 50
                        ? msg.replyToMessage.text.slice(0, 50) + '...'
                        : msg.replyToMessage.text}
                    </div>
                  )}

                  <div>{msg.text}</div>
                  <time
                    className={`mt-1 text-xs italic select-none ${
                      isOwnMessage ? 'text-blue-200' : 'text-gray-600'
                    }`}
                    title={timestamp.tooltip}
                  >
                    {timestamp.display}
                  </time>

                  {/* Seen status */}
                  {isOwnMessage && (
                    <div
                      className="text-xs italic text-blue-300 mt-1 select-none"
                      aria-label={isSeenByOther ? 'Message seen' : 'Message not seen'}
                    >
                      {isSeenByOther ? 'Seen' : 'Delivered'}
                    </div>
                  )}
                </div>

                {/* Message tail */}
                <span
                  className={`absolute bottom-0 w-3 h-3 ${
                    isOwnMessage
                      ? 'right-0 bg-blue-600 translate-x-1 rotate-45 rounded-bl-none rounded-tr-xl shadow-md'
                      : 'left-0 bg-gray-200 -translate-x-1 rotate-45 rounded-br-none rounded-tl-xl shadow-sm'
                  }`}
                  aria-hidden="true"
                />

                {/* Reply button */}
                <button
                  type="button"
                  aria-label="Reply to this message"
                  className="absolute top-1 right-1 text-gray-400 hover:text-blue-500 transition"
                  onClick={() => setReplyToMessage(msg)}
                >
                  <FiCornerDownLeft size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </section>

      {/* Reply preview */}
      {replyToMessage && (
        <div className="flex items-center gap-2 mb-2 px-4 py-2 border border-blue-300 rounded bg-blue-50 text-blue-800 select-text">
          <FiCornerDownLeft />
          <span className="flex-1 truncate">
            Replying to:{' '}
            {replyToMessage.text.length > 60
              ? replyToMessage.text.slice(0, 60) + '...'
              : replyToMessage.text}
          </span>
          <button
            type="button"
            aria-label="Cancel reply"
            className="text-blue-600 hover:text-blue-900"
            onClick={() => setReplyToMessage(null)}
          >
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Input */}
      <footer className="flex gap-3 items-center border-t pt-3">
        <textarea
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 resize-none border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition scrollbar-thin scrollbar-thumb-blue-300"
          aria-label="Message input"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-md transition
            disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Send message"
          type="button"
        >
          <FiSend size={20} />
        </button>
      </footer>
    </main>
  );
}



// {/* <main className="flex-1 flex flex-col p-4 bg-white">
//         {!selectedUser ? (
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-lg font-medium select-none">
//             <FiUser size={72} className="mb-4 opacity-30" />
//             Select a user to start chatting
//           </div>
//         ) : (
//           <>
//             {/* Header */}
//             <header className="border-b pb-3 mb-5 flex items-center gap-4">
//               <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-2xl uppercase select-none">
//                 {selectedUser.name.charAt(0)}
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-blue-800">{selectedUser.name}</h2>
//                 <p className="text-sm text-gray-500">{selectedUser.profession || 'N/A'}</p>
//               </div>
//             </header>

//             {/* Messages */}
//             <section
//               className="flex-1 overflow-y-auto px-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100"
//               style={{ scrollBehavior: 'smooth' }}
//               aria-live="polite"
//               aria-relevant="additions"
//             >
//               {hasMore && (
//                 <button
//                   className="text-blue-600 text-sm underline mb-2"
//                   onClick={() => setPage((prev) => prev + 1)}
//                 >
//                   Load more messages
//                 </button>
//               )}

//               <AnimatePresence initial={false}>
//                 {messages.map((msg, index) => {
//                   const isOwnMessage = msg.senderId === userId;
//                   const timestamp = formatTimestamp(msg.createdAt);

//                   // Check if current user has seen this message
//                   // For own messages, check if selectedUser has seen
//                   // For received messages, consider always seen since user sees them now
//                   const isSeenByOther =
//                     isOwnMessage && msg.seenBy?.includes(selectedUser.id);

//                   return (
//                     <motion.div
//                       key={msg.id || index}
//                       id={`msg-${msg.id}`}
//                       layout
//                       initial={{ opacity: 0, y: 15 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 15 }}
//                       transition={{ duration: 0.3, ease: 'easeOut' }}
//                       className={`relative max-w-[75%] px-5 py-3 rounded-xl break-words whitespace-pre-wrap
//                         ${isOwnMessage
//                           ? 'bg-blue-600 text-white self-end ml-auto flex items-start gap-2'
//                           : 'bg-gray-200 text-gray-900 self-start flex items-start gap-2'}`}
//                       aria-label={`${isOwnMessage ? 'Sent message' : 'Received message'}: ${msg.text}`}
//                       tabIndex={0}
//                     >
//                       {/* Sender Avatar */}
//                       {!isOwnMessage && (
//                         <div
//                           className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-semibold text-sm uppercase select-none flex-shrink-0"
//                           aria-hidden="true"
//                           title={selectedUser.name}
//                         >
//                           {selectedUser.name.charAt(0)}
//                         </div>
//                       )}

//                       <div className="flex flex-col flex-grow">
//                         {/* If this message is a reply, show replied message snippet */}
//                         {msg.replyToMessage && (
//                           <div
//                             className="mb-2 p-2 border-l-4 border-blue-400 bg-blue-100 text-blue-800 rounded-md text-sm cursor-pointer select-text"
//                             onClick={() => {
//                               // Scroll to the replied message in the chat if exists
//                               const elem = document.getElementById(`msg-${msg.replyToMessage.id}`);
//                               if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                             }}
//                             aria-label={`Reply to message: ${msg.replyToMessage.text}`}
//                             tabIndex={0}
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter' || e.key === ' ') {
//                                 const elem = document.getElementById(`msg-${msg.replyToMessage.id}`);
//                                 if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                               }
//                             }}
//                           >
//                             {msg.replyToMessage.text.length > 50
//                               ? msg.replyToMessage.text.slice(0, 50) + '...'
//                               : msg.replyToMessage.text}
//                           </div>
//                         )}

//                         <div>{msg.text}</div>
//                         <time
//                           className={`mt-1 text-xs italic select-none ${
//                             isOwnMessage ? 'text-blue-200' : 'text-gray-600'
//                           }`}
//                           title={timestamp.tooltip}
//                         >
//                           {timestamp.display}
//                         </time>

//                         {/* Seen status for own messages */}
//                         {isOwnMessage && (
//                           <div
//                             className="text-xs italic text-blue-300 mt-1 select-none"
//                             aria-label={isSeenByOther ? 'Message seen' : 'Message not seen'}
//                           >
//                             {isSeenByOther ? 'Seen' : 'Delivered'}
//                           </div>
//                         )}
//                       </div>

//                       {/* Message tail */}
//                       <span
//                         className={`absolute bottom-0 w-3 h-3 ${
//                           isOwnMessage
//                             ? 'right-0 bg-blue-600 translate-x-1 rotate-45 rounded-bl-none rounded-tr-xl shadow-md'
//                             : 'left-0 bg-gray-200 -translate-x-1 rotate-45 rounded-br-none rounded-tl-xl shadow-sm'
//                         }`}
//                         aria-hidden="true"
//                       />

//                       {/* Reply button */}
//                       <button
//                         type="button"
//                         aria-label="Reply to this message"
//                         className="absolute top-1 right-1 text-gray-400 hover:text-blue-500 transition"
//                         onClick={() => setReplyToMessage(msg)}
//                       >
//                         <FiCornerDownLeft size={16} />
//                       </button>
//                     </motion.div>
//                   );
//                 })}
//               </AnimatePresence>

//               <div ref={messagesEndRef} />
//             </section>

//             {/* Reply preview */}
//             {replyToMessage && (
//               <div className="flex items-center gap-2 mb-2 px-4 py-2 border border-blue-300 rounded bg-blue-50 text-blue-800 select-text">
//                 <FiCornerDownLeft />
//                 <span className="flex-1 truncate">
//                   Replying to:{' '}
//                   {replyToMessage.text.length > 60
//                     ? replyToMessage.text.slice(0, 60) + '...'
//                     : replyToMessage.text}
//                 </span>
//                 <button
//                   type="button"
//                   aria-label="Cancel reply"
//                   className="text-blue-600 hover:text-blue-900"
//                   onClick={() => setReplyToMessage(null)}
//                 >
//                   <FiX size={20} />
//                 </button>
//               </div>
//             )}

//             {/* Input */}
//             <footer className="flex gap-3 items-center border-t pt-3">
//               <textarea
//                 rows={1}
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     sendMessage();
//                   }
//                 }}
//                 placeholder="Type a message..."
//                 className="flex-1 resize-none border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition scrollbar-thin scrollbar-thumb-blue-300"
//                 aria-label="Message input"
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={!newMessage.trim()}
//                 className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-md transition
//                   disabled:opacity-50 disabled:cursor-not-allowed`}
//                 aria-label="Send message"
//                 type="button"
//               >
//                 <FiSend size={20} />
//               </button>
//             </footer>
//           </>
//         )}
//       </main> */}
