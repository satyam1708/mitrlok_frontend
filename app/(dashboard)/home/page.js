"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaImage, FaSmile, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);
  }, []);

  const fetchPosts = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${API_URL}/feed?page=${pageNumber}`, {
          headers: { Authorization: `Bearer ${token}`, userId },
        });

        if (pageNumber === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
        }

        setPage(pageNumber);
      } catch {
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, token, userId]
  );

  useEffect(() => {
    if (token) fetchPosts(1);
  }, [token]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/posts`,
        { content, imageUrl: imageUrl.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      setImageUrl("");
      setModalOpen(false);
      fetchPosts(1);
    } catch {
      setError("Failed to create post.");
    }
  };

  const postVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* What's on your mind button */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white rounded-lg shadow p-4 cursor-pointer flex items-center gap-3 hover:shadow-md transition"
      >
        <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
          {userName[0]}
        </div>
        <p className="text-gray-500">What&apos;s on your mind, {userName}?</p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-lg"
              >
                &times;
              </button>
              <form onSubmit={handlePostSubmit}>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none mb-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400"
                  rows={4}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex gap-4 mb-4 text-blue-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <FaImage /> <span className="text-sm">Image/Video</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <FaSmile /> <span className="text-sm">Feeling</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <FaMapMarkerAlt /> <span className="text-sm">Location</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <FaPlus /> <span className="text-sm">More</span>
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-4"
                />
                {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold shadow hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Post
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <section className="mt-10">
        {loading && (
          <p className="text-center text-gray-600">Loading posts...</p>
        )}
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-500">No posts to show.</p>
        )}

        <ul className="space-y-6">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.li
                key={post.id}
                className="bg-white p-5 rounded-lg shadow"
                variants={postVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <div className="flex items-center space-x-4 mb-3">
                  {post.author.profileImage ? (
                    <Image
                      src={post.author.profileImage}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {post.author.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {post.author.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {post.content}
                </p>
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt="Post"
                    width={800}
                    height={600}
                    className="w-full mt-4 rounded-md max-h-80 object-contain"
                  />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {posts.length > 0 && !loading && (
          <div className="text-center mt-8">
            <motion.button
              onClick={() => fetchPosts(page + 1)}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-md shadow"
              whileTap={{ scale: 0.95 }}
            >
              Load More
            </motion.button>
          </div>
        )}
      </section>
    </main>
  );
}
