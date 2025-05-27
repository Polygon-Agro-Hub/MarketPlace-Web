'use client';

import { usePathname } from 'next/navigation';
import Layout from './layout';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excludedRoutes = ['/signin', '/signup', '/otp', '/forget-password', '/reset-password', '/reset-password-phone'];	
  const shouldExcludeLayout = excludedRoutes.some(route => pathname.startsWith(route));

  return (
    <Provider store={store}>
      {shouldExcludeLayout ? children : <Layout>{children}</Layout>}
    </Provider>
  );
}
