import React, { useState, useEffect } from "react";
import { apiUrl } from "./config";

const ASSIGN_REVIEWER_URL = apiUrl("/admin/assign-reviewer");
const GET_ASSIGNMENTS_URL = apiUrl("/admin/assignments");

const DELETE_ASSIGNMENT_URL = (paperId, reviewerId) => `${apiUrl("/admin/assignment")}/${paperId}/${reviewerId}`;

const TRACKS = [
  "Emerging & Frontier Technologies",
  "Sustainable Energy & Power Systems",
  "Environment, Climate-Tech & Sustainable Infrastructure",
  "Advanced Computing & Cyber-Physical Systems",
  "Sustainable Transportation & E-Mobility",
  "Nextgen communication, VLSI & Embedded Systems"
];

function AssignReviewer({ registrations, reviewers, onAssignmentComplete }) {
  // State for available papers
  const [availablePapers, setAvailablePapers] = useState([]);
  const [selectedReviewers1, setSelectedReviewers1] = useState({});
  const [selectedReviewers2, setSelectedReviewers2] = useState({});
  const [assigningNew, setAssigningNew] = useState(false);
  const [assignments, setAssignments] = useState([]); // Array of {paperId, paperTitle, track, reviewerNames[], reviewerDetails[], reviewerIds[]}
  const [loadingAssignments, setLoadingAssignments] = useState(true);


  const [deletingAssignment, setDeletingAssignment] = useState(null); // {paperId, reviewerId} being deleted
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', paperTracks: '', reviewerTracks: '', paperId: '' });
  const [reviewerTrackFilters, setReviewerTrackFilters] = useState('');
  const [paperTrackFilters, setPaperTrackFilters] = useState('');
  const [selectedSecondReviewers, setSelectedSecondReviewers] = useState({});
  const [assigningSecond, setAssigningSecond] = useState(false);
  const [showAssignedPapers, setShowAssignedPapers] = useState(false); // Default to show unassigned (0 reviewers)
  const [currentPageAssignments, setCurrentPageAssignments] = useState(1);
  const [currentPageAvailable, setCurrentPageAvailable] = useState(1);
  const pageSize = 10;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePaperTrackFilterChange = (e) => {
    setPaperTrackFilters(e.target.value);
  };

  const handleReviewerTrackFilterChange = (e) => {
    setReviewerTrackFilters(e.target.value);
  };

  // Fetch all assignments and unassigned papers on mount/refresh or filter change
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignments([]);
          setAvailablePapers([]);
          setLoadingAssignments(false);
          return;
        }
        // Build query params for filters
        const queryParams = new URLSearchParams();
        if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) queryParams.append('toDate', filters.toDate);
        if (filters.paperTracks) {
          queryParams.append('paperTracks', filters.paperTracks);
        }
        if (filters.reviewerTracks) {
          queryParams.append('reviewerTracks', filters.reviewerTracks);
        }
        if (filters.paperId) {
          queryParams.append('paperId', filters.paperId);
        }
        const queryString = queryParams.toString();

        // Fetch assignments
        const assignmentsUrl = queryString ? `${GET_ASSIGNMENTS_URL}?${queryString}` : GET_ASSIGNMENTS_URL;
        const response = await fetch(assignmentsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setAssignments(data);
        } else {
          setAssignments([]);
        }
        // Fetch available papers
        const availableQueryParams = new URLSearchParams();
        if (filters.fromDate) availableQueryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) availableQueryParams.append('toDate', filters.toDate);
        if (paperTrackFilters) {
          availableQueryParams.append('paperTracks', paperTrackFilters);
        }
        if (reviewerTrackFilters) {
          availableQueryParams.append('reviewerTracks', reviewerTrackFilters);
        }
        if (filters.paperId) {
          availableQueryParams.append('paperId', filters.paperId);
        }
        const availableQueryString = availableQueryParams.toString();
        const availableUrl = availableQueryString ? `${apiUrl("/admin/papers-available-for-assignment")}?${availableQueryString}` : apiUrl("/admin/papers-available-for-assignment");
        const availableRes = await fetch(availableUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const availableData = await availableRes.json();
        if (availableRes.ok && Array.isArray(availableData)) {
          setAvailablePapers(availableData);
        } else {
          setAvailablePapers([]);
        }
      } catch (err) {
        setAssignments([]);
        setAvailablePapers([]);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
    setCurrentPageAssignments(1);
    setCurrentPageAvailable(1);
  }, [onAssignmentComplete, filters, paperTrackFilters, reviewerTrackFilters]);



  // Assign reviewers to a paper (updated for two reviewers)
  const handleAssignNew = async (paperId) => {
    const reviewerId1 = selectedReviewers1[paperId];
    const reviewerId2 = selectedReviewers2[paperId];
    if (!reviewerId1 && !reviewerId2) {
      alert("Please select at least one reviewer for the paper.");
      return;
    }
    if (reviewerId1 && reviewerId2 && reviewerId1 === reviewerId2) {
      alert("Please select different reviewers for each slot.");
      return;
    }
    setAssigningNew(true);
    try {
      const token = localStorage.getItem('token');
      const assignments = [];
      if (reviewerId1) assignments.push({ paperId, reviewerId: reviewerId1 });
      if (reviewerId2) assignments.push({ paperId, reviewerId: reviewerId2 });

      for (const assignment of assignments) {
        const response = await fetch(ASSIGN_REVIEWER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignment)
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.error || 'Failed to assign reviewer');
          return;
        }
      }
      alert('Reviewers assigned successfully!');
      setSelectedReviewers1(prev => ({ ...prev, [paperId]: "" }));
      setSelectedReviewers2(prev => ({ ...prev, [paperId]: "" }));
      if (onAssignmentComplete) onAssignmentComplete();
    } catch (err) {
      alert('Error assigning reviewers');
    } finally {
      setAssigningNew(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (paperId, reviewerId) => {
    if (!window.confirm('Are you sure you want to unassign this reviewer from the paper?')) return;
    setDeletingAssignment({ paperId, reviewerId });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(DELETE_ASSIGNMENT_URL(paperId, reviewerId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Assignment deleted successfully!');
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to delete assignment');
      }
    } catch (err) {
      alert('Error deleting assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };

  // Assign second reviewer for papers with 1 reviewer
  const handleAssignSecond = async (paperId) => {
    const reviewerId = selectedSecondReviewers[paperId];
    if (!reviewerId) {
      alert("Please select a second reviewer.");
      return;
    }
    setAssigningSecond(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(ASSIGN_REVIEWER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paperId, reviewerId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Second reviewer assigned successfully!');
        setSelectedSecondReviewers(prev => ({ ...prev, [paperId]: "" }));
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to assign second reviewer');
      }
    } catch (err) {
      alert('Error assigning second reviewer');
    } finally {
      setAssigningSecond(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">All Reviewer Assignments</h2>
        <p className="text-gray-600">View, update, or delete reviewer assignments for papers. Assign a reviewer to a submitted paper below.</p>
        <div className="mt-4">
          <button
            onClick={() => setShowAssignedPapers(!showAssignedPapers)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAssignedPapers ? 'Show Unassigned Papers' : 'Show Assigned Papers'}
          </button>
        </div>
        <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-md p-3">
          <p className="text-yellow-800 font-medium">Note: Yellow rows represent papers assigned with 1 reviewer.</p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Submission Date, Tracks, and ID</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper ID</label>
            <input
              type="text"
              name="paperId"
              value={filters.paperId}
              onChange={handleFilterChange}
              placeholder="Enter Paper ID"
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Tracks</label>
            <select
              name="paperTracks"
              value={filters.paperTracks}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Tracks</option>
              {TRACKS.map(track => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Tracks</label>
            <select
              name="reviewerTracks"
              value={filters.reviewerTracks}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Tracks</option>
              {TRACKS.map(track => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Existing Assignments Table */}
      {showAssignedPapers && (
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          {loadingAssignments ? (
            <p>Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500">No assignments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <tr>
                    <th className="px-4 py-2">Paper ID</th>
                    <th className="px-4 py-2">Paper Title</th>
                    <th className="px-4 py-2">Reviewers</th>
                    <th className="px-4 py-2">Track</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.slice((currentPageAssignments - 1) * pageSize, currentPageAssignments * pageSize).map((a) => (
                    <tr key={a.paperId} className={a.reviewerIds.length === 1 ? 'bg-yellow-100' : ''}>
                      <td className="px-4 py-2">{a.paperId}</td>
                      <td className="px-4 py-2">{a.paperTitle}</td>
                      <td className="px-4 py-2">{a.reviewerNames.join(', ')}</td>
                      <td className="px-4 py-2">{a.track}</td>
                      <td className="px-4 py-2">
                        {a.reviewerIds.map((revId, index) => {
                          const reviewerName = a.reviewerNames[index];
                          const isDeleting = deletingAssignment && deletingAssignment.paperId === a.paperId && deletingAssignment.reviewerId === revId;
                          return (
                            <div key={revId} className="mb-2">
                              <span className="mr-2">{reviewerName} </span>
                              <button
                                className="px-3 py-1 bg-red-600 text-white rounded"
                                onClick={() => handleDeleteAssignment(a.paperId, revId)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          );
                        })}
                        {a.reviewerIds.length === 1 && (
                          <div className="mt-2">
                            <select
                              value={selectedSecondReviewers[a.paperId] || ''}
                              onChange={e => setSelectedSecondReviewers({...selectedSecondReviewers, [a.paperId]: e.target.value})}
                              className="border border-gray-300 rounded-md px-2 py-1 mr-2"
                            >
                              <option value="">Select Second Reviewer</option>
                              {reviewers.map(rev => (
                                <option key={rev.id} value={rev.id} disabled={a.reviewerNames.includes(rev.name)}>{rev.name} ({rev.track}) - {rev.reviewerType === 'external' ? 'External' : 'Internal'}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignSecond(a.paperId)}
                              disabled={!selectedSecondReviewers[a.paperId] || assigningSecond}
                              className={`px-3 py-1 rounded text-white ${!selectedSecondReviewers[a.paperId] || assigningSecond ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {assigningSecond ? 'Assigning...' : 'Assign 2nd'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination for Assignments */}
              <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(assignments.length / pageSize) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPageAssignments(page)}
                    className={`px-3 py-1 mx-1 rounded ${currentPageAssignments === page ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign Reviewer to Unassigned Paper */}
      {!showAssignedPapers && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Assign Reviewer to Paper</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Papers by Track</label>
            <select
              value={paperTrackFilters}
              onChange={handlePaperTrackFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Tracks</option>
              {TRACKS.map(track => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Reviewers by Track</label>
            <select
              value={reviewerTrackFilters}
              onChange={handleReviewerTrackFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Tracks</option>
              {TRACKS.map(track => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </div>
          {loadingAssignments ? (
            <div className="text-center py-6 text-gray-500">
              Loading unassigned papers...
            </div>
          ) : (
            <>
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Paper ID</th>
                    <th className="border border-gray-300 px-4 py-2">Paper Title</th>
                    <th className="border border-gray-300 px-4 py-2">Track</th>
                    <th className="border border-gray-300 px-4 py-2">Select Reviewer 1 (Internal)</th>
                    <th className="border border-gray-300 px-4 py-2">Select Reviewer 2 (External)</th>
                    <th className="border border-gray-300 px-4 py-2">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredPapers = availablePapers.filter(paper => !paperTrackFilters || paper.track === paperTrackFilters).filter(paper => paper.assignedReviewers < 2);
                    return filteredPapers.slice((currentPageAvailable - 1) * pageSize, currentPageAvailable * pageSize).map(paper => {
                      const trackFiltered = reviewers.filter(rev => !reviewerTrackFilters || rev.track === reviewerTrackFilters);
                      const internalReviewers = trackFiltered.filter(rev => (rev.reviewerType || 'internal') === 'internal');
                      const externalReviewers = trackFiltered.filter(rev => rev.reviewerType === 'external');

                      const reviewer1Options = internalReviewers.length > 0 ? internalReviewers : trackFiltered;
                      const reviewer2Options = externalReviewers.length > 0 ? externalReviewers : trackFiltered;

                      return (
                        <tr key={paper.id}>
                          <td className="border border-gray-300 px-4 py-2">{paper.id}</td>
                          <td className="border border-gray-300 px-4 py-2">{paper.paperTitle}</td>
                          <td className="border border-gray-300 px-4 py-2">{paper.track}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <select
                              value={selectedReviewers1[paper.id] || ''}
                              onChange={e => setSelectedReviewers1({...selectedReviewers1, [paper.id]: e.target.value})}
                              disabled={paper.currentReviewers.length !== 0}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            >
                              <option value="">Select Reviewer 1 (Internal)</option>
                              {reviewer1Options.map(rev => (
                                <option key={rev.id} value={rev.id} disabled={paper.currentReviewers.includes(rev.name)}>
                                  {rev.name} ({rev.track || 'No Track'}) - Internal
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <select
                              value={selectedReviewers2[paper.id] || ''}
                              onChange={e => setSelectedReviewers2({...selectedReviewers2, [paper.id]: e.target.value})}
                              disabled={paper.currentReviewers.length !== 1 && !selectedReviewers1[paper.id]}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            >
                              <option value="">Select Reviewer 2 (External)</option>
                              {reviewer2Options.map(rev => (
                                <option key={rev.id} value={rev.id} disabled={paper.currentReviewers.includes(rev.name) || rev.id === selectedReviewers1[paper.id]}>
                                  {rev.name} ({rev.track || 'No Track'}) - External
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={() => handleAssignNew(paper.id)}
                              disabled={(!selectedReviewers1[paper.id] && !selectedReviewers2[paper.id]) || assigningNew}
                              className={`px-4 py-2 rounded-md text-white ${(!selectedReviewers1[paper.id] && !selectedReviewers2[paper.id]) || assigningNew ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {assigningNew ? 'Assigning...' : 'Assign'}
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              {/* Pagination for Available Papers */}
              <div className="flex justify-center mt-4">
                {(() => {
                  const filteredPapers = availablePapers.filter(paper => !paperTrackFilters || paper.track === paperTrackFilters).filter(paper => paper.assignedReviewers === 0);
                  const totalPages = Math.ceil(filteredPapers.length / pageSize);
                  return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPageAvailable(page)}
                      className={`px-3 py-1 mx-1 rounded ${currentPageAvailable === page ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>
              {availablePapers.filter(paper => !paperTrackFilters || paper.track === paperTrackFilters).filter(paper => paper.assignedReviewers === 0).length === 0 && (
                <p className="text-gray-500 mt-4">No papers available for assignment matching the filters.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignReviewer;
