"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token and user details to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id); // or data.user._id if using MongoDB
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userImage", data.user.profileImage || "");

      router.push("/home");
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="bg-[#5aebeb] p-8 rounded-lg shadow-lg w-full max-w-[350px]">
        <form className="space-y-5" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038d8d] focus:border-transparent transition"
            required
          />

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038d8d] focus:border-transparent transition"
              required
            />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-[#034747] hover:text-[#026262] font-semibold"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 font-semibold text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#0593a5] text-white py-3 rounded-md hover:bg-[#037a7a] transition font-semibold text-lg"
          >
            Sign In
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-400" />
            <span className="mx-3 text-[#034747] font-semibold">OR</span>
            <hr className="flex-grow border-gray-400" />
          </div>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full border-2 border-[#0593a5] text-[#0593a5] py-3 rounded-md hover:bg-[#0593a5] hover:text-white transition font-semibold text-lg"
          >
            Create an Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
