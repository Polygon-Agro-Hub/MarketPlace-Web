
'use client';

import { usePathname } from 'next/navigation';
import Layout from './layout';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthGuard from '@/components/AuthGuard';
import TokenExpirationChecker from '@/components/TokenExpirationChecker';

const excludedRoutes = [
  '/signin',
  '/signup',
  '/otp',
  '/forget-password',
  '/reset-password',
  '/reset-password-phone',
  '/error/404',
  '/error/451',
  '/unsubscribe',
  '/exclude/summary',
  '/exclude/exclude',
];

const publicRoutes = [
  '/signin',
  '/signup',
  '/otp',
  '/forget-password',
  '/reset-password',
  '/reset-password-phone',
  '/error/404',
  '/error/451',
  '/unsubscribe',
  '/', 
];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (!pathname) {
    return <Provider store={store}>{children}</Provider>;
  }

  const cleanPathname = pathname.replace(/\/$/, '').split('?')[0];
  
  const shouldExcludeLayout = excludedRoutes.some(route => 
    cleanPathname === route || cleanPathname.startsWith(`${route}/`)
  );

  const isPublicRoute = publicRoutes.some(route => 
    cleanPathname === route || cleanPathname.startsWith(`${route}/`)
  );

  return (
    <Provider store={store}>
      <TokenExpirationChecker />
      <AuthGuard requireAuth={!isPublicRoute}>
        {shouldExcludeLayout ? children : <Layout>{children}</Layout>}
      </AuthGuard>
    </Provider>
  );
}