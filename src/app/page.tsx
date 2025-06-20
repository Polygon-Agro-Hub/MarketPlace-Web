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

  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsState = useSelector((state: RootState) => state.cartItems);
  const authState = useSelector((state: RootState) => state.auth); // If you want to see auth state too

  // Console log Redux data whenever it changes
  useEffect(() => {
    console.log('=== REDUX STATE UPDATE ===');
    console.log('Cart State:', cartState);
    console.log('Cart Items State:', cartItemsState);
    console.log('Auth State:', authState);
    console.log('==========================');
  }, [cartState, cartItemsState, authState]);

  // Alternative: Log only when specific values change
  useEffect(() => {
    if (cartState.totalItems > 0) {
      console.log('🛒 Cart has items:', {
        totalItems: cartState.totalItems,
        grandTotal: cartState.grandTotal,
        finalTotal: cartState.finalTotal,
        itemsCount: cartItemsState.items.length
      });
    }
  }, [cartState.totalItems, cartState.grandTotal, cartItemsState.items.length]);

  useEffect(()=>{
    console.log("NEXT_PUBLIC_BASE_PATH:",process.env.NEXT_PUBLIC_BASE_PATH );
    console.log("NODE_ENV:",process.env.NODE_ENV );
    console.log("NEXT_PUBLIC_API_BASE_URL:",process.env.NEXT_PUBLIC_API_BASE_URL );
    
  })

  // You can also add a button to manually log the state
  const logReduxState = () => {
    console.log('📊 MANUAL REDUX STATE CHECK:');
    console.log('Full Cart State:', cartState);
    console.log('Full Cart Items State:', cartItemsState);
    console.log('Individual Items:', cartItemsState.items);
    console.log('Packages:', cartItemsState.packages);
    console.log('Additional Items:', cartItemsState.additionalItems);
  };



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