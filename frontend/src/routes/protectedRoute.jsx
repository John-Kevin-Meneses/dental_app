import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import apiService from '../services/api';

const ProtectedRoute = () => {
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiService.getProfile();
        setAuthStatus(response.success ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };
    checkAuth();
  }, []);

  if (authStatus === 'loading') {
    return <div>Loading...</div>;
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;