'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import Loading from '@/components/loadings/loading';
import PackageSlider from "@/components/home/PackageSlider";
import CategoryFilter from "@/components/type-filters/CategoryFilter";
import { getAllProduct } from "@/services/product-service";
import TopBanner from '@/components/home/TopBanner';

interface Package {
  id: number;
  displayName: string;
  image: string;
  subTotal: number;
}

export default function Home() {
  const [data, setData] = useState<{ message: string } | null>(null);
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const [productData, setProductData] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('fruits');

  const cart = useSelector((state: RootState) => state.checkout) || null;


  useEffect(() => {
    fetchAllPackages();
    console.log("Car:", cart);
    
  }, []);

  useEffect(() => {
    console.log(`Category changed to: ${selectedCategory}`);
  }, [selectedCategory]);

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

  // const handleCategorySelect = (categoryId) => {
  //   setSelectedCategory(categoryId);
  // };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className='mt-0 my-8'>
        <TopBanner/>
      </div>
      {loading ? (
        <div>Loading packages...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <PackageSlider productData={productData} />
      )}

      <div className="w-full mb-8">
        <CategoryFilter />
      </div>
    </main>
  );
}