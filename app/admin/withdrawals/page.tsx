// File: app/admin/withdrawals/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  method?: string;
  note?: string;
  driver: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    earnings: {
      total: number;
    };
  };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const cache = useRef<Record<string, Withdrawal[]>>({});

  const fetchWithdrawals = async (status: string) => {
    if (cache.current[status]) {
      setWithdrawals(cache.current[status]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/withdrawals?status=${status}`,
        { credentials: "include" }
      );

      if (res.status === 429) {
        toast.error("Too many requests. Please slow down.");
        return;
      }

      const data = await res.json();
      cache.current[status] = data;
      setWithdrawals(data);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      toast.error("Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useRef(
    debounce((status: string) => fetchWithdrawals(status), 300)
  ).current;

  const updateStatus = async (
    id: string,
    action: "approve" | "reject",
    note?: string
  ) => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/withdrawals/${id}/${action}`;

      const options: RequestInit = {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      };

      if (action === "reject") {
        options.body = JSON.stringify({ note: note || "Rejected by admin" });
      }

      const res = await fetch(endpoint, options);

      if (res.ok) {
        toast.success(`Withdrawal ${action}d successfully`);
        delete cache.current[statusFilter];
        fetchWithdrawals(statusFilter);
      } else {
        const errorData = await res.json();
        toast.error(errorData?.error || `Failed to ${action} withdrawal`);
      }
    } catch (err) {
      console.error(`Error updating withdrawal ${action}:`, err);
      toast.error(`Error: Could not ${action} withdrawal`);
    }
  };

  useEffect(() => {
    setLoading(true);
    debouncedFetch(statusFilter);
  }, [statusFilter, debouncedFetch]);

  if (loading)
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-gray-600">
        <FiLoader className="animate-spin text-blue-600" /> Loading
        withdrawals...
      </div>
    );

  const statusColorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Withdrawals</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium text-gray-700">
          Filter by status:
        </label>
        <select
          className="px-3 py-2 border border-blue-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={statusFilter}
          onChange={(e) => {
            setLoading(true);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {withdrawals.length === 0 ? (
        <p className="text-gray-500 italic">
          No <span className="font-semibold">{statusFilter}</span> withdrawal
          requests.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {w.driver.firstName} {w.driver.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">
                    ₦{w.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColorMap[w.status]
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {w.status === "pending" && (
                      <div className="flex flex-col md:flex-row gap-2">
                        <button
                          onClick={() => updateStatus(w._id, "approve")}
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow w-full md:w-auto"
                        >
                          <FiCheck className="inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(w._id, "reject")}
                          className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow w-full md:w-auto"
                        >
                          <FiX className="inline mr-1" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
