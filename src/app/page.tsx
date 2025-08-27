'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchTerm, setPackageResults } from '@/store/slices/searchSlice';
import { useEffect, useState } from 'react';
import Loading from '@/components/loadings/loading';
import PackageSlider from "@/components/home/PackageSlider";
import CategoryFilter from "@/components/type-filters/CategoryFilter";
import { getAllProduct } from "@/services/product-service";
import TopBanner from '@/components/home/TopBanner';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { X } from 'lucide-react';
import { useRef } from 'react';
import animationData from '../../public/noResults.json';

interface Package {
  id: number;
  displayName: string;
  image: string;
  subTotal: number;
}

export default function Home() {
  // Redux state
  const dispatch = useDispatch();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const isSearchActive = useSelector((state: RootState) => state.search.isSearchActive);
  const user = useSelector((state: RootState) => state.auth.user) || null;
  const cart = useSelector((state: RootState) => state.checkout) || null;
  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsState = useSelector((state: RootState) => state.cartItems);
  const authState = useSelector((state: RootState) => state.auth);
  const hasPackageResults = useSelector((state: RootState) => state.search.hasPackageResults);
  const hasCategoryResults = useSelector((state: RootState) => state.search.hasCategoryResults);

  // Local state
  const [data, setData] = useState<{ message: string } | null>(null);
  const [productData, setProductData] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('fruits');
  const [localSearchInput, setLocalSearchInput] = useState('');

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedPackageForCart, setSelectedPackageForCart] = useState<any>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const router = useRouter();

  // Initialize mobile input with Redux search term
  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  // Initial data fetch
  useEffect(() => {
    fetchAllPackages();
    console.log("Cart:", cart);
  }, []);

  // Fetch products when search term changes
  useEffect(() => {
    fetchAllPackages(searchTerm);
  }, [searchTerm]);

  // Log category changes
  useEffect(() => {
    console.log(`Category changed to: ${selectedCategory}`);
  }, [selectedCategory]);

  // Console log Redux data whenever it changes
  useEffect(() => {
    console.log('=== REDUX STATE UPDATE ===');
    console.log('Auth State:', authState);
    console.log('Search Term:', searchTerm);
    console.log('Search Active:', isSearchActive);
    console.log('==========================');
  }, [cartState, cartItemsState, authState, searchTerm, isSearchActive]);

  // Mobile search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = localSearchInput.trim();
    console.log('Mobile search submitted:', trimmedSearch);
    dispatch(setSearchTerm(trimmedSearch));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e as any);
    }
  };

  // Reset search function
  const handleResetSearch = () => {
    setLocalSearchInput('');
    dispatch(setSearchTerm(''));
    console.log('Search reset');
  };

  // Fetch packages function
 async function fetchAllPackages(search?: string) {
  try {
    setLoading(true);
    console.log('Fetching packages with search term:', search);
    const response = await getAllProduct(search) as any;
    if (response && response.product) {
      setProductData(response.product);
      // Update package results state
      dispatch(setPackageResults(response.product.length > 0));
    } else {
      setError('No products found');
      // Update package results state for no products
      dispatch(setPackageResults(false));
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    setError('Failed to fetch packages');
    // Update package results state for error
    dispatch(setPackageResults(false));
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
  
const NoSearchResults = () => {
  const animationContainer = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    let animationInstance: any = null;

    const loadAnimation = async () => {
      try {
        // Prevent double loading
        if (isLoadedRef.current || !animationContainer.current) return;
        
        isLoadedRef.current = true;
        
        const lottie = await import('lottie-web');
        
        animationInstance = lottie.default.loadAnimation({
          container: animationContainer.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animationData,
        });
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
        isLoadedRef.current = false;
      }
    };

    loadAnimation();

    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
      isLoadedRef.current = false;
    };
  }, []);
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Lottie Animation Container */}
        <div className="w-32 h-32 mb-4 flex items-center justify-center">
          <div 
            ref={animationContainer}
            className="w-full h-full"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-500 mb-4">
          Sorry, we couldn't find any products matching "{searchTerm}"
        </p>
        <button
          onClick={handleResetSearch}
          className="px-6 py-2 bg-[#3E206D] text-white rounded-lg hover:bg-[#2D1850] transition-colors"
        >
          Clear Search
        </button>
      </div>
    </div>
  );
};

  // Login popup component
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
              Welcome, Guest!
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
    {/* Top banner - hide when search is active */}
    {!isSearchActive && (
      <div className="w-full">
        <TopBanner />
      </div>
    )}
    
    {/* Mobile search bar */}
    <div className="w-full px-4 sm:hidden mt-4">
      <div className="flex-1 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative shadow-lg">
            <input
              type="text"
              placeholder="Search for Product"
              value={localSearchInput}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className="italic w-full py-2 px-4 rounded-[10px] text-[#3E206D] focus:outline-none bg-gray-200"
            />
            {isSearchActive && searchTerm ? (
              <button 
                type="button"
                onClick={handleResetSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#3E206D] transition-colors"
              >
                <X size={16} color='#3E206D' />
              </button>
            ) : (
              <button 
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#3E206D]"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} color='#3E206D'/>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    
    {/* Search indicator on mobile */}
    {isSearchActive && (
      <div className="w-full px-4 sm:hidden mt-2">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Searching for: "{searchTerm}"
          </p>
        </div>
      </div>
    )}
    
    {/* Conditional rendering based on search results */}
    {isSearchActive && !hasPackageResults && !hasCategoryResults ? (
      // Show no results animation when both have no data
      <NoSearchResults />
    ) : (
      <>
        {/* Package slider section - show only if has results or not searching */}
        {(!isSearchActive || hasPackageResults) && (
          loading ? (
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
          )
        )}

        {/* Category filter section - show only if has results or not searching */}
        {(!isSearchActive || hasCategoryResults) && (
          <div className="w-full mb-8 px-4 sm:px-6 lg:px-8">
            <CategoryFilter />
          </div>
        )}
      </>
    )}

    {/* Package add to cart confirmation modal */}
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

    {/* Login popup modal */}
    <LoginPopup />
  </main>
);
}