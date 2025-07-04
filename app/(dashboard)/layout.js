"use client";

import { useEffect, useState } from "react";
import Sidebar from "../_components/Sidebar";
import NavBar from "../_components/NavBar";
export default function DashboardLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Hide sidebar on small screens
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define widths in px to use in inline style
  const sidebarWidth = isSidebarOpen ? 256 : 64; // 256px = 16rem, 64px = 4rem (adjust as per your Sidebar css)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />

      {/* Content */}
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: !isMobile ? sidebarWidth : 0,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        <NavBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
          sidebarWidth={sidebarWidth}
        />
        <main className="flex-grow p-4 pt-[64px]">{children}</main>
      </div>
    </div>
  );
}
