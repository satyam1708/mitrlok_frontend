"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    city: "",
    state: "",
    interests: "",
    profileImage: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          interests: form.interests
            .split(",")
            .map((interest) => interest.trim())
            .filter((i) => i),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#e5f9f9]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-[#0593a5] mb-6">Create Account</h1>

        <form className="space-y-4" onSubmit={handleRegister}>
          {[
            ["name", "Full Name"],
            ["email", "Email"],
            ["password", "Password", "password"],
            ["bio", "Bio"],
            ["city", "City"],
            ["state", "State"],
            ["interests", "Interests (comma-separated)"],
            ["profileImage", "Profile Image URL"],
          ].map(([name, label, type = "text"]) => (
            <input
              key={name}
              type={type}
              name={name}
              placeholder={label}
              value={form[name]}
              onChange={handleChange}
              required={["name", "email", "password"].includes(name)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0593a5]"
            />
          ))}

          {error && <p className="text-red-600 text-sm font-semibold text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold text-center">{success}</p>}

          <button
            type="submit"
            className="w-full bg-[#0593a5] text-white py-3 rounded-md hover:bg-[#037a7a] transition font-semibold text-lg"
          >
            Register
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <span
              className="text-[#0593a5] hover:underline cursor-pointer font-semibold"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
