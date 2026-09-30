import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header';
import { apiUrl } from "./config";

const ASSIGNED_PAPERS_URL = apiUrl("/admin/chairperson/assigned-papers");
const SUBMIT_REVIEW_URL = apiUrl("/admin/chairperson/submit-review");

const rubricRows = [
  {
    key: 'technicalDepthScore',
    label: 'Technical Depth & Innovation',
    excellent: 'Demonstrates advanced technical depth with cutting-edge methods and strong innovation.',
    veryGood: 'Good technical depth with clear improvements over existing methods.',
    good: 'Moderate technical explanation; limited innovation.',
    average: 'Superficial technical explanation; lacks strong innovation.',
    poor: 'No technical depth; concept unclear or incorrect.'
  },
  {
    key: 'practicalImpactScore',
    label: 'Practical Impact & Sustainability Relevance',
    excellent: 'Strong real-world applicability with clear contribution to sustainable engineering or societal benefit.',
    veryGood: 'Good practical relevance with identifiable applications.',
    good: 'Some application potential but not clearly demonstrated.',
    average: 'Limited practical relevance or unclear impact.',
    poor: 'No identifiable practical or sustainability relevance.'
  },
  {
    key: 'researchQualityScore',
    label: 'Research Quality',
    excellent: 'Rigorous methodology; comprehensive data analysis and clear validation.',
    veryGood: 'Sound methodology; well-supported results and logical flow.',
    good: 'Standard approach; results validated but lack depth.',
    average: 'Methodology weak or unclear; limited data validation.',
    poor: 'Unscientific approach; no clear methodology or validation.'
  },
  {
    key: 'presentationSkillsScore',
    label: 'Presentation Skills',
    excellent: 'Exceptional delivery; perfect pacing, professional slides, high engagement.',
    veryGood: 'Very clear and organized; slides high quality and easy to follow.',
    good: 'Clear communication; slides functional but standard.',
    average: 'Monotone or disorganized; slides cluttered or hard to read.',
    poor: 'Poor communication; unable to convey ideas; slides unprofessional.'
  },
  {
    key: 'queryResponseScore',
    label: 'Ability to Respond to Queries',
    excellent: 'Handles all questions with precision, depth, and extreme confidence.',
    veryGood: 'Responds accurately and confidently to most technical questions.',
    good: 'Answers basic questions well; may struggle with complex ones.',
    average: 'Hesitant responses; provides vague or surface-level answers.',
    poor: 'Unable to answer basic questions related to the work.'
  }
];

function formatAuthors(authors) {
  if (!authors) return 'N/A';
  if (typeof authors === 'string') return authors;
  if (Array.isArray(authors)) {
    return authors.map((author) => author.name || author.email || '').filter(Boolean).join(', ');
  }
  return 'N/A';
}

