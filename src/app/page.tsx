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

  // Modal state lifted to main component
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedPackageForCart, setSelectedPackageForCart] = useState<any>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const cart = useSelector((state: RootState) => state.checkout) || null;

  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsState = useSelector((state: RootState) => state.cartItems);
  const authState = useSelector((state: RootState) => state.auth);

  const router = useRouter();

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

  const handleShowLoginPopup = () => {
    setShowLoginPopup(true);
  };

  const handleLoginClick = () => {
    setShowLoginPopup(false);
    router.push('/signin');
  };

  const handleRegisterClick = () => {
    setShowLoginPopup(false);
    router.push('/signup');
  };

      const LoginPopup = () => {
        if (!showLoginPopup) return null;

        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-black/50 flex items-center justify-center z-[9999] mb-[5%]">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                    {/* Close button */}
                    <button
                        onClick={() => setShowLoginPopup(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-[#000000] mb-4">
                            Welcome, Guest! 👋
                        </h2>
                        <p className="text-[#8492A3] text-base leading-relaxed">
                            We're excited to have you here!<br />
                            To unlock the best experience,<br />
                            please log in or create a new account.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleRegisterClick}
                            className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#EDE1FF] text-[#3E206D] text-sm sm:text-base font-semibold hover:bg-[#DCC7FF] transition-colors cursor-pointer"
                        >
                            Register
                        </button>
                        <button
                            onClick={handleLoginClick}
                            className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#3E206D] text-white font-semibold hover:bg-[#2D1A4F] text-sm sm:text-base transition-colors cursor-pointer"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    };



return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Updated banner container - removed margin constraints */}
      <div className="w-full">
        <TopBanner />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">Loading packages...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <PackageSlider
            productData={productData}
            onShowConfirmModal={handleShowConfirmModal}
            onShowLoginPopup={handleShowLoginPopup}
          />
        </div>
      )}

      <div className="w-full mb-8 px-4 sm:px-6 lg:px-8">
        <CategoryFilter />
      </div>

      {/* Rest of your modals remain the same */}
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
      <LoginPopup />
    </main>
  );
}