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
} from "react-icons/fa";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/home", icon: <FaHome size={20} /> },
    { name: "My Connections", href: "/connections", icon: <FaUserFriends size={20} /> },
    { name: "Messaging", href: "/messaging", icon: <FaComments size={20} /> },
    { name: "Notifications", href: "/notifications", icon: <FaBell size={20} /> },
    { name: "Profile", href: "/profile", icon: <FaUserCircle size={20} /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#c2eef4] to-[#a4d8e3] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        {/* Left - Logo */}
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
                  {/* Hide text on xs, show on sm+ */}
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
