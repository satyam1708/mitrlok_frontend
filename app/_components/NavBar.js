"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaBell,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";
export default function NavBar({ isSidebarOpen, setIsSidebarOpen, isMobile, sidebarWidth }) {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/home", icon: <FaHome size={20} /> },
    { name: "My Connections", href: "/connections", icon: <FaUserFriends size={20} /> },
    { name: "Messaging", href: "/messaging", icon: <FaComments size={20} /> },
    { name: "Notifications", href: "/notifications", icon: <FaBell size={20} /> },
    { name: "Profile", href: "/profile", icon: <FaUserCircle size={20} /> },
  ];

  return (
    <nav
  className="fixed top-0 z-50 bg-gradient-to-r from-[#c2eef4] to-[#a4d8e3] shadow-md transition-all duration-300"
  style={{
    left: !isMobile ? sidebarWidth : 0,
    width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
    height: 64,
  }}
>
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Left - Logo & Toggle */}
        <div className="flex items-center space-x-3">
          {/* Hamburger for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-[#037a7a] mr-2 focus:outline-none"
              aria-label="Open sidebar"
            >
              <FaBars size={22} />
            </button>
          )}

          <Link href="/home" className="flex items-center space-x-2 shrink-0">
            <Image
              src="/mitrlokimage.png"
              alt="MitrLok Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-[#037a7a] hidden sm:inline">MitrLok</span>
          </Link>
        </div>

        {/* Right - Navigation Links */}
        <ul
          className="
            flex
            space-x-2
            sm:space-x-5
            overflow-x-auto
            scrollbar-hide
            whitespace-nowrap
            flex-wrap
            sm:flex-nowrap
          "
          aria-label="Primary Navigation"
        >
          {links.map(({ name, href, icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} title={name} className="flex-shrink-0">
                <Link
                  href={href}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm md:text-base
                    ${
                      isActive
                        ? "bg-[#0593a5] text-white shadow-md"
                        : "text-gray-800 hover:bg-[#d3f1f6] hover:text-[#037a7a]"
                    }
                  `}
                >
                  {icon}
                  <span className="hidden sm:inline">{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
