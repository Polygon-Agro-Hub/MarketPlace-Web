import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

const header = () => {
  return (
    <>
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
      <header className='bg-[#3E206D] text-white py-5 px-5 shadow-md'>
        <div className='mx-auto flex justify-between items-center'>
          <Link href="/" className='text-2xl font-bold'>My Farm</Link>
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
        </div>
      </header>
    </>
  )
}

export default header
