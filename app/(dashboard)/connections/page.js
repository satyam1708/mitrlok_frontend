'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ConnectionsPage() {
  const [tab, setTab] = useState('connections'); // connections | requests | discover
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    state: '',
    profession: '',
    interests: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      if (tab === 'requests') {
        endpoint = '/follow/requests';
      } else if (tab === 'discover') {
        endpoint = '/users/to-follow';
      } else if (tab === 'connections') {
        endpoint = '/follow/connections';
      }

      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filters,
        },
      });

      const dataList = res.data.users || res.data.requests || [];
      setUsers(dataList);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Error loading data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setFilters({
        name: '',
        city: '',
        state: '',
        profession: '',
        interests: '',
      });
      fetchUsers();
    }
  }, [tab]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleFollowRequest = async (toUserId) => {
    try {
      const res = await axios.post(
        `${API_URL}/follow/request/${toUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending request');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/unfollow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Unfollowed successfully');
      fetchUsers();
    } catch (err) {
      setMessage('Error unfollowing');
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `${API_URL}/follow/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Follow request accepted');
      fetchUsers();
    } catch (err) {
      setMessage('Error accepting');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.post(
        `${API_URL}/follow/decline/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Follow request declined');
      fetchUsers();
    } catch (err) {
      setMessage('Error declining');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-[80vh]">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {[
          { key: 'connections', label: 'Your Connections' },
          { key: 'requests', label: 'Follow Requests' },
          { key: 'discover', label: 'Discover People' },
        ].map(({ key, label }) => (
          <motion.button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md focus:outline-none whitespace-nowrap ${
              tab === key
                ? 'bg-blue-600 text-white shadow-blue-500/50'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layoutId={tab === key ? 'activeTab' : undefined}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8 items-end"
      >
        {['name', 'city', 'state', 'profession', 'interests'].map((field) => (
          <motion.div key={field} layout>
            <input
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={filters[field]}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition"
              autoComplete="off"
            />
          </motion.div>
        ))}
        <motion.button
          type="submit"
          className="bg-blue-600 text-white font-semibold rounded-lg px-6 py-3 shadow-md hover:bg-blue-700 transition w-full sm:w-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layout
        >
          Apply Filters
        </motion.button>
      </form>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.p
            className="mb-6 text-center text-green-600 font-semibold px-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Users List */}
      {loading ? (
        <p className="text-center text-gray-600 text-lg font-medium mt-12">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-12">No users found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {users.map((userOrRequest) => {
              const user = tab === 'requests' ? userOrRequest.fromUser : userOrRequest;
              if (!user) return null;

              return (
                <motion.li
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-5 border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow bg-white flex flex-col justify-between"
                >
                  <div>
                    <p className="text-lg sm:text-xl font-semibold text-blue-700 mb-1 truncate">{user.name}</p>
                    <p className="text-sm sm:text-base text-gray-600 mb-1 truncate">{user.profession || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      {user.city || 'Unknown'}, {user.state || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 italic truncate" title={`Interests: ${user.interests?.join(', ') || 'N/A'}`}>
                      Interests: {user.interests?.length ? user.interests.join(', ') : 'N/A'}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3 justify-end flex-wrap">
                    {tab === 'requests' ? (
                      <>
                        <motion.button
                          onClick={() => handleAccept(userOrRequest.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Accept follow request from ${user.name}`}
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          onClick={() => handleDecline(userOrRequest.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Decline follow request from ${user.name}`}
                        >
                          Decline
                        </motion.button>
                      </>
                    ) : tab === 'connections' ? (
                      <motion.button
                        onClick={() => handleUnfollow(user.id)}
                        className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Unfollow ${user.name}`}
                      >
                        Unfollow
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handleFollowRequest(user.id)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Follow ${user.name}`}
                      >
                        Follow
                      </motion.button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
