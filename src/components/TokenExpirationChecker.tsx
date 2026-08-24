'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { RootState } from '@/store';

const TokenExpirationChecker = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { token, tokenExpiration } = useSelector((state: RootState) => state.auth);

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

  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (!token || !tokenExpiration) return;

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime >= tokenExpiration;

      if (isExpired) {
        dispatch(logout());
        dispatch(clearCart());

        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');

        if (!isPublicRoute) {
          router.push('/signin');
        }
      }
    };

    if (token && tokenExpiration) {
      checkTokenExpiration(); // check immediately
      intervalRef.current = setInterval(checkTokenExpiration, 1000); // every second
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, tokenExpiration, pathname]);

  return null;
};

export default TokenExpirationChecker;