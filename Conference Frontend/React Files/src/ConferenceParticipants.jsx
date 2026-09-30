import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { apiUrl } from "./config";

const API_URL = apiUrl("/admin/conference-participants");
const EXCEL_EXPORT_URL = apiUrl("/admin/conference-participants/export");

const PAGE_SIZE = 10;
const EXPORT_BATCH_SIZE = 1000;

function ConferenceParticipants() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [error, setError] = useState("");

  const fetchParticipants = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setData([]);
        setError("No token found. Please login again.");
        return;
      }

      const res = await fetch(`${API_URL}?page=${pageNumber}&limit=${PAGE_SIZE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Failed to fetch conference participants");
      }

      setData(payload.data || []);
      setPage(payload.page || pageNumber);
      setTotalPages(payload.totalPages || 1);
      setTotal(payload.total || 0);
    } catch (err) {
      console.error("Error fetching conference participants:", err);
      setData([]);
      setError(err.message || "Error fetching conference participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchParticipants(page);
    }
  }, [user, page]);

  const parseAuthors = (authors) => {
    if (!authors) return [];
    if (Array.isArray(authors)) return authors;
    if (typeof authors === "string") {
      try {
        const parsed = JSON.parse(authors);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const parseParticipants = (indexes, authors) => {
    let list = [];
    try {
      list = typeof indexes === "string" ? JSON.parse(indexes) : indexes;
    } catch {
      list = [];
    }
    if (!Array.isArray(list)) return [];
    return list.map((idx) => authors[idx]?.name || `Author ${idx + 1}`);
  };

  const formatCurrency = (amount) => ((amount || 0) / 100).toFixed(2);

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const buildCsvRows = (rowsData) =>
    rowsData.map((row) => {
      const authors = parseAuthors(row.authors);
      const participants = parseParticipants(row.participantIndexes, authors);

      return [
        row.id,
        row.paperId,
        row.paperTitle || "",
        row.userId,
        row.presentationMode,
        row.stayRequired ? "Yes" : "No",
        row.baseCategory || "",
        formatCurrency(row.baseAmount),
        row.additionalParticipants || 0,
        formatCurrency(row.additionalAmount),
        formatCurrency(row.totalAmount),
        row.currency || "INR",
        authors.length > 0
          ? authors.map((a) => `${a.name || "Author"} (${a.email || "N/A"})`).join(", ")
          : "N/A",
        participants.length > 0 ? participants.join(", ") : "N/A",
        formatDate(row.createdAt),
      ];
    });

  const downloadCsv = async () => {
    if (downloading || total === 0) return;

    const header = [
      "ID",
      "Paper ID",
      "Paper Title",
      "User ID",
      "Presentation Mode",
      "Stay Required",
      "Base Category",
      "Base Amount (INR)",
      "Additional Participants",
      "Additional Amount (INR)",
      "Total Amount (INR)",
      "Currency",
      "Authors",
      "Participants",
      "Created At"
    ];

    const escapeCell = (value) => {
      const safe = (value ?? "").toString().replace(/"/g, '""');
      return `"${safe}"`;
    };

    try {
      setDownloading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      let exportRows = [];
      let exportPage = 1;
      let exportTotalPages = 1;

      do {
        const res = await fetch(`${API_URL}?page=${exportPage}&limit=${EXPORT_BATCH_SIZE}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Failed to download conference participants");
        }

        exportRows = [...exportRows, ...(payload.data || [])];
        exportTotalPages = payload.totalPages || 1;
        exportPage += 1;
      } while (exportPage <= exportTotalPages);

      const rows = buildCsvRows(exportRows).map((row) => row.map(escapeCell).join(","));
      const csvContent = `\uFEFF${[header.map(escapeCell).join(","), ...rows].join("\n")}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "conference_participants_all_records.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading conference participants CSV:", err);
      setError(err.message || "Error downloading conference participants CSV");
    } finally {
      setDownloading(false);
    }
  };

  const downloadExcel = async () => {
    if (downloadingExcel || total === 0) return;
    try {
      setDownloadingExcel(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login again.");
      }
      const res = await fetch(EXCEL_EXPORT_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to download conference participants Excel file");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "conference_participants.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading conference participants Excel file:", err);
      setError(err.message || "Error downloading conference participants Excel file");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Conference Participants</h2>
        <p className="text-gray-600">
          Showing payment dashboard details submitted by users ({PAGE_SIZE} per page).
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">Total records: {total}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsv}
            disabled={loading || downloading || total === 0}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download CSV"}
          </button>
          <button
            onClick={downloadExcel}
            disabled={loading || downloadingExcel || total === 0}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded disabled:opacity-50"
          >
            {downloadingExcel ? "Downloading..." : "Download Excel"}
          </button>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Paper ID</th>
              <th className="p-2">Paper Title</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Presentation</th>
              <th className="p-2">Stay</th>
              <th className="p-2">Base Category</th>
              <th className="p-2">Base Amount</th>
              <th className="p-2">Additional</th>
              <th className="p-2">Additional Amount</th>
              <th className="p-2">Total Amount</th>
              <th className="p-2">Currency</th>
              <th className="p-2">Authors</th>
              <th className="p-2">Participants</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="15" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="15" className="p-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const authors = parseAuthors(row.authors);
                const participants = parseParticipants(row.participantIndexes, authors);
                return (
                  <tr key={row.id} className="border-b hover:bg-gray-50 align-top">
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">{row.paperId}</td>
                    <td className="p-2">{row.paperTitle || "-"}</td>
                    <td className="p-2">{row.userId}</td>
                    <td className="p-2 capitalize">{row.presentationMode}</td>
                    <td className="p-2">{row.stayRequired ? "Yes" : "No"}</td>
                    <td className="p-2">{row.baseCategory || "-"}</td>
                    <td className="p-2 whitespace-nowrap text-right">Rs. {formatCurrency(row.baseAmount)}</td>
                    <td className="p-2">{row.additionalParticipants || 0}</td>
                    <td className="p-2 whitespace-nowrap text-right">Rs. {formatCurrency(row.additionalAmount)}</td>
                    <td className="p-2 whitespace-nowrap text-right font-semibold">Rs. {formatCurrency(row.totalAmount)}</td>
                    <td className="p-2">{row.currency || "INR"}</td>
                    <td className="p-2">
                      {authors.length > 0
                        ? authors.map((a) => `${a.name || "Author"} (${a.email || "N/A"})`).join(", ")
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      {participants.length > 0 ? participants.join(", ") : "N/A"}
                    </td>
                    <td className="p-2">
                      {row.createdAt ? formatDate(row.createdAt) : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConferenceParticipants;
