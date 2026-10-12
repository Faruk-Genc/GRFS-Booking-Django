import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser } from '../services/api';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;
    const sessionEnded = () => {
      active = false;
      setSession({ key: location.key, authenticated: false });
    };
    window.addEventListener('auth-session-ended', sessionEnded);
    const validateToken = async () => {
      try {
        // Validate token by making an authenticated request
        const response = await getUser();
        // Check if we got a valid response
        if (response && response.data) {
          if (active) setSession({ key: location.key, authenticated: true });
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        // Token is invalid or expired
        if (active) setSession({ key: location.key, authenticated: false });
      }
    };

    validateToken();
    return () => {
      active = false;
      window.removeEventListener('auth-session-ended', sessionEnded);
    };
  }, [location.key]);

  if (!session || session.key !== location.key) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  return session.authenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname, search: location.search }} />;
};

export default PrivateRoute;
