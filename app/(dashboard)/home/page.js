"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchPosts = async (pageNumber = 1) => {
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
  };

  useEffect(() => {
    if (token) {
      fetchPosts(1);
    }
  }, [token]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      fetchPosts(1);
    } catch {
      setError("Failed to create post.");
    }
  };

  // Animation variants for posts
  const postVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <main className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <section className="mb-10">
        <form onSubmit={handlePostSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md resize-none mb-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />

          <input
            type="url"
            className="w-full p-3 border border-gray-300 rounded-md mb-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            pattern="https?://.*"
            title="Please enter a valid URL starting with http:// or https://"
          />

          {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-md transition"
            whileTap={{ scale: 0.95 }}
          >
            Post
          </button>
        </form>
      </section>

      <section>
        {loading && (
          <p className="text-center text-gray-600 mb-6 animate-pulse font-medium">Loading posts...</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-600 font-medium">No posts to show.</p>
        )}

        <ul className="space-y-10">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.li
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-md"
                variants={postVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-4 mb-2">
                  {post.author.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                      {post.author.name[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 text-base">{post.author.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-gray-800 whitespace-pre-line text-sm">{post.content}</p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full max-h-72 object-contain rounded-md mt-4"
                    loading="lazy"
                  />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {posts.length > 0 && !loading && (
          <div className="text-center mt-10">
            <motion.button
              onClick={() => fetchPosts(page + 1)}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-md font-semibold shadow-md transition"
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
