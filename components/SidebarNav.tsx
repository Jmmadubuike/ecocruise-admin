"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MapIcon,
  UsersIcon,
  TicketIcon,
  ChartBarIcon,
  BanknotesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Routes", href: "/admin/routes", icon: MapIcon },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Wallet Update", href: "/admin/wallet", icon: WalletIcon },
  { label: "Tickets", href: "/admin/tickets", icon: TicketIcon },
  { label: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: BanknotesIcon },
];

const ACTIVE_BG = "#004aad";
const ACTIVE_TEXT = "#ffffff";
const HOVER_BG = "rgba(0, 74, 173, 0.1)";
const INACTIVE_TEXT = "#333333";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col bg-base-100 border-r border-base-300 shadow-lg h-full sticky top-0 p-4 space-y-1 w-64"
      aria-label="Admin navigation"
    >
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200`}
            aria-current={isActive ? "page" : undefined}
            style={{
              backgroundColor: isActive ? ACTIVE_BG : undefined,
              color: isActive ? ACTIVE_TEXT : INACTIVE_TEXT,
              boxShadow: isActive ? "0 0 10px rgba(0,74,173,0.6)" : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = HOVER_BG;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "";
            }}
          >
            <Icon
              className="w-5 h-5 transition-transform duration-200"
              style={{ color: isActive ? ACTIVE_TEXT : ACTIVE_BG }}
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
