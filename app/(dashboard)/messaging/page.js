'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSend } from 'react-icons/fi';

export default function MessagingPage() {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const socketRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Auth check
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (!storedToken || !storedUserId) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    setUserId(storedUserId);
  }, []);

  // Socket init and message receive
  useEffect(() => {
    if (token && userId) {
      if (!socketRef.current) {
        socketRef.current = io(API_URL, {
          auth: { token },
        });

        socketRef.current.on('connect', () => {
          socketRef.current.emit('setup', userId);
        });

        socketRef.current.on('receive_message', (msg) => {
          const currentChatUser = selectedUserRef.current;
          if (
            msg.senderId === currentChatUser?.id ||
            msg.receiverId === currentChatUser?.id
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [token, userId]);

  // Fetch connections
  useEffect(() => {
    if (!token || !userId) return;
    axios
      .get(`${API_URL}/follow/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConnections(res.data.users))
      .catch((err) => console.error('Error fetching connections:', err));
  }, [token, userId]);

  // Fetch messages
  useEffect(() => {
    if (!selectedUser) return;
    selectedUserRef.current = selectedUser;

    axios
      .get(`${API_URL}/messages/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const newMsgs = res.data.messages;
        if (page === 1) {
          setMessages(newMsgs);
        } else {
          setMessages((prev) => [...newMsgs, ...prev]);
        }
        setHasMore(false); // backend pagination not implemented yet
      })
      .catch((err) => console.error('Error fetching messages:', err));
  }, [selectedUser, page]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const msgData = {
      toUserId: selectedUser.id,
      content: newMessage.trim(),
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    setMessages((prev) => [
      ...prev,
      {
        senderId: userId,
        receiverId: selectedUser.id,
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);

    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp nicely with date and time tooltip
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      display: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tooltip: date.toLocaleString(),
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-[85vh] max-w-7xl mx-auto border rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
        <h2 className="text-xl font-bold mb-6 text-center md:text-left tracking-wide text-blue-800">
          Your Connections
        </h2>

        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400 select-none">
            <FiUser size={48} className="mb-2 opacity-40" />
            <p>No connections yet.</p>
          </div>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {connections.map((conn) => (
                <motion.li
                  key={conn.id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  whileHover={{ scale: 1.04, backgroundColor: '#dbeafe' }} // light blue bg
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`cursor-pointer p-3 mb-3 rounded-lg flex items-center gap-3
                    ${
                      selectedUser?.id === conn.id
                        ? 'bg-blue-200 shadow-inner border border-blue-400'
                        : 'hover:bg-blue-100'
                    }`}
                  onClick={() => {
                    setSelectedUser(conn);
                    setPage(1);
                  }}
                  aria-label={`Select connection ${conn.name}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedUser(conn);
                      setPage(1);
                    }
                  }}
                >
                  {/* Avatar placeholder */}
                  <div className="w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center font-semibold text-lg uppercase select-none">
                    {conn.name ? conn.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-blue-800 truncate">{conn.name}</p>
                    <p className="text-sm text-gray-600 truncate">{conn.profession || 'N/A'}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col p-4 bg-white">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-lg font-medium select-none">
            <FiUser size={72} className="mb-4 opacity-30" />
            Select a user to start chatting
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="border-b pb-3 mb-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-2xl uppercase select-none">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-800">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.profession || 'N/A'}</p>
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
                >
                  Load more messages
                </button>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === userId;
                  const timestamp = formatTimestamp(msg.createdAt);

                  return (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className={`relative max-w-[75%] px-5 py-3 rounded-xl break-words whitespace-pre-wrap
                        ${isOwnMessage ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-gray-200 text-gray-900 self-start'}`}
                      aria-label={`${isOwnMessage ? 'Sent message' : 'Received message'}: ${msg.text}`}
                      tabIndex={0}
                    >
                      {msg.text}
                      <time
                        className="absolute bottom-1 right-3 text-xs text-blue-200 italic select-none"
                        title={timestamp.tooltip}
                      >
                        {timestamp.display}
                      </time>

                      {/* Message tail */}
                      <span
                        className={`absolute bottom-0 w-3 h-3 ${
                          isOwnMessage
                            ? 'right-0 bg-blue-600 translate-x-1 rotate-45 rounded-bl-none rounded-tr-xl shadow-md'
                            : 'left-0 bg-gray-200 -translate-x-1 rotate-45 rounded-br-none rounded-tl-xl shadow-sm'
                        }`}
                        aria-hidden="true"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </section>

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
          </>
        )}
      </main>
    </div>
  );
}
