'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        // GET /follow/requests
        // Returns follow requests sent TO current user, with fromUser info
        endpoint = '/follow/requests';
      } else if (tab === 'discover') {
        // GET /users/to-follow
        // Returns users that current user can discover/follow
        endpoint = '/users/to-follow';
      } else if (tab === 'connections') {
        // GET /follow/connections
        // Returns users the current user is following (your connections)
        endpoint = '/follow/connections';
      }

      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filters,
        },
      });

      // Defensive: API may return 'users' or 'requests' array
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

  // Refetch when tab changes or filters change (optional debounce recommended)
  useEffect(() => {
    if (token) {
      // Reset filters when tab changes (optional)
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

  // POST /follow/request/:toUserId
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

  // POST /unfollow/:userId
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

  // POST /follow/accept/:requestId
  const handleAccept = async (requestId) => {
    console.log(requestId)
    console.log(typeof(requestId))
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

  // POST /follow/decline/:requestId
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Connections</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {[
          { key: 'connections', label: 'Your Connections' },
          { key: 'requests', label: 'Follow Requests' },
          { key: 'discover', label: 'Discover People' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded ${
              tab === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
      >
        <input
          name="name"
          placeholder="Name"
          value={filters.name}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="state"
          placeholder="State"
          value={filters.state}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="profession"
          placeholder="Profession"
          value={filters.profession}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="interests"
          placeholder="Interests (comma)"
          value={filters.interests}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="col-span-full md:col-span-1 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Apply
        </button>
      </form>

      {/* Message */}
      {message && <p className="mb-4 text-green-600 font-semibold">{message}</p>}

      {/* Users List */}
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {users.map((userOrRequest) => {
            // For requests tab, user is inside fromUser
            const user = tab === 'requests' ? userOrRequest.fromUser : userOrRequest;
            if (!user) return null; // Defensive check

            return (
              <li
                key={user.id}
                className="p-4 border rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.profession}</p>
                  <p className="text-sm">
                    {user.city}, {user.state}
                  </p>
                  <p className="text-xs mt-1 text-gray-500">
                    Interests: {user.interests?.join(', ') || 'N/A'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {tab === 'requests' ? (
                    <>
                      <button
                        onClick={() => handleAccept(userOrRequest.id)}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(userOrRequest.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </>
                  ) : tab === 'connections' ? (
                    <button
                      onClick={() => handleUnfollow(user.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Unfollow
                    </button>
                  ) : (
                    // discover tab
                    <button
                      onClick={() => handleFollowRequest(user.id)}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
