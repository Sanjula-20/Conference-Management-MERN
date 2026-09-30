import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { apiUrl } from "./config";

const LOCK_STATUS_URL = apiUrl("/admin/submission-lock");
const LOCKED_USERS_URL = apiUrl("/admin/submission-lock/users");
const RESET_PASSWORD_URL = apiUrl("/admin/reset-user-password");

function SubmissionControl() {
  const { user } = useContext(AuthContext);
  const [globalLocked, setGlobalLocked] = useState(false);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [resettingUserId, setResettingUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchLockStatus = async () => {
    try {
      const res = await fetch(LOCK_STATUS_URL, { headers: authHeaders() });
      const payload = await res.json();
      if (res.ok) setGlobalLocked(Boolean(payload.locked));
    } catch (err) {
      console.error("Error fetching submission lock status:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(LOCKED_USERS_URL, { headers: authHeaders() });
      const payload = await res.json();
      if (res.ok) setUsers(payload);
    } catch (err) {
      console.error("Error fetching users for submission lock:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchLockStatus();
      fetchUsers();
    }
  }, [user]);

  const toggleGlobalLock = async () => {
    setLoadingGlobal(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(LOCK_STATUS_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ locked: !globalLocked }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to update submission lock");
      setGlobalLocked(payload.locked);
      setMessage(payload.message);
    } catch (err) {
      setError(err.message || "Error updating submission lock");
    } finally {
      setLoadingGlobal(false);
    }
  };

  const toggleUserLock = async (targetUser) => {
    setTogglingUserId(targetUser.id);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${LOCKED_USERS_URL}/${targetUser.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ locked: !targetUser.submissionLocked }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to update user submission lock");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, submissionLocked: !targetUser.submissionLocked } : u))
      );
      setMessage(payload.message);
    } catch (err) {
      setError(err.message || "Error updating user submission lock");
    } finally {
      setTogglingUserId(null);
    }
  };

  const resetPassword = async (targetUser) => {
    if (!window.confirm(`Send a password reset link to ${targetUser.name} (${targetUser.email})?`)) return;
    setResettingUserId(targetUser.id);
    setMessage("");
    setError("");
    try {
      const res = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: targetUser.id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to reset password");
      setMessage(payload.message);
    } catch (err) {
      setError(err.message || "Error resetting password");
    } finally {
      setResettingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Global Submission Control</h3>
        <p className="text-sm text-gray-600 mb-4">
          Locking submissions prevents every participant from submitting or resubmitting a paper, regardless of
          their individual lock status below.
        </p>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              globalLocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {globalLocked ? "Submissions Locked" : "Submissions Open"}
          </span>
          <button
            onClick={toggleGlobalLock}
            disabled={loadingGlobal}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
              globalLocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            } disabled:opacity-50`}
          >
            {loadingGlobal ? "Updating..." : globalLocked ? "Unlock All Submissions" : "Lock All Submissions"}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`p-3 rounded-md text-sm ${
            error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-blue-700">Per-User Submission Lock & Password Reset</h3>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
          />
        </div>

        {loadingUsers ? (
          <p className="text-gray-600">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Submission Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.submissionLocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.submissionLocked ? "Locked" : "Open"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleUserLock(u)}
                          disabled={togglingUserId === u.id}
                          className={`px-3 py-1 rounded text-xs text-white ${
                            u.submissionLocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          } disabled:opacity-50`}
                        >
                          {togglingUserId === u.id ? "Updating..." : u.submissionLocked ? "Unlock" : "Lock"}
                        </button>
                        <button
                          onClick={() => resetPassword(u)}
                          disabled={resettingUserId === u.id}
                          className="px-3 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                        >
                          {resettingUserId === u.id ? "Sending..." : "Reset Password"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmissionControl;
