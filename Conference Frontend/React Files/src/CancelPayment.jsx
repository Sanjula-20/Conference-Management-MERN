import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function CancelPayment() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const error = location.state?.error || "Payment was cancelled";
  const paperId = location.state?.paperId;

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleRetry = () => {
    if (paperId) {
      navigate("/payment", { state: { paperId } });
    } else {
      navigate("/paper-status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          {/* Error Icon */}
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Payment Cancelled
          </h2>
          
          <p className="text-gray-600 mb-2">
            Your payment was cancelled and was not completed.
          </p>
          
          {error && (
            <p className="text-red-600 text-sm mb-6 bg-red-50 rounded-lg p-3">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            
            <button
              onClick={() => navigate("/paper-status")}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Paper Status
            </button>
          </div>

          <p className="text-gray-500 text-xs mt-6">
            If you continue to face issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CancelPayment;
