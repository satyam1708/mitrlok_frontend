"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

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
    try {
      const res = await axios.get(`${API_URL}/feed?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}`,
        "userId": userId },
      });
      if (pageNumber === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setPage(pageNumber);
    } catch (err) {
      setError("Failed to load posts");
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
    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/posts`,
        { content, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      setImageUrl("");
      setError("");
      fetchPosts(1); // refresh feed after posting
    } catch (err) {
      setError("Failed to create post");
    }
  };

  return (
    <>
      <main className="max-w-3xl mx-auto p-4">
        <section className="mb-6">
          <form onSubmit={handlePostSubmit} className="bg-white p-4 rounded shadow">
            <textarea
              className="w-full p-2 border rounded resize-none mb-2"
              rows={4}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post
            </button>
          </form>
        </section>

        <section>
          {loading && <p>Loading posts...</p>}
          {posts.length === 0 && !loading && <p>No posts to show</p>}
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center space-x-3 mb-2">
                  {post.author.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {post.author.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.author.profession}</p>
                  </div>
                </div>
                <p className="mb-2">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="max-h-64 w-full object-contain rounded"
                  />
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          {posts.length > 0 && !loading && (
            <div className="text-center mt-4">
              <button
                onClick={() => fetchPosts(page + 1)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Load More
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
