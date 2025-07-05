"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResending(false);

      if (!res.ok) {
        setError(data.message || "Failed to resend OTP");
      } else {
        setMessage("OTP resent successfully");
      }
    } catch (err) {
      console.error(err);
      setResending(false);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f0faff]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#0593a5] mb-4">Verify Your Email</h1>
        <p className="text-sm text-center mb-4">Enter the OTP sent to <b>{email}</b></p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0593a5]"
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <button
            type="submit"
            className="w-full bg-[#0593a5] text-white py-3 rounded-md hover:bg-[#037a7a] transition font-semibold text-lg"
          >
            Verify Email
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Didn&apos;t receive the OTP?{" "}
          <button
            className="text-[#0593a5] hover:underline font-semibold"
            onClick={handleResendOtp}
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </p>
      </div>
    </div>
  );
}
