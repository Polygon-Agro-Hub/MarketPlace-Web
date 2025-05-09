'use client';

import MainLayout from "@/components/main-layout/layout";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PackageSlider from "@/components/home/PackageSlider";

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user) || null;
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-5">
      <PackageSlider/>
    </main>
  );
}