function prettyRecommendation(value) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function ChairpersonDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaperId, setExpandedPaperId] = useState(null);
  const [submittingPaperId, setSubmittingPaperId] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'chairperson') {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loadAssignedPapers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(ASSIGNED_PAPERS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (res.ok && Array.isArray(data)) {
        setPapers(data);
      } else {
        if (!res.ok) {
          const fallbackMessage = raw?.startsWith('<') ? `Request failed (${res.status})` : raw;
          console.error('Fetch chairperson papers error:', data?.error || fallbackMessage || 'Unknown error');
        }
        setPapers([]);
      }
    } catch (error) {
      console.error('Fetch chairperson papers error:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'chairperson') {
      loadAssignedPapers();
    }
  }, [user]);

  const togglePaper = (paper) => {
    if (expandedPaperId === paper.id) {
      setExpandedPaperId(null);
      return;
    }

    setExpandedPaperId(paper.id);
    setScores((prev) => ({
      ...prev,
      [paper.id]: {
        technicalDepthScore: paper.review?.technicalDepthScore ?? '',
        practicalImpactScore: paper.review?.practicalImpactScore ?? '',
        researchQualityScore: paper.review?.researchQualityScore ?? '',
        presentationSkillsScore: paper.review?.presentationSkillsScore ?? '',
        queryResponseScore: paper.review?.queryResponseScore ?? '',
        recommendation: paper.review?.recommendation ?? 'recommended'
      }
    }));
  };

  const updateScore = (paperId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [paperId]: {
        ...(prev[paperId] || {}),
        [field]: value
      }
    }));
  };

  const calculateTotal = (paperId) => {
    const form = scores[paperId] || {};
    return rubricRows.reduce((sum, row) => sum + Number(form[row.key] || 0), 0);
  };

  const validatePaperScores = (paperId) => {
    const form = scores[paperId] || {};
    for (const row of rubricRows) {
      const value = Number(form[row.key]);
      if (Number.isNaN(value) || value < 0 || value > 10) {
        return `${row.label} score must be between 0 and 10.`;
      }
    }
    if (!form.recommendation) {
      return 'Please select a recommendation.';
    }
    return null;
  };

  const handleSubmit = async (paperId) => {
    const validationError = validatePaperScores(paperId);
    if (validationError) {
      alert(validationError);
      return;
    }

    const form = scores[paperId];
    setSubmittingPaperId(paperId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(SUBMIT_REVIEW_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paperId,
          technicalDepthScore: Number(form.technicalDepthScore),
          practicalImpactScore: Number(form.practicalImpactScore),
          researchQualityScore: Number(form.researchQualityScore),
          presentationSkillsScore: Number(form.presentationSkillsScore),
          queryResponseScore: Number(form.queryResponseScore),
          recommendation: form.recommendation
        })
      });
      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!res.ok) {
        const fallbackMessage = raw?.startsWith('<') ? `Request failed (${res.status}). Server timeout or proxy error.` : raw;
        alert(data?.error || fallbackMessage || 'Failed to submit review.');
        return;
      }

      alert(`Review submitted successfully. Total Score: ${data?.totalScore ?? calculateTotal(paperId)}/50`);
      await loadAssignedPapers();
    } catch (error) {
      console.error('Submit chairperson review error:', error);
      alert('Error submitting review.');
    } finally {
      setSubmittingPaperId(null);
    }
  };

  const reviewedCount = useMemo(
    () => papers.filter((paper) => paper.review && paper.review.totalScore !== null).length,
    [papers]
  );

  if (!user || user.role !== 'chairperson') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-28 max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chairperson Dashboard</h1>
            <p className="text-gray-600">Evaluate assigned papers using the rubric</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <p className="text-gray-500">Assigned</p>
              <p className="text-xl font-bold text-blue-700">{papers.length}</p>
            </div>
            <div className="text-sm text-right">
              <p className="text-gray-500">Reviewed</p>
              <p className="text-xl font-bold text-green-700">{reviewedCount}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading assigned papers...</p>
        ) : papers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600">No papers assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => {
              const form = scores[paper.id] || {};
              const totalScore = calculateTotal(paper.id);
              return (
                <div key={paper.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Paper ID: {paper.id}</p>
                      <h2 className="text-xl font-semibold text-blue-800">{paper.paperTitle}</h2>
                      <p className="text-sm text-gray-700 mt-1">Authors: {formatAuthors(paper.authors)}</p>
                      <p className="text-sm text-gray-700">Track: {paper.tracks || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      {paper.review ? (
                        <>
                          <p className="text-sm text-gray-500">Submitted Score</p>
                          <p className="text-xl font-bold text-green-700">{paper.review.totalScore}/50</p>
                          <p className="text-xs text-gray-600">{prettyRecommendation(paper.review.recommendation)}</p>
                        </>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">Pending Review</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => togglePaper(paper)}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {expandedPaperId === paper.id ? 'Hide Rubric' : 'Open Rubric'}
                    </button>
                  </div>

                  {expandedPaperId === paper.id && (
                    <div className="mt-5">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border p-2 text-left">Criteria</th>
                              <th className="border p-2 text-left">Excellent (9-10)</th>
                              <th className="border p-2 text-left">Very Good (7-8)</th>
                              <th className="border p-2 text-left">Good (5-6)</th>
                              <th className="border p-2 text-left">Average (2-4)</th>
                              <th className="border p-2 text-left">Poor (0-1)</th>
                              <th className="border p-2 text-left">Score (0-10)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rubricRows.map((row) => (
                              <tr key={row.key}>
                                <td className="border p-2 font-medium">{row.label}</td>
                                <td className="border p-2">{row.excellent}</td>
                                <td className="border p-2">{row.veryGood}</td>
                                <td className="border p-2">{row.good}</td>
                                <td className="border p-2">{row.average}</td>
                                <td className="border p-2">{row.poor}</td>
                                <td className="border p-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={form[row.key] ?? ''}
                                    onChange={(e) => updateScore(paper.id, row.key, e.target.value)}
                                    className="w-24 border border-gray-300 rounded px-2 py-1"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">Total Score: {totalScore} / 50</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Best Paper Recommendation:</span>
                          <label className="text-sm">
                            <input
                              type="radio"
                              name={`recommendation-${paper.id}`}
                              checked={form.recommendation === 'strongly_recommended'}
                              onChange={() => updateScore(paper.id, 'recommendation', 'strongly_recommended')}
                            />{' '}
                            Strongly Recommended
                          </label>
                          <label className="text-sm">
                            <input
                              type="radio"
                              name={`recommendation-${paper.id}`}
                              checked={form.recommendation === 'recommended'}
                              onChange={() => updateScore(paper.id, 'recommendation', 'recommended')}
                            />{' '}
                            Recommended
                          </label>
                          <label className="text-sm">
                            <input
                              type="radio"
                              name={`recommendation-${paper.id}`}
                              checked={form.recommendation === 'not_recommended'}
                              onChange={() => updateScore(paper.id, 'recommendation', 'not_recommended')}
                            />{' '}
                            Not Recommended
                          </label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => handleSubmit(paper.id)}
                          disabled={submittingPaperId === paper.id}
                          className={`px-5 py-2 rounded text-white ${
                            submittingPaperId === paper.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {submittingPaperId === paper.id ? 'Submitting...' : 'Submit Evaluation'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChairpersonDashboard;
