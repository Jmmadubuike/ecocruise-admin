"use client";
import { useState } from "react";

const AdminWalletPage = () => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [walletAction, setWalletAction] = useState({
    amount: "",
    action: "credit",
    description: "",
  });
  const [success, setSuccess] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUser = async () => {
    setUser(null);
    setError("");
    setSuccess("");
    if (!email) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/admin/users?search=${email}&role=customer`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.data?.length) {
        throw new Error("User not found");
      }

      setUser(data.data[0]); // First match
    } catch (err: any) {
      setError(err.message || "Error fetching user");
    }
  };

  const handleWalletUpdate = async (e: any) => {
    e.preventDefault();

    if (!user?._id) return;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/admin/wallet/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(walletAction.amount),
          action: walletAction.action,
          description: walletAction.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wallet");

      setSuccess("Wallet updated successfully");
      setUser((prev: any) => ({ ...prev, wallet: data.wallet }));
      setWalletAction({ amount: "", action: "credit", description: "" });
    } catch (err: any) {
      setError(err.message || "Error updating wallet");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">
        Update User Wallet by Email
      </h1>

      {/* Search By Email */}
      <div className="flex gap-2 items-end">
        <input
          type="email"
          placeholder="Enter user email"
          className="input input-bordered w-full max-w-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-accent" onClick={fetchUser}>
          Fetch
        </button>
      </div>

      {/* Result */}
      {user && (
        <div className="card bg-base-200 p-4 mt-4 space-y-2">
          <div>
            <strong>Name:</strong>{" "}
            {user.name || `${user.firstName} ${user.lastName}`}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Current Wallet:</strong> ₦{user.wallet}
          </div>
        </div>
      )}

      {/* Wallet Action */}
      {user && (
        <form
          onSubmit={handleWalletUpdate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              name="amount"
              value={walletAction.amount}
              onChange={(e) =>
                setWalletAction({ ...walletAction, amount: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="label">Action</label>
            <select
              name="action"
              value={walletAction.action}
              onChange={(e) =>
                setWalletAction({ ...walletAction, action: e.target.value })
              }
              className="select select-bordered w-full"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              name="description"
              value={walletAction.description}
              onChange={(e) =>
                setWalletAction({
                  ...walletAction,
                  description: e.target.value,
                })
              }
              className="textarea textarea-bordered w-full"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary w-full">
              Update Wallet
            </button>
          </div>
        </form>
      )}

      {error && <div className="alert alert-error mt-4">{error}</div>}
      {success && <div className="alert alert-success mt-4">{success}</div>}
    </div>
  );
};

export default AdminWalletPage;
