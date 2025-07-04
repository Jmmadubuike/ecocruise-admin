"use client";

import { useEffect, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiDollarSign,
  FiMapPin,
  FiDownload,
  FiAlertCircle,
  FiSearch,
  FiCheckCircle,
  FiXOctagon,
} from "react-icons/fi";

type AnalyticsData = {
  totalRevenue: number;
  totalPaidToDrivers: number;
  activeDrivers: number;
  totalRides: number;
  driverPayoutBreakdown: {
    _id: string;
    name: string;
    email: string;
    totalPaid: number;
    lastPaid: string;
  }[];
  studentPayments: {
    name?: string;
    email?: string;
    amount?: number;
    route?: string;
  }[];
};

type AnalyticsSummary = {
  totalCustomers: number;
  totalAdmins: number;
  totalDrivers: number;
  totalBanned: number;
  totalRevenue: number;
  totalDriverWithdrawals: number;
  totalPaidToDrivers: number;
  totalRoutes: number;
  activeDrivers: number;
  totalRides: number;
  driverPayoutBreakdown: AnalyticsData["driverPayoutBreakdown"];
  studentPayments: AnalyticsData["studentPayments"];
};

const dateOptions = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "last7" },
  { label: "This Month", value: "month" },
];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      let query = "";
      if (range === "last7") query = "?range=7";
      else if (range === "month") query = "?range=month";
      else if (fromDate && toDate) query = `?from=${fromDate}&to=${toDate}`;

      const [customersRes, adminsRes, driversRes, bannedRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/admin/users?role=customer`, { credentials: "include" }),
        fetch(`${baseUrl}/api/v1/admin/users?role=admin`, { credentials: "include" }),
        fetch(`${baseUrl}/api/v1/admin/users?role=driver`, { credentials: "include" }),
        fetch(`${baseUrl}/api/v1/admin/users/banned?isBanned=true`, { credentials: "include" }),
      ]);

      const [customers, admins, drivers, banned] = await Promise.all([
        customersRes.json(),
        adminsRes.json(),
        driversRes.json(),
        bannedRes.json(),
      ]);

      const analyticsRes = await fetch(`${baseUrl}/api/v1/admin/analytics${query}`, {
        credentials: "include",
      });
      const analyticsData: { data: AnalyticsData } = await analyticsRes.json();

      const withdrawalsRes = await fetch(`${baseUrl}/api/v1/admin/withdrawals`, {
        credentials: "include",
      });
      const withdrawalsData: { amount: number; status: string }[] = await withdrawalsRes.json();

      const routesRes = await fetch(`${baseUrl}/api/v1/admin/routes`, {
        credentials: "include",
      });
      const routesData = await routesRes.json();

      const paidWithdrawals = withdrawalsData.filter(
        (w) => w.status === "approved" || w.status === "paid"
      );

      const totalPaidToDrivers =
        analyticsData.data?.totalPaidToDrivers ??
        paidWithdrawals.reduce((acc, w) => acc + w.amount, 0);

      setData({
        totalCustomers: customers?.pagination?.total ?? customers?.length ?? 0,
        totalAdmins: admins?.pagination?.total ?? admins?.length ?? 0,
        totalDrivers: drivers?.pagination?.total ?? drivers?.length ?? 0,
        totalBanned: banned?.pagination?.total ?? banned?.length ?? 0,
        totalRevenue: analyticsData.data.totalRevenue || 0,
        totalDriverWithdrawals: withdrawalsData.reduce((acc, w) => acc + w.amount, 0),
        totalPaidToDrivers,
        totalRoutes: routesData?.data?.length ?? routesData?.length ?? 0,
        activeDrivers: analyticsData.data.activeDrivers,
        totalRides: analyticsData.data.totalRides,
        driverPayoutBreakdown: analyticsData.data.driverPayoutBreakdown,
        studentPayments: analyticsData.data.studentPayments,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleDateSearch = () => {
    if (!fromDate || !toDate) return;
    fetchAnalytics();
  };

  if (loading) {
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
        <span>Error loading analytics: {error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="p-6 space-y-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#004aad] mb-1">System Analytics</h1>
          <p className="text-gray-500">Insights into platform metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`btn btn-sm ${
                range === opt.value ? "btn-primary" : "btn-outline"
              }`}
              style={{
                borderColor: "#004aad",
                color: range === opt.value ? "white" : "#004aad",
                backgroundColor: range === opt.value ? "#004aad" : "transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="input input-sm input-bordered"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="input input-sm input-bordered"
        />
        <button
          onClick={handleDateSearch}
          className="btn btn-sm"
          style={{ backgroundColor: "#004aad", color: "white" }}
        >
          <FiSearch className="mr-2" />
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard icon={<FiUsers />} title="Total Customers" value={data.totalCustomers} />
        <AnalyticsCard icon={<FiUserCheck />} title="Total Admins" value={data.totalAdmins} />
        <AnalyticsCard icon={<FiUserPlus />} title="Total Drivers" value={data.totalDrivers} />
        <AnalyticsCard icon={<FiXOctagon />} title="Total Banned Users" value={data.totalBanned} />
        <AnalyticsCard icon={<FiDollarSign />} title="Total Revenue" value={`₦${data.totalRevenue.toLocaleString()}`} />
        <AnalyticsCard icon={<FiDownload />} title="Driver Withdrawals" value={`₦${data.totalDriverWithdrawals.toLocaleString()}`} />
        <AnalyticsCard icon={<FiCheckCircle />} title="Total Paid to Drivers" value={`₦${data.totalPaidToDrivers.toLocaleString()}`} />
        <AnalyticsCard icon={<FiMapPin />} title="Total Routes" value={data.totalRoutes} />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-[#004aad] mb-4">Driver Payout Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Paid</th>
                <th>Last Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.driverPayoutBreakdown.map((driver) => (
                <tr key={driver._id}>
                  <td>{driver.name}</td>
                  <td>{driver.email}</td>
                  <td>₦{driver.totalPaid.toLocaleString()}</td>
                  <td>{new Date(driver.lastPaid).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-[#004aad] mb-4">Student Payments</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Amount Paid</th>
                <th>Route</th>
              </tr>
            </thead>
            <tbody>
              {data.studentPayments.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.name || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>₦{p.amount?.toLocaleString() || "0"}</td>
                  <td>{p.route || "Route Deleted or Not Found"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AnalyticsCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-base-100 rounded-xl shadow p-5 border flex items-center" style={{ borderColor: "#004aad" }}>
      <div className="p-3 rounded-full mr-4" style={{ backgroundColor: "rgba(0, 74, 173, 0.1)", color: "#004aad" }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-[#004aad] mt-1">{value}</p>
      </div>
    </div>
  );
}
