"use client";

import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage(data.message || "If this email exists, a reset link was sent.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#e0f7f7]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#0593a5] mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0593a5]"
          />

          {error && <p className="text-red-600 text-sm text-center font-semibold">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center font-semibold">{message}</p>}

          <button
            type="submit"
            className="w-full bg-[#0593a5] text-white py-3 rounded-md hover:bg-[#037a7a] transition font-semibold text-lg"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
