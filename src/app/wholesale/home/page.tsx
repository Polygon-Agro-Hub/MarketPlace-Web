'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import CategoryFilter from "@/components/type-filters/CategoryFilterWholesale";
import { getAllProduct } from "@/services/product-service";
import TopBanner from '@/components/home/TopBanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  
  
   const checkBuyerTypeAndRedirect = () => {
    if (user && user.buyerType) {
      if (user.buyerType === 'Retail') {
        // Already on correct page for Retail
        return;
      } else if (user.buyerType === 'Wholesale') {
        router.push('/wholesale/home');
        return;
      }
    }
  };
  
  
  useEffect(() => {
    checkBuyerTypeAndRedirect();
  }, [user, router]);
  
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className='mt-0 my-8'>
        <TopBanner/>
      </div>
      {/* Mobile Search Bar - only visible on small screens */}
      <div className="w-full px-4 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5" color='#3E206D' />
          </button>
        </div>
      </div>
      <div className="w-full mb-8">
        <CategoryFilter />
      </div>
    </main>
  );
}