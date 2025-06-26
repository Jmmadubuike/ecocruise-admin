"use client";
import useAuth from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiDollarSign,
  FiMap,
  FiTruck,
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivities: [],
    pendingActions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user?.role === "admin") {
      fetchDashboardData();
    }
  }, [user, loading]);

  const fetchWithCookies = async (url, options = {}) => {
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
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const [
        analyticsData,
        withdrawalsData,
        ticketsData,
        usersData,
        routesData,
      ] = await Promise.all([
        fetchWithCookies(`${baseUrl}/analytics`),
        fetchWithCookies(`${baseUrl}/withdrawals?status=pending`),
        fetchWithCookies(`${baseUrl}/support-tickets?status=pending`),
        fetchWithCookies(`${baseUrl}/users?role=customer&limit=5`),
        fetchWithCookies(`${baseUrl}/routes?limit=5`),
      ]);

      setDashboardData({
        stats: [
          {
            title: "Total Users",
            value: usersData.pagination?.total || usersData.length || 0,
            icon: <FiUsers className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Revenue",
            value: `₦${(
              analyticsData.data?.totalRevenue || 0
            ).toLocaleString()}`,
            icon: <FiDollarSign className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Active Routes",
            value: routesData.length || 0,
            icon: <FiMap className="w-6 h-6 text-[#004aad]" />,
          },
          {
            title: "Total Trips",
            value: analyticsData.data?.totalRides || 0,
            icon: <FiTruck className="w-6 h-6 text-[#004aad]" />,
          },
        ],
        recentActivities: [
          ...(usersData.data?.slice(0, 3).map((user) => ({
            id: user._id,
            user: user.name || user.email,
            action: "Created account",
            time: "Recently",
            icon: <FiUser className="text-[#004aad]" />,
          })) || []),
          ...((ticketsData.data || ticketsData).slice(0, 2).map((ticket) => ({
            id: ticket._id,
            user: ticket.user?.name || "User",
            action: `Submitted ticket: ${ticket.subject}`,
            time: new Date(ticket.createdAt).toLocaleTimeString(),
            icon: <FiAlertCircle className="text-[#f80b0b]" />,
          })) || []),
        ],
        pendingActions: [
          ...((withdrawalsData.data || withdrawalsData).map((w) => ({
            id: w._id,
            title: `Withdrawal: ₦${w.amount} by ${w.driver?.name || "Driver"}`,
            action: "Review",
            type: "withdrawal",
          })) || []),
          ...((ticketsData.data || ticketsData).map((t) => ({
            id: t._id,
            title: `Ticket: ${t.subject.substring(0, 30)}...`,
            action: "Respond",
            type: "ticket",
          })) || []),
        ],
      });
    } catch (err) {
      setError(err.message);
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  const handleActionClick = (action) => {
    if (action.type === "withdrawal") {
      router.push(`/admin/withdrawals/${action.id}`);
    } else if (action.type === "ticket") {
      router.push(`/admin/support-tickets/${action.id}`);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4"
          style={{ borderColor: "#004aad", borderTopColor: "transparent" }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="alert shadow-lg mt-10 mx-auto w-full max-w-3xl p-4 rounded flex items-center gap-3"
        style={{ backgroundColor: "#f80b0b", color: "white" }}
      >
        <FiAlertCircle className="text-xl" />
        <span>Error loading dashboard: {error}</span>
        <button
          className="btn btn-sm"
          style={{
            borderColor: "white",
            color: "#f80b0b",
            backgroundColor: "white",
            fontWeight: "bold",
          }}
          onClick={fetchDashboardData}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <section className="p-6 space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#004aad]">
            {getTimeBasedGreeting()}, {user.firstName}
          </h1>
          <p className="text-gray-500">Administrative Overview</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-sm btn-outline"
          style={{
            borderColor: "#004aad",
            color: "#004aad",
            fontWeight: "600",
          }}
        >
          <FiClock className="mr-2" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-base-100 shadow-lg rounded-xl p-5 flex items-center"
            style={{ border: "1px solid #004aad" }}
          >
            <div
              className="p-3 rounded-full mr-4"
              style={{
                backgroundColor: "rgba(0, 74, 173, 0.1)",
                color: "#004aad",
              }}
            >
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

      {/* Content Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div
          className="lg:col-span-2 bg-base-100 rounded-xl shadow p-6"
          style={{ border: "1px solid #004aad" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#004aad]">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                  style={{ borderColor: "#004aad" }}
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

        {/* Pending Actions + Quick Links */}
        <div
          className="bg-base-100 rounded-xl shadow p-6"
          style={{ border: "1px solid #004aad" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#004aad]">
            Pending Actions ({dashboardData.pendingActions.length})
          </h2>
          <div className="space-y-4">
            {dashboardData.pendingActions.length > 0 ? (
              dashboardData.pendingActions.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3 last:border-b-0"
                  style={{ borderColor: "#004aad" }}
                >
                  <p className="text-sm text-gray-700">{item.title}</p>
                  <button
                    onClick={() => handleActionClick(item)}
                    className="btn btn-xs btn-outline"
                    style={{
                      borderColor: "#004aad",
                      color: "#004aad",
                      fontWeight: "600",
                    }}
                  >
                    {item.action}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No pending actions.</p>
            )}
          </div>

          {/* Quick Links */}
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
