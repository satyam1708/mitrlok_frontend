"use client";

import {
  FaGamepad,
  FaBriefcase,
  FaUsers,
  FaTools,
  FaBuilding,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaHandsHelping,
  FaShieldAlt,
  FaAmbulance,
  FaMicrophone,
  FaUserShield,
  FaClipboardCheck,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarLinks = [
  // === USER ===
  {
    name: "Profile",
    icon: "/mitrlokimage.png",
    href: "/profile",
    isProfile: true,
  },
  {
    name: "Local Superheroes",
    icon: <FaUserShield />,
    href: "/local-superhero",
  },

  // === NETWORKING & SOCIAL ===
  { name: "Teams / Groups", icon: <FaUsers />, href: "/teams" },
  { name: "Games", icon: <FaGamepad />, href: "/games" },
  { name: "Hire", icon: <FaBriefcase />, href: "/hire" },
  { name: "Interview", icon: <FaClipboardCheck />, href: "/interview" },

  // === UTILITIES ===
  { name: "Tools", icon: <FaTools />, href: "/tools" },
  { name: "Offices", icon: <FaBuilding />, href: "/offices" },
  { name: "AI Voice Assistant", icon: <FaMicrophone />, href: "/voice-assistant" },

  // === SAFETY & SUPPORT ===
  { name: "Emergency", icon: <FaExclamationTriangle />, href: "/emergency" },
  { name: "Ambulance", icon: <FaAmbulance />, href: "/ambulance" },
  { name: "Safety", icon: <FaShieldAlt />, href: "/safety" },
  { name: "Help", icon: <FaHandsHelping />, href: "/help" },
];

export default function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    setUserName(storedName || "User");
  }, []);

  const handleClose = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={handleClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-white border-r transition-all duration-300
          ${isOpen ? "w-64" : "w-16"}
          ${!isMobile || isOpen ? "block" : "hidden"}
          flex flex-col
        `}
      >
        {/* Top Bar with Search & Toggle */}
        <div
          className="flex items-center justify-between gap-2 border-b px-4"
          style={{ height: 64 }}
        >
          {isOpen && (
            <input
              type="text"
              placeholder="Search people..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#037a7a]"
            />
          )}

          <button
            className="text-gray-600 hover:text-gray-900 flex-shrink-0 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <FaChevronLeft size={18} /> : <FaChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="mt-2 flex-1 space-y-2 px-2">
          {sidebarLinks.map(({ name, icon, href, isProfile }) => {
            const isActive = pathname === href;

            return (
              <li key={name}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={handleClose}
                  className={`
                    flex items-center gap-3 p-2 rounded-md transition
                    ${
                      isActive
                        ? "bg-[#0593a5] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-[#037a7a]"
                    }
                    focus:outline-none focus:ring-2 focus:ring-[#037a7a]
                    cursor-pointer
                  `}
                >
                  {isProfile ? (
                    <>
                      <Image
                        src={icon}
                        alt="Profile Picture"
                        width={isOpen ? 60 : 40}
                        height={isOpen ? 60 : 40}
                        className="rounded-full flex-shrink-0"
                      />
                      {isOpen && (
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {userName}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      {isOpen && (
                        <span className="text-sm font-medium">{name}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
