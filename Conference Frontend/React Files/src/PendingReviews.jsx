import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { apiUrl } from "./config";

const UNASSIGNED_PAPERS_URL = apiUrl("/admin/unassigned-papers");
const PENDING_REVIEWS_URL = apiUrl("/admin/pending-reviews");
const REMIND_URL = apiUrl("/admin/pending-reviews/remind");

function PendingReviews() {
  const { user } = useContext(AuthContext);
  const [unassignedPapers, setUnassignedPapers] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remindingKey, setRemindingKey] = useState(null);
  const [remindingAll, setRemindingAll] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [unassignedRes, pendingRes] = await Promise.all([
        fetch(UNASSIGNED_PAPERS_URL, { headers: authHeaders() }),
        fetch(PENDING_REVIEWS_URL, { headers: authHeaders() }),
      ]);
      const unassignedPayload = await unassignedRes.json();
      const pendingPayload = await pendingRes.json();
      if (!unassignedRes.ok) throw new Error(unassignedPayload.error || "Failed to fetch unassigned papers");
      if (!pendingRes.ok) throw new Error(pendingPayload.error || "Failed to fetch pending reviews");
      setUnassignedPapers(Array.isArray(unassignedPayload) ? unassignedPayload : unassignedPayload.data || []);
      setPendingReviews(pendingPayload || []);
    } catch (err) {
      console.error("Error fetching pending reviews data:", err);
      setError(err.message || "Error fetching pending reviews data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchData();
  }, [user]);

  const remindOne = async (row) => {
    const key = `${row.paperId}-${row.reviewerId}`;
    setRemindingKey(key);
    setMessage("");
    setError("");
    try {
      const res = await fetch(REMIND_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ paperId: row.paperId, reviewerId: row.reviewerId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to send reminder");
      setMessage(payload.message);
      fetchData();
    } catch (err) {
      setError(err.message || "Error sending reminder");
    } finally {
      setRemindingKey(null);
    }
  };

  const remindAll = async () => {
    if (!window.confirm(`Send reminder emails to all reviewers with pending reviews (${pendingReviews.length} item(s))?`)) return;
    setRemindingAll(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(REMIND_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ sendAll: true }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to send reminders");
      setMessage(payload.message);
      fetchData();
    } catch (err) {
      setError(err.message || "Error sending reminders");
    } finally {
      setRemindingAll(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
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
        <h3 className="text-lg font-semibold text-blue-700 mb-4">
          Pending Paper Assignments ({unassignedPapers.length})
        </h3>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : unassignedPapers.length === 0 ? (
          <p className="text-gray-600">All submitted papers have been assigned to reviewers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Paper ID</th>
                  <th className="text-left p-2">Paper Title</th>
                  <th className="text-left p-2">Track(s)</th>
                </tr>
              </thead>
              <tbody>
                {unassignedPapers.map((p) => (
                  <tr key={p.id || p.paperId} className="border-b">
                    <td className="p-2">{p.id || p.paperId}</td>
                    <td className="p-2">{p.paperTitle}</td>
                    <td className="p-2">{Array.isArray(p.paperTracks) ? p.paperTracks.join(", ") : p.paperTracks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-blue-700">
            Pending Review Status ({pendingReviews.length})
          </h3>
          <button
            onClick={remindAll}
            disabled={remindingAll || pendingReviews.length === 0}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md disabled:opacity-50"
          >
            {remindingAll ? "Sending..." : "Remind All Reviewers"}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : pendingReviews.length === 0 ? (
          <p className="text-gray-600">No pending reviews - everything assigned has been reviewed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Paper ID</th>
                  <th className="text-left p-2">Paper Title</th>
                  <th className="text-left p-2">Reviewer</th>
                  <th className="text-left p-2">Assigned On</th>
                  <th className="text-left p-2">Deadline</th>
                  <th className="text-left p-2">Last Reminded</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.map((row) => {
                  const key = `${row.paperId}-${row.reviewerId}`;
                  return (
                    <tr key={key} className="border-b">
                      <td className="p-2">{row.paperId}</td>
                      <td className="p-2">{row.paperTitle}</td>
                      <td className="p-2">
                        {row.reviewerName}
                        <span className="text-xs text-gray-500 block">{row.reviewerEmail}</span>
                      </td>
                      <td className="p-2">{row.assignedAt ? new Date(row.assignedAt).toLocaleDateString() : "-"}</td>
                      <td className="p-2">{row.dueAt ? new Date(row.dueAt).toLocaleDateString() : "-"}</td>
                      <td className="p-2">
                        {row.lastReminderSentAt ? new Date(row.lastReminderSentAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => remindOne(row)}
                          disabled={remindingKey === key}
                          className="px-3 py-1 rounded text-xs text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                        >
                          {remindingKey === key ? "Sending..." : "Send Reminder"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingReviews;
