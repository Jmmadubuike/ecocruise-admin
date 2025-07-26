"use client";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminRoutesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [routes, setRoutes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    startPoint: "",
    endPoint: "",
    price: "",
    studentDiscount: "",
  });
  const [editingRoute, setEditingRoute] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetch(`${baseUrl}/api/v1/admin/routes`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRoutes(data.data);
          else {
            setError("Failed to load routes");
            showError("Failed to load routes");
          }
        })
        .catch(() => {
          setError("Server error while fetching routes");
          showError("Server error while fetching routes");
        });
    }
  }, [user, showError]);

  const deleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/routes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setRoutes((prev) => prev.filter((r) => r._id !== id));
        showSuccess("Route deleted successfully");
      } else {
        showError(data.error || "Failed to delete route");
      }
    } catch (err) {
      showError("Server error while deleting route");
    }
  };

  const createRoute = async () => {
    if (
      !form.startPoint ||
      !form.endPoint ||
      !form.price ||
      !form.studentDiscount
    ) {
      return alert("All fields are required");
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          studentDiscount: parseFloat(form.studentDiscount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRoutes((prev) => [data.data, ...prev]);
        setEditingRoute(null);
        setForm({
          startPoint: "",
          endPoint: "",
          price: "",
          studentDiscount: "",
        });
        showSuccess("Route created successfully");
      } else {
        showError(data.error || "Failed to create route");
      }
    } catch (err) {
      showError("Server error while creating route");
    }
  };

  const handleEditClick = (route: any) => {
    setEditingRoute(route);
    setForm({
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      price: route.price.toString(),
      studentDiscount: route.studentDiscount.toString(),
    });
  };

  const updateRoute = async () => {
    if (!editingRoute) return;

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/routes/${editingRoute._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          studentDiscount: parseFloat(form.studentDiscount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoutes((prev) =>
          prev.map((r) => (r._id === editingRoute._id ? data.data : r))
        );
        setEditingRoute(null);
        setForm({
          startPoint: "",
          endPoint: "",
          price: "",
          studentDiscount: "",
        });
        showSuccess("Route updated successfully");
      } else {
        showError(data.error || "Failed to update route");
      }
    } catch (err) {
      showError("Server error while updating route");
    }
  };

  if (loading || !user)
    return <div className="p-6 text-[#004aad] font-semibold">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#004aad]">Manage Routes</h1>
      {error && (
        <p className="mb-4 p-3 bg-[#f80b0b] text-white rounded font-semibold">
          {error}
        </p>
      )}

      {/* Form for Create or Edit */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title text-[#004aad]">
            {editingRoute ? "Edit Route" : "Add New Route"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input input-bordered border-[#004aad]"
              placeholder="Start Point"
              value={form.startPoint}
              onChange={(e) => setForm({ ...form, startPoint: e.target.value })}
            />
            <input
              className="input input-bordered border-[#004aad]"
              placeholder="End Point"
              value={form.endPoint}
              onChange={(e) => setForm({ ...form, endPoint: e.target.value })}
            />
            <input
              className="input input-bordered border-[#004aad]"
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="input input-bordered border-[#004aad]"
              placeholder="Student Discount (%)"
              type="number"
              value={form.studentDiscount}
              onChange={(e) =>
                setForm({ ...form, studentDiscount: e.target.value })
              }
            />
          </div>
          <div className="card-actions justify-end mt-4 gap-3">
            {editingRoute ? (
              <>
                <button
                  className="btn btn-secondary border-[#004aad] text-[#004aad]"
                  onClick={() => setEditingRoute(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary bg-[#004aad] border-[#004aad]"
                  onClick={updateRoute}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary bg-[#004aad] border-[#004aad]"
                onClick={createRoute}
              >
                Create Route
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div
            key={route._id}
            className="card bg-base-100 shadow-xl border border-[#004aad]"
          >
            <div className="card-body">
              <h2 className="card-title text-[#004aad]">
                {route.startPoint} → {route.endPoint}
              </h2>
              <p className="text-[#004aad] font-semibold">
                Price: ₦{route.price}
              </p>
              <p className="text-[#004aad] font-semibold">
                Student Discount: {route.studentDiscount}%
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-sm btn-outline border-[#004aad] text-[#004aad]"
                  onClick={() => handleEditClick(route)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline border-[#f80b0b] text-[#f80b0b]"
                  onClick={() => deleteRoute(route._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
