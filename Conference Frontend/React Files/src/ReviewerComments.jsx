import React, { useState } from "react";
import { apiUrl } from "./config";

const SEND_STATUS_EMAIL_URL =
  apiUrl("/admin/send-status-email");

function ReviewerComments() {
  const [paperId, setPaperId] = useState("");
  const [paper, setPaper] = useState(null);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingDecision, setUpdatingDecision] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminComments, setAdminComments] = useState("");
  const [resetting, setResetting] = useState(false);

  // ---------------- SEARCH ----------------
  const handleSearch = async () => {
    if (!paperId.trim()) {
      alert("Enter Paper ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiUrl("/admin/paper-with-comments")}/${paperId.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!res.ok) {
        alert("Paper not found");
        setPaper(null);
        return;
      }

      const data = await res.json();
      setPaper(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch paper");
      setPaper(null);
    }
  };

  // ---------------- HELPERS ----------------
  const getPhone = (reg) =>
    reg?.phone ||
    (Array.isArray(reg?.authors) && reg.authors[0]?.mobile) ||
    "";

  const hasFinalPaper = (reg) =>
    !!reg?.finalPaperBlob ||
    reg?.finalSubmissionStatus === "submitted";

  // ---------------- FILE HELPERS ----------------
  const base64ToBlob = (base64Data) => {
    if (!base64Data || typeof base64Data !== 'string') return null;
    // Remove data URL prefix if present
    let cleaned = base64Data.trim();
    const commaIndex = cleaned.indexOf(',');
    if (commaIndex !== -1 && cleaned.startsWith('data:')) {
      cleaned = cleaned.slice(commaIndex + 1);
    }
    cleaned = cleaned.replace(/\s/g, '');
    try {
      const byteCharacters = atob(cleaned);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
    
      let mimeType = "application/pdf";
      let extension = "pdf";
      if (byteArray.length > 4) {
        if (byteArray[0] === 0x25 && byteArray[1] === 0x50 && byteArray[2] === 0x44 && byteArray[3] === 0x46) {
          mimeType = "application/pdf"; extension = "pdf";
        } else if (byteArray[0] === 0xD0 && byteArray[1] === 0xCF && byteArray[2] === 0x11 && byteArray[3] === 0xE0) {
          mimeType = "application/msword"; extension = "doc";
        } else if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {
          mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; extension = "docx";
        }
      }
      return { blob: new Blob([byteArray], { type: mimeType }), extension };
    } catch (err) {
      console.error("Invalid base64 data:", err);
      return null;
    }
  };

  const downloadAbstract = (data, title) => {
    const result = base64ToBlob(data);
    if (!result) return alert("No abstract available");
    const { blob, extension } = result;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}_abstract.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFinalFromServer = async (reg) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiUrl("/admin/download-final-paper")}/${reg.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const contentType = res.headers.get('content-type') || blob.type || 'application/pdf';
      let extension = 'pdf';
      if (contentType.includes('pdf')) extension = 'pdf';
      else if (contentType.includes('msword')) extension = 'doc';
      else if (contentType.includes('document')) extension = 'docx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reg.paperTitle}_final.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      if (reg.finalPaperBlob) {
        const result = base64ToBlob(reg.finalPaperBlob);
        if (result) {
          const { blob, extension } = result;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${reg.paperTitle}_final.${extension}`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          alert("Invalid final paper data");
        }
      } else {
        alert("Final paper not available");
      }
    }
  };

  // ---------------- STATUS HELPERS ----------------
  const notificationSent =
    paper?.notificationSent === true || paper?.notificationSent === 1;

  const canSendStatus =
    paper?.status &&
    paper.status !== "submitted" &&
    paper.status !== "under_review" &&
    !notificationSent;

  const statusClass = (status) => {
    if (status === "accepted") return "bg-green-100 text-green-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    if (status === "under_review") return "bg-yellow-100 text-yellow-800";
    if (status === "accepted_with_minor_revision")
      return "bg-blue-100 text-blue-800";
    if (status === "accepted_with_major_revision")
      return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-600";
  };

  // ---------------- ACTIONS ----------------
  const sendStatusEmail = async () => {
    if (!window.confirm("Send status email to authors?")) return;
    setSendingEmail(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(SEND_STATUS_EMAIL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paperId: paper.id })
      });
      alert("Status email sent");
      setPaper({ ...paper, notificationSent: true });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateDecision = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { status: newStatus };
      if (adminComments.trim()) {
        payload.adminComments = adminComments.trim();
      }
      await fetch(
        `${apiUrl("/admin/registrations")}/${paper.id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      alert("Decision updated");
      setPaper({ ...paper, status: newStatus, adminComments: adminComments.trim() || paper.adminComments });
      setUpdatingDecision(false);
      setAdminComments("");
    } catch {
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this registration?")) return;
    const token = localStorage.getItem("token");
    await fetch(
      `${apiUrl("/admin/registrations")}/${paper.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Deleted");
    setPaper(null);
  };

  const handleResetFinal = async () => {
    if (!window.confirm("Reset final submission?")) return;
    setResetting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${apiUrl("/admin/registrations")}/${paper.id}/reset-final-submission`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Final submission reset");
      setPaper({ ...paper, finalSubmissionStatus: "not_submitted" });
    } finally {
      setResetting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">
        Reviewer Comments – Detailed View
      </h2>

      {/* SEARCH */}
      <div className="flex gap-4 mb-6">
        <input
          value={paperId}
          onChange={(e) => setPaperId(e.target.value)}
          placeholder="Enter Paper ID"
          className="border px-4 py-2 rounded w-72"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Search
        </button>
      </div>

      {!paper && (
        <p className="text-gray-600">
          Search a paper to view reviewer comments.
        </p>
      )}

      {paper && (
       <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6 overflow-hidden">


          {/* PAPER DETAILS */}
          <section>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              Paper Details
            </h3>
            <p><b>ID:</b> {paper.id}</p>
            <p><b>Title:</b> {paper.paperTitle}</p>
            <p><b>Authors:</b> {paper.authors?.map(a => a.name).join(", ")}</p>
            <p><b>Email:</b> {paper.email}</p>
            <p><b>Phone:</b> {getPhone(paper)}</p>
            <p><b>Track:</b> {paper.tracks}</p>
            <p><b>Created On:</b> {new Date(paper.createdAt).toLocaleDateString()}</p>
            {paper.adminComments && (
              <p><b>Admin Comments:</b> {paper.adminComments}</p>
            )}
          </section>

          {/* REVIEWERS */}
          {paper.status !== "rejected" && (
            <section>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Reviewer Evaluations
              </h3>

              {paper.reviewers?.map((r, i) => (
                <div key={i} className="border rounded p-4 mb-3 bg-gray-50">
                  <p><b>Reviewer:</b> {r.name}</p>

                  <span className={`inline-block px-2 py-1 rounded text-xs ${statusClass(r.reviewStatus)}`}>
                    {r.reviewStatus || "Not reviewed"}
                  </span>

                 <p className="mt-2 text-sm whitespace-pre-wrap break-words break-all overflow-hidden">

                    {r.comments || "No comments"}
                  </p>

                  {/* QUESTIONS & ANSWERS */}
                  {r.questions && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">
                        Evaluation Questions
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(r.questions).map(([k, v]) => (
                        <div
  key={k}
  className="bg-white border rounded p-2 text-sm break-words break-all overflow-hidden"
>

                            <b>{k.toUpperCase()}:</b> {v || "Not answered"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ADMIN ACTIONS */}
          <section>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              Admin Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadAbstract(paper.abstractBlob, paper.paperTitle)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Download Abstract
              </button>

              <button
                onClick={() => downloadFinalFromServer(paper)}
                disabled={!hasFinalPaper(paper)}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Download Final Paper
              </button>

              {canSendStatus && (
                <button
                  onClick={sendStatusEmail}
                  disabled={sendingEmail}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Send Status Email
                </button>
              )}

              {notificationSent && (
                <span className="px-3 py-1 rounded text-xs bg-red-100 text-red-700">
                  Email Sent
                </span>
              )}

              <button
                onClick={() => {
                  setUpdatingDecision(true);
                  setNewStatus(paper.status || "under_review");
                  setAdminComments(paper.adminComments || '');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update Decision
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>

              {paper.finalSubmissionStatus === "submitted" && (
                <button
                  onClick={handleResetFinal}
                  disabled={resetting}
                  className="bg-orange-600 text-white px-4 py-2 rounded"
                >
                  Reset Final Submission
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* UPDATE DECISION MODAL */}
      {updatingDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-semibold mb-4">Update Decision</h3>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border px-3 py-2 mb-4"
            >
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="accepted_with_minor_revision">Minor Revision</option>
              <option value="accepted_with_major_revision">Major Revision</option>
            </select>

            <textarea
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder="Enter admin comments (optional)"
              className="w-full border px-3 py-2 mb-4"
              rows="4"
            />

            <div className="flex gap-2">
              <button
                onClick={handleUpdateDecision}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={() => setUpdatingDecision(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewerComments;
