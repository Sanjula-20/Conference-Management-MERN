import React, { useState } from 'react';
import { apiUrl } from "./config";
  import { useNavigate } from 'react-router-dom';
  import Header from './Header.jsx';
  import Footer from './Footer.jsx';

  const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const showToast = (message, type = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    const validate = () => {
      let newErrors = {};
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
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
        const response = await fetch(apiUrl("/auth/forgot-password"), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          showToast('If an account with that email exists, a password reset link has been sent.', 'success');
          setEmail('');
        } else {
          showToast(data.error || 'Failed to send reset email', 'error');
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        showToast('Network error. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">

        <Header />
     
        <main className="flex-grow flex justify-center py-28 px-4 sm:px-6 lg:px-8">


          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Forgot your password?
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </div>

            {toast.show && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  toast.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}
              >
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium">{toast.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  };

  export default ForgotPassword;
