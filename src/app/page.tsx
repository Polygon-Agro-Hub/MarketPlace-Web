'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import Loading from '@/components/loadings/loading';

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ message: string } | null>(null);
  const user = useSelector((state: RootState) => state.auth.user) || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setData({ message: "Data loaded successfully!" })
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loading width={81} height={81} />
            <p className="mt-4 text-lg font-medium text-gray-700">Loading your content...</p>
          </div>
        ) : (
          <>
            <div>Welcome to the Home Page</div>
            <div>{user ? `Hello, ${user.firstName}` : 'Please sign in'}</div>
            <p className="mt-4 text-gray-600">{data?.message}</p>
          </>
        )}

      </div>

    </main>
  );
}