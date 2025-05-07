import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown, faMagnifyingGlass, faBagShopping, faBars, faUser, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react'

const header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenue = () => {
    setIsMenuOpen(!isMenuOpen);
  }
  return (
    <>
      {!isMobile && (
        <div className='bg-[#2C2C2C] text-gray-300 py-2 px-7'>
          <div className="mx-auto flex justify-between items-center">
            <span className="text-sm italic">Call us for any query or help +94 770 111 999</span>
            <div className="flex gap-2">
              <Link href="/signup" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
                Signup
              </Link>
              <Link href="/signin" className="text-sm bg-gray-700 rounded-full px-4 py-1 hover:bg-gray-600">
                Login
              </Link>
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
              <div className='relative group'>
                <button className='flex items-center hover:text-purple-200'>
                  Category <span className='ml-1'><FontAwesomeIcon icon={faAngleDown} /></span>
                </button>
                <div className='absolute hidden group-hover:block bg-white text-purple-900 w-48 shadow-lg rounded-md mt-1 py-2 z-10'>
                  <Link href="/category/retail" className="block px-4 py-2 hover:bg-purple-100">
                    • Retail
                  </Link>
                  <Link href="/category/wholesale" className="block px-4 py-2 hover:bg-purple-100">
                    • Wholesale
                  </Link>
                </div>
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
              <FontAwesomeIcon className='text-3xl' icon={faClockRotateLeft} />
            </Link>
          )}
          {!isMobile && (
            <Link className='border-2 w-9 h-9 flex justify-center items-center rounded-full' href="/account">
              <FontAwesomeIcon className='text-1xl' icon={faUser} />
            </Link>
          )}
          {isMobile && (
            <button className='md:hidden'>
              <FontAwesomeIcon className='text-2xl' icon={faBars} />
            </button>
          )}
        </div>
      </header>
    </>
  )
}

export default header
