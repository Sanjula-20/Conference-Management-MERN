import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { apiUrl } from "./config";

const API_URL = apiUrl("/admin/update-payment-amount");

export default function UpdatePaymentAmount() {
  const { token } = useContext(AuthContext);
  const [paperId, setPaperId] = useState('');
  const [amount, setAmount] = useState(''); // rupees
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!paperId || amount === '') {
      setMessage({ type: 'error', text: 'Paper ID and amount are required' });
      return;
    }

    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed < 0) {
      setMessage({ type: 'error', text: 'Amount must be a non-negative number' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ paperId, amount: parsed })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Updated: ${data.amountPaise || parsed*100} paise` });
      } else {
        setMessage({ type: 'error', text: data.error || JSON.stringify(data) });
      }
    } catch (err) {
      console.error('Error updating amount:', err);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Update Payment Amount</h2>
      <p className="text-sm text-gray-600 mb-4">Set a custom payment amount (in rupees) for a specific paper.</p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Paper ID</label>
          <input
            type="text"
            value={paperId}
            onChange={e => setPaperId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (INR)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 10.00"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
