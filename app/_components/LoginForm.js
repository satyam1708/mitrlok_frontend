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
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userImage", data.user.profileImage || "");

      router.push("/home");
    } catch {
      setError("Something went wrong");
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0593a5] focus:border-transparent transition text-sm";

  return (
    <div className="flex justify-center items-center h-full w-full px-4 sm:px-6">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-900 p-5 sm:p-6 md:p-8 rounded-xl shadow-md max-w-sm w-full space-y-4"
        noValidate
      >
        <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
          Sign In to MitrLok
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
          autoComplete="current-password"
        />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-2 sm:space-y-0">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-[#0593a5] hover:text-[#037a7a] font-semibold"
          >
            Forgot Password?
          </button>
          {error && (
            <p className="text-red-600 font-semibold text-xs max-w-full sm:max-w-xs truncate">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#0593a5] hover:bg-[#037a7a] text-white py-2 rounded-md font-semibold text-base transition-shadow shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#037a7a]"
        >
          Sign In
        </button>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="mx-2 font-semibold select-none">OR</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>

        <button
          type="button"
          onClick={() => router.push("/register")}
          className="w-full border-2 border-[#0593a5] text-[#0593a5] hover:bg-[#0593a5] hover:text-white py-2 rounded-md font-semibold text-base transition"
        >
          Create an Account
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
