import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { apiUrl } from "./config";

const Auth = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (!isLogin) {
      let passwordErrors = [];
      if (formData.password.length < 8) passwordErrors.push('at least 8 characters');
      if (!/(?=.*[a-z])/.test(formData.password)) passwordErrors.push('one lowercase letter');
      if (!/(?=.*[A-Z])/.test(formData.password)) passwordErrors.push('one uppercase letter');
      if (!/(?=.*\d)/.test(formData.password)) passwordErrors.push('one number');
      if (!/(?=.*[@$!%*?&])/.test(formData.password)) passwordErrors.push('one special character');
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must include ${passwordErrors.join(', ')}`;
      }
    }
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }
    setIsLoading(true);
    const url = isLogin ? apiUrl("/auth/login") : apiUrl("/auth/signup");
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isLogin ? 'Login successful' : 'Signup successful');
        try {
          login(data.token);
        } catch (err) {
          console.error('Error during login:', err);
          showToast('Login processing error', 'error');
          setIsLoading(false);
          return;
        }

        // Role-based redirect, but check for first login
        const userRole = data.user.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'reviewer') {
          if (data.user.isFirstLogin) {
            navigate('/change-password');
          } else {
            navigate('/reviewer');
          }
        } else if (userRole === 'chairperson') {
          navigate('/chairperson');
        } else {
          navigate('/paper-status');
        }
      } else {
        showToast(data.error || 'Authentication failed', 'error');
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
          <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
          {!isLogin && (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className={`w-full px-3 py-2 mb-4 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-3 py-2 mb-4 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-3 py-2 pr-10 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
          <button
            onClick={() => window.location.href = apiUrl("/auth/google")}
            className="w-full py-2 px-4 mt-3 rounded-md text-white bg-red-500 hover:bg-red-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="mr-2"><path fill="#FFC107" d="M43.611 20.083h-1.932V20H24v8h11.277c-1.627 4.657-6.076 8-11.277 8-6.627 0-12-5.373-12-12s5.373-12 12-12c2.993 0 5.728 1.093 7.857 2.885l6.057-6.057C34.013 6.797 29.284 4.999 24 4.999 13.506 4.999 4.999 13.506 4.999 24c0 10.494 8.507 19.001 19.001 19.001 9.5 0 17.501-6.873 17.501-17.501 0-1.17-.119-2.312-.347-3.417z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.104 19.013 13 24 13c2.993 0 5.728 1.093 7.857 2.885l6.057-6.057C34.013 6.797 29.284 4.999 24 4.999c-7.137 0-13.19 4.115-16.306 10.692z"/><path fill="#4CAF50" d="M24 43.001c5.066 0 9.797-1.677 13.444-4.567l-6.197-5.066C29.013 35.104 26.656 36 24 36c-5.191 0-9.64-3.343-11.277-8.001l-6.571 4.819C10.81 39.886 16.863 43.001 24 43.001z"/><path fill="#1976D2" d="M43.611 20.083h-1.932V20H24v8h11.277c-.654 1.87-1.857 3.54-3.33 4.868.001-.001 6.197 5.066 6.197 5.066C39.373 40.324 43.001 36.001 43.001 24c0-1.17-.119-2.312-.347-3.417z"/></svg>
            Login with Google
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={toggleForm} className="text-blue-500 hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
          {isLogin && (
            <p className="mt-2 text-center text-sm text-gray-600">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-blue-500 hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          )}
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

export default Auth;
