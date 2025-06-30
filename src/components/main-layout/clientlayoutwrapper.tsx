'use client';

import { usePathname } from 'next/navigation';
import Layout from './layout';
import { Provider } from 'react-redux';
import { store } from '@/store';

const excludedRoutes = [
  '/signin',
  '/signup',
  '/otp',
  '/forget-password',
  '/reset-password',
  '/error/404',
  '/error/451',
  '/unsubscribe'
];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (!pathname) {
    // Handle case where pathname is not available yet
    return <Provider store={store}>{children}</Provider>;
  }

  // Remove trailing slash and query params
  const cleanPathname = pathname.replace(/\/$/, '').split('?')[0];
  
  const shouldExcludeLayout = excludedRoutes.some(route => 
    cleanPathname === route || cleanPathname.startsWith(`${route}/`)
  );

  return (
    <Provider store={store}>
      {shouldExcludeLayout ? children : <Layout>{children}</Layout>}
    </Provider>
  );
}