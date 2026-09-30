import React, { useState, useEffect } from "react";
import { apiUrl } from "./config";

const CREATE_REVIEWER_URL = apiUrl("/admin/create-reviewer");
const GET_REVIEWERS_URL = apiUrl("/admin/reviewers-with-assignments");

function CreateReviewer({ setReviewers }) {
  const [reviewerForm, setReviewerForm] = useState({ name: '', email: '', track: '', password: '12345678' });
  const [creatingReviewer, setCreatingReviewer] = useState(false);
  const [reviewersList, setReviewersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');

  // Fetch reviewers when component mounts
  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(GET_REVIEWERS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setReviewersList(data);
        if (setReviewers) {
          setReviewers(data);
        }
      } else {
        setReviewersList([]);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      setReviewersList([]);
    } finally {
      setLoading(false);
    }
  };

  const showToaster = (message) => {
    setToasterMessage(message);
    setTimeout(() => setToasterMessage(''), 5000);
  };

  const handleCreateReviewer = async (e) => {
    e.preventDefault();
    setCreatingReviewer(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(CREATE_REVIEWER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewerForm)
      });

      const data = await response.json();

      if (response.ok) {
        showToaster(data.emailLog || 'Reviewer created successfully! Credentials have been sent to their email.');
        setReviewerForm({ name: '', email: '', track: '' });
        // Refresh the reviewers list
        await fetchReviewers();
      } else {
        showToaster(data.error || 'Failed to create reviewer');
      }
    } catch (error) {
      console.error('Error creating reviewer:', error);
      showToaster('Error creating reviewer');
    } finally {
      setCreatingReviewer(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Create Reviewer</h2>
        <p className="text-gray-600">Add a new reviewer to the system</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <h3 className="text-lg font-semibold   text-blue-700 mb-4">Create Reviewer</h3>
        <form onSubmit={handleCreateReviewer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="reviewerName"
                value={reviewerForm.name}
                onChange={(e) => setReviewerForm({ ...reviewerForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <select
                id="reviewerEmail"
                value={reviewerForm.email}
                onChange={(e) => {
                  const selectedReviewer = reviewersList.find(r => r.email === e.target.value);
                  setReviewerForm({
                    ...reviewerForm,
                    email: e.target.value,
                    name: selectedReviewer ? selectedReviewer.name : '',
                    track: selectedReviewer ? selectedReviewer.track : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Email</option>
                {reviewersList.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.email}>
                    {reviewer.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reviewerTrack" className="block text-sm font-medium text-gray-700 mb-1">
                Track
              </label>
              <select
                id="reviewerTrack"
                value={reviewerForm.track}
                onChange={(e) => setReviewerForm({ ...reviewerForm, track: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Track</option>
                <option value="Deep Technology & Emerging Innovations">Deep Technology & Emerging Innovations</option>
                <option value="Sustainable Energy & Power Systems">Sustainable Energy & Power Systems</option>
                <option value="Environment, Climate-Tech & Sustainable Infrastructure">Environment, Climate-Tech & Sustainable Infrastructure</option>
                <option value="Advanced Computing & Cyber-Physical Systems">Advanced Computing & Cyber-Physical Systems</option>
                <option value="Sustainable Transportation & E-Mobility">Sustainable Transportation & E-Mobility</option>
                <option value="Nextgen communication, VLSI & Embedded Systems">Nextgen communication, VLSI & Embedded Systems</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creatingReviewer}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {creatingReviewer ? 'Creating...' : 'Create Reviewer'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviewers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-700">All Reviewers</h3>
          <button
            onClick={fetchReviewers}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {reviewersList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {loading ? 'Loading reviewers...' : 'No reviewers found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Papers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {reviewersList.map((reviewer, index) => (
                  <tr
                    key={reviewer.id}
                    className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {reviewer.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reviewer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reviewer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {reviewer.track || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {reviewer.assignedPapers || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toasterMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50">
          {toasterMessage}
        </div>
      )}
    </div>
  );
}

export default CreateReviewer;
