import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown, faMagnifyingGlass, faBagShopping, faBars, faUser, faClockRotateLeft, faTimes } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    // Close desktop category menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsDesktopCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const toggleDesktopCategory = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsDesktopCategoryOpen(!isDesktopCategoryOpen);
  }

  const dispatch = useDispatch();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
  }

  return (
    <>
      {!isMobile && (
        <div className='bg-[#2C2C2C] text-gray-300 py-2 px-7'>
          <div className="mx-auto flex justify-between items-center">
            <span className="text-sm italic">
              Call us for any query or help +94 770 111 999
            </span>
            <div className="flex gap-2">
              {user ? (
                <Link
                  href="/"
                  className="text-sm flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(logout());
                  }}
                >
                  <img
                    src="/icons/Exit.png"
                    alt="Logout"
                    className="w-4 h-4"
                  />
                  Logout
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
                    Signup
                  </Link>
                  <Link href="/signin" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <header className='bg-[#3E206D] text-white py-5 px-5 shadow-md'>
        <div className='mx-auto flex justify-between items-center'>
          <Link href="/" className='text-2xl font-bold'>My Farm</Link>
          {!isMobile && (
            <nav className='hidden md:flex space-x-6'>
              <Link href='/' className='hover:text-purple-200'>Home</Link>
              <div className='relative' ref={categoryRef}>
                <button
                  className='flex items-center hover:text-purple-200'
                  onClick={toggleDesktopCategory}
                >
                  Category <span className='ml-1'><FontAwesomeIcon icon={faAngleDown} /></span>
                </button>
                {isDesktopCategoryOpen && (
                  <div className='absolute bg-[#3E206D] text-white w-48 shadow-lg mt-7 z-10'>
                    <Link href="/category/retail" className="border-b-1 block px-4 py-2 hover:bg-[#6c5394]">
                      Retail
                    </Link>
                    <Link href="/category/wholesale" className="block px-4 py-2 hover:bg-[#6c5394]">
                      Wholesale
                    </Link>
                  </div>
                )}
              </div>
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

          <div className="flex items-center space-x-4 bg-[#502496] px-8 py-2 rounded-full">
            <Link href='/cart' className='relative'>
              <FontAwesomeIcon className='text-2xl' icon={faBagShopping} />
              <span className="absolute top-3 -right-2 bg-[#FF8F66] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                0
              </span>
            </Link>
            <div className="text-sm">Rs. 0.00</div>

          </div>
          {!isMobile && (
            <Link href="/orders">
              <FontAwesomeIcon className='text-4xl' icon={faClockRotateLeft} />
            </Link>
          )}
          <Link className='border-2 w-9 h-9 flex justify-center items-center rounded-full' href="/account">
            <FontAwesomeIcon className='text-1xl' icon={faUser} />
          </Link>
          {isMobile && (
            <button onClick={toggleMenu} className='md:hidden'>
              <FontAwesomeIcon className='text-2xl' icon={faBars} />
            </button>
          )}
        </div>
      </header>
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
                {user ? (
                  <Link
                    href="/logout"
                    className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                ) : (
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
                )}
                <Link href="/" className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                  Home
                </Link>
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
                      <Link href="/category/retail" className="block py-3 px-8 hover:bg-purple-800">
                        • Retail
                      </Link>
                      <Link href="/category/wholesale" className="block py-3 px-8 hover:bg-purple-800">
                        • Wholesale
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/promotions" className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                  Promotions
                </Link>
                <Link href="/history" className="py-4 px-6 border-b border-purple-800 hover:bg-purple-800">
                  Order History
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Header