import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown, faMagnifyingGlass, faBagShopping, faBars, faUser, faClockRotateLeft, faTimes } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import ExitImg from '../../../public/icons/Exit.png';
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // New state for hydration
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const cartState = useSelector((state: RootState) => state.auth.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedBuyerType, setSelectedBuyerType] = useState('');

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    const handleResize = () => {
      // Updated breakpoint to match Tailwind's md breakpoint
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

  const formatPrice = (price: number): string => {
    // Convert to fixed decimal first, then add commas
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');

    // Add commas to integer part
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
    router.push('/signin');
  };

  // Helper function to get the correct home URL
  const getHomeUrl = () => {
    if (!isHydrated) return '/'; // Default during SSR/hydration
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
    setIsDesktopCategoryOpen(false); // Close dropdown
  };

  const confirmSignup = () => {
    setShowSignupModal(false);
    if (selectedBuyerType === 'Wholesale') {
      router.push('/wholesale/home');
    } else {
      router.push('/');
    }
  };

  const handleMobileCategoryClick = (e: React.MouseEvent, buyerType: string) => {
    e.preventDefault();
    setSelectedBuyerType(buyerType);
    setShowSignupModal(true);
    setIsMenuOpen(false); // Close mobile menu
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to signin if not authenticated
      router.push('/signin');
      return;
    }

    // If authenticated, proceed to cart
    router.push('/cart');
  };

  // Render auth buttons consistently
  const renderAuthButtons = () => {
    if (!isHydrated) {
      // Show default unauthenticated state during hydration
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

  // Render mobile auth buttons consistently
  const renderMobileAuthButtons = () => {
    if (!isHydrated) {
      // Show default unauthenticated state during hydration
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Product"
                  className="italic w-full py-2 px-4 rounded-[10px] text-gray-800 focus:outline-none bg-white"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>
            </div>
          )}

          <div onClick={handleCartClick} className="cursor-pointer">
            <div className="flex items-center space-x-4 bg-[#502496] px-8 py-2 rounded-full">
              <div className='relative'>
                <FontAwesomeIcon className='text-2xl' icon={faBagShopping} />
                <span className="absolute top-3 -right-2 bg-[#FF8F66] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {isHydrated ? cartState.count : 0}
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
            <Link className='border-2 w-9 h-9 flex justify-center items-center rounded-full' href="/account">
              <FontAwesomeIcon className='text-1xl' icon={faUser} />
            </Link>
          )}

          {isMobile && (
            <button onClick={toggleMenu} className='md:hidden'>
              <FontAwesomeIcon className='text-2xl' icon={faBars} />
            </button>
          )}
        </div>

        <style jsx>{`
          @media screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
            header {
              padding: 12px 16px !important;
            }
            header > div {
              gap: 8px;
            }
            header .text-2xl {
              font-size: 18px !important;
            }
            header nav {
              gap: 12px !important;
            }
            header nav a,
            header nav button {
              font-size: 14px !important;
            }
            header .flex-1 {
              max-width: 280px !important;
              margin: 0 8px !important;
            }
            header input {
              padding: 6px 12px !important;
              font-size: 13px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 6px 12px !important;
              gap: 6px !important;
            }
            header .bg-\\[\\#502496\\] svg {
              font-size: 16px !important;
            }
            header .bg-\\[\\#502496\\] .text-sm {
              font-size: 11px !important;
            }
            header .text-4xl {
              font-size: 22px !important;
            }
            header .w-9 {
              width: 30px !important;
              height: 30px !important;
            }
            header .text-1xl {
              font-size: 13px !important;
            }
          }

          @media screen and (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
            header {
              padding: 16px 20px !important;
            }
            header > div {
              gap: 12px;
            }
            header nav {
              gap: 16px !important;
            }
            header nav a,
            header nav button {
              font-size: 15px !important;
            }
            header .flex-1 {
              max-width: 320px !important;
              margin: 0 12px !important;
            }
            header input {
              padding: 8px 14px !important;
              font-size: 14px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 8px 16px !important;
              gap: 8px !important;
            }
            header .bg-\\[\\#502496\\] svg {
              font-size: 18px !important;
            }
            header .bg-\\[\\#502496\\] .text-sm {
              font-size: 12px !important;
            }
            header .text-4xl {
              font-size: 28px !important;
            }
            header .w-9 {
              width: 34px !important;
              height: 34px !important;
            }
            header .text-1xl {
              font-size: 15px !important;
            }
          }

          /* Small tablets: 481px - 767px */
          @media screen and (min-width: 481px) and (max-width: 767px) {
            header {
              padding: 10px 12px !important;
            }
            header > div {
              gap: 6px;
            }
            header .text-2xl {
              font-size: 16px !important;
            }
            header nav {
              gap: 8px !important;
            }
            header nav a,
            header nav button {
              font-size: 13px !important;
            }
            header .flex-1 {
              max-width: 200px !important;
              margin: 0 6px !important;
            }
            header input {
              padding: 5px 10px !important;
              font-size: 12px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 5px 10px !important;
              gap: 4px !important;
            }
            header .bg-\\[\\#502496\\] svg {
              font-size: 14px !important;
            }
            header .bg-\\[\\#502496\\] .text-sm {
              font-size: 10px !important;
            }
            header .text-4xl {
              font-size: 18px !important;
            }
            header .w-9 {
              width: 26px !important;
              height: 26px !important;
            }
            header .text-1xl {
              font-size: 11px !important;
            }
          }

          /* Large tablets/small desktops: 1025px - 1200px */
          @media screen and (min-width: 1025px) and (max-width: 1200px) {
            header .flex-1 {
              max-width: 450px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 8px 20px !important;
            }
          }
        `}</style>
      </header>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className='relative flex w-full justify-end'>
          <div className="absolute z-50">
            <div className="bg-[#3E206D] text-white w-64 flex flex-col">
              <div className="flex justify-between items-center border-b border-purple-800 px-6 py-4">
                <span className="font-semibold">Menu</span>
                <button onClick={toggleMenu} className="text-white hover:text-purple-200">
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