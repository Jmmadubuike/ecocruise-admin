// File: app/admin/users/page.tsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/Modal"; // Implement this or use your own modal

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "driver" | "customer";
  wallet?: number;
  username?: string;
  isOnline?: boolean;
  isBanned?: boolean;
  earnings?: {
    daily: number;
    monthly: number;
    total: number;
  };
  createdAt: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function UsersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch users by role
  useEffect(() => {
    const fetchByRole = async (
      role: string,
      setter: React.Dispatch<React.SetStateAction<User[]>>
    ) => {
      try {
        const res = await fetch(
          `${baseUrl}/admin/users?role=${role}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to load ${role}s`);
        setter(data.data || data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };

    const fetchAllUsers = async () => {
      setLoading(true);
      setError("");
      await Promise.all([
        fetchByRole("customer", setCustomers),
        fetchByRole("driver", setDrivers),
        fetchByRole("admin", setAdmins),
      ]);
      setLoading(false);
    };

    fetchAllUsers();
  }, []);

  // Format currency
  const formatCurrency = (amount = 0) => `₦${amount.toLocaleString()}`;

  // Handle Ban/Unban toggle
  const toggleBan = async (user: User) => {
    const shouldBan = !user.isBanned;
    try {
      const res = await fetch(`${baseUrl}/admin/users/${user._id}/ban`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: shouldBan }),
      });

      if (!res.ok) throw new Error("Failed to update user ban status");

      toast.success(`${shouldBan ? "Banned" : "Unbanned"} successfully`);

      // Update user lists optimistically
      const updateUserList = (list: User[]) =>
        list.map((u) =>
          u._id === user._id ? { ...u, isBanned: shouldBan } : u
        );
      setCustomers((prev) => updateUserList(prev));
      setDrivers((prev) => updateUserList(prev));
      setAdmins((prev) => updateUserList(prev));

      // Update modal user state
      setSelectedUser({ ...user, isBanned: shouldBan });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // Render table for users of a given role
  const renderUserTable = (users: User[], role: string) => (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-4 capitalize border-b pb-2 border-gray-300">
        {role}s
      </h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full min-w-[900px]">
          <thead
            className="sticky top-0"
            style={{ backgroundColor: "#004aad" }}
          >
            <tr>
              <th className="text-white cursor-default">Name</th>
              <th className="text-white cursor-default">Username</th>
              <th className="text-white cursor-default">Email</th>
              <th className="text-white cursor-default">Phone</th>
              <th className="text-white cursor-default">Status</th>
              <th className="text-white cursor-default">Online</th>
              <th className="text-white cursor-default">Wallet</th>
              {role === "driver" && (
                <>
                  <th className="text-white cursor-default">Daily</th>
                  <th className="text-white cursor-default">Monthly</th>
                  <th className="text-white cursor-default">Total</th>
                </>
              )}
              <th className="text-white cursor-default">Joined</th>
              <th className="text-white cursor-default">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={role === "driver" ? 13 : 10}
                  className="text-center italic text-gray-500"
                >
                  No {role}s found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setProfileModalOpen(true);
                  }}
                >
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.username || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.isBanned ? (
                      <span className="badge badge-error">Banned</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    {user.isOnline ? (
                      <span className="badge bg-green-600 text-white">
                        Online
                      </span>
                    ) : (
                      <span className="badge bg-red-600 text-white">
                        Offline
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(user.wallet)}</td>
                  {role === "driver" && (
                    <>
                      <td>{formatCurrency(user.earnings?.daily)}</td>
                      <td>{formatCurrency(user.earnings?.monthly)}</td>
                      <td>{formatCurrency(user.earnings?.total)}</td>
                    </>
                  )}
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn btn-xs ${
                        user.isBanned ? "btn-success" : "btn-error"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent modal open on button click
                        toggleBan(user);
                      }}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  if (loading)
    return (
      <div className="p-6 text-[#004aad] font-semibold">Loading users...</div>
    );

  if (error)
    return (
      <div className="p-6 text-white font-semibold bg-[#f80b0b] p-4 rounded">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {renderUserTable(customers, "customer")}
      {renderUserTable(drivers, "driver")}
      {renderUserTable(admins, "admin")}

      {/* User Profile Modal */}
      {selectedUser && (
        <Modal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        >
          <div className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <div className="mb-4 space-y-1 text-sm">
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone}
              </p>
              <p>
                <strong>Username:</strong> {selectedUser.username || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedUser.isBanned ? "Banned" : "Active"}
              </p>
              <p>
                <strong>Online:</strong> {selectedUser.isOnline ? "Yes" : "No"}
              </p>
              <p>
                <strong>Wallet:</strong> ₦
                {selectedUser.wallet?.toLocaleString() || "0"}
              </p>
              {selectedUser.role === "driver" && (
                <>
                  <p>
                    <strong>Daily Earnings:</strong> ₦
                    {selectedUser.earnings?.daily.toLocaleString() || "0"}
                  </p>
                  <p>
                    <strong>Monthly Earnings:</strong> ₦
                    {selectedUser.earnings?.monthly.toLocaleString() || "0"}
                  </p>
                  <p>
                    <strong>Total Earnings:</strong> ₦
                    {selectedUser.earnings?.total.toLocaleString() || "0"}
                  </p>
                </>
              )}
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                className="btn btn-outline"
                onClick={() => setProfileModalOpen(false)}
              >
                Close
              </button>
              <button
                className={`btn ${
                  selectedUser.isBanned ? "btn-success" : "btn-error"
                }`}
                onClick={() => toggleBan(selectedUser)}
              >
                {selectedUser.isBanned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
