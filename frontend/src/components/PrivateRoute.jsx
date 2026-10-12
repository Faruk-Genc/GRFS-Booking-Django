import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser } from '../services/api';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Validate token by making an authenticated request
        const response = await getUser();
        // Check if we got a valid response
        if (response && response.data) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        // Token is invalid or expired
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname, search: location.search }} />;
};

export default PrivateRoute;
