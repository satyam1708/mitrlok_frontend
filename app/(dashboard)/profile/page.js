'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    city: '',
    state: '',
    interests: '',
    profileImage: '',
  });
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) return setError(data.message || 'Failed to fetch profile');

        setUser(data.user);
      } catch (err) {
        setError('Something went wrong');
        console.error(err);
      }
    };

    fetchProfile();
  }, [router]);

  const openModal = () => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      city: user.city || '',
      state: user.state || '',
      interests: user.interests?.join(', ') || '',
      profileImage: user.profileImage || '',
    });
    setModalOpen(true);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setError('Not authenticated');

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          interests: formData.interests
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setUser(data.user);
        setModalOpen(false);
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (error && !modalOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#f0f8f8] p-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
          <h1 className="text-2xl font-bold text-[#0593a5] mb-6 text-center">
            Welcome, {user.name}
          </h1>

          <div className="grid gap-3 text-[#034747] text-[15px]">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || '—'}</p>
            <p><strong>City:</strong> {user.city || '—'}</p>
            <p><strong>State:</strong> {user.state || '—'}</p>
            <p><strong>Interests:</strong> {user.interests?.join(', ') || '—'}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          </div>

          {user.profileImage && (
            <div className="text-center mt-6">
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-[#0593a5]"
              />
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={openModal}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-[#0593a5]">Edit Profile</h2>
            <div className="space-y-4">
              {['name', 'bio', 'city', 'state', 'interests', 'profileImage'].map((field) => (
                <div key={field}>
                  <label className="block text-sm capitalize">
                    {field.replace('profileImage', 'Profile Image URL')}
                    <input
                      type={field === 'bio' ? 'textarea' : 'text'}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#0593a5]"
                    />
                  </label>
                </div>
              ))}
            </div>

            {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
