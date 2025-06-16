'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/follow/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/follow/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // Refresh after accepting
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/follow/decline/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // Refresh after declining
    } catch (err) {
      console.error('Decline error:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Follow Requests</h2>

      {requests.length === 0 ? (
        <p>No pending follow requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={req.fromUser.profileImage || '/default-avatar.png'}
                  alt={req.fromUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{req.fromUser.name}</p>
                  <p className="text-sm text-gray-500">{req.fromUser.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
