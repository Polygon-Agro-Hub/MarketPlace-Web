'use client';

import { usePathname } from 'next/navigation';
import Layout from './layout';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excludedRoutes = ['/signin', '/signup', '/otp'];
  const shouldExcludeLayout = excludedRoutes.includes(pathname);

  return (
    <Provider store={store}>
      {shouldExcludeLayout ? children : <Layout>{children}</Layout>}
    </Provider>
  );
}
