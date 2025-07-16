'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import Loading from '@/components/loadings/loading';
import PackageSlider from "@/components/home/PackageSlider";
import CategoryFilter from "@/components/type-filters/CategoryFilter";
import { getAllProduct } from "@/services/product-service";
import TopBanner from '@/components/home/TopBanner';
import AuthGuard from '@/components/AuthGuard';

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
  
  // Modal state lifted to main component
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedPackageForCart, setSelectedPackageForCart] = useState<any>(null);

  const cart = useSelector((state: RootState) => state.checkout) || null;

  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsState = useSelector((state: RootState) => state.cartItems);
  const authState = useSelector((state: RootState) => state.auth);

  // Console log Redux data whenever it changes
  // useEffect(() => {
  //   console.log('=== REDUX STATE UPDATE ===');
  //   // console.log('Cart State:', cartState);
  //   // console.log('Cart Items State:', cartItemsState);
  //   console.log('Auth State:', authState);
  //   console.log('==========================');
  // }, [cartState, cartItemsState, authState]);

  useEffect(() => {
    console.log("NEXT_PUBLIC_BASE_PATH:", process.env.NEXT_PUBLIC_BASE_PATH);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Auth State:', authState.cart);


  })




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

  // Modal handlers
  const handleShowConfirmModal = (packageData: any) => {
    setSelectedPackageForCart(packageData);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedPackageForCart(null);
  };

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
        <PackageSlider 
          productData={productData} 
          onShowConfirmModal={handleShowConfirmModal}
        />
      )}

      <div className="w-full mb-8">
        <CategoryFilter />
      </div>

      {/* Global confirmation modal */}
      {showConfirmModal && selectedPackageForCart && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Add to Cart
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to add "{selectedPackageForCart.packageItem.displayName}" to your cart?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseConfirmModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Call the add to cart function from the package data
                  if (selectedPackageForCart.handlePackageAddToCart) {
                    selectedPackageForCart.handlePackageAddToCart();
                  }
                  handleCloseConfirmModal();
                }}
                className="px-6 py-2 bg-[#3E206D] text-white rounded hover:bg-[#2D1850] transition-colors cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  
  );
}