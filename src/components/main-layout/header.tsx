import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown, faMagnifyingGlass, faBagShopping, faBars, faUser, faClockRotateLeft, faTimes } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { useRouter, usePathname } from 'next/navigation' // Added usePathname
import { LogOut } from 'lucide-react';
import { setSearchTerm, clearSearch, resetAndSearch, } from '../../store/slices/searchSlice';
import { X } from 'lucide-react';
import { fetchProfile } from '@/services/auth-service';

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
  searchValue?: string;
}

const Header = ({ onSearch, searchValue }: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const cartState = useSelector((state: RootState) => state.auth.cart) || { count: 0, price: 0 };

  const router = useRouter();
  const pathname = usePathname(); // Use Next.js hook instead of window.location
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedBuyerType, setSelectedBuyerType] = useState('');

  const dispatch = useDispatch();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [localSearchInput, setLocalSearchInput] = useState('');
  const isSearchActive = useSelector((state: RootState) => state.search.isSearchActive);
  const profileImage = useSelector((state: RootState) => state.auth.user?.image || null);

  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsDesktopCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  // FIXED: Updated search submit function with better routing logic
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = localSearchInput.trim();
    console.log('Header: Search submitted:', trimmedSearch);

    if (trimmedSearch) {
      const isWholesaleUser = user?.buyerType === 'Wholesale';
      const targetHomePage = isWholesaleUser ? '/wholesale/home' : '/';

      // Use pathname instead of window.location.pathname
      if (pathname !== targetHomePage) {
        console.log(`Header: Redirecting from ${pathname} to ${targetHomePage} with search: ${trimmedSearch}`);
        
        // OPTION 1: Use replace instead of push to avoid RSC issues
        router.replace(`${targetHomePage}?search=${encodeURIComponent(trimmedSearch)}`);
        
        // OPTION 2: Alternative - Navigate first, then set search state
        // router.replace(targetHomePage);
        // setTimeout(() => {
        //   dispatch(resetAndSearch(trimmedSearch));
        // }, 100);
        
        return;
      } else {
        // On the correct page, use resetAndSearch
        dispatch(resetAndSearch(trimmedSearch));
      }
    }

    if (onSearch) {
      onSearch(trimmedSearch);
    }
  }, [localSearchInput, dispatch, onSearch, router, user?.buyerType, pathname]); // Added pathname to dependencies

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e as any);
    }
  };

  const handleResetSearch = () => {
    setLocalSearchInput('');
    dispatch(clearSearch());
    console.log('Header search reset');
  };

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart}`;
  };

  const toggleDesktopCategory = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsDesktopCategoryOpen(!isDesktopCategoryOpen);
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  }

  const confirmLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setShowLogoutModal(false);
    // Use replace instead of push for logout
    router.replace('/signin');
  };

  // Helper function to get the correct home URL
  const getHomeUrl = () => {
    if (!isHydrated) return '/';
    return user?.buyerType === 'Wholesale' ? '/wholesale/home' : '/';
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return isHydrated && token;
  };

  // Helper function to get user info safely
  const getUserInfo = () => {
    return isHydrated ? user : null;
  };

  const handleCategoryClick = (e: React.MouseEvent, buyerType: string) => {
    e.preventDefault();
    setSelectedBuyerType(buyerType);
    setShowSignupModal(true);
    setIsDesktopCategoryOpen(false);
  };

  const confirmSignup = () => {
    setShowSignupModal(false);
    if (selectedBuyerType === 'Wholesale') {
      router.replace('/wholesale/home'); // Use replace instead of push
    } else {
      router.replace('/');
    }
  };

  const handleMobileCategoryClick = (e: React.MouseEvent, buyerType: string) => {
    e.preventDefault();
    setSelectedBuyerType(buyerType);
    setShowSignupModal(true);
    setIsMenuOpen(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      router.replace('/signin'); // Use replace instead of push
      return;
    }

    router.push('/cart');
  };

  // Rest of your component remains the same...
  const renderAuthButtons = () => {
    if (!isHydrated) {
      return (
        <>
          <Link href="/signup" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
            Signup
          </Link>
          <Link href="/signin" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
            Login
          </Link>
        </>
      );
    }

    if (getUserInfo()) {
      return (
        <Link
          href="/"
          className="text-sm flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut />
          Logout
        </Link>
      );
    }

    return (
      <>
        <Link href="/signup" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
          Signup
        </Link>
        <Link href="/signin" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
          Login
        </Link>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (!isHydrated) {
      return (
        <>
          <Link
            href="/signin"
            className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
          >
            Signup
          </Link>
        </>
      );
    }

    if (getUserInfo()) {
      return (
        <Link
          href="/logout"
          className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
          onClick={handleLogout}
        >
          Logout
        </Link>
      );
    }

    return (
      <>
        <Link
          href="/signin"
          className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
        >
          Signup
        </Link>
      </>
    );
  };

  return (
    <>
      {/* Your existing JSX remains exactly the same */}
      {!isMobile && (
        <div className="bg-[#2C2C2C] text-gray-300 py-2 px-4 sm:px-7">
          <div className="mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm italic text-center sm:text-left">
              Call us for any query or help +94 770 111 999
            </span>
            <div className="flex gap-2">
              {renderAuthButtons()}
            </div>
          </div>
        </div>
      )}

      <header className='bg-[#3E206D] text-white py-5 px-5 shadow-md'>
        <div className='mx-auto flex justify-between items-center'>
          <Link href="/" className='text-2xl font-bold'>My Farm</Link>
          {!isMobile && (
            <nav className='hidden md:flex space-x-6'>
              <Link href={getHomeUrl()} className='hover:text-purple-200'>
                Home
              </Link>
              {!isAuthenticated() && (
                <div className='relative cursor-pointer' ref={categoryRef}>
                  <button
                    className='flex items-center hover:text-purple-200  cursor-pointer'
                    onClick={toggleDesktopCategory}
                  >
                    Category <span className='ml-1'><FontAwesomeIcon icon={faAngleDown} /></span>
                  </button>
                  {isDesktopCategoryOpen && (
                    <div className='absolute bg-[#3E206D] text-white w-48 shadow-lg mt-7 z-10  cursor-pointer'>
                      <button
                        onClick={(e) => handleCategoryClick(e, 'Retail')}
                        className="border-b-1 block px-4 py-2 hover:bg-[#6c5394] w-full text-left"
                      >
                        Retail
                      </button>
                      <button
                        onClick={(e) => handleCategoryClick(e, 'Wholesale')}
                        className="block px-4 py-2 hover:bg-[#6c5394] w-full text-left"
                      >
                        Wholesale
                      </button>
                    </div>
                  )}
                </div>
              )}
              <Link href="/promotions" className="hover:text-purple-200">
                Promotions
              </Link>
            </nav>
          )}

          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for Product"
                    value={localSearchInput}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="italic w-full py-2 px-4 rounded-[10px] text-gray-800 focus:outline-none bg-white"
                  />
                  {isSearchActive && searchTerm ? (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={16} className='cursor-pointer' />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} className='cursor-pointer' />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div onClick={handleCartClick} className="cursor-pointer">
            <div className="flex items-center space-x-4 bg-[#502496] px-8 py-2 rounded-full">
              <div className='relative'>
                <FontAwesomeIcon className='text-2xl' icon={faBagShopping} />
                <span className="absolute top-3 -right-2 bg-[#FF8F66] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {isHydrated ? (cartState.count || 0) : 0}
                </span>
              </div>
              <div className="text-sm">Rs. {isHydrated ? formatPrice(cartState.price) : '0.00'}</div>
            </div>
          </div>

          {!isMobile && isAuthenticated() && (
            <Link href="/history/order">
              <FontAwesomeIcon className='text-4xl' icon={faClockRotateLeft} />
            </Link>
          )}

          {isAuthenticated() && (
            <Link className='border-2 w-12 h-12 flex justify-center items-center rounded-full overflow-hidden' href="/account">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon className='text-1xl' icon={faUser} />
              )}
            </Link>
          )}

          {isMobile && (
            <button onClick={toggleMenu} className='md:hidden'>
              <FontAwesomeIcon className='text-2xl' icon={faBars} />
            </button>
          )}
        </div>

        {/* Your existing styles remain the same */}
        <style jsx>{`
          /* All your existing styles remain unchanged */
          @media screen and (min-width: 320px) and (max-width: 374px) {
            header {
              padding: 8px 10px !important;
            }
            header > div {
              gap: 4px;
            }
            header .text-2xl {
              font-size: 14px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 4px 8px !important;
              gap: 3px !important;
            }
            header .bg-\\[\\#502496\\] svg {
              font-size: 12px !important;
            }
            header .bg-\\[\\#502496\\] .text-sm {
              font-size: 8px !important;
            }
            header .w-9 {
              width: 22px !important;
              height: 22px !important;
            }
            header .text-1xl {
              font-size: 9px !important;
            }
            header .text-2xl.fa-bars {
              font-size: 16px !important;
            }
          }
          /* ... rest of your styles remain the same ... */
        `}</style>
      </header>

      {/* Mobile Menu and Modals remain the same */}
      {isMobile && isMenuOpen && (
        <div className='relative flex w-full justify-end mobile-menu-container'>
          <div className="absolute z-50">
            <div className="bg-[#3E206D] text-white w-64 flex flex-col mobile-menu-content">
              <div className="flex justify-between items-center border-b border-purple-800 px-6 py-4">
                <button onClick={toggleMenu} className="text-white hover:text-purple-200 ml-[90%]">
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>
              <nav className="flex flex-col w-full">
                {renderMobileAuthButtons()}
                <Link href={getHomeUrl()} className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                  Home
                </Link>
                {!isAuthenticated() && (
                  <div className="border-b border-purple-800">
                    <button
                      className="py-4 px-6 w-full flex justify-between items-center hover:bg-purple-800 text-left"
                      onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                    >
                      Category
                      <span className="text-xs">{isCategoryExpanded ? '▲' : '▼'}</span>
                    </button>
                    {isCategoryExpanded && (
                      <div className="bg-purple-950">
                        <button
                          onClick={(e) => handleMobileCategoryClick(e, 'Retail')}
                          className="block py-3 px-8 hover:bg-purple-800 w-full text-left"
                        >
                          • Retail
                        </button>
                        <button
                          onClick={(e) => handleMobileCategoryClick(e, 'Wholesale')}
                          className="block py-3 px-8 hover:bg-purple-800 w-full text-left"
                        >
                          • Wholesale
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <Link href="/promotions" className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                  Promotions
                </Link>
                {isAuthenticated() && (
                  <Link href="/history/order" className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                    Order History
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Your existing modals remain the same */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[25px] shadow-lg w-96 text-center">
            <p className="text-lg font-medium mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 bg-[#F3F4F7] text-gray-800 hover:bg-gray-300 transition-colors rounded-[15px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-[#E4001A] text-white rounded-[15px] hover:bg-red-700 transition- cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[25px] shadow-lg w-96 text-center">
            <p className="text-lg font-medium mb-5">
              Do you want to SignIn as a {selectedBuyerType} buyer?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSignupModal(false)}
                className="px-6 py-2 bg-[#F3F4F7] text-gray-800 hover:bg-gray-300 transition-colors rounded-[15px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignup}
                className="px-6 py-2 bg-[#3E206D] text-white rounded-[15px] hover:bg-[#502496] transition-colors cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header