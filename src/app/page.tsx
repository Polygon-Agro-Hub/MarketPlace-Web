'use client';

import MainLayout from "@/components/main-layout/layout";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PackageSlider from "@/components/home/PackageSlider";
import { useEffect, useState } from "react";
import { getAllProduct } from "@/services/product-service";

interface Package {
  id: number;
  displayName: string;
  image: string;
  subTotal: number;
}

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const [productData, setProductData] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPackages();
  }, []);

  async function fetchAllPackages() {
    try {
      setLoading(true);
      const response = await getAllProduct() as any;
      if (response && response.product) {
        setProductData(response.product);
      } else {
        setError('No products found');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  }

  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-5">
        {loading ? (
          <div>Loading packages...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <PackageSlider productData={productData} />
        )}
      </main>
  );
}