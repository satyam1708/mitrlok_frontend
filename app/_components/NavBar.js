"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/home" },
    { name: "My Connections", href: "/connections" },
    { name: "Messaging", href: "/messaging" },
    { name: "Notifications", href: "/notifications" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="bg-white shadow-md px-6 py-3 sticky top-0 z-50">
      <ul className="flex space-x-6 max-w-5xl mx-auto">
        {links.map(({ name, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={`text-gray-700 hover:text-blue-600 font-medium ${
                pathname === href ? "text-blue-600 border-b-2 border-blue-600" : ""
              }`}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
