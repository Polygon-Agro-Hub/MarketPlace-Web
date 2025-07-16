'use client';

import { useAuth } from '@/components/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/signin' 
}: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, tokenExpiration } = useSelector((state: RootState) => state.auth);

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token || !tokenExpiration) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= tokenExpiration;
  };

  // Check if user is truly authenticated (has valid, non-expired token)
  const isValidlyAuthenticated = isAuthenticated && !isTokenExpired();

  useEffect(() => {
    // If this is a public route (requireAuth = false), don't do any auth checks
    if (!requireAuth) {
      return;
    }

    // Handle token expiration for protected routes only
    if (isAuthenticated && isTokenExpired()) {
      console.log('Token expired, logging out...');
      dispatch(logout());
      
      // Clear any stored credentials
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      
      // Redirect to signin
      router.push(redirectTo);
      return;
    }

    // Redirect unauthenticated users from protected routes
    if (requireAuth && !isValidlyAuthenticated) {
      router.push(redirectTo);
    }
  }, [isValidlyAuthenticated, requireAuth, router, redirectTo, dispatch, token, tokenExpiration, isAuthenticated]);

  // For public routes, always render children without auth checks
  if (!requireAuth) {
    return <>{children}</>;
  }

  // For protected routes, show loading while checking authentication
  if (requireAuth && !isValidlyAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}