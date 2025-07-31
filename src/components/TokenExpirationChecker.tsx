'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';

const TokenExpirationChecker = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { token, tokenExpiration } = useSelector((state: RootState) => state.auth);

  // Public routes where auto-logout shouldn't redirect
  const publicRoutes = [
    '/signin',
    '/signup',
    '/otp',
    '/forget-password',
    '/reset-password',
    '/reset-password-phone/',
    '/error/404',
    '/error/451',
    '/unsubscribe',
    '/',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const checkTokenExpiration = () => {
    if (!token || !tokenExpiration) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime >= tokenExpiration;

    if (isExpired) {
      console.log('Token expired, logging out...');
      dispatch(logout());
      
      // Clear any stored credentials
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      
      // Only redirect if not already on a public route
      if (!isPublicRoute) {
        router.push('/signin');
      }
    }
  };

  useEffect(() => {
    // Only run the checker if user is authenticated
    if (token && tokenExpiration) {
      // Check immediately
      checkTokenExpiration();
      
      // Set up interval to check every 30 seconds
      intervalRef.current = setInterval(checkTokenExpiration, 30000);
    }

    // Cleanup interval on unmount or when token changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, tokenExpiration, pathname]);

  // This component doesn't render anything
  return null;
};

export default TokenExpirationChecker;