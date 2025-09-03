'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchTerm, setPackageResults } from '@/store/slices/searchSlice';
import { useEffect, useState, useRef } from 'react';
import CategoryFilter from "@/components/type-filters/CategoryFilterWholesale";
import { getAllProduct } from "@/services/product-service";
import TopBanner from '@/components/home/TopBanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import animationData from '../../../../public/noResults.json';

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

  const router = useRouter();

  // Initialize mobile input with Redux search term
  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  const checkBuyerTypeAndRedirect = () => {
    console.log('Checking buyer type for user:', user?.buyerType);
    if (user && user.buyerType) {
      if (user.buyerType === 'Retail') {
        router.push('/');
        return;
      } else if (user.buyerType === 'Wholesale') {
       router.push('/wholesale/home')
        return;
      }
    }
  };

  useEffect(() => {
    checkBuyerTypeAndRedirect();
  }, [user, router]);

  // Initial data fetch
  useEffect(() => {
    fetchAllPackages();
    console.log("Cart:", cart);
  }, []);

  // Fetch products when search term changes
  useEffect(() => {
    fetchAllPackages(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    console.log(`Category changed to: ${selectedCategory}`);
  }, [selectedCategory]);

  // Console log Redux data whenever it changes
  useEffect(() => {
    console.log('=== REDUX STATE UPDATE (WHOLESALE) ===');
    console.log('Auth State:', authState);
    console.log('Search Term:', searchTerm);
    console.log('Search Active:', isSearchActive);
    console.log('======================================');
  }, [cartState, cartItemsState, authState, searchTerm, isSearchActive]);

  // Mobile search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = localSearchInput.trim();
    console.log('Wholesale mobile search submitted:', trimmedSearch);
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
    console.log('Wholesale search reset');
  };

  // Fetch packages function - you might want to create a wholesale-specific version
  async function fetchAllPackages(search?: string) {
    try {
      setLoading(true);
      console.log('Fetching wholesale packages with search term:', search);
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
      console.error('Error fetching wholesale packages:', error);
      setError('Failed to fetch packages');
      // Update package results state for error
      dispatch(setPackageResults(false));
    } finally {
      setLoading(false);
    }
  }

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
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Top banner - hide when search is active */}
      {!isSearchActive && (
        <div className='mt-0 my-8 w-full'>
          <TopBanner/>
        </div>
      )}
      
      {/* Mobile search bar */}
      <div className="w-full px-4 md:hidden mt-4">
        <div className="flex-1 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative shadow-lg">
              <input
                type="text"
                placeholder="Search wholesale products..."
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
        <div className="w-full px-4 md:hidden mt-2">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Searching wholesale for: "{searchTerm}"
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
          {/* Category filter section - show only if has results or not searching */}
          {(!isSearchActive || hasCategoryResults) && (
            <div className="w-full mb-8">
              <CategoryFilter />
            </div>
          )}
        </>
      )}
    </main>
  );
}