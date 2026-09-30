import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Header from "./Header";
import { apiUrl } from "./config";

const API_BASE_URL = apiUrl("/admin");

function ReviewerDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignedPapers, setAssignedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [reviewData, setReviewData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('pending');


  useEffect(() => {
    if (!user || user.role !== 'reviewer') {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAssignedPapers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignedPapers([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/reviewer/assigned-papers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAssignedPapers(data);
        } else {
          setAssignedPapers([]);
          console.warn("Failed to fetch assigned papers:", data);
        }
      } catch (err) {
        console.error("Error fetching assigned papers:", err);
        setAssignedPapers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'reviewer') {
      fetchAssignedPapers();
    }
  }, [user]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    const paperId = expandedPaper;
    const data = reviewData[paperId];
    if (!paperId || !data.status) {
      alert('Please select a status before updating.');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/reviewer/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paperId,
          status: data.status,
          comments: data.comments,
          q1: data.q1,
          q2: data.q2,
          q3: data.q3,
          q4: data.q4,
          q5: data.q5,
          q6: data.q6
        })
      });

      const responseData = await res.json();
      if (res.ok) {
        alert('Paper status updated successfully!');
        setExpandedPaper(null);
        setReviewData({});

        // Refresh the assigned papers list
        const refreshRes = await fetch(`${API_BASE_URL}/reviewer/assigned-papers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && Array.isArray(refreshData)) {
          setAssignedPapers(refreshData);
        }
      } else {
        alert(`Error: ${responseData.error}`);
      }
    } catch (err) {
      console.error("Error updating paper status:", err);
      alert('Error updating paper status');
    } finally {
      setUpdating(false);
    }
  };

  const toggleAccordion = (paperId) => {
    if (expandedPaper === paperId) {
      setExpandedPaper(null);
    } else {
      setExpandedPaper(paperId);
      // Initialize review data for this paper
      setReviewData(prev => ({
        ...prev,
        [paperId]: {
          status: '',
          comments: '',
          q1: '',
          q2: '',
          q3: '',
          q4: '',
          q5: '',
          q6: ''
        }
      }));
    }
  };

  const updateReviewData = (paperId, field, value) => {
    setReviewData(prev => ({
      ...prev,
      [paperId]: {
        ...prev[paperId],
        [field]: value
      }
    }));
  };

  const isPaperReviewed = (paper) => {
  const status = (paper.reviewStatus || "").toLowerCase();

  return [
    "accepted",
    "accepted_with_minor_revision",
    "accepted_with_major_revision",
    "rejected"
  ].includes(status);
};
  const filteredPapers = assignedPapers.filter((paper) => {
    if (reviewFilter === 'completed') {
      return isPaperReviewed(paper);
    }
    if (reviewFilter === 'pending') {
      return !isPaperReviewed(paper);
    }
    return true;
  });

  const pendingCount = assignedPapers.filter((paper) => !isPaperReviewed(paper)).length;
  const completedCount = assignedPapers.filter((paper) => isPaperReviewed(paper)).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted_with_minor_revision': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted_with_major_revision': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      // case 'published': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAuthors = (authors) => {
    if (typeof authors === 'string') {
      try {
        authors = JSON.parse(authors);
      } catch {
        return authors;
      }
    }
    if (Array.isArray(authors)) {
      return authors.map(author => `${author.name} (${author.email})`).join(', ');
    }
    return 'N/A';
  };

  const downloadAbstract = (base64Data, paperTitle) => {
    if (!base64Data) {
      alert("No abstract file available");
      return;
    }
    const cleanedBase64 = base64Data.replace(/\s/g, '');
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    let mimeType = "application/pdf";
    let extension = "pdf";

    if (byteArray.length > 4) {
      if (byteArray[0] === 0x25 && byteArray[1] === 0x50 && byteArray[2] === 0x44 && byteArray[3] === 0x46) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (byteArray[0] === 0xD0 && byteArray[1] === 0xCF && byteArray[2] === 0x11 && byteArray[3] === 0xE0) {
        mimeType = "application/msword";
        extension = "doc";
      } else if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      }
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${paperTitle}_abstract.${extension}`;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadFinalPaper = (base64Data, paperTitle) => {
    if (!base64Data) {
      alert("No final paper file available");
      return;
    }
    const cleanedBase64 = base64Data.replace(/\s/g, '');
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    let mimeType = "application/pdf";
    let extension = "pdf";

    if (byteArray.length > 4) {
      if (byteArray[0] === 0x25 && byteArray[1] === 0x50 && byteArray[2] === 0x44 && byteArray[3] === 0x46) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (byteArray[0] === 0xD0 && byteArray[1] === 0xCF && byteArray[2] === 0x11 && byteArray[3] === 0xE0) {
        mimeType = "application/msword";
        extension = "doc";
      } else if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      }
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${paperTitle}_final.${extension}`;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading assigned papers...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header/>
      <div className="bg-white shadow-md border-b pt-32 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Reviewer Dashboard</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-lg border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-600 mb-0.5">Your Track</p>
                <p className="text-sm font-bold text-blue-900">{user?.track || 'Not Assigned'}</p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Assigned Papers
              </h2>
              <p className="text-gray-600">Review and update the status of assigned papers</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-0.5">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{assignedPapers.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Showing {filteredPapers.length}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="inline-flex bg-white rounded-xl border border-gray-200 shadow-sm p-1">
              <button
                onClick={() => setReviewFilter('pending')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${reviewFilter === 'pending' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setReviewFilter('completed')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${reviewFilter === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 rounded-full p-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {assignedPapers.length === 0 ? 'No Papers Assigned Yet' : 'No Papers Match This Filter'}
            </h3>
            <p className="text-gray-500">
              {assignedPapers.length === 0
                ? 'Papers will appear here once they are assigned to you for review'
                : 'Try switching the filter to see other assigned papers'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-2.5 mt-0.5">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                          {paper.paperTitle}
                        </h3>
                        <div className="space-y-2.5">
                          <p className="text-sm text-gray-700 flex items-start gap-2">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span><span className="font-semibold text-gray-900">Authors:</span> {formatAuthors(paper.authors)}</span>
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span><span className="font-semibold text-gray-900">Submitted by:</span> {paper.email}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1">
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span><span className="font-semibold text-gray-900">Submitted:</span> {new Date(paper.createdAt).toLocaleDateString()}</span>
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span><span className="font-semibold text-gray-900">Assigned:</span> {new Date(paper.assignedAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2.5 ml-6">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${getStatusColor(paper.status)} shadow-sm`}>
                      {paper.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {paper.reviewStatus && (
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${getStatusColor(paper.reviewStatus)} shadow-sm`}>
                        Your Review: {paper.reviewStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Abstract Display Section: show only if an abstract blob exists. */}
                {paper.abstractBlob && (
                  <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Abstract
                        {paper.updatedAt && new Date(paper.updatedAt) > new Date(paper.assignedAt) && (
                          <span className="ml-2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                            Inital Paper Submission
                          </span>
                        )}
                      </h4>
                      {paper.abstractBlob && (
                        <button
                          onClick={() => downloadAbstract(paper.abstractBlob, paper.paperTitle)}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Download abstract for ${paper.paperTitle}`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Abstract
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Final Paper Display Section */}
                {paper.finalPaperBlob && (
                  <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Final Paper
                        {paper.updatedAt && new Date(paper.updatedAt) > new Date(paper.assignedAt) && (
                          <span className="ml-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                            Updated
                          </span>
                        )}
                      </h4>
                      <button
                        onClick={() => downloadFinalPaper(paper.finalPaperBlob, paper.paperTitle)}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label={`Download final paper for ${paper.paperTitle}`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Final Paper
                      </button>
                    </div>
                  </div>
                )}

                {paper.comments && (
                  <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-200 rounded-lg p-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Your Comments:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{paper.comments}</p>
                        {paper.reviewedAt && (
                          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reviewed on: {new Date(paper.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleAccordion(paper.id)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg className={`w-5 h-5 mr-2 transition-transform ${expandedPaper === paper.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {expandedPaper === paper.id ? 'Hide Review Form' : 'Update Status'}
                  </button>

                  {(paper.status === 'accepted' || paper.status === 'accepted_with_minor_revision' || paper.status === 'accepted_with_major_revision') && (
                    <span className="flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Paper Accepted
                    </span>
                  )}
                  {paper.status === 'rejected' && (
                    <span className="flex items-center gap-2 text-sm text-red-700 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Paper Rejected
                    </span>
                  )}
                </div>

                {/* Accordion Content */}
                {expandedPaper === paper.id && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 rounded-xl p-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Update Paper Status
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">Review and update the paper status</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">Paper Title</p>
                      <p className="text-sm text-gray-900 font-semibold">{paper.paperTitle}</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleStatusUpdate(e); }}>
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Status *
                        </label>
                        <select
                          value={reviewData[paper.id]?.status || ''}
                          onChange={(e) => updateReviewData(paper.id, 'status', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="under_review">Under Review</option>
                          <option value="accepted">Accepted</option>
                          <option value="accepted_with_minor_revision">Accepted with Minor Revision</option>
                          <option value="accepted_with_major_revision">Accepted with Major Revision</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          1.	Originality: Does the paper contain new and significant information adequate to justify publication?
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q1 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q1', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Provide your assessment of the paper's quality..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                           2.	Relationship to Literature: Does the paper demonstrate an adequate understanding of the relevant literature in the field and cite an appropriate range of literature sources.
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q2 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q2', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Discuss the relevance to the conference theme..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          3. Methodology: Is the paper's argument built on an appropriate base of theory, concepts or other ideas? Has the research or equivalent intellectual work on which the paper is based been well designed? Are the methods employed appropriate?
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q3 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q3', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Highlight the key strengths..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          4.	Results: Are results presented clearly and analysed appropriately? Do the conclusions adequately tie together the other elements of the paper?
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q4 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q4', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Identify areas for improvement..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                         5.	Does the paper clearly state implications for research, practice, and society? - Does it connect theory to real-world applications? - What's the potential impact on society (e.g., changing attitudes, improving lives)? Are these implications consistent with the findings and conclusions of the paper?
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q5 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q5', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Evaluate the technical content..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                         6.	Quality of Communication: - Is the paper clear and concise in its language and arguments? - Is technical language used appropriately for the journal's audience? - Is the writing readable, with minimal jargon and clear acronyms?
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.q6 || ''}
                          onChange={(e) => updateReviewData(paper.id, 'q6', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="3"
                          placeholder="Provide any additional feedback..."
                        />
                      </div>

                      <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Overall Comments
                        </label>
                        <textarea
                          value={reviewData[paper.id]?.comments || ''}
                          onChange={(e) => updateReviewData(paper.id, 'comments', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all"
                          rows="4"
                          placeholder="Add your overall review comments..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setExpandedPaper(null)}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updating}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                          {updating ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Update Status
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}

export default ReviewerDashboard;
