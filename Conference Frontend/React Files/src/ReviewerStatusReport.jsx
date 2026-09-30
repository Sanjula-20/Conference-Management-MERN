import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { apiUrl } from "./config";

const REPORT_URL = apiUrl("/admin/reviewer-status-report");
const REVIEWERS_PER_PAGE = 5;

const statusBadge = (status) => {
  const normalized = (status || "pending").toLowerCase();
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    revision: "bg-orange-100 text-orange-700",
  };
  return styles[normalized] || "bg-gray-100 text-gray-700";
};

function ReviewerStatusReport() {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(REPORT_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to fetch reviewer status report");
      setReport(payload || []);
    } catch (err) {
      console.error("Error fetching reviewer status report:", err);
      setError(err.message || "Error fetching reviewer status report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchReport();
  }, [user]);

  const toggleExpand = (reviewerId) => {
    setExpanded((prev) => ({ ...prev, [reviewerId]: !prev[reviewerId] }));
  };

  // Match the start of any name part: "Jo" matches "John Smith" and "S" matches "Smith".
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredReport = report.filter((rev) => {
    const nameParts = rev.reviewerName?.toLowerCase().split(/\s+/) || [];
    return nameParts.some((namePart) => namePart.startsWith(normalizedSearchTerm));
  });
  const totalPages = Math.max(1, Math.ceil(filteredReport.length / REVIEWERS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedReport = filteredReport.slice(
    (activePage - 1) * REVIEWERS_PER_PAGE,
    activePage * REVIEWERS_PER_PAGE
  );

  if (!user || user.role !== "admin") return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">Reviewer-Wise Status Report</h3>

      <div className="mb-4">
        <label htmlFor="reviewer-search" className="sr-only">Search reviewers</label>
        <input
          id="reviewer-search"
          type="search"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search reviewers by name..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : report.length === 0 ? (
        <p className="text-gray-600">No reviewers with assignments found.</p>
      ) : filteredReport.length === 0 ? (
        <p className="text-gray-600">No reviewers found matching “{searchTerm}”.</p>
      ) : (
        <div className="space-y-3">
          {paginatedReport.map((rev) => {
           const completed = rev.papers.filter((p) => {
  const status = (p.status || "").toLowerCase();

  return [
    "accepted",
    "accepted_with_minor_revision",
    "accepted_with_major_revision",
    "rejected"
  ].includes(status);
}).length;
            const isExpanded = Boolean(expanded[rev.reviewerId]);
            return (
              <div key={rev.reviewerId} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleExpand(rev.reviewerId)}
                  className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div>
                    <span className="font-semibold text-gray-800">{rev.reviewerName}</span>
                    <span className="text-sm text-gray-500 ml-2">({rev.reviewerEmail})</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        rev.reviewerType === "external" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {rev.reviewerType === "external" ? "External" : "Internal"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                    {completed}/{rev.papers.length} reviewed &nbsp;
                    <span className="text-blue-600">{isExpanded ? "Hide" : "Show"} papers</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto border-t border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-2">Paper ID</th>
                          <th className="text-left p-2">Paper Title</th>
                          <th className="text-left p-2">Assigned On</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Reviewed On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rev.papers.map((paper) => (
                          <tr key={paper.paperId} className="border-b">
                            <td className="p-2">{paper.paperId}</td>
                            <td className="p-2">{paper.paperTitle}</td>
                            <td className="p-2">{paper.assignedAt ? new Date(paper.assignedAt).toLocaleDateString() : "-"}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(paper.status)}`}>
                                {paper.status || "pending"}
                              </span>
                            </td>
                            <td className="p-2">{paper.reviewedAt ? new Date(paper.reviewedAt).toLocaleDateString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredReport.length > REVIEWERS_PER_PAGE && (
        <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-gray-600">
            Showing {(activePage - 1) * REVIEWERS_PER_PAGE + 1}–{Math.min(activePage * REVIEWERS_PER_PAGE, filteredReport.length)} of {filteredReport.length} reviewers
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={activePage === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {activePage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={activePage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewerStatusReport;
