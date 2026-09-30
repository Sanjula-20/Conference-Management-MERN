import React from "react";

function Sidebar({ activeSection, setActiveSection, handleLogout }) {
  return (
    <div className="w-64 bg-blue-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
      <ul className="space-y-4">
        <li>
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-left px-4 py-2 rounded ${activeSection === 'dashboard' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >Dashboard</button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection('viewRegistrations')}
            className={`w-full text-left px-4 py-2 rounded ${activeSection === 'viewRegistrations' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >View Registrations</button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection('createReviewer')}
            className={`w-full text-left px-4 py-2 rounded ${activeSection === 'createReviewer' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >Create Reviewer</button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection('assignReviewer')}
            className={`w-full text-left px-4 py-2 rounded ${activeSection === 'assignReviewer' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >Assign Reviewer</button>
        </li>
        <li>
          <button
            onClick={() => setActiveSection('analytics')}
            className={`w-full text-left px-4 py-2 rounded ${activeSection === 'analytics' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >Registration Analytics</button>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded bg-red-500 hover:bg-red-600"
          >Logout</button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;