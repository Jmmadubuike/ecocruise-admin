"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const LOGOUT_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout`;
const PRIMARY_COLOR = "bg-[#004aad]";
const HOVER_COLOR = "hover:bg-[#f80b0b]";

export default function Navbar() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: "POST",
        credentials: "include",
      });
      await fetchUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Optionally, add toast error notification here
    }
  }, [fetchUser, router]);

  if (loading) {
    // You may want to render a skeleton loader or placeholder here
    return null;
  }

  return (
    <nav
      className={`navbar sticky top-0 z-50 px-4 md:px-8 border-b border-[#004aad]/10 shadow-lg bg-base-100`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="EcoCruise Logo"
            width={36}
            height={36}
            className="rounded"
            style={{ height: "auto" }} // <-- Add this
            priority
          />

          <span className={`text-xl font-bold text-[#004aad] hidden sm:inline`}>
            EcoCruise Admin
          </span>
        </Link>
      </div>

      <div className="flex-none">
        {user ? (
          <div className="dropdown dropdown-end" tabIndex={0}>
            <button
              className="btn btn-ghost btn-circle avatar ring ring-[#004aad] ring-offset-2"
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="User menu"
              type="button"
            >
              <div className="w-10 rounded-full bg-[#004aad] text-white flex items-center justify-center font-semibold select-none">
                {(user.name && user.name.charAt(0).toUpperCase()) || "U"}
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-4 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-60 border border-[#004aad]/20"
              role="menu"
              aria-label="User menu options"
            >
              <li className="mb-2" role="none">
                <div
                  className="text-sm font-medium text-gray-700"
                  role="presentation"
                >
                  Signed in as
                </div>
                <div
                  className="text-sm text-[#004aad] font-bold truncate"
                  role="presentation"
                  title={user.name}
                >
                  {user.name}
                </div>
                <div
                  className="text-xs text-gray-500 truncate"
                  role="presentation"
                  title={user.email}
                >
                  {user.email}
                </div>
              </li>
              <li role="none">
                <Link
                  href="/admin/dashboard"
                  className="hover:text-[#004aad] block"
                  role="menuitem"
                  tabIndex={-1}
                >
                  Dashboard
                </Link>
              </li>
              <li role="none">
                <button
                  onClick={handleLogout}
                  className="text-[#f80b0b] hover:text-[#004aad] block w-full text-left"
                  role="menuitem"
                  tabIndex={-1}
                  type="button"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link
            href="/login"
            className={`${PRIMARY_COLOR} ${HOVER_COLOR} btn border-none text-white transition-colors duration-200`}
            aria-label="Login"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
