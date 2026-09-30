import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import PasswordChange from "./PasswordChange";

function Reviewer() {
  const { user, requiresPasswordChange } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'reviewer') {
      navigate('/auth');
      return;
    }

    // If password change is required, don't redirect
    if (requiresPasswordChange) {
      return;
    }

    // Redirect to the new reviewer dashboard
    navigate('/reviewer-dashboard');
  }, [user, navigate, requiresPasswordChange]);

  // If password change is required, show the password change component
  if (requiresPasswordChange) {
    return <PasswordChange />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to reviewer dashboard...</p>
      </div>
    </div>
  );
}

export default Reviewer;
