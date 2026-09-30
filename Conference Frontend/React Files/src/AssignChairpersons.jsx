import React, { useEffect, useState } from 'react';
import { apiUrl } from "./config";

const CHAIR_ASSIGNMENTS_URL = apiUrl("/admin/chair-assignments");
const ASSIGN_CHAIRPERSON_URL = apiUrl("/admin/assign-chairperson");

const TRACK_GROUPS = [
  {
    id: 'track1',
    label: 'Track 1',
    track: 'Advanced Computing & Cyber-Physical Systems',
    session: '26.03.2026 (AN) - 2:00 PM',
    venue: 'CSE Seminar Hall',
    defaultChairpersonKeyword: 'k rajkumar',
    paperIds: ['21', '119', '315', '318', '346', '357', '361', '408', '422']
  },
  {
    id: 'track2a',
    label: 'Track 2A',
    track: 'Emerging & Frontier Technologies',
    session: '26.03.2026 (AN) - 2:00 PM',
    venue: 'EEE Seminar Hall',
    defaultChairpersonKeyword: 'm sivapalanirajan',
    paperIds: ['27', '40', '108', '124', '216', '224', '235', '245', '253', '331', '414','460','407','429']
  },
  {
    id: 'track2b',
    label: 'Track 2B',
    track: 'Emerging & Frontier Technologies',
    session: '27.03.2026 (FN) - 10:00 AM',
    venue: 'UG3-IT Lab',
    defaultChairpersonKeyword: 'n gowthami',
    paperIds: ['257', '272', '275', '290', '298', '300', '308', '325', '352', '362', '388',  '409', '419']
  },
  {
    id: 'track3',
    label: 'Track 3',
    track: 'Sustainable Transportation & E-Mobility',
    session: '26.03.2026 (AN) - 3:00 PM',
    venue: 'Mechanical Seminar Hall',
    defaultChairpersonKeyword: 'c veera ajay',
    paperIds: ['107', '310', '328', '344', '350', '370', '420',  '432', '444','445']
  },
  {
    id: 'track4',
    label: 'Track 4',
    track: 'Nextgen Communication, VLSI & Embedded Systems',
    session: '26.03.2026 (AN) - 3:00 PM',
    venue: 'E-Yantra Lab',
    defaultChairpersonKeyword: 'c kaleeshwari',
    paperIds: ['85', '127', '150', '267', '319', '360', '401', '406', '415', '441']
  },
  {
    id: 'track5',
    label: 'Track 5',
    track: 'Environment, Climate-Tech & Sustainable Infrastructure',
    session: '27.03.2026 (FN) - 10:00 AM',
    venue: 'SH Seminar Hall',
    defaultChairpersonKeyword: 'k latha',
    paperIds: ['148', '217', '314', '330', '356', '416', '424', '450','382']
  }
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getChairpersonTrackText(chairperson) {
  return normalizeText(chairperson?.tracks || chairperson?.track || '');
}

function isChairpersonForGroup(chairperson, group) {
  const chairTrack = getChairpersonTrackText(chairperson);
  if (!chairTrack) return false;

  const groupLabel = normalizeText(group.label);
  const groupTrack = normalizeText(group.track);

  return chairTrack.includes(groupLabel) || chairTrack.includes(groupTrack);
}

function AssignChairpersons({ chairpersons, refreshTrigger, onRefresh }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedByTrack, setSelectedByTrack] = useState({});
  const [assigningTrackId, setAssigningTrackId] = useState('');
  const [assigningAll, setAssigningAll] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(CHAIR_ASSIGNMENTS_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPapers(data);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error('Fetch chair assignments error:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [refreshTrigger]);

  useEffect(() => {
    setSelectedByTrack((prev) => {
      const next = { ...prev };
      TRACK_GROUPS.forEach((group) => {
        if (next[group.id]) return;
        const match = chairpersons.find((person) => {
          if (!isChairpersonForGroup(person, group)) return false;
          return normalizeText(person.name).includes(group.defaultChairpersonKeyword);
        });
        if (match) {
          next[group.id] = String(match.id);
        }
      });
      return next;
    });
  }, [chairpersons]);

  const assignForGroup = async (group) => {
    const chairpersonId = selectedByTrack[group.id];
    if (!chairpersonId) {
      return { message: `${group.label}: chairperson not selected.` };
    }

    const selectedChairperson = chairpersons.find((person) => String(person.id) === String(chairpersonId));
    if (!selectedChairperson) {
      return { message: `${group.label}: selected chairperson not found.` };
    }
    if (!isChairpersonForGroup(selectedChairperson, group)) {
      return { message: `${group.label}: selected chairperson does not belong to this track.` };
    }

    const matchingPapers = papers.filter((paper) => group.paperIds.includes(String(paper.paperId)));
    const notFoundCount = Math.max(group.paperIds.length - matchingPapers.length, 0);

    const pendingPapers = matchingPapers.filter((paper) => {
      const names = Array.isArray(paper.chairpersonNames) ? paper.chairpersonNames : [];
      return !names.some((name) => normalizeText(name) === normalizeText(selectedChairperson.name));
    });

    if (pendingPapers.length === 0) {
      return {
        message: `${group.label}: all matching papers already assigned.${notFoundCount ? ` ${notFoundCount} paper IDs not found in API.` : ''}`
      };
    }

    let success = 0;
    let failed = 0;

    try {
      const token = localStorage.getItem('token');
      for (const paper of pendingPapers) {
        const res = await fetch(ASSIGN_CHAIRPERSON_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paperId: paper.paperId, chairpersonId })
        });

        if (res.ok) {
          success += 1;
        } else {
          failed += 1;
        }
      }

      return {
        message: `${group.label}: ${success} assigned, ${failed} failed.${notFoundCount ? ` ${notFoundCount} paper IDs not found in API.` : ''}`
      };
    } catch (error) {
      console.error('Assign chairperson error:', error);
      return {
        message: `${group.label}: request failed.${notFoundCount ? ` ${notFoundCount} paper IDs not found in API.` : ''}`
      };
    }
  };

  const handleAssignTrack = async (group) => {
    setAssigningTrackId(group.id);
    try {
      const result = await assignForGroup(group);
      alert(result.message);
      if (onRefresh) {
        onRefresh();
      }
      await loadAssignments();
    } finally {
      setAssigningTrackId('');
    }
  };

  const handleAssignAllTracks = async () => {
    setAssigningAll(true);
    try {
      const results = [];
      for (const group of TRACK_GROUPS) {
        const result = await assignForGroup(group);
        results.push(result.message);
      }
      alert(results.join('\n'));
      if (onRefresh) {
        onRefresh();
      }
      await loadAssignments();
    } finally {
      setAssigningAll(false);
    }
  };

  const getPapersByTrackGroup = (group) => papers.filter((paper) => group.paperIds.includes(String(paper.paperId)));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Assign Chairpersons by Track</h2>
        <p className="text-gray-600">Bulk assignment is done for all papers in each track group</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="mb-4">
          <button
            onClick={handleAssignAllTracks}
            disabled={assigningAll}
            className={`px-4 py-2 rounded text-white ${assigningAll ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {assigningAll ? 'Assigning All...' : 'Assign All Tracks'}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading papers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Track No</th>
                  <th className="text-left p-2">Session</th>
                  <th className="text-left p-2">Venue</th>
                  <th className="text-left p-2">Paper IDs</th>
                  <th className="text-left p-2">Track Name</th>
                  <th className="text-left p-2">Assigned Chairpersons</th>
                  <th className="text-left p-2">Assign Chairperson</th>
                </tr>
              </thead>
              <tbody>
                {TRACK_GROUPS.map((group) => {
                  const groupPapers = getPapersByTrackGroup(group);
                  const assignedNames = Array.from(
                    new Set(groupPapers.flatMap((paper) => (Array.isArray(paper.chairpersonNames) ? paper.chairpersonNames : [])))
                  );
                  const filteredChairpersons = chairpersons.filter((chairperson) => isChairpersonForGroup(chairperson, group));
                  const isSelectedValid = filteredChairpersons.some((chairperson) => String(chairperson.id) === String(selectedByTrack[group.id]));

                  return (
                    <tr key={group.id} className="border-b align-top">
                      <td className="p-2 font-semibold">{group.label}</td>
                      <td className="p-2">{group.session}</td>
                      <td className="p-2">{group.venue}</td>
                      <td className="p-2 text-sm">{group.paperIds.join(', ')}</td>
                      <td className="p-2">{group.track}</td>
                      <td className="p-2">
                        {assignedNames.length > 0 ? (
                          <div>
                            <div>{assignedNames.join(', ')}</div>
                            <div className="text-xs text-gray-600 mt-1">Matched papers in API: {groupPapers.length}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <select
                            value={selectedByTrack[group.id] || ''}
                            onChange={(e) => setSelectedByTrack((prev) => ({ ...prev, [group.id]: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">{filteredChairpersons.length === 0 ? 'No chairperson for this track' : 'Select chairperson'}</option>
                            {filteredChairpersons.map((chairperson) => (
                              <option key={chairperson.id} value={chairperson.id}>
                                {chairperson.name}
                                {chairperson.tracks || chairperson.track ? ` (${chairperson.tracks || chairperson.track})` : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignTrack(group)}
                            disabled={!selectedByTrack[group.id] || !isSelectedValid || assigningTrackId === group.id}
                            className={`px-3 py-1 rounded text-white ${
                              !selectedByTrack[group.id] || !isSelectedValid || assigningTrackId === group.id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {assigningTrackId === group.id ? 'Assigning...' : 'Assign Track'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignChairpersons;
