"use client";
import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TicketUser {
  _id: string;
  name: string;
}

interface TicketResponse {
  _id: string;
  message: string;
  createdAt: string;
  responder: TicketUser;
}

interface Ticket {
  _id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  createdAt: string;
  updatedAt?: string;
  user?: TicketUser;
  responses?: TicketResponse[];
}

const validStatuses = ["open", "pending", "resolved", "closed"] as const;

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [statusEdits, setStatusEdits] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      if (!baseUrl) throw new Error("API base URL is not configured");

      const url = new URL(`${baseUrl}/support/admin`);
      if (statusFilter) url.searchParams.append("status", statusFilter);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load tickets");
      }
      const data = await res.json();
      setTickets(data.data || data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleReplyChange = (ticketId: string, value: string) => {
    setReplyTexts(prev => ({ ...prev, [ticketId]: value }));
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    if (validStatuses.includes(newStatus as any)) {
      setStatusEdits(prev => ({ ...prev, [ticketId]: newStatus }));
    }
  };

  const handleReplySubmit = async (ticketId: string) => {
    const message = replyTexts[ticketId]?.trim();
    if (!message && (statusEdits[ticketId] === undefined || statusEdits[ticketId] === tickets.find(t => t._id === ticketId)?.status)) {
      return;
    }

    setSubmittingId(ticketId);
    setSubmitError("");

    try {
      if (message) {
        const replyRes = await fetch(`${baseUrl}/support/admin/${ticketId}/respond`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        if (!replyRes.ok) {
          const errData = await replyRes.json();
          throw new Error(errData.error || "Failed to send reply");
        }
      }

      if (statusEdits[ticketId] && statusEdits[ticketId] !== tickets.find(t => t._id === ticketId)?.status) {
        const patchRes = await fetch(`${baseUrl}/support/admin/${ticketId}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusEdits[ticketId] }),
        });
        if (!patchRes.ok) {
          const errData = await patchRes.json();
          throw new Error(errData.error || "Failed to update status");
        }
      }

      await fetchTickets();
      setReplyTexts(prev => ({ ...prev, [ticketId]: "" }));
      setStatusEdits(prev => ({ ...prev, [ticketId]: "" }));
    } catch (err: unknown) {
      if (err instanceof Error) setSubmitError(err.message);
      else setSubmitError("An unexpected error occurred while submitting reply or updating status.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#004aad]">Support Tickets (Admin)</h1>

      <div className="mb-6 max-w-xs">
        <label htmlFor="statusFilter" className="block mb-2 font-semibold text-gray-700">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select select-bordered w-full text-[#004aad] focus:outline-none focus:ring-2 focus:ring-[#004aad]"
        >
          <option value="">All</option>
          {validStatuses.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-[#004aad] font-semibold animate-pulse py-6">Loading tickets...</div>
      )}
      {error && (
        <div className="text-red-600 font-semibold py-6">{error}</div>
      )}
      {!loading && !error && tickets.length === 0 && (
        <div className="text-gray-500 font-medium py-6 text-center">No tickets found.</div>
      )}

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div
            key={ticket._id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer" onClick={() => toggleExpand(ticket._id)}>
              <div>
                <div className="font-bold text-[#004aad]">{ticket.subject}</div>
                <div className="text-sm text-gray-600">By: {ticket.user?.name || "Unknown"} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm font-semibold px-2 py-1 rounded bg-[#004aad]/10 text-[#004aad] mr-3">
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                {expandedIds.has(ticket._id) ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                expandedIds.has(ticket._id) ? "max-h-[500px] mt-4" : "max-h-0"
              }`}
            >
              {/* Responses */}
              {ticket.responses && ticket.responses.length > 0 && (
                <div className="mb-4 border rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
                  {ticket.responses.map(resp => (
                    <div key={resp._id} className="mb-3">
                      <div className="text-sm font-semibold text-[#004aad]">{resp.responder?.name || "Support"}</div>
                      <div className="text-sm">{resp.message}</div>
                      <div className="text-xs text-gray-400">{new Date(resp.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <textarea
                placeholder="Write your reply here..."
                rows={3}
                className="textarea textarea-bordered w-full mb-3 text-[#004aad]"
                value={replyTexts[ticket._id] || ""}
                onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                disabled={submittingId === ticket._id}
              />

              <label className="block mb-2 font-semibold text-gray-700" htmlFor={`status-select-${ticket._id}`}>
                Update Status
              </label>
              <select
                id={`status-select-${ticket._id}`}
                value={statusEdits[ticket._id] ?? ticket.status}
                onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                className="select select-bordered w-48 mb-4 text-[#004aad]"
                disabled={submittingId === ticket._id || ticket.status === "closed"}
              >
                {validStatuses.map(status => (
                  <option key={status} value={status} disabled={ticket.status === "closed"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {submitError && submittingId === ticket._id && (
                <p className="text-red-600 mb-2">{submitError}</p>
              )}

              <button
                className="btn btn-primary"
                onClick={() => handleReplySubmit(ticket._id)}
                disabled={
                  submittingId === ticket._id ||
                  (!replyTexts[ticket._id]?.trim() && (statusEdits[ticket._id] === undefined || statusEdits[ticket._id] === ticket.status))
                }
              >
                {submittingId === ticket._id ? "Submitting..." : "Submit Reply & Status"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
