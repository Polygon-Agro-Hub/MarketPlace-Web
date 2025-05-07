import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

const header = () => {
  return (
    <>
      <header className='bg-[#3E206D] text-white py-5 px-5 shadow-md'>
        <div className='mx-auto flex justify-between items-center'>
          <Link href="/" className='text-2xl font-bold'>My Farm</Link>
          <nav className='hidden md:flex space-x-6'>
            <Link href='/' className='hover:text-purple-200'>Home</Link>
            <div className='relative group'>
              <button className='flex items-center hover:text-purple-200'>
                Category <span className='ml-1'><FontAwesomeIcon icon={faAngleDown} /></span>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

export default header
