import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated users to Sign Up first before accessing workspace or scan
    return (
      <Navigate
        to="/signup"
        state={{ from: location, message: 'You must create an account or sign in to launch the workspace or perform APK scans.' }}
        replace
      />
    );
  }

  return <>{children}</>;
}
