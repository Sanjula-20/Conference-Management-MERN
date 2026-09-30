import React, { useState, useEffect } from "react";
import { apiUrl } from "./config";

const TOTAL_PAYMENT_API_URL = apiUrl("/payment/total");

function Dashboard({ registrations, reviewers }) {
  const [totalPaymentsReceived, setTotalPaymentsReceived] = useState(0);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const papersWithAbstracts = registrations.filter(reg => reg.abstractBlob).length;

  useEffect(() => {
    const fetchTotalPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoadingPayments(false);
          return;
        }

        const res = await fetch(TOTAL_PAYMENT_API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Amount is in paise, convert to rupees
          setTotalPaymentsReceived((data.totalAmount || 0) / 100);
        }
      } catch (err) {
        console.error("Error fetching total payment:", err);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchTotalPayment();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of conference management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{registrations.length}</p>
          <p className="text-sm text-gray-600 font-medium">Total Registrations</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{reviewers.length}</p>
          <p className="text-sm text-gray-600 font-medium">Total Reviewers</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{papersWithAbstracts}</p>
          <p className="text-sm text-gray-600 font-medium">Papers with Abstracts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 text-center">
          {loadingPayments ? (
            <p className="text-3xl font-bold text-gray-400">...</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">₹{totalPaymentsReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          )}
          <p className="text-sm text-gray-600 font-medium">Total Payment Received</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
