'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#e0f2f1]">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#e0f2f1]">
        <p className="text-gray-500 text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl border border-teal-200"
          aria-live="polite"
          role="region"
        >
          <h1 className="text-4xl font-extrabold text-teal-800 mb-10 text-center tracking-wide select-none">
            Welcome, <span className="underline decoration-teal-400">{user.name}</span>
          </h1>

          <div className="grid gap-6 text-teal-900 text-base sm:text-lg">
            {[
              { label: 'Email', value: user.email },
              { label: 'Bio', value: user.bio || '—' },
              { label: 'City', value: user.city || '—' },
              { label: 'State', value: user.state || '—' },
              { label: 'Interests', value: user.interests?.join(', ') || '—' },
              {
                label: 'Joined',
                value: new Date(user.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              },
            ].map(({ label, value }) => (
              <ProfileRow key={label} label={label} value={value} />
            ))}
          </div>

          {/* <div className="flex justify-center mt-12">
            {user.profileImage ? (
              <motion.img
                src={user.profileImage}
                alt={`${user.name}'s profile`}
                className="w-32 h-32 rounded-full object-cover border-8 border-teal-300 shadow-md"
                loading="lazy"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-teal-100 border-8 border-teal-300 shadow-md select-none text-teal-400 text-6xl font-bold">
                {user.name?.[0].toUpperCase() || '?'}
              </div>
            )}
          </div> */}

          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-14">
            <button
              onClick={openModal}
              className="px-10 py-3 rounded-full bg-teal-600 text-white font-semibold shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition"
              aria-label="Edit Profile"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-10 py-3 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-50"
              aria-hidden="true"
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 flex justify-center items-center p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="editProfileTitle"
            >
              <motion.div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-teal-300">
                <h2
                  id="editProfileTitle"
                  className="text-3xl font-bold mb-7 text-teal-700 text-center tracking-tight select-none"
                >
                  Edit Profile
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!saving) handleSave();
                  }}
                  className="space-y-6"
                  autoComplete="off"
                >
                  {[
                    { name: 'name', label: 'Name', type: 'text' },
                    { name: 'bio', label: 'Bio', type: 'textarea' },
                    { name: 'city', label: 'City', type: 'text' },
                    { name: 'state', label: 'State', type: 'text' },
                    { name: 'interests', label: 'Interests (comma separated)', type: 'text' },
                    { name: 'profileImage', label: 'Profile Image URL', type: 'text' },
                  ].map(({ name, label, type }, idx) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <label
                        htmlFor={name}
                        className="block text-sm font-semibold text-teal-700 mb-2 cursor-pointer select-none"
                      >
                        {label}
                      </label>
                      {type === 'textarea' ? (
                        <textarea
                          id={name}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          rows={3}
                          className="w-full rounded-md border border-teal-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                      ) : (
                        <input
                          id={name}
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          className="w-full rounded-md border border-teal-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                      )}
                    </motion.div>
                  ))}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-600 text-center text-sm mt-3 select-none"
                      role="alert"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      disabled={saving}
                      className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      {saving ? (
                        <Spinner />
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-teal-200 pb-4 last:border-0 hover:bg-teal-50 rounded-md transition"
      tabIndex={0}
      aria-label={`${label}: ${value}`}
    >
      <span className="font-semibold select-text">{label}:</span>
      <span className="text-teal-800 mt-1 sm:mt-0 select-text">{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
