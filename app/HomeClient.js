"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginForm from "./_components/LoginForm";

// Shuffle helper
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Group images into chunks (tabs)
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function HomeClient({ initialImages, allImages }) {
  const router = useRouter();
  const [tabs, setTabs] = useState(chunkArray(shuffle(allImages), 6)); // multiple tabs of 6 images
  const [activeTab, setActiveTab] = useState(0);
  const [images, setImages] = useState(tabs[0] || []);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;

      if (tick % 5 === 0) {
        // Tab switch every 5 ticks (i.e., 5*1.5s = 7.5s)
        setActiveTab((prevTab) => (prevTab + 1) % tabs.length);
      } else {
        // Rotate images every 1.5s
        setImages((prev) => {
          const next = [...prev];
          const first = next.shift();
          next.push(first);
          return next;
        });
      }

      setKey((k) => k + 1); // AnimatePresence rerender
    }, 1800);

    return () => clearInterval(interval);
  }, [tabs]);

  // Update images on tab change
  useEffect(() => {
    setImages(tabs[activeTab] || []);
    setKey((k) => k + 1);
  }, [activeTab, tabs]);

  // Handle tab click manually
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <main className="flex flex-col lg:flex-row h-screen" role="main">
      {/* Info Section */}
      <section className="lg:w-1/2 w-full flex justify-center items-center bg-[#FFF8E7] px-6 py-12 lg:py-16">
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
            <span className="font-semibold text-[#FF9966]">conversations</span> — MitrLok brings like-minded people together in your city.
          </p>

          {/* Image Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
            <AnimatePresence mode="wait" initial={false} key={key}>
              {images.map((src, index) => (
                <motion.div
                  key={src}
                  className="rounded-lg overflow-hidden h-20 sm:h-24 w-full relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Image
                    src={src}
                    alt={`MitrLok community image ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    priority={index < 2}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Tab buttons */}
          <div className="flex justify-center mt-4 space-x-2">
            {tabs.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i === activeTab ? "bg-[#FF9966]" : "bg-gray-300"
                }`}
                onClick={() => handleTabClick(i)}
                aria-label={`Go to tab ${i + 1}`}
              ></button>
            ))}
          </div>

          {/* CTA */}
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
            <blockquote className="text-sm italic text-gray-600">
              “I found my startup co-founder on MitrLok. We clicked instantly over our love for clean code and strong chai!”
              <footer className="font-semibold text-[#FF9966] mt-1">— Arjun, Bangalore</footer>
            </blockquote>
            <blockquote className="text-sm italic text-gray-600">
              “Finally found a weekend football group in my city. MitrLok just makes it easy.”
              <footer className="font-semibold text-[#FF9966] mt-1">— Priya, Pune</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="lg:w-1/2 w-full flex justify-center items-center bg-gradient-to-br from-[#c2eef4] to-[#a4d8e3] px-6 py-16 sm:py-20">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-500 mb-6">
            Sign in to continue your journey with MitrLok
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
