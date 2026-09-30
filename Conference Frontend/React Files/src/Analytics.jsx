import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function Analytics({ registrations, analyticsData, loading = false }) {
  const countries = analyticsData?.countries || [];
  const states = analyticsData?.states || [];
  const papersWithAbstracts = registrations.filter(reg => reg.abstractBlob).length;
  const recentSubmissions = registrations.filter(reg => {
    const regDate = new Date(reg.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return regDate > weekAgo;
  }).length;

  // Calculate decision-wise data
  const decisionData = [
    { decision: 'Accepted', count: registrations.filter(r => r.status === 'accepted').length },
    { decision: 'Rejected', count: registrations.filter(r => r.status === 'rejected').length },
    { decision: 'Minor Revision', count: registrations.filter(r => r.status === 'accepted_with_minor_revision').length },
    { decision: 'Major Revision', count: registrations.filter(r => r.status === 'accepted_with_major_revision').length },
    { decision: 'Under Review', count: registrations.filter(r => r.status === 'under_review').length },
    
  ].filter(item => item.count > 0);

  // Calculate monthly submission data
  const monthlyData = registrations.reduce((acc, reg) => {
    if (!reg.createdAt) return acc;
    const date = new Date(reg.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    const existing = acc.find(item => item.month === monthName);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month: monthName, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => {
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return aDate - bDate;
  });

  // Enhanced color palette with better contrast and modern colors
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${data.name}`}</p>
          <p className="text-blue-600">
            <span className="font-medium">Count: {data.value}</span>
          </p>
          <p className="text-gray-600 text-sm">
            {((data.value / data.payload.total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Enhanced label rendering function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.005) return null; // Hide labels for slices < 0.5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="10"
        fontWeight="600"
        className="drop-shadow-sm"
      >
        {percent >= 0.01 ? `${Math.min(99.9, percent * 100).toFixed(1)}%` : '<1%'}
      </text>
    );
  };

  // Calculate track-wise data
  const trackData = registrations.reduce((acc, reg) => {
    if (!reg.tracks) return acc;
    const tracks = reg.tracks.split(/[,;]/).map(track => track.trim()).filter(track => track);
    tracks.forEach(track => {
      const existing = acc.find(item => item.track === track);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ track, count: 1 });
      }
    });
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Process data to add totals for tooltip
  const processDataWithTotals = (data) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map(item => ({ ...item, total }));
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Registration Analytics</h2>
        <p className="text-gray-600">Insights into conference registrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-blue-600">{registrations.length}</p>
          <p className="text-sm text-gray-600 font-medium">Total Registrations</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-blue-600">{papersWithAbstracts}</p>
          <p className="text-sm text-gray-600 font-medium">Papers with Abstracts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-blue-600">{recentSubmissions}</p>
          <p className="text-sm text-gray-600 font-medium">Recent Submissions (Last 7 Days)</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Additional Insights</h3>
        <p className="text-gray-600">
          Average authors per paper: {registrations.length > 0 ? (registrations.reduce((acc, reg) => acc + (Array.isArray(reg.authors) ? reg.authors.length : 0), 0) / registrations.length).toFixed(2) : 0}
        </p>
      </div>

      {/* Decision-wise Bar Chart */}
      {decisionData.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-blue-700">Registrations by Decision Status</h3>
            <div className="text-sm text-gray-500">
              {decisionData.reduce((sum, item) => sum + item.count, 0)} total decisions
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={decisionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="decision" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Submission Bar Chart */}
      {monthlyData.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-blue-700">Monthly Submission Trends</h3>
            <div className="text-sm text-gray-500">
              {monthlyData.reduce((sum, item) => sum + item.count, 0)} total submissions
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Track-wise Bar Chart */}
      {trackData.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-blue-700">Papers by Research Track</h3>
            <div className="text-sm text-gray-500">
              {trackData.reduce((sum, item) => sum + item.count, 0)} total papers
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trackData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="track" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Enhanced Pie Charts - Side by Side */}
      {(countries.length > 0 || states.length > 0) && (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Countries Pie Chart */}
          {countries.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-700">Registrations by Country</h3>
                <div className="text-sm text-gray-500">
                  {countries.reduce((sum, country) => sum + country.count, 0)} total registrations
                </div>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={processDataWithTotals(countries)}
                    cx="50%"
                    cy="50%"
                    outerRadius={200}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="country"
                    labelLine={false}
                    label={renderCustomLabel}
                    stroke="#fff"
                    strokeWidth={3}
                    minAngle={5}
                  >
                    {countries.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{
                      paddingTop: '30px',
                      fontSize: '14px'
                    }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Enhanced States Pie Chart */}
          {states.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-700">Registrations by State</h3>
                <div className="text-sm text-gray-500">
                  {states.reduce((sum, state) => sum + state.count, 0)} total registrations
                </div>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={processDataWithTotals(states)}
                    cx="50%"
                    cy="50%"
                    outerRadius={160}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="state"
                    labelLine={false}
                    label={renderCustomLabel}
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    {states.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{
                      paddingTop: '30px',
                      fontSize: '14px'
                    }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Analytics;
