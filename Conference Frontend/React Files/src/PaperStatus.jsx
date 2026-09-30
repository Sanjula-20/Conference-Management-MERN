import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Header from "./Header";
import { apiUrl } from "./config";

const API_BASE_URL = apiUrl("/admin");

function PaperStatus() {
  const { logout, user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchPaperStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        setPapers([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/paper-status/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        try {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Debug: Log admin comments for each paper
            data.forEach(paper => {
              console.log(`Paper ID: ${paper.id}, Admin Comments: ${paper.adminComments}`);
            });
            setPapers(data);
          } else {
            setPapers([]);
            console.warn("Invalid data format");
          }
        } catch (jsonErr) {
          setPapers([]);
          console.warn("Failed to parse JSON:", jsonErr);
        }
      } else {
        setPapers([]);
        console.warn("Failed to fetch paper status:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Error fetching paper status:", err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we just landed here from a Google OAuth redirect, a token is present
    // in the URL and hasn't been consumed into context yet - wait for that
    // effect to run first before deciding whether to redirect away.
    if (searchParams.get("token")) return;

    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.role !== "user") {
      // Route reviewers/chairpersons/admins who signed in with Google to
      // their correct dashboard instead of bouncing them back to login.
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "reviewer") navigate(user.isFirstLogin ? "/change-password" : "/reviewer-dashboard");
      else if (user.role === "chairperson") navigate("/chairperson");
      else navigate("/auth");
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    if (user && user.role === "user") {
      fetchPaperStatus();
    }
  }, [user]);

  useEffect(() => {
    const poll = () => {
      if (user && user.role === "user") {
        fetchPaperStatus();
      }
    };

    intervalRef.current = setInterval(poll, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      navigate("/paper-status", { replace: true });
    }
  }, [searchParams, login, navigate]);

  const getEffectiveStatus = (paper) => {
    return paper.notificationSent ? paper.status : "under_review";
  };

  const getStatusColor = (paperOrStatus) => {
    const status =
      typeof paperOrStatus === "string"
        ? paperOrStatus
        : getEffectiveStatus(paperOrStatus);
    switch (status) {
      case "submitted":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-300 shadow-sm";
      case "under_review":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-300 shadow-sm";
      case "accepted":
      case "accepted_with_minor_revision":
      case "accepted_with_major_revision":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-300 shadow-sm";
      case "rejected":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-300 shadow-sm";
      case "published":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-300 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-300 shadow-sm";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "under_review":
        return (
          <svg
            className="w-5 h-5 mr-2 animate-spin"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "accepted":
      case "accepted_with_minor_revision":
      case "accepted_with_major_revision":
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "rejected":
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "published":
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatAuthors = (authors) => {
    if (typeof authors === "string") {
      try {
        authors = JSON.parse(authors);
      } catch (e) {
        return authors;
      }
    }
    if (Array.isArray(authors)) {
      return authors.map((author) => `${author.name} (${author.email})`).join(", ");
    }
    return "N/A";
  };

  const downloadFile = (base64Data, paperTitle, fileType) => {
    if (!base64Data) {
      alert(`No ${fileType} file available`);
      return;
    }
    const cleanedBase64 = base64Data.replace(/\s/g, "");
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    let mimeType = "application/pdf";
    let extension = "pdf";

    if (byteArray.length > 4) {
      if (
        byteArray[0] === 0x25 &&
        byteArray[1] === 0x50 &&
        byteArray[2] === 0x44 &&
        byteArray[3] === 0x46
      ) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (
        byteArray[0] === 0xD0 &&
        byteArray[1] === 0xCF &&
        byteArray[2] === 0x11 &&
        byteArray[3] === 0xE0
      ) {
        mimeType = "application/msword";
        extension = "doc";
      } else if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      }
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${paperTitle}_${fileType}.${extension}`;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "submitted":
        return "Your paper has been submitted and is waiting for review assignment.";
      case "under_review":
        return "Your paper is currently being reviewed by our experts.";
      case "accepted":
        return "Congratulations! Your paper has been accepted for publication.";
      case "accepted_with_minor_revision":
        return "Congratulations! Your paper has been accepted with minor revisions required.";
      case "accepted_with_major_revision":
        return "Congratulations! Your paper has been accepted with major revisions required.";
      case "rejected":
        return "Your paper has been reviewed and unfortunately not accepted at this time.";
      case "published":
        return "Your paper has been published successfully.";
      default:
        return "Status unknown.";
    }
  };

  const canSubmitAnotherPaper = () => {
    const hasMinorRevision = papers.some(paper => paper.status === "accepted_with_minor_revision");
    const hasMajorRevision = papers.some(paper => paper.status === "accepted_with_major_revision");
    return hasMajorRevision && !hasMinorRevision;
  };

  const getAssignedReviewerId = () => {
    const majorRevisionPaper = papers.find(paper => paper.status === "accepted_with_major_revision");
    return majorRevisionPaper ? majorRevisionPaper.assignedReviewerId : null;
  };

  const latestPaper =
    papers.length > 0
      ? papers.reduce((latest, curr) =>
          new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest
        )
      : null;

  const latestAcceptedPaperFiltered = papers
    .filter(paper => paper.status === "accepted" || paper.status === "accepted_with_minor_revision" || paper.status === "accepted_with_major_revision")
    .reduce((latest, curr) => !latest || new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest, null);

  const paperToResubmit = papers
    .filter(paper => {
      const statusCheck = paper.status === "accepted_with_minor_revision" || paper.status === "accepted_with_major_revision";
      const reviewStatusCheck = paper.reviewStatus === "accepted_with_minor_revision" || paper.reviewStatus === "accepted_with_major_revision";
      return statusCheck || reviewStatusCheck;
    })
    .reduce((latest, curr) => !latest || new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest, null);

  const canSubmitAnother =
    papers.length === 0 ||
    (paperToResubmit && paperToResubmit.id === latestPaper?.id);

  const latestAcceptedPaper = papers
    .filter(paper => ["accepted", "accepted_with_minor_revision", "accepted_with_major_revision"].includes(paper.status))
    .reduce((latest, curr) => !latest || new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest, null);

  const canSubmitFinal = latestAcceptedPaper && latestAcceptedPaper.notificationSent && latestAcceptedPaper.finalSubmissionStatus === "not_submitted";

  const showQuickActions = !!latestAcceptedPaper && !['submitted', '1', 1].includes(String(latestAcceptedPaper.finalSubmissionStatus));

  const handleSubmitAnother = () => {
    if (canSubmitAnother) {
      const paper = latestPaper;
      const isResubmission = !!paper && (paper.status === "accepted_with_minor_revision" || paper.status === "accepted_with_major_revision" || paper.reviewStatus === "accepted_with_minor_revision" || paper.reviewStatus === "accepted_with_major_revision");
      navigate("/registration", {
        state: {
          paper: paper,
          isResubmission: isResubmission,
          assignedReviewerId: paper?.assignedReviewerId,
          autoAssign: true,
          originalPaperId: paper?.id
        },
      });
    } else {
      navigate("/registration");
    }
  };

  const handleSubmitFinal = () => {
    if (canSubmitFinal) {
      navigate("/registration", {
        state: {
          paper: latestAcceptedPaper,
          isFinalSubmission: true,
          originalPaperId: latestAcceptedPaper.id
        }
      });
    }
  };

  const handlePaymentDashboard = (paper) => {
    if (!paper || !paper.id) return;
    navigate(`/payment-dashboard?paperId=${paper.id}`, {
      state: {
        paper
      }
    });
  };

  const filteredPapers = papers.filter((paper, index, self) =>
    index === self.findIndex(p => p.id === paper.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-blue-400 opacity-20 mx-auto"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold">Loading paper status...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
  <div className="flex items-center justify-between gap-3">
    
    {/* User Info */}
    <div className="flex items-center space-x-3 min-w-0">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      <p className="text-sm font-semibold text-gray-800 truncate">
        {user?.name || "User"}
      </p>
    </div>

    {/* Logout Button */}
    <button
      onClick={() => {
        logout();
        navigate("/auth");
      }}
      className="flex-shrink-0 inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow"
    >
      Logout
    </button>
  </div>
</div>

{/* Mobile Profile Card */}
<div className="lg:hidden px-4 mt-4">
  <div className="bg-white rounded-xl shadow border p-4 flex items-center justify-between">
    <div>
      <p className="font-semibold text-gray-800">{user?.name}</p>
      <p className="text-sm text-gray-500">Conference Participant</p>
    </div>
    <button
      onClick={() => {
        logout();
        navigate("/auth");
      }}
      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
    >
      Logout
    </button>
  </div>
</div>

      {/* Mobile Quick Actions + Status Summary */}
      <div className="lg:hidden px-4 mt-4 space-y-4">
        {showQuickActions && canSubmitFinal && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-4 hover:shadow-xl transition-all duration-300">
            <h4 className="font-bold text-gray-800 text-base mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Quick Actions
            </h4>
            <button
              onClick={handleSubmitFinal}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Submit Final Paper
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
          <h4 className="font-bold text-gray-800 text-base mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Status Summary
          </h4>
          <div className="space-y-3">
            {filteredPapers.length > 0 && (
              <>
                <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Papers</span>
                  <span className="font-bold text-blue-700 text-lg">{filteredPapers.length}</span>
                </div>
                {[
                  "submitted",
                  "under_review",
                  "accepted",
                  "accepted_with_minor_revision",
                  "accepted_with_major_revision",
                  "rejected",
                  "published",
                ].map((status) => {
                  const count = filteredPapers.filter((p) => p.status === status).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={status}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                    >
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          status
                        )}`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:py-28">
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-1">
                    {user?.name || "User"}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-4">Conference Participant</p>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/auth");
                    }}
                    className="w-full inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>

              {showQuickActions && canSubmitFinal && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
                  <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Quick Actions
                  </h4>
                  <button
                    onClick={handleSubmitFinal}
                    className="w-full inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Final Paper
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <h4 className="font-bold text-gray-800 text-lg mb-5 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Status Summary
                </h4>
                <div className="space-y-3">
                  {filteredPapers.length > 0 && (
                    <>
                      <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Papers</span>
                        <span className="font-bold text-blue-700 text-lg">{filteredPapers.length}</span>
                      </div>
                      {[
                        "submitted",
                        "under_review",
                        "accepted",
                        "accepted_with_minor_revision",
                        "accepted_with_major_revision",
                        "rejected",
                        "published",
                      ].map((status) => {
                        const count = filteredPapers.filter((p) => p.status === status).length;
                        if (count === 0) return null;
                        return (
                          <div
                            key={status}
                            className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                          >
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {status.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                status
                              )}`}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>


            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    Your Research Papers
                  </h2>
                  <p className="text-gray-600 text-base">
                    Monitor the current status and progress of all your submissions
                  </p>
                </div>
              </div>

              
            </div>

            {papers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-16 text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="relative inline-block mb-8">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <svg
                      className="w-12 h-12 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                  No Papers Submitted Yet
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Get started by submitting your first research paper. Join our
                  academic community today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleSubmitAnother}
                    disabled={!canSubmitAnother}
                    className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      !canSubmitAnother
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Submit Your First Paper
                  </button>
                  {canSubmitFinal && (
                    <button
                      onClick={handleSubmitFinal}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Submit Final Paper
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
              {filteredPapers.map((paper) => {
                const hasFinal = paper.finalSubmissionStatus === 'submitted' && paper.finalPaperBlob;
                const isAcceptedDecision = ["accepted", "accepted_with_minor_revision", "accepted_with_major_revision"].includes(paper.status) ||
                  ["accepted", "accepted_with_minor_revision", "accepted_with_major_revision"].includes(paper.reviewStatus);
                const canOpenPaymentDashboard = isAcceptedDecision && paper.notificationSent && paper.paymentStatus !== 'paid';
                const submissions = hasFinal ? [
                  { type: 'initial', label: 'Initial Submission', blob: paper.abstractBlob, fileType: 'Paper' },
                  { type: 'final', label: 'Final Submission', blob: paper.finalPaperBlob, fileType: 'Final_paper' }
                ] : [
                  { type: 'initial', label: 'Submission', blob: paper.abstractBlob, fileType: 'Paper' }
                ];

                return submissions.map((submission, index) => (
                  <div
                    key={`${paper.id}-${submission.type}`}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-start">
                          <svg className="w-6 h-6 text-blue-600 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>
                            {paper.paperTitle} - {submission.label}
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-2 ml-0 sm:ml-8">
                          {paper.finalSubmissionStatus && paper.finalSubmissionStatus !== "not_submitted" && submission.type === 'final' && (
                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold rounded-lg border border-green-300 shadow-sm">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Final: {paper.finalSubmissionStatus.replace(/_/g, " ")}
                            </span>
                          )}
                          {paper.batch && (
                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-bold rounded-lg border border-purple-300 shadow-sm">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                              </svg>
                              Batch: {paper.batch}
                            </span>
                          )}
                        </div>
                      </div>
                      {submission.type === 'initial' && (
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 whitespace-nowrap ${getStatusColor(
                            paper
                          )}`}
                        >
                          {getStatusIcon(getEffectiveStatus(paper))}
                          {getEffectiveStatus(paper).replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4 ml-0 sm:ml-8">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Authors</p>
                          <p className="text-sm text-gray-600">{formatAuthors(paper.authors)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Track</p>
                          <p className="text-sm text-gray-600">{paper.tracks}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Status Description</p>
                          <p className="text-sm text-gray-600">{getStatusDescription(getEffectiveStatus(paper))}</p>
                        </div>
                      </div>
                      
                      {paper.reviews && paper.reviews.length > 0 && submission.type === 'initial' && paper.notificationSent && paper.status !== 'rejected' && (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200 mt-4">
                          <div className="flex items-start mb-3">
                            <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="text-sm font-bold text-amber-900">Reviewer Comments</p>
                          </div>
                          {paper.reviews.map((review, reviewIndex) => (
                            <div key={reviewIndex} className="mb-3 last:mb-0">
                             <p className="
  text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm
  whitespace-pre-wrap break-words break-all overflow-hidden
  border border-amber-100
">

                                <strong>Reviewer{reviewIndex + 1}:</strong> {review.comments || 'No comments provided'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {['rejected', 'accepted', 'accepted_with_minor_revision', 'accepted_with_major_revision'].includes(paper.status) && paper.adminComments && paper.notificationSent && submission.type === 'initial' && (
  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200 mt-4">
    
    <div className="flex items-start mb-2">
      <svg
        className="w-5 h-5 text-red-600 mr-2 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-sm font-bold text-red-900">Comments</p>
    </div>

    {/* Condolence / Info message (rejected only) */}
    {paper.status === 'rejected' && (
      <p className="text-sm text-red-800 mb-3 leading-relaxed">
        Thank you for submitting your research. While your paper could not be accepted
        at this time, we appreciate your effort and encourage you to consider the
        feedback below for future improvements.
      </p>
    )}

    {/* Admin comments */}
    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm whitespace-pre-wrap break-words break-all overflow-hidden">
      {paper.adminComments}
    </p>

  </div>
)}

                      
                      <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                        <button
                          onClick={() => downloadFile(submission.blob, paper.paperTitle, submission.fileType)}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download {submission.fileType.replace('_', ' ')}
                        </button>
                        
                        {/* Payment Dashboard - available once paper is accepted */}
                        {submission.type === 'initial' && canOpenPaymentDashboard && (
                          <button
                            onClick={() => handlePaymentDashboard(paper)}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payment Dashboard
                          </button>
                        )}

                        {/* Payment Status Badge - shows when payment is completed */}
                        {submission.type === 'initial' && isAcceptedDecision && paper.paymentStatus === 'paid' && (
                          <>
                            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold rounded-xl border border-green-300 shadow-sm">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Payment Completed
                            </span>
                            <button
                              onClick={() => navigate(`/payment?paperId=${paper.id}`, { state: { paperId: paper.id, paperTitle: paper.paperTitle } })}
                              className="inline-flex items-center px-4 py-2 bg-white border border-green-300 text-green-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-green-50 transition-all duration-200"
                            >
                              View Payment Status
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              }).flat()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperStatus;
