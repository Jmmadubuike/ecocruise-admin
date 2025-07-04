"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Roles } from "@/types/User";
import {
  FiUsers,
  FiDollarSign,
  FiMap,
  FiTruck,
  FiAlertCircle,
  FiClock,
  FiUser,
} from "react-icons/fi";

type StatItem = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
  icon: React.ReactNode;
};

type PendingActionItem = {
  id: string;
  title: string;
  action: string;
  type: "withdrawal" | "ticket";
};

type DashboardData = {
  stats: StatItem[];
  recentActivities: ActivityItem[];
  pendingActions: PendingActionItem[];
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    recentActivities: [],
    pendingActions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!loading && (!user || user.role !== Roles.ADMIN)) {
      router.push("/login");
      return;
    }

    if (user?.role === Roles.ADMIN) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchWithCookies = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) router.push("/login");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        analyticsData,
        withdrawalsData,
        ticketsData,
        usersData,
        routesData,
      ] = await Promise.all([
        fetchWithCookies(`${baseUrl}/api/v1/admin/analytics`),
        fetchWithCookies(`${baseUrl}/api/v1/admin/withdrawals?status=pending`),
        fetchWithCookies(`${baseUrl}/api/v1/admin/support-tickets?limit=5`),
        fetchWithCookies(`${baseUrl}/api/v1/admin/users?role=customer&limit=5`),
        fetchWithCookies(`${baseUrl}/api/v1/admin/routes?limit=5`),
      ]);

      setDashboardData({
        stats: [
          {
            title: "Total Users",
            value:
              usersData?.pagination?.total ??
              usersData?.length ??
              usersData?.data?.length ??
              0,
            icon: <FiUsers className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Revenue",
            value: `₦${(
              analyticsData?.data?.totalRevenue || 0
            ).toLocaleString()}`,
            icon: <FiDollarSign className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Active Routes",
            value: routesData?.length || routesData?.data?.length || 0,
            icon: <FiMap className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Total Trips",
            value: analyticsData?.data?.totalRides || 0,
            icon: <FiTruck className="w-6 h-6 text-[#004aad]" />,
          },
        ],
        recentActivities: [
          ...(usersData?.data?.slice(0, 3).map((user: any) => ({
            id: user._id,
            user: user.name || user.email || "Unknown",
            action: "Created account",
            time: "Recently",
            icon: <FiUser className="text-[#004aad]" />,
          })) ?? []),
          ...(ticketsData?.data?.slice(0, 2).map((ticket: any) => ({
            id: ticket._id,
            user: ticket.user?.name || "User",
            action: `Submitted ticket: ${ticket.subject}`,
            time: new Date(ticket.createdAt).toLocaleTimeString(),
            icon: <FiAlertCircle className="text-[#f80b0b]" />,
          })) ?? []),
        ],
        pendingActions: [
          ...(withdrawalsData?.data?.map((w: any) => ({
            id: w._id,
            title: `Withdrawal: ₦${w.amount} by ${w.driver?.name || "Driver"}`,
            action: "Review",
            type: "withdrawal" as const,
          })) ?? []),
          ...(ticketsData?.data?.map((t: any) => ({
            id: t._id,
            title: `Ticket: ${t.subject?.substring(0, 30) ?? "No subject"}...`,
            action: "Respond",
            type: "ticket" as const,
          })) ?? []),
        ],
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleActionClick = (action: PendingActionItem) => {
    const path =
      action.type === "withdrawal"
        ? `/admin/withdrawals/${action.id}`
        : `/admin/tickets`;
    router.push(path);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4"
          style={{ borderColor: "#004aad", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert shadow-lg mt-10 mx-auto w-full max-w-3xl p-4 rounded flex items-center gap-3 bg-red-600 text-white">
        <FiAlertCircle className="text-xl" />
        <span>Error loading dashboard: {error}</span>
        <button
          className="btn btn-sm border-white text-red-600 bg-white font-bold"
          onClick={fetchDashboardData}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user || user.role !== Roles.ADMIN) {
    router.push("/login");
    return null;
  }

  return (
    <section className="p-6 space-y-8 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#004aad]">
            {getTimeBasedGreeting()}, {user.name}
          </h1>
          <p className="text-gray-500">Administrative Overview</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-sm btn-outline border-[#004aad] text-[#004aad] font-semibold"
        >
          <FiClock className="mr-2" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-base-100 shadow-lg rounded-xl p-5 flex items-center border border-[#004aad]"
          >
            <div className="p-3 rounded-full mr-4 bg-[#004aad1a] text-[#004aad]">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold mt-1 text-[#004aad]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-base-100 rounded-xl shadow p-6 border border-[#004aad]">
          <h2 className="text-xl font-semibold mb-4 text-[#004aad]">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0 border-[#004aad]"
                >
                  <div className="text-xl">{activity.icon}</div>
                  <div>
                    <p className="font-semibold text-[#004aad]">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <FiClock />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow p-6 border border-[#004aad]">
          <h2 className="text-xl font-semibold mb-4 text-[#004aad]">
            Pending Actions ({dashboardData.pendingActions.length})
          </h2>
          <div className="space-y-4">
            {dashboardData.pendingActions.length > 0 ? (
              dashboardData.pendingActions.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3 last:border-b-0 border-[#004aad]"
                >
                  <p className="text-sm text-gray-700">{item.title}</p>
                  <button
                    onClick={() => handleActionClick(item)}
                    className="btn btn-xs btn-outline border-[#004aad] text-[#004aad] font-semibold"
                  >
                    {item.action}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No pending actions.</p>
            )}
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-[#004aad] mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { href: "/admin/users", label: "Users" },
                { href: "/admin/routes", label: "Routes" },
                { href: "/admin/withdrawals", label: "Withdrawals" },
                { href: "/admin/tickets", label: "Tickets" },
                { href: "/admin/analytics", label: "Analytics" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-md shadow-sm bg-white hover:bg-blue-50 text-[#004aad] border border-[#004aad] font-medium text-sm transition-colors duration-200 text-center"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
