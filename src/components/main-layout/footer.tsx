import Link from 'next/link'
import React from 'react'
import MasterCard from '../../../public/images/Mastercard.png'
import Visa from '../../../public/images/Visa.png'
import Image from 'next/image'

const footer = () => {
  return (
    <>
      <footer className='bg-[#191D28] text-gray-300'>
        <div className=' container mx-auto'>
          <div className='p-14 flex flex-col md:flex-row md:justify-between'>
            <div className='mb-6 md:mb-0'>
              <h2 className='text-white text-2xl font-bold mb-6'>MyFarm</h2>

              <div className='flex flex-col space-y-4'>
                <div className='flex items-start'>
                  <div className='text-blue-300 mr-2 mt-1'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p>Registered Office :</p>
                    <p>No. 14, Sir Baron Jayathilaka Mawatha, Colombo 01.</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='text-blue-300 mr-2 mt-1'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p>Cooperate Office :</p>
                    <p>No. 46/42, Nawam Mawatha, Colombo 02.</p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <div className='text-blue-300 mr-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <p>+94 77 1666 800</p>
                </div>
              </div>
            </div>

            <div className='mb-6 md:mb-0 order-3 md:order-2'>
              <h3 className='text-white text-lg font-semibold mb-4'>Quick Links</h3>
              <ul className='space-y-2'>
                <li>
                  <Link href='/' className="hover:text-white transition duration-300">Home</Link>
                </li>
                <li>
                  <Link href='/privacy-policy' className="hover:text-white transition duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="hover:text-white transition duration-300">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div className='mb-6 md:mb-0 order-2 md:order-3'>
              <h3 className="text-white text-lg font-semibold mb-4">My Accounts</h3>

              <ul className='space-y-2'>
                <li>
                  <Link href='/my-account' className="hover:text-white transition duration-300">My Account</Link>
                </li>
                <li>
                  <Link href="/my-cart" className="hover:text-white transition duration-300">
                    My Cart
                  </Link>
                </li>
                <li>
                  <Link href="/order-history" className="hover:text-white transition duration-300">
                    My Order History
                  </Link>
                </li>
              </ul>
            </div>

            <div className='order-3 flex justify-center md:justify-end space-x-4 my-6'>
              <Link href="https://linkedin.com" aria-label="LinkedIn">
                <div className="text-blue-300 hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </div>
              </Link>
              <Link href="https://facebook.com" aria-label="Facebook">
                <div className="text-blue-300 hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </div>
              </Link>
              <Link href="https://youtube.com" aria-label="YouTube">
                <div className="text-blue-300 hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </div>
              </Link>
              <Link href="https://instagram.com" aria-label="Instagram">
                <div className="text-blue-300 hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.151 0-3.507.014-4.735.07-2.295.105-3.356 1.198-3.461 3.461-.056 1.228-.07 1.584-.07 4.735s.014 3.507.07 4.735c.105 2.263 1.166 3.356 3.461 3.461 1.228.056 1.584.07 4.735.07s3.507-.014 4.735-.07c2.295-.105 3.356-1.198 3.461-3.461.056-1.228.07-1.584.07-4.735s-.014-3.507-.07-4.735c-.105-2.263-1.166-3.356-3.461-3.461-1.228-.056-1.584-.07-4.735-.07zm0 3.678c-2.269 0-4.108 1.839-4.108 4.108 0 2.269 1.84 4.108 4.108 4.108 2.269 0 4.108-1.839 4.108-4.108 0-2.269-1.839-4.108-4.108-4.108zm0 6.775c-1.473 0-2.667-1.194-2.667-2.667 0-1.473 1.194-2.667 2.667-2.667 1.473 0 2.667 1.194 2.667 2.667 0 1.473-1.194 2.667-2.667 2.667zm5.23-6.937c0 .53-.43.96-.96.96s-.96-.43-.96-.96.43-.96.96-.96.96.43.96.96z" />
                  </svg>
                </div>
              </Link>
              <Link href="mailto:info@myfarm.com" aria-label="Email">
                <div className="text-blue-300 hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
          <div className='p-2.5 border-t flex justify-between border-gray-700'>
            <div className='flex flex-col md:flex-row items-center'>
              <p className="mb-4 md:mb-0 text-sm">© All rights reserved by AgroWorld Pvt Ltd</p>

              <div className='flex ml-5'>
                <div>
                  <Image src={Visa} alt="Visa" className='w-auto h-6 object-cover' />
                </div>
                <div className='pl-2'>
                  <Image src={MasterCard} alt="MasterCard" className='w-auto h-6 object-cover' />
                </div>
              </div>
            </div>

            <div className='flex flex-col md:flex-row justify-between items-center'>
              <div className='flex space-x-6 mb-4 md:mb-0 order-1 md:order-2'>
                <Link href="/terms-conditions" className="text-sm underline hover:text-white transition duration-300">
                  Terms & Conditions
                </Link>
                <Link href="/privacy-policy" className="text-sm underline hover:text-white transition duration-300">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default footer
