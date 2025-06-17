"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LoginForm from "./_components/LoginForm";

export default function Home() {
  const router = useRouter();

  const images = useMemo(() => {
    const allImages = [
      "/img1.jpg",
      "/img2.jpg",
      "/img3.jpg",
      "/img4.jpg",
      "/img5.jpg",
      "/img6.jpg",
      "/img7.jpg",
      "/img9.jpg",
      "/img10.jpg",
      "/img11.jpg",
    ];
    return allImages.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Half - Info Section */}
      <div className="lg:w-1/2 w-full flex justify-center items-center bg-[#FFF8E7] px-6 py-12 lg:py-16">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#FF9966] italic tracking-tight drop-shadow-sm">
            MitrLok
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-800 leading-relaxed">
            Discover friendships around shared interests. <br />
            From{" "}
            <span className="font-semibold text-[#FF9966]">coding</span> and{" "}
            <span className="font-semibold text-[#FF9966]">cricket</span> to{" "}
            <span className="font-semibold text-[#FF9966]">coffee</span> and{" "}
            <span className="font-semibold text-[#FF9966]">conversations</span> —MitrLok brings like-minded people together in your city.
          </p>

          {/* Dynamic Image Grid with Animation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
            {images.map((src, index) => (
              <motion.img
                key={index}
                src={src}
                alt={`mitrlok-${index}`}
                className="rounded-lg object-cover h-20 sm:h-24 w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            ))}
          </div>

          {/* CTA Button with Link to /register */}
          <div className="mt-6">
            <button
              onClick={() => router.push("/register")}
              className="inline-block bg-[#FF9966] text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition"
            >
              Explore Your Circle
            </button>
          </div>

          {/* Testimonials */}
          <div className="mt-8 space-y-4 max-w-md mx-auto lg:mx-0">
            <div className="text-sm italic text-gray-600">
              “I found my startup co-founder on MitrLok. We clicked instantly over our love for clean code and strong chai!”
              <br />
              <span className="font-semibold text-[#FF9966]">— Arjun, Bangalore</span>
            </div>
            <div className="text-sm italic text-gray-600">
              “Finally found a weekend football group in my city. MitrLok just makes it easy.”
              <br />
              <span className="font-semibold text-[#FF9966]">— Priya, Pune</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Login Section */}
      <div className="lg:w-1/2 w-full flex justify-center items-center bg-gradient-to-br from-[#c2eef4] to-[#a4d8e3] px-6 py-16 sm:py-20">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-500 mb-6">
            Sign in to continue your journey with MitrLok
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
