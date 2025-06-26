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
    firstname: string;
    lastname: string;
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/withdrawals?status=${status}`,
        {
          credentials: "include",
        }
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

  const debouncedFetch = useRef<(status: string) => void>(
  debounce((status: string) => {
    fetchWithdrawals(status);
  }, 300)
).current;

  const updateStatus = async (id: string, action: "approve" | "reject") => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/withdrawals/${id}/${action}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) fetchWithdrawals(statusFilter);
    } catch (err) {
      console.error(`Error updating withdrawal ${action}:`, err);
    }
  };

  useEffect(() => {
    setLoading(true);
    debouncedFetch(statusFilter);
  }, [statusFilter, debouncedFetch]);

  if (loading)
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-gray-600">
        <FiLoader className="animate-spin" /> Loading withdrawals...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Withdrawals</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by status:</label>
        <select
          className="select select-bordered"
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
        <p className="text-gray-500">No {statusFilter} withdrawal requests.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id} className="border-t">
                  <td className="px-4 py-3">
                    {w.driver.firstname} {w.driver.lastname}
                  </td>
                  <td className="px-4 py-3">₦{w.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {w.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(w._id, "approve")}
                          className="px-2 py-1 text-green-600 border border-green-500 rounded hover:bg-green-50"
                        >
                          <FiCheck className="inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(w._id, "reject")}
                          className="px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50"
                        >
                          <FiX className="inline mr-1" /> Reject
                        </button>
                      </>
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
