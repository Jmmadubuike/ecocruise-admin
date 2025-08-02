"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiHome,
  FiMap,
  FiUsers,
  FiTruck,
  FiPieChart,
  FiDollarSign,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { FiCreditCard } from "react-icons/fi";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: FiHome },
  { label: "Routes", href: "/admin/routes", icon: FiMap },
  { label: "Users", href: "/admin/users", icon: FiUsers },
  { label: "Wallet Update", href: "/admin/wallet", icon: FiCreditCard },
  { label: "Tickets", href: "/admin/tickets", icon: FiTruck },
  { label: "Analytics", href: "/admin/analytics", icon: FiPieChart },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: FiDollarSign },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    await fetchUser();
    router.push("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-full bg-white border-r shadow-sm">
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <h4 className="uppercase text-xs text-gray-400 tracking-widest px-2 mb-3">
            Menu
          </h4>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive(href) ? "text-primary" : "text-gray-500"
                }`}
              />
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

      {/* Mobile Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow md:hidden flex justify-around items-center px-2 py-2"
        aria-label="Bottom Navigation"
      >
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1 text-xs font-medium transition ${
                active ? "text-primary" : "text-gray-600 hover:text-primary"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  active ? "text-primary" : "text-gray-500"
                }`}
              />
              <span className="hidden sm:inline truncate">{label}</span>
            </Link>
          );
        })}

        {/* Logout Icon (mobile only) */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1 text-xs font-medium text-red-600 hover:text-red-700"
        >
          <FiLogOut className="w-5 h-5 mb-0.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
