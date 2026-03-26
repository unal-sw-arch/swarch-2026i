// This component protect routes redirecting in base if the user is already authenticated or not.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

function AuthLoadingScreen() {
  // Just a loading animation or message while we check the auth state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <p className="text-gray-600">Loading session...</p>
    </div>
  );
}

// This function is used to wrap routes that require authentication.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }
  // If user is not authenticated, redirect to root page (login)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// This function is used to wrap routes that should only be accessible to unauthenticated users
export function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }
  // if the user is authenticated, redirect to rooms page
  // We avoid going back to login or register.
  if (user) {
    return <Navigate to="/rooms" replace />;
  }
  // Else render the children (login or register page)

  return <>{children}</>;
}
