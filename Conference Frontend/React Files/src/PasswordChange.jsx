import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header';
import Footer from './Footer';
import { apiUrl } from "./config";

function PasswordChange() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      let passwordErrors = [];
      if (formData.newPassword.length < 8) passwordErrors.push('at least 8 characters');
      if (!/(?=.*[a-z])/.test(formData.newPassword)) passwordErrors.push('one lowercase letter');
      if (!/(?=.*[A-Z])/.test(formData.newPassword)) passwordErrors.push('one uppercase letter');
      if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) passwordErrors.push('one special character');
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `Password must include ${passwordErrors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/auth/change-password"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        // Update token if provided
        if (data.token) {
          login(data.token);
        }

        // Navigate based on user role
        setTimeout(() => {
          if (user.role === 'reviewer') {
            navigate('/reviewer-dashboard');
          } else if (user.role === 'chairperson') {
            navigate('/chairperson');
          } else {
            navigate('/paper-status'); // fallback
          }
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-28 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
            Change Password Required
          </h2>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Security Notice:</strong> You are required to change your password before proceeding.
              Please choose a strong password that you haven't used before.
            </p>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded text-center ${
              message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0012 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.573 16.993 16.638 20 12 20c-4.638 0-8.573-3.007-9.963-7.178a.75.75 0 010-.638z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.99902 9.879C3.15612 9.63751 5.94363 5.5 11.9998 5.5C18.056 5.5 20.8435 9.63751 20.9996 9.879C21.0806 10.006 21.0806 10.194 20.9996 10.321C20.8435 10.5625 18.056 14.7 11.9998 14.7C5.94363 14.7 3.15612 10.5625 2.99902 10.321C2.91802 10.194 2.91802 10.006 2.99902 9.879Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.87891 9.87891L14.1216 14.1216" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.1216 9.87891L9.87891 14.1216" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0012 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.573 16.993 16.638 20 12 20c-4.638 0-8.573-3.007-9.963-7.178a.75.75 0 010-.638z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.99902 9.879C3.15612 9.63751 5.94363 5.5 11.9998 5.5C18.056 5.5 20.8435 9.63751 20.9996 9.879C21.0806 10.006 21.0806 10.194 20.9996 10.321C20.8435 10.5625 18.056 14.7 11.9998 14.7C5.94363 14.7 3.15612 10.5625 2.99902 10.321C2.91802 10.194 2.91802 10.006 2.99902 9.879Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.87891 9.87891L14.1216 14.1216" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.1216 9.87891L9.87891 14.1216" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0012 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.573 16.993 16.638 20 12 20c-4.638 0-8.573-3.007-9.963-7.178a.75.75 0 010-.638z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.99902 9.879C3.15612 9.63751 5.94363 5.5 11.9998 5.5C18.056 5.5 20.8435 9.63751 20.9996 9.879C21.0806 10.006 21.0806 10.194 20.9996 10.321C20.8435 10.5625 18.056 14.7 11.9998 14.7C5.94363 14.7 3.15612 10.5625 2.99902 10.321C2.91802 10.194 2.91802 10.006 2.99902 9.879Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.87891 9.87891L14.1216 14.1216" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.1216 9.87891L9.87891 14.1216" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• At least 1 capital letter</li>
              <li>• At least 1 small letter</li>
              <li>• At least 1 special character</li>
              <li>• Must be different from current password</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PasswordChange;
