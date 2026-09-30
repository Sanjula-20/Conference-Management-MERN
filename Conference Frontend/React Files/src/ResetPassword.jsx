import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { apiUrl } from "./config";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') setNewPassword(value);
    else if (name === 'confirmPassword') setConfirmPassword(value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  const validate = () => {
    let newErrors = {};
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    else {
      let passwordErrors = [];
      if (newPassword.length < 8) passwordErrors.push('at least 8 characters');
      if (!/(?=.*[a-z])/.test(newPassword)) passwordErrors.push('one lowercase letter');
      if (!/(?=.*[A-Z])/.test(newPassword)) passwordErrors.push('one uppercase letter');
      if (!/(?=.*\d)/.test(newPassword)) passwordErrors.push('one number');
      if (!/(?=.*[@$!%*?&])/.test(newPassword)) passwordErrors.push('one special character');
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `Password must include ${passwordErrors.join(', ')}`;
      }
    }
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl("/auth/reset-password"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password has been reset successfully');
        setTimeout(() => navigate('/auth'), 2000);
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col pt-22 min-h-screen">
      <main className="flex-grow py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
          <p className="text-gray-600 text-center mb-6">
            Enter your new password below.
          </p>
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                placeholder="New Password"
                className={`w-full px-3 py-2 pr-10 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>
          <div className="mb-4">
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className={`w-full px-3 py-2 pr-10 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white mb-4 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button
            onClick={() => navigate('auth')}
            className="w-full py-2 px-4 rounded-md text-blue-500 border border-blue-500 hover:bg-blue-50"
          >
            Back to Login
          </button>
          {toast.show && (
            <div
              className={`mt-4 p-3 rounded text-white text-center ${
                toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
