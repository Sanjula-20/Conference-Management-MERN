import React, { useState, useEffect, useRef } from "react";
import { apiUrl } from "./config";
import {
  Download,
  FileDown,
  Mail,
  MailCheck,
  Edit,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
  Loader2,
  MessageSquare
} from "lucide-react";

const SEND_STATUS_EMAIL_URL = apiUrl("/admin/send-status-email");

function ViewRegistrations({
  registrations = [],
  registrationFilters = {},
  handleFilterChange,
  clearFilters,
  tracks = [],
  handleTrackChange,
  refreshData,
  onDeleteSuccess,
  loading = false
}) {
  const [sendingEmail, setSendingEmail] = useState(null);
  const [updatingDecision, setUpdatingDecision] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [resetting, setResetting] = useState(null);
  const [showingCommentsModal, setShowingCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState({ name: '', comments: '' });
  const [showingAllCommentsModal, setShowingAllCommentsModal] = useState(false);
  const [selectedAllComments, setSelectedAllComments] = useState('');
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [editCountry, setEditCountry] = useState('');
  const [editAuthors, setEditAuthors] = useState([]);
  const [savingDetails, setSavingDetails] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const tableContainerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const scrollbarInnerRef = useRef(null);

  // Sync scrollbars
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const scrollbar = scrollbarRef.current;

    if (!tableContainer || !scrollbar) return;

    const handleTableScroll = () => {
      if (scrollbar) scrollbar.scrollLeft = tableContainer.scrollLeft;
    };

    const handleScrollbarScroll = () => {
      if (tableContainer) tableContainer.scrollLeft = scrollbar.scrollLeft;
    };

    tableContainer.addEventListener('scroll', handleTableScroll);
    scrollbar.addEventListener('scroll', handleScrollbarScroll);

    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll);
      scrollbar.removeEventListener('scroll', handleScrollbarScroll);
    };
  }, []);

  // Reset page to 1 when filters or registrations change
  useEffect(() => {
    setPage(1);
  }, [registrationFilters.fromDate, registrationFilters.toDate, registrationFilters.selectedTracks, registrationFilters.idFilter, registrationFilters.commentsFilter, registrations.length]);

  const filteredRegistrations = registrations.filter(registration => {
    // Date filter
    if (registrationFilters.fromDate || registrationFilters.toDate) {
      const registrationDate = new Date(registration.createdAt);
      if (registrationFilters.fromDate && registrationDate < new Date(registrationFilters.fromDate)) {
        return false;
      }
      if (registrationFilters.toDate && registrationDate > new Date(registrationFilters.toDate)) {
        return false;
      }
    }

    // Track filter
    if (registrationFilters.selectedTracks && registrationFilters.selectedTracks.length > 0) {
      if (!registration.tracks) {
        return false;
      }
      const regTracks = registration.tracks
        .split(/[,;]/)
        .map(track => track.trim().toLowerCase())
        .filter(track => track);
      const hasMatch = registrationFilters.selectedTracks.some(selectedTrack =>
        regTracks.some(regTrack => regTrack === selectedTrack.toLowerCase())
      );
      if (!hasMatch) {
        return false;
      }
    }

    // ID filter
    if (registrationFilters.idFilter && registrationFilters.idFilter.trim()) {
      const idStr = String(registration.id || '').toLowerCase();
      const filterStr = registrationFilters.idFilter.trim().toLowerCase();
      if (!idStr.includes(filterStr)) {
        return false;
      }
    }

    // Comments filter
    if (registrationFilters.commentsFilter) {
      const hasComments = registration.reviewers && registration.reviewers.some(reviewer =>
        reviewer.comments && reviewer.comments.trim().length > 0
      );
      if (!hasComments) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const paginatedRegistrations = filteredRegistrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Safe helpers
  const getPhone = (reg) =>
    reg?.phone ||
    (Array.isArray(reg?.authors) && reg.authors[0]?.mobile) ||
    "";

  const emptyAuthor = () => ({ name: '', designation: '', type: '', institution: '', email: '', mobile: '' });

  const openRegistrationEditor = (registration) => {
    setEditingRegistration(registration);
    setEditCountry(registration.country || '');
    setEditAuthors(Array.isArray(registration.authors) && registration.authors.length
      ? registration.authors.map((author) => ({ ...emptyAuthor(), ...author }))
      : [emptyAuthor()]);
  };

  const updateAuthorField = (index, field, value) => {
    setEditAuthors((authors) => authors.map((author, authorIndex) =>
      authorIndex === index ? { ...author, [field]: value } : author
    ));
  };

  const saveRegistrationDetails = async () => {
    if (!editCountry.trim() || editAuthors.some((author) => !author.name.trim())) {
      alert('Enter a country and a name for every author.');
      return;
    }
    setSavingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl('/admin/registrations')}/${editingRegistration.id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ country: editCountry, authors: editAuthors })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update registration details');
      alert('Country and author details updated successfully.');
      setEditingRegistration(null);
      if (typeof refreshData === 'function') refreshData();
    } catch (error) {
      alert(error.message || 'Unable to update registration details');
    } finally {
      setSavingDetails(false);
    }
  };

  // CSV helpers
  const escapeCSVField = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    // Escape double quotes by doubling them, wrap in quotes
    return '"' + str.replace(/"/g, '""') + '"';
  };

  const downloadCSV = async () => {
    if (filteredRegistrations.length === 0) return;

    setIsDownloadingCSV(true);
    try {
      // Simulate async operation if needed, but for now it's synchronous
      const headers = ["ID", "Paper Title", "Authors", "Email", "Phone", "Assigned Reviewer", "Created At", "Reviewer Statuses", "Reviewer Comments", "Track", "Comments", "Admin Decision", "Final Submission"];
      const rows = filteredRegistrations.map(reg => {
        const reviewerStatuses = reg.reviewers && reg.reviewers.length > 0
          ? reg.reviewers.map(r => `${r.name}: ${r.reviewStatus || 'Not reviewed'}`).join('; ')
          : 'No reviewers assigned';
        const reviewerComments = reg.reviewers && reg.reviewers.length > 0
          ? reg.reviewers.map(r => `${r.name}: ${r.comments || 'No comments'}`).join('; ')
          : 'No reviewers assigned';
        const comments = reg.reviewers && reg.reviewers.length > 0
          ? reg.reviewers.map(r => `${r.name}: ${r.comments || 'No comments'}`).join('; ')
          : 'No reviewers assigned';

        return [
          escapeCSVField(reg.id || ""),
          escapeCSVField(reg.paperTitle || ""),
          escapeCSVField(Array.isArray(reg.authors) ? reg.authors.map(a => a.name).join(", ") : "N/A"),
          escapeCSVField(reg.email || ""),
          escapeCSVField(getPhone(reg)),
          escapeCSVField((reg.reviewers && reg.reviewers.length > 0) ? reg.reviewers.map(r => r.name).join(", ") : 'Not assigned'),
          escapeCSVField(new Date(reg.createdAt).toLocaleString()),
          escapeCSVField(reviewerStatuses),
          escapeCSVField(reg.tracks || ""),
          escapeCSVField(comments),
          escapeCSVField(reg.status || 'Not reviewed'),
          escapeCSVField(reg.finalSubmissionStatus || 'Not submitted'),
        ].join(",");
      });

      const csvContent = [headers.map(h => escapeCSVField(h)).join(","), ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  // Generic base64 -> blob helper
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

      // Try to detect mime type by magic numbers
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

  const downloadAbstract = (base64Data, paperTitle = 'paper') => {
    const result = base64ToBlob(base64Data);
    if (!result) {
      alert("No abstract file available");
      return;
    }
    const { blob, extension } = result;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paperTitle}_abstract.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadFinalPaper = (base64Data, paperTitle = 'paper') => {
    const result = base64ToBlob(base64Data);
    if (!result) {
      alert("No final paper file available");
      return;
    }
    const { blob, extension } = result;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paperTitle}_final.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadFinalFromServer = async (registration) => {
    if (!registration) return;

    // If no id, fall back to client blob
    if (!registration.id) {
      return downloadFinalPaper(registration?.finalPaperBlob, registration?.paperTitle);
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl("/admin/download-final-paper")}/${registration.id}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        console.warn('Server download failed, falling back to client-side. Status:', res.status);
        if (registration && registration.finalPaperBlob) {
          return downloadFinalPaper(registration.finalPaperBlob, registration.paperTitle);
        }
        const errorBody = await res.json().catch(() => ({}));
        return alert(errorBody.error || 'Final paper not available for download');
      }

      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      let filename = (registration.paperTitle || 'final_submission').replace(/["\\/:*?<>|]+/g, '_');
      const match = cd.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading final paper from server:', err);
      if (registration && registration.finalPaperBlob) {
        return downloadFinalPaper(registration.finalPaperBlob, registration.paperTitle);
      }
      alert('Error downloading final paper');
    }
  };

  const hasFinalPaper = (registration) => {
    if (!registration) return false;
    if (registration.finalPaperBlob && typeof registration.finalPaperBlob === 'string' && registration.finalPaperBlob.trim().length > 0) return true;
    if (registration.finalSubmissionStatus && registration.finalSubmissionStatus === 'submitted') return true;
    return false;
  };

  const sendStatusEmail = async (paperId) => {
    if (!window.confirm('Are you sure you want to send status update emails to all authors of this paper?')) {
      return;
    }

    setSendingEmail(paperId);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(SEND_STATUS_EMAIL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paperId })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(`Status update emails sent successfully to ${data.emailsSent || 'authors'}`);
        if (typeof refreshData === 'function') refreshData();
      } else {
        alert(data.error || 'Failed to send status emails');
      }
    } catch (err) {
      console.error("Error sending status emails:", err);
      alert('Error sending status emails');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl("/admin/registrations")}/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('Registration deleted successfully');
        if (typeof onDeleteSuccess === 'function') onDeleteSuccess(id);
        if (typeof refreshData === 'function') refreshData();
      } else {
        alert(data.error || 'Failed to delete registration');
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      alert('Error deleting registration');
    }
  };

  const handleUpdateDecision = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = { status };
      if (adminComments.trim()) {
        payload.adminComments = adminComments.trim();
      }

      const res = await fetch(`${apiUrl("/admin/registrations")}/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('Decision updated successfully');
        setUpdatingDecision(null);
        setAdminComments('');
        if (typeof refreshData === 'function') refreshData();
      } else {
        alert(data.error || 'Failed to update decision');
      }
    } catch (err) {
      console.error('Error updating decision:', err);
      alert('Error updating decision');
    }
  };

  const handleResetFinalSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to reset the final submission? This will allow the author to resubmit the final paper.')) {
      return;
    }

    setResetting(id);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl("/admin/registrations")}/${id}/reset-final-submission`, {
        method: 'PUT',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('Final submission reset successfully');
        if (typeof refreshData === 'function') refreshData();
      } else {
        alert(data.error || 'Failed to reset final submission');
      }
    } catch (err) {
      console.error('Error resetting final submission:', err);
      alert('Error resetting final submission');
    } finally {
      setResetting(null);
    }
  };

  // ---------- NEW: updater to ensure fake scrollbar inner width matches real table ----------
  const updateFakeScrollbar = () => {
    try {
      const tableEl = tableContainerRef.current?.querySelector('table');
      const inner = scrollbarInnerRef.current;
      if (!inner) return;
      if (tableEl) {
        inner.style.width = `${tableEl.scrollWidth}px`;
      } else if (tableContainerRef.current) {
        inner.style.width = `${tableContainerRef.current.scrollWidth}px`;
      } else {
        inner.style.width = '100%';
      }
    } catch (e) {
      // ignore
    }
  };

  // Run updater when paginated rows change (this ensures the fake scrollbar appears immediately)
  useEffect(() => {
    updateFakeScrollbar();

    // Also schedule a micro-delay update to catch any async layout changes (fonts, rendering)
    const t = setTimeout(updateFakeScrollbar, 50);
    const t2 = setTimeout(updateFakeScrollbar, 250);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [paginatedRegistrations, page, registrations.length]);

  // ResizeObserver on the table to update fake scrollbar when layout changes
  useEffect(() => {
    const tableEl = tableContainerRef.current?.querySelector('table');
    if (!tableEl || typeof ResizeObserver === 'undefined') {
      // fallback to window resize listener
      window.addEventListener('resize', updateFakeScrollbar);
      return () => window.removeEventListener('resize', updateFakeScrollbar);
    }

    const ro = new ResizeObserver(() => {
      updateFakeScrollbar();
    });
    ro.observe(tableEl);

    // also observe container in case vertical scrollbar appears/disappears
    ro.observe(tableContainerRef.current);

    // cleanup
    return () => ro.disconnect();
  }, []);

  // ------------------------------------------------------------------------------

  // --------- Helper to get the real table width (used earlier versions; kept for compatibility) ----------
  const getTableInnerWidth = () => {
    try {
      const tableEl = tableContainerRef.current?.querySelector('table');
      if (tableEl) return `${tableEl.scrollWidth}px`;
      const cw = tableContainerRef.current?.scrollWidth;
      return cw ? `${cw}px` : '100%';
    } catch (e) {
      const cw = tableContainerRef.current?.scrollWidth;
      return cw ? `${cw}px` : '100%';
    }
  };
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <style>{`
        /* hide horizontal scrollbar while keeping vertical scroll */
        .hide-horizontal-scroll {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-horizontal-scroll::-webkit-scrollbar {
          height: 0px;
        }
      `}</style>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">View Registrations</h2>
        <p className="text-gray-600">Total registrations: {filteredRegistrations.length}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="sm:mb-0">
            <h3 className="text-base sm:text-lg font-semibold text-blue-700">Export Data</h3>
            <p className="text-sm text-gray-500">Download filtered registration data as CSV</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={downloadCSV}
              disabled={isDownloadingCSV}
              className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDownloadingCSV
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isDownloadingCSV ? 'Downloading...' : 'Download CSV'}
            </button>
            <button
              onClick={() => refreshData && refreshData()}
              disabled={loading}
              className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-4">Filter Registrations by Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={registrationFilters.fromDate || ""}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={registrationFilters.toDate || ""}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {(registrationFilters.fromDate || registrationFilters.toDate || (registrationFilters.selectedTracks && registrationFilters.selectedTracks.length > 0)) && (
          <p className="text-sm text-blue-600 mt-2">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-4">Filter Registrations by Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tracks.map(track => (
            <div key={track} className="flex items-center">
              <input
                type="checkbox"
                id={track}
                checked={(registrationFilters.selectedTracks || []).includes(track)}
                onChange={(e) => handleTrackChange(track, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={track} className="ml-2 block text-sm text-gray-900">
                {track}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-4">Filter Registrations by ID and Comments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="idFilter" className="block text-sm font-medium text-gray-700 mb-1">
              ID Filter
            </label>
            <input
              type="text"
              id="idFilter"
              name="idFilter"
              value={registrationFilters.idFilter || ""}
              onChange={handleFilterChange}
              placeholder="Enter ID to filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="commentsFilter"
              name="commentsFilter"
              checked={registrationFilters.commentsFilter || false}
              onChange={(e) => handleFilterChange({ target: { name: 'commentsFilter', value: e.target.checked } })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="commentsFilter" className="ml-2 block text-sm text-gray-900">
              Has Comments
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {registrations.length === 0 ? 'No registrations found' : 'No registrations match the selected filters'}
            </p>
          </div>
        ) : (
          <>
            <div
              ref={tableContainerRef}
              className="overflow-x-auto"
              style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
            >
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Paper ID</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Paper Title</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Authors</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Email</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Phone</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Assigned Reviewer</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Created At</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Reviewer Statuses</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Reviewer Comments</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Track</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Admin Comments</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Admin Decision</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Final Submission</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Paper Submission</th>
                    <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {paginatedRegistrations.map((reg, index) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + index;
                    const rowClass = `${globalIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-50 transition-colors duration-150`;
                    const isSending = sendingEmail === reg.id;
                    const assignedCls = reg.reviewers && reg.reviewers.length > 0
                      ? 'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800'
                      : 'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600';
                    const hasTwoReviews = (reg.reviewers ? reg.reviewers.filter(r => r.reviewStatus && r.reviewStatus.trim() !== '') : []).length >= 2;
                    const notificationSent = reg.notificationSent === true || reg.notificationSent === 1;
                    const canSendStatus = reg.status && reg.status !== 'submitted' && reg.status !== 'under_review' && !notificationSent;

                    return (
                      <tr key={reg.id || globalIndex} className={rowClass}>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.id}</td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <p className="font-medium truncate" title={reg.paperTitle}>{reg.paperTitle}</p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-700">
                          <div className="max-w-xs">
                            {Array.isArray(reg.authors) ? reg.authors.map(author => author.name).join(", ") : "N/A"}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.email}</td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getPhone(reg)}</td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className={assignedCls}>
                            {reg.reviewers && reg.reviewers.length > 0 ? reg.reviewers.map(r => r.name).join(', ') : 'Not assigned'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 text-sm">
                          <div className="flex flex-col space-y-1 min-w-max">
                            {reg.reviewers && reg.reviewers.length > 0 ? (
                              reg.reviewers.map((reviewer, idx) => {
                                let reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer';
                                if (reviewer.reviewStatus === 'accepted') reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
                                else if (reviewer.reviewStatus === 'rejected') reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-green-200 cursor-pointer';
                                else if (reviewer.reviewStatus === 'under_review') reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer';
                                else if (reviewer.reviewStatus === 'accepted_with_minor_revision') reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer';
                                else if (reviewer.reviewStatus === 'accepted_with_major_revision') reviewerClass = 'px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer';

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedComments({ name: reviewer.name, comments: reviewer.comments || 'No comments available' });
                                      setShowingCommentsModal(true);
                                    }}
                                    className={reviewerClass}
                                  >
                                    {reviewer.name}: {reviewer.reviewStatus || 'Not reviewed'}
                                  </button>
                                );
                              })
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                No reviewers assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 text-sm">
                          <div className="flex flex-col space-y-1 min-w-max">
                            {reg.reviewers && reg.reviewers.length > 0 ? (
                              reg.reviewers.map((reviewer, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedComments({ name: reviewer.name, comments: reviewer.comments || 'No comments available' });
                                    setShowingCommentsModal(true);
                                  }}
                                  title={`View comments from ${reviewer.name}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{reviewer.name}: View Comments</span>
                                </button>
                              ))
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                No reviewers assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                          {reg.tracks || 'N/A'}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 text-sm text-gray-700">
                          <div className="max-w-xs truncate" title={reg.adminComments || 'No admin comments'}>
                            {reg.adminComments || 'N/A'}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                          {(() => {
                            let statusCls = 'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600';
                            if (reg.status === 'accepted') statusCls = 'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800';
                            else if (reg.status === 'rejected') statusCls = 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800';
                            else if (reg.status === 'under_review') statusCls = 'px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800';
                            else if (reg.status === 'accepted_with_minor_revision') statusCls = 'px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800';
                            else if (reg.status === 'accepted_with_major_revision') statusCls = 'px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800';

                            return <span className={statusCls}>{reg.status || 'Not reviewed'}</span>;
                          })()}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {reg.finalSubmissionStatus || 'Not submitted'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                          {reg.abstractBlob ? (
                            <button
                              onClick={() => downloadAbstract(reg.abstractBlob, reg.paperTitle)}
                              title="Download Abstract"
                              aria-label="Download Abstract"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-xs transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 min-w-max">
                            <button
                              onClick={() => downloadFinalFromServer(reg)}
                              disabled={!hasFinalPaper(reg)}
                              title={hasFinalPaper(reg) ? "Download Final Paper" : "Final Paper Not Submitted"}
                              aria-label="Download Final Paper"
                              className={`inline-flex items-center justify-center p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                                !hasFinalPaper(reg) ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                              }`}
                            >
                              <FileDown className="w-4 h-4" />
                            </button>

                            {canSendStatus && (
                              <button
                                onClick={() => sendStatusEmail(reg.id)}
                                disabled={isSending}
                                title={isSending ? "Sending Status Email..." : "Send Status Email"}
                                aria-label="Send Status Email"
                                className={`inline-flex items-center justify-center p-2 text-white rounded-md shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                                  isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                                }`}
                              >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                              </button>
                            )}

                            {notificationSent && (
                              <span
                                title="Status Email Sent"
                                aria-label="Status Email Sent"
                                className="inline-flex items-center justify-center p-2 rounded-md bg-red-100 text-red-700 border border-red-300"
                              >
                                <MailCheck className="w-4 h-4" />
                              </span>
                            )}

                            <button
                              onClick={() => openRegistrationEditor(reg)}
                              title="Edit Details"
                              aria-label="Edit Details"
                              className="inline-flex items-center justify-center p-2 text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setUpdatingDecision(reg.id);
                                setNewStatus(reg.status || 'under_review');
                                setAdminComments(reg.adminComments || '');
                              }}
                              title="Update Decision"
                              aria-label="Update Decision"
                              className="inline-flex items-center justify-center p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              title="Delete"
                              aria-label="Delete"
                              className="inline-flex items-center justify-center p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {reg.finalSubmissionStatus === 'submitted' && (
                              <button
                                onClick={() => handleResetFinalSubmission(reg.id)}
                                disabled={resetting === reg.id}
                                title={resetting === reg.id ? "Resetting Final Submission..." : "Reset Final Submission"}
                                aria-label="Reset Final Submission"
                                className={`inline-flex items-center justify-center p-2 text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${
                                  resetting === reg.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                }`}
                              >
                                {resetting === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls (outside the scrollable table container so they never scroll horizontally) */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredRegistrations.length)} of {filteredRegistrations.length}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Prev
                </button>

                <div className="flex flex-wrap gap-1 max-w-full">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Native horizontal scrollbar is used; removed custom fake scrollbar to avoid duplication */}
          </>
        )}
      </div>

      {updatingDecision && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Decision</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select the new decision status for this registration and add any admin comments if necessary.
              </p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              >
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="accepted_with_minor_revision">Accepted with Minor Revision</option>
                <option value="accepted_with_major_revision">Accepted with Major Revision</option>
              </select>
              <textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder="Enter admin comments (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
                rows="4"
              ></textarea>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateDecision(updatingDecision, newStatus)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update
                </button>
                <button
                  onClick={() => setUpdatingDecision(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Registration Details</h3>
            <p className="text-sm text-gray-500 mb-4">Paper #{editingRegistration.id}: {editingRegistration.paperTitle}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input value={editCountry} onChange={(event) => setEditCountry(event.target.value)} className="w-full px-3 py-2 border rounded-md mb-5" />
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Authors</h4>
              <button onClick={() => setEditAuthors((authors) => [...authors, emptyAuthor()])} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Add Author</button>
            </div>
            {editAuthors.map((author, index) => (
              <div key={index} className="border rounded-md p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {['name', 'designation', 'type', 'institution', 'email', 'mobile'].map((field) => (
                    <input key={field} value={author[field] || ''} onChange={(event) => updateAuthorField(index, field, event.target.value)} placeholder={field === 'name' ? 'Full Name *' : field.charAt(0).toUpperCase() + field.slice(1)} className="px-3 py-2 border rounded-md" />
                  ))}
                </div>
                {editAuthors.length > 1 && <button onClick={() => setEditAuthors((authors) => authors.filter((_, authorIndex) => authorIndex !== index))} className="mt-2 text-sm text-red-600">Remove author</button>}
              </div>
            ))}
            <div className="flex gap-3 mt-5">
              <button onClick={saveRegistrationDetails} disabled={savingDetails} className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:bg-gray-400">{savingDetails ? 'Saving...' : 'Save Details'}</button>
              <button onClick={() => setEditingRegistration(null)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showingCommentsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reviewer Comments</h3>
              <p className="text-sm text-gray-500 mb-4">
                Comments from {selectedComments.name}:
              </p>
              <div className="bg-gray-50 p-4 rounded-md mb-6 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedComments.comments}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowingCommentsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRegistrations;
