import React, { useState } from 'react';
import { apiUrl } from "./config";

const CREATE_CHAIRPERSON_URL = apiUrl("/admin/create-chairperson");
const TRACK_OPTIONS = [
  'Track 1 - Advanced Computing & Cyber-Physical Systems',
  'Track 2A - Emerging & Frontier Technologies',
  'Track 2B - Emerging & Frontier Technologies',
  'Track 3 - Sustainable Transportation & E-Mobility',
  'Track 4 - Nextgen Communication, VLSI & Embedded Systems',
  'Track 5 - Environment, Climate-Tech & Sustainable Infrastructure'
];

function ManageChairpersons({ chairpersons, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    designation: '',
    department: '',
    institution: '',
    mobileNumber: '',
    tracks: ''
  });
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.designation || !form.department || !form.institution || !form.mobileNumber || !form.tracks) {
      alert('Please fill all fields.');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(CREATE_CHAIRPERSON_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          track: form.tracks
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create chairperson credentials.');
        return;
      }

      alert(`Chairperson created successfully. Default password: ${data.defaultPassword}`);
      setForm({
        name: '',
        email: '',
        designation: '',
        department: '',
        institution: '',
        mobileNumber: '',
        tracks: ''
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Create chairperson error:', error);
      alert('Error creating chairperson credentials.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Manage Chairpersons</h2>
        <p className="text-gray-600">Create login credentials for paper evaluation chairpersons</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Create Chairperson Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email ID"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="designation"
            value={form.designation}
            onChange={handleChange}
            placeholder="Designation"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="institution"
            value={form.institution}
            onChange={handleChange}
            placeholder="Institution"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            name="tracks"
            value={form.tracks}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Track</option>
            {TRACK_OPTIONS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-sm text-gray-600">Default password will be set to <strong>ICODSES@2026</strong>.</p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className={`mt-4 px-6 py-2 rounded-md text-white ${creating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {creating ? 'Creating...' : 'Create Credentials'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Existing Chairpersons</h3>
        {chairpersons.length === 0 ? (
          <p className="text-gray-600">No chairpersons found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Designation</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">Institution</th>
                  <th className="text-left p-2">Mobile</th>
                  <th className="text-left p-2">Tracks</th>
                  <th className="text-left p-2">Assigned Papers</th>
                </tr>
              </thead>
              <tbody>
                {chairpersons.map((chairperson) => (
                  <tr key={chairperson.id} className="border-b">
                    <td className="p-2">{chairperson.name}</td>
                    <td className="p-2">{chairperson.email}</td>
                    <td className="p-2">{chairperson.designation}</td>
                    <td className="p-2">{chairperson.department}</td>
                    <td className="p-2">{chairperson.institution}</td>
                    <td className="p-2">{chairperson.mobileNumber}</td>
                    <td className="p-2">{chairperson.tracks || chairperson.track || 'Not assigned'}</td>
                    <td className="p-2">{chairperson.assignedPapers || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageChairpersons;
