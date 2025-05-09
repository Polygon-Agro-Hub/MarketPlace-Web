'use client';

import MainLayout from "@/components/main-layout/layout";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user) || null;

  return (
    <main>
      <div>Welcome to the Home Page</div>
      <div>{user ? `Hello, ${user.firstName}` : 'Please sign in'}</div>
    </main>
  );
}