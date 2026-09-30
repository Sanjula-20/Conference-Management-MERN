import React, { createContext, useState, useEffect, useRef } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const inactivityTimeoutRef = useRef(null);

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (token) {
      inactivityTimeoutRef.current = setTimeout(() => {
        logout();
        alert('You have been logged out due to inactivity.');
      }, 5 * 60 * 1000); // 5 minutes
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);

        // Check if user needs to change password (first login for reviewers)
        if (payload.isFirstLogin === true) {
          setRequiresPasswordChange(true);
        } else {
          setRequiresPasswordChange(false);
        }
        resetInactivityTimer();
      } catch (error) {
        console.error('Invalid token');
        logout();
      }
    } else {
      setUser(null);
      setRequiresPasswordChange(false);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    }
  }, [token]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetTimer = () => resetInactivityTimer();

    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRequiresPasswordChange(false);
    localStorage.removeItem('token');
  };

  const passwordChanged = () => {
    setRequiresPasswordChange(false);
    // Update user state to reflect password change
    if (user) {
      setUser({ ...user, passwordChanged: true });
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      requiresPasswordChange,
      passwordChanged
    }}>
      {children}
    </AuthContext.Provider>
  );
};
