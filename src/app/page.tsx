'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchTerm, setPackageResults, resetAndSearch ,clearSearch} from '@/store/slices/searchSlice';
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


  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchAllPackages();
    console.log("Cart:", cart);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search');

    if (searchFromUrl) {
      console.log('Home: Found search in URL:', searchFromUrl);

      dispatch(resetAndSearch(searchFromUrl));

      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [dispatch]);

  // Keep the existing search useEffect unchanged:
  useEffect(() => {
    fetchAllPackages(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Home: Search term changed to:', searchTerm);
      if (searchTerm && searchTerm.trim()) {
        fetchAllPackages(searchTerm.trim());
      } else if (searchTerm === '') {

        fetchAllPackages();
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    console.log(`Category changed to: ${selectedCategory}`);
  }, [selectedCategory]);


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
    dispatch(clearSearch());
    console.log('Search reset');
  };

  // Update the useEffect for initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchAllPackages();
        // Add a small delay to show the skeleton for better UX
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        setLoading(false);
      }
    };

    initializeData();
    console.log("Cart:", cart);
  }, []);

  async function fetchAllPackages(search?: string) {
    try {
      // Only show loading on searches, not initial load
      if (search !== undefined && search !== '') {
        setLoading(true);
      }

      console.log('Home: Fetching packages with search term:', search);
      const response = await getAllProduct(search) as any;

      if (response && response.product) {
        setProductData(response.product);
        dispatch(setPackageResults(response.product.length > 0));
      } else {
        setError('No products found');
        dispatch(setPackageResults(false));
      }
    } catch (error) {
      console.error('Home: Error fetching packages:', error);
      setError('Failed to fetch packages');
      dispatch(setPackageResults(false));
    } finally {
      if (search !== undefined && search !== '') {
        setLoading(false);
      }
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

          // Clear any existing content first
          animationContainer.current.innerHTML = '';
          isLoadedRef.current = true;

          const lottie = await import('lottie-web');

          animationInstance = lottie.default.loadAnimation({
            container: animationContainer.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData,
          });

          // Additional cleanup of duplicate elements after animation loads
          setTimeout(() => {
            if (animationContainer.current) {
              const svgElements = animationContainer.current.querySelectorAll('svg');
              if (svgElements.length > 1) {
                // Keep only the first SVG element
                for (let i = 1; i < svgElements.length; i++) {
                  svgElements[i].remove();
                }
              }
            }
          }, 100);
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
        if (animationContainer.current) {
          animationContainer.current.innerHTML = '';
        }
        isLoadedRef.current = false;
      };
    }, []);

    return (
      <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="flex flex-col items-center justify-center text-center max-w-md w-full">
          {/* Lottie Animation Container - isolated and controlled */}
          <div className="w-48 h-48 mb-4 flex items-center justify-center">
            <div
              ref={animationContainer}
              className="w-full h-full"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                overflow: 'hidden'
              }}
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

  const HomeSkeleton = ({ isSearchActive = false }) => {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50 mb-[10%]">
        {/* Top banner skeleton - hide when search is active */}
        {!isSearchActive && (
          <div className="w-full h-[500px] bg-gray-200 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              {/* Main content skeleton */}
              <div className="space-y-6 z-10">
                <div className="h-16 bg-gray-300 rounded-lg w-80 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
                {/* Timer skeleton */}
                <div className="flex space-x-6 items-center justify-center mt-12">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 w-10 bg-gray-200 rounded mt-2 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-3 bg-gray-300 animate-pulse"></div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded mt-2 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-3 bg-gray-300 animate-pulse"></div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 w-14 bg-gray-200 rounded mt-2 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-3 bg-gray-300 animate-pulse"></div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 w-14 bg-gray-200 rounded mt-2 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Carousel dots skeleton */}
              <div className="flex space-x-3 mt-12">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile search bar skeleton */}
        <div className={`w-full px-4 sm:hidden ${isSearchActive ? 'mt-4' : 'mt-4'}`}>
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative shadow-lg">
              <div className="h-10 bg-gray-200 rounded-[10px] animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Content container with controlled spacing */}
        <div className={`flex-1 ${isSearchActive ? 'mt-6' : 'mt-6'} px-4 sm:px-6 lg:px-8`}>
          <div className="space-y-8">
            {/* Package slider skeleton section */}
            <div className="w-full">
              {/* Section label skeleton */}
              <div className="flex justify-center mb-8">
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Package cards horizontal slider skeleton */}
              <div className="relative max-w-6xl mx-auto">
                {/* Navigation arrows skeleton */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 -ml-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse shadow-md"></div>
                </div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 -mr-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse shadow-md"></div>
                </div>

                {/* Package cards */}
                <div className="flex justify-center space-x-8 overflow-hidden px-16">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden animate-pulse flex-shrink-0 w-80 h-96 shadow-sm">
                      <div className="p-8 text-center h-full flex flex-col justify-center">
                        {/* Package icon skeleton */}
                        <div className="w-32 h-32 bg-gray-200 rounded-2xl mx-auto mb-8 animate-pulse relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-2xl"></div>
                        </div>
                        {/* Package title skeleton */}
                        <div className="h-8 bg-gray-300 rounded-lg w-3/4 mx-auto mb-4 animate-pulse"></div>
                        {/* Package price skeleton */}
                        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category filter skeleton section */}
            <div className="w-full">
              {/* Section label skeleton */}
              <div className="flex justify-center mb-6">
                <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Category cards grid skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                      {/* Category icon placeholder */}
                      <div className="absolute bottom-4 right-4 w-8 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual product cards skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse relative">
                    {/* Discount badge skeleton */}
                    {index % 2 === 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="w-8 h-12 bg-gray-300 rounded-r-full animate-pulse"></div>
                      </div>
                    )}
                    <div className="aspect-square bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                      <div className="h-8 bg-gray-300 rounded-full w-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };


  return (
    <>
      {loading ? (
        <HomeSkeleton isSearchActive={isSearchActive} />
      ) : (
        <main className="flex min-h-screen flex-col">
          {/* Top banner - hide when search is active */}
          {!isSearchActive && (
            <div className="w-full">
              <TopBanner />
            </div>
          )}

          {/* Mobile search bar */}
          <div className={`w-full px-4 sm:hidden ${isSearchActive ? 'mt-4' : 'mt-4'}`}>
            <div className="flex-1 max-w-xl mx-auto">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative shadow-lg">
                  <input
                    type="text"
                    placeholder="Search for Product"
                    value={localSearchInput}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="italic w-full py-2 px-4 rounded-[10px] text-[#3E206D] focus:outline-none bg-[#EFE4FF]"
                  />
                  {isSearchActive && searchTerm ? (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#3E206D] transition-colors"
                    >
                      <X size={16} color='#3E206D' className='cursor-pointer' />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#3E206D]"
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} color='#3E206D' className='cursor-pointer' />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Content container with controlled spacing */}
          <div className={`flex-1 ${isSearchActive ? 'mt-6' : 'mt-0'}`}>
            {/* Conditional rendering based on search results */}
            {isSearchActive && !hasPackageResults && !hasCategoryResults ? (
              <NoSearchResults />
            ) : (
              <div className="space-y-6">
                {/* Package slider section - show only if has results or not searching */}
                {(!isSearchActive || hasPackageResults) && (
                  error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                  ) : (
                    <div className="w-full px-4 sm:px-3 lg:px-8">
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
                  <div className="w-full px-4 sm:px-6 lg:px-8">
                    <CategoryFilter />
                  </div>
                )}
              </div>
            )}
          </div>

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
      )}
    </>
  );
}