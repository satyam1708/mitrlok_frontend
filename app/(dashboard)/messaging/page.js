'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSend, FiCornerDownLeft, FiX } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import ChatWindow from '@/app/_components/ChatWindow';

// Dynamically import the ConnectionsSidebar component (no SSR)
const ConnectionsSidebar = dynamic(() => import('@/app/_components/ConnectionsSidebar'), {
  ssr: false,
});

export default function MessagingPage() {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);

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
  }, [router]);

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
          // Only add message if it's for the currently open chat
          if (
            msg.senderId === currentChatUser?.id ||
            msg.receiverId === currentChatUser?.id
          ) {
            setMessages((prev) => [...prev, msg]);

            // Emit message_seen event to mark the message as seen immediately upon receiving
            socketRef.current.emit('message_seen', { messageId: msg.id, userId });
          }
        });

        socketRef.current.on('message_seen_update', ({ messageId, userId: seenByUserId }) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    seenBy: msg.seenBy ? Array.from(new Set([...msg.seenBy, seenByUserId])) : [seenByUserId],
                  }
                : msg
            )
          );
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
  }, [API_URL, token, userId]);

  // Fetch connections
  useEffect(() => {
    if (!token || !userId) return;
    axios
      .get(`${API_URL}/follow/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConnections(res.data.users))
      .catch((err) => console.error('Error fetching connections:', err));
  }, [API_URL, token, userId]);

  // Fetch messages for selected user and page (pagination placeholder)
  useEffect(() => {
    if (!selectedUser) return;

    selectedUserRef.current = selectedUser;

    axios
      .get(`${API_URL}/messages/${selectedUser.id}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const newMsgs = res.data.messages;

        if (page === 1) {
          setMessages(newMsgs);
        } else {
          // For pagination: prepend older messages to the start of messages array
          setMessages((prev) => [...newMsgs, ...prev]);
        }

        // If backend returns fewer messages than page size, no more messages
        setHasMore(newMsgs.length > 0); 
      })
      .catch((err) => console.error('Error fetching messages:', err));
  }, [selectedUser, page, API_URL, token]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const msgData = {
      toUserId: selectedUser.id,
      content: newMessage.trim(),
      replyToMessageId: replyToMessage?.id || null,
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    // Optimistic UI update for sent message with reply info included
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        senderId: userId,
        receiverId: selectedUser.id,
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
        replyToMessage: replyToMessage || null,
        seenBy: [],
      },
    ]);

    setNewMessage('');
    setReplyToMessage(null);
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
      <ConnectionsSidebar
    connections={connections}
    selectedUser={selectedUser}
    setSelectedUser={setSelectedUser}
    setPage={setPage}
    setReplyToMessage={setReplyToMessage}
  />

      {/* Chat Area */}
      <ChatWindow
  selectedUser={selectedUser}
  messages={messages}
  userId={userId}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  sendMessage={sendMessage}
  setReplyToMessage={setReplyToMessage}
  replyToMessage={replyToMessage}
  hasMore={hasMore}
  setPage={setPage}
  formatTimestamp={formatTimestamp}
/>
    </div>
  );
}
