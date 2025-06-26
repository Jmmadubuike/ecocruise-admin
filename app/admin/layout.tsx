// File: components/layouts/AdminLayout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  FiHome,
  FiMap,
  FiUsers,
  FiTruck,
  FiPieChart,
  FiDollarSign,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiSettings,
} from "react-icons/fi";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <FiHome className="w-5 h-5" /> },
  { label: "Routes", href: "/admin/routes", icon: <FiMap className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <FiUsers className="w-5 h-5" /> },
  { label: "Tickets", href: "/admin/tickets", icon: <FiTruck className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <FiPieChart className="w-5 h-5" /> },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: <FiDollarSign className="w-5 h-5" /> },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    await fetchUser();
    router.push("/login");
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-full bg-white border-r shadow-sm">
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <h4 className="uppercase text-xs text-gray-400 tracking-widest px-2 mb-3">Menu</h4>
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={`${isActive(href) ? "text-primary" : "text-gray-500"} w-5 h-5`}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive("/admin/settings")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiSettings className="w-5 h-5 text-gray-500" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed z-40 top-0 left-0 h-screen w-72 bg-white border-r shadow-md transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={`${isActive(href) ? "text-primary" : "text-gray-500"} w-5 h-5`}>{icon}</span>
              {label}
            </Link>
          ))}
          <div className="mt-6 border-t pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
