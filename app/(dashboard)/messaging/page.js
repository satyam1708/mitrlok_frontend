'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

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
  
        socketRef.current.on("connect", () => {
          socketRef.current.emit("setup", userId);
        });
        // Tell the backend who this user is
        // socketRef.current.emit('setup', userId);
  
        // Handle receiving a message
        socketRef.current.on('receive_message', (msg) => {
          const currentChatUser = selectedUserRef.current;
          if (
            msg.senderId === currentChatUser?.id ||
            msg.receiverId === currentChatUser?.id
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        });
  
        // Handle connection errors
        socketRef.current.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });
      }
  
      // Clean up on unmount or token/userId change
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
    axios.get(`${API_URL}/follow/connections`, {
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
        // messages from backend are ordered ascending, no need to reverse here
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
      content: newMessage,
    };
  
    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }
  
    setMessages((prev) => [
      ...prev,
      {
        senderId: userId,
        receiverId: selectedUser.id,
        text: newMessage,
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

  return (
    <div className="flex h-[85vh]">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-4">Your Connections</h2>
        {connections.length === 0 ? (
          <p className="text-gray-500">No connections yet.</p>
        ) : (
          <ul>
            {connections.map((conn) => (
              <li
                key={conn.id}
                className={`cursor-pointer p-2 rounded hover:bg-blue-100 ${
                  selectedUser?.id === conn.id ? 'bg-blue-200' : ''
                }`}
                onClick={() => {
                  setSelectedUser(conn);
                  setPage(1);
                }}
              >
                <p className="font-medium">{conn.name}</p>
                <p className="text-sm text-gray-600">{conn.profession}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col p-4">
        {!selectedUser ? (
          <div className="text-center text-gray-500 my-auto">
            Select a user to start chatting
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b pb-2 mb-4">
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
              <p className="text-sm text-gray-500">{selectedUser.profession}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {hasMore && (
                <button
                  className="text-blue-500 text-sm mb-2 underline"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Load more messages
                </button>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded max-w-[70%] ${
                    msg.senderId === userId
                      ? 'bg-blue-500 text-white self-end ml-auto'
                      : 'bg-gray-200 self-start'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 border p-2 rounded"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
