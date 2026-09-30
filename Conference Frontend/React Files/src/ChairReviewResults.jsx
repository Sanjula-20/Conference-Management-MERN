import React, { useEffect, useState } from 'react';
import { apiUrl } from "./config";

const CHAIR_RESULTS_URL = apiUrl("/admin/chair-results");
const TRACK_GROUPS = [
  {
    id: 'track1',
    label: 'Track 1',
    track: 'Advanced Computing & Cyber-Physical Systems',
    session: '26.03.2026 (AN) - 2:00 PM',
    venue: 'CSE Seminar Hall',
    paperIds: ['21', '119', '315', '318', '346', '357', '361', '408', '422']
  },
  {
    id: 'track2a',
    label: 'Track 2A',
    track: 'Emerging & Frontier Technologies',
    session: '26.03.2026 (AN) - 2:00 PM',
    venue: 'EEE Seminar Hall',
    paperIds: ['27', '40', '108', '124', '216', '224', '235', '245', '253', '331', '414','460','407','429']
  },
  {
    id: 'track2b',
    label: 'Track 2B',
    track: 'Emerging & Frontier Technologies',
    session: '27.03.2026 (FN) - 10:00 AM',
    venue: 'UG3-IT Lab',
    paperIds: ['257', '272', '275', '290', '298', '300', '308', '325', '352', '362', '388',  '409', '419']
  },
  {
    id: 'track3',
    label: 'Track 3',
    track: 'Sustainable Transportation & E-Mobility',
    session: '26.03.2026 (AN) - 3:00 PM',
    venue: 'Mechanical Seminar Hall',
    paperIds:['107', '310', '328', '344', '350', '370', '420',  '432', '444','445']
  },
  {
    id: 'track4',
    label: 'Track 4',
    track: 'Nextgen Communication, VLSI & Embedded Systems',
    session: '26.03.2026 (AN) - 3:00 PM',
    venue: 'E-Yantra Lab',
    paperIds: ['85', '127', '150', '267', '319', '360', '401', '406', '415', '441']
  },
  {
    id: 'track5',
    label: 'Track 5',
    track: 'Environment, Climate-Tech & Sustainable Infrastructure',
    session: '27.03.2026 (FN) - 10:00 AM',
    venue: 'SH Seminar Hall',
    paperIds:['148', '217', '314', '330', '356', '416', '424', '450','382']
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

function formatRecommendation(value) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeCSVField(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function ChairReviewResults({ refreshTrigger }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(CHAIR_RESULTS_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Fetch chair review results error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [refreshTrigger]);

  const getResultsByTrackGroup = (group) => {
    return results.filter((paper) => group.paperIds.includes(String(paper.paperId)));
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Track No',
      'Track Name',
      'Session',
      'Venue',
      'Paper ID',
      'Paper Title',
      'Authors',
      'Paper Track',
      'Reviews Submitted',
      'Average Total Score',
      'Avg Technical',
      'Avg Impact',
      'Avg Research',
      'Avg Presentation',
      'Avg Queries',
      'Strongly Recommended',
      'Recommended',
      'Not Recommended',
      'Chairperson Name',
      'Chairperson Email',
      'Review Total Score',
      'Review Recommendation',
      'Reviewed At'
    ];

    const rows = [];

    TRACK_GROUPS.forEach((group) => {
      const trackResults = getResultsByTrackGroup(group);
      trackResults.forEach((paper) => {
        const reviews = Array.isArray(paper.reviews) ? paper.reviews : [];
        const reviewNames = reviews.map((review) => review?.chairpersonName || '').filter(Boolean).join(' | ');
        const reviewEmails = reviews.map((review) => review?.chairpersonEmail || '').filter(Boolean).join(' | ');
        const reviewTotals = reviews
          .map((review) => (review?.totalScore === 0 || review?.totalScore ? String(review.totalScore) : ''))
          .filter(Boolean)
          .join(' | ');
        const reviewRecommendations = reviews
          .map((review) => (review?.recommendation ? formatRecommendation(review.recommendation) : ''))
          .filter(Boolean)
          .join(' | ');
        const reviewTimes = reviews
          .map((review) => (review?.reviewedAt ? new Date(review.reviewedAt).toLocaleString() : ''))
          .filter(Boolean)
          .join(' | ');

        rows.push([
          group.label,
          group.track,
          group.session,
          group.venue,
          paper.paperId,
          paper.paperTitle,
          formatAuthors(paper.authors),
          paper.tracks || 'N/A',
          paper.totalReviews ?? 0,
          paper.avgTotalScore ?? '',
          paper.avgTechnicalDepthScore ?? '',
          paper.avgPracticalImpactScore ?? '',
          paper.avgResearchQualityScore ?? '',
          paper.avgPresentationSkillsScore ?? '',
          paper.avgQueryResponseScore ?? '',
          paper.recommendations?.stronglyRecommended ?? 0,
          paper.recommendations?.recommended ?? 0,
          paper.recommendations?.notRecommended ?? 0,
          reviewNames,
          reviewEmails,
          reviewTotals,
          reviewRecommendations,
          reviewTimes
        ]);
      });
    });

    if (rows.length === 0) {
      return;
    }

    const csvContent = [
      headers.map(escapeCSVField).join(','),
      ...rows.map((row) => row.map(escapeCSVField).join(','))
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileDate = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `chairperson-review-results-${fileDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Chairperson Review Results</h2>
        <p className="text-gray-600">Aggregated scorecards grouped by assigned track sets</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        {!loading && results.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Download CSV
            </button>
          </div>
        )}
        {loading ? (
          <p className="text-gray-600">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-600">No review results available yet.</p>
        ) : (
          <div className="space-y-6">
            {TRACK_GROUPS.map((group) => {
              const trackResults = getResultsByTrackGroup(group);
              return (
                <div key={group.id} className="border border-blue-100 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">{group.label} - {group.track}</h3>
                    <p className="text-sm text-gray-600">{group.session} | {group.venue}</p>
                    <p className="text-sm text-gray-600">Configured Papers: {group.paperIds.join(', ')}</p>
                    <p className="text-sm text-gray-700 font-medium">Matched Results: {trackResults.length}</p>
                  </div>

                  {trackResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No papers found for this track group.</p>
                  ) : (
                    <div className="space-y-4">
                      {trackResults.map((paper) => (
                        <div key={paper.paperId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900">{paper.paperTitle}</h4>
                              <p className="text-sm text-gray-600">Paper ID: {paper.paperId}</p>
                              <p className="text-sm text-gray-600">Authors: {formatAuthors(paper.authors)}</p>
                              <p className="text-sm text-gray-600">Track: {paper.tracks || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Reviews Submitted</p>
                              <p className="text-2xl font-bold text-blue-700">{paper.totalReviews}</p>
                              <p className="text-sm text-gray-600">Average Score: <strong>{paper.avgTotalScore ?? 'N/A'}/50</strong></p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 text-sm">
                            <div className="bg-gray-50 p-2 rounded">Technical: <strong>{paper.avgTechnicalDepthScore ?? 'N/A'}</strong></div>
                            <div className="bg-gray-50 p-2 rounded">Impact: <strong>{paper.avgPracticalImpactScore ?? 'N/A'}</strong></div>
                            <div className="bg-gray-50 p-2 rounded">Research: <strong>{paper.avgResearchQualityScore ?? 'N/A'}</strong></div>
                            <div className="bg-gray-50 p-2 rounded">Presentation: <strong>{paper.avgPresentationSkillsScore ?? 'N/A'}</strong></div>
                            <div className="bg-gray-50 p-2 rounded">Queries: <strong>{paper.avgQueryResponseScore ?? 'N/A'}</strong></div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm mb-4">
                            <span className="px-3 py-1 rounded bg-green-100 text-green-800">Strongly Recommended: {paper.recommendations.stronglyRecommended}</span>
                            <span className="px-3 py-1 rounded bg-blue-100 text-blue-800">Recommended: {paper.recommendations.recommended}</span>
                            <span className="px-3 py-1 rounded bg-red-100 text-red-800">Not Recommended: {paper.recommendations.notRecommended}</span>
                          </div>

                          {paper.reviews.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-2">Chairperson</th>
                                    <th className="text-left p-2">Email</th>
                                    <th className="text-left p-2">Total</th>
                                    <th className="text-left p-2">Recommendation</th>
                                    <th className="text-left p-2">Reviewed At</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paper.reviews.map((review) => (
                                    <tr key={`${paper.paperId}-${review.chairpersonId}`} className="border-b">
                                      <td className="p-2">{review.chairpersonName}</td>
                                      <td className="p-2">{review.chairpersonEmail}</td>
                                      <td className="p-2 font-semibold">{review.totalScore}/50</td>
                                      <td className="p-2">{formatRecommendation(review.recommendation)}</td>
                                      <td className="p-2">{new Date(review.reviewedAt).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
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

export default ChairReviewResults;
