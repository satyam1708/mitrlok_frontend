"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUserId = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // You don’t need to store userId if unused here, but keep if needed
    } catch (err) {
      console.error("Failed to fetch user ID", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/follow/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching follow requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/follow/accept/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error("Error accepting follow request:", err);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/follow/decline/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error("Error declining follow request:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchUserId();
    fetchRequests();

    if (!socketRef.current && token) {
      const socket = io(API_URL, {
        auth: { token: `Bearer ${token}` },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🔌 Connected to socket.io");
      });

      socket.on("follow_request", (data) => {
        setRequests((prev) => [data, ...prev]);
      });

      socket.on("new_post", (data) => {
        setNewPosts((prev) => [data, ...prev]);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from socket.io");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [API_URL, fetchRequests, fetchUserId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-10">
      {/* Follow Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left text-blue-900">
          Follow Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-center text-gray-500">
            No pending follow requests.
          </p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4 mb-3 sm:mb-0 flex-shrink-0">
                  <Image
                    src={req.fromUser.profileImage || "/default-avatar.png"}
                    alt={req.fromUser.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-lg truncate max-w-xs">
                      {req.fromUser.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {req.fromUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition min-w-[90px]"
                    aria-label={`Accept follow request from ${req.fromUser.name}`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition min-w-[90px]"
                    aria-label={`Decline follow request from ${req.fromUser.name}`}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* New Posts Notifications */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left text-blue-900">
          New Posts
        </h2>
        {newPosts.length === 0 ? (
          <p className="text-center text-gray-500">No new posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {newPosts.map((post, i) => (
              <li
                key={post.id || i}
                className="border p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition"
                onClick={() => router.push(`/posts/${post.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/posts/${post.id}`);
                  }
                }}
                aria-label={`View post by ${
                  post.author?.name || "Unknown User"
                }`}
              >
                <p className="font-semibold text-lg truncate">
                  {post.author?.name || "Unknown User"}
                </p>
                <p className="text-gray-700 text-sm line-clamp-2 mb-1">
                  {post.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
