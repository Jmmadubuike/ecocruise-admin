"use client";
import { useEffect, useState } from "react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TicketUser {
  _id: string;
  name: string;
  // Add other user properties as needed
}

interface Ticket {
  _id: string;
  subject: string;
  status: "open" | "closed" | "pending";
  createdAt: string;
  updatedAt?: string;
  user?: TicketUser;
  // Add other ticket properties as needed
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"customer" | "driver">("customer");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        if (!baseUrl) {
          throw new Error("API base URL is not configured");
        }

        const res = await fetch(
          `${baseUrl}/admin/support-tickets?role=${role}`,
          {
            credentials: "include",
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to load tickets");
        }

        const data = await res.json();
        setTickets(data.data || data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [role]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-[#004aad]">
        Support Tickets
      </h1>

      {/* Role Filter */}
      <div className="mb-6">
        <label
          htmlFor="role"
          className="block mb-2 font-semibold text-gray-700"
        >
          Filter Tickets by Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "customer" | "driver")}
          className="select select-bordered w-48 text-[#004aad] focus:outline-none focus:ring-2 focus:ring-[#004aad]"
        >
          <option value="customer">Customer Tickets</option>
          <option value="driver">Driver Tickets</option>
        </select>
      </div>

      {loading ? (
        <div className="text-[#004aad] font-semibold">Loading tickets...</div>
      ) : error ? (
        <div className="text-[#f80b0b] font-semibold">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-gray-500 font-medium">
          No {role} tickets found.
        </div>
      ) : (
        <table className="table w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-[#004aad] text-white">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                className="hover:bg-[#004aad]/10 transition-colors"
              >
                <td className="py-2 px-4">{ticket.user?.name || "Unknown"}</td>
                <td className="py-2 px-4">{ticket.subject}</td>
                <td
                  className={`py-2 px-4 font-semibold ${
                    ticket.status === "pending"
                      ? "text-[#f80b0b]"
                      : "text-green-600"
                  }`}
                >
                  {ticket.status.charAt(0).toUpperCase() +
                    ticket.status.slice(1)}
                </td>
                <td className="py-2 px-4">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}