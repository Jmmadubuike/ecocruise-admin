"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Extend with any other editable fields you support
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminSettingsPage() {
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`${baseUrl}/users/profile`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to load profile");
        }
        const data = await res.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (error: any) {
        toast.error(error.message || "Error loading profile");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle profile input changes
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Submit profile updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const res = await fetch(`${baseUrl}/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      toast.success(data.message || "Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Validate passwords
  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return false;
    }
    return true;
  };

  // Submit password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setChangingPassword(true);

    try {
      const res = await fetch(`${baseUrl}/users/change-password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success(data.message || "Password changed successfully");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return <div className="p-6 text-center text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md space-y-10">
      <h1 className="text-3xl font-bold mb-4">Admin Settings</h1>

      {/* Profile Update Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block font-semibold mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className="input input-bordered w-full"
              value={profile.firstName}
              onChange={(e) => handleProfileChange("firstName", e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block font-semibold mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className="input input-bordered w-full"
              value={profile.lastName}
              onChange={(e) => handleProfileChange("lastName", e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input input-bordered w-full"
              value={profile.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-semibold mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              className="input input-bordered w-full"
              value={profile.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${updatingProfile ? "loading" : ""}`}
            disabled={updatingProfile}
          >
            {updatingProfile ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </section>

      {/* Password Change Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block font-semibold mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="input input-bordered w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block font-semibold mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="input input-bordered w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-semibold mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${changingPassword ? "loading" : ""}`}
            disabled={changingPassword}
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
