// HeaderSkeleton.tsx
import React, { useEffect, useState } from 'react';

const HeaderSkeleton = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Top banner skeleton - only show on desktop */}
      {!isMobile && (
        <div className="bg-[#2C2C2C] py-2 px-4 sm:px-7 animate-pulse">
          <div className="mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            {/* Phone number skeleton */}
            <div className="h-4 bg-gray-600 rounded w-60 animate-pulse"></div>
            {/* Auth buttons skeleton */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-6 w-14 bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main header skeleton */}
      <header className='bg-[#cccccc] py-5 px-5 shadow-md animate-pulse'>
        <div className='mx-auto flex justify-between items-center'>
          {/* Logo skeleton */}
          <div className="h-8 w-24 bg-gray-400 rounded animate-pulse"></div>

          {/* Desktop navigation skeleton */}
          {!isMobile && (
            <nav className='hidden md:flex space-x-6'>
              <div className="h-5 w-12 bg-gray-400 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-gray-400 rounded animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-400 rounded animate-pulse"></div>
            </nav>
          )}

          {/* Desktop search bar skeleton */}
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <div className="h-10 bg-white rounded-[10px] animate-pulse"></div>
                {/* Search icon placeholder */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-400 rounded animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Right side elements container */}
          <div className="flex items-center space-x-4">
            {/* Cart skeleton */}
            <div className="flex items-center space-x-4 bg-gray-400 px-8 py-2 rounded-full animate-pulse">
              <div className='relative'>
                {/* Shopping bag icon skeleton */}
                <div className="w-6 h-6 bg-gray-400 rounded animate-pulse"></div>
                {/* Cart count badge skeleton */}
                <div className="absolute top-3 -right-2 bg-[#FF8F66] w-4 h-4 rounded-full animate-pulse"></div>
              </div>
              {/* Cart price skeleton */}
              <div className="h-4 w-16 bg-gray-400 rounded animate-pulse"></div>
            </div>

            {/* Order history icon skeleton - desktop only */}
            {!isMobile && (
              <div className="w-9 h-9 bg-gray-400 rounded animate-pulse"></div>
            )}

            {/* User profile icon skeleton */}
            <div className='border-2 border-white w-9 h-9 flex justify-center items-center rounded-full animate-pulse'>
              <div className="w-4 h-4 bg-gray-400 rounded animate-pulse"></div>
            </div>

            {/* Mobile menu button skeleton */}
            {isMobile && (
              <div className="w-6 h-6 bg-gray-400 rounded animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Responsive styles */}
        <style jsx>{`
          /* Extra Small Mobile Devices: 320px - 374px */
          @media screen and (min-width: 320px) and (max-width: 374px) {
            header {
              padding: 8px 10px !important;
            }
            header > div {
              gap: 4px;
            }
            header > div > div:first-child {
              width: 60px !important;
              height: 20px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 4px 8px !important;
              gap: 3px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 12px !important;
              height: 12px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 40px !important;
              height: 12px !important;
            }
            header .w-9 {
              width: 22px !important;
              height: 22px !important;
            }
            header .w-9 > div {
              width: 9px !important;
              height: 9px !important;
            }
          }

          /* Small Mobile Devices: 375px - 424px */
          @media screen and (min-width: 375px) and (max-width: 424px) {
            header {
              padding: 10px 12px !important;
            }
            header > div {
              gap: 5px;
            }
            header > div > div:first-child {
              width: 70px !important;
              height: 22px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 5px 10px !important;
              gap: 4px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 14px !important;
              height: 14px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 45px !important;
              height: 12px !important;
            }
            header .w-9 {
              width: 24px !important;
              height: 24px !important;
            }
            header .w-9 > div {
              width: 10px !important;
              height: 10px !important;
            }
          }

          /* Standard Mobile Devices: 425px - 480px */
          @media screen and (min-width: 425px) and (max-width: 480px) {
            header {
              padding: 12px 14px !important;
            }
            header > div {
              gap: 6px;
            }
            header > div > div:first-child {
              width: 80px !important;
              height: 24px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 6px 12px !important;
              gap: 5px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 16px !important;
              height: 16px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 50px !important;
              height: 14px !important;
            }
            header .w-9 {
              width: 26px !important;
              height: 26px !important;
            }
            header .w-9 > div {
              width: 11px !important;
              height: 11px !important;
            }
          }

          /* Small tablets: 481px - 767px */
          @media screen and (min-width: 481px) and (max-width: 767px) {
            header {
              padding: 14px 16px !important;
            }
            header > div {
              gap: 8px;
            }
            header > div > div:first-child {
              width: 90px !important;
              height: 26px !important;
            }
            header nav {
              gap: 12px !important;
            }
            header nav > div {
              height: 16px !important;
            }
            header .flex-1 {
              max-width: 200px !important;
              margin: 0 8px !important;
            }
            header .flex-1 div div {
              height: 32px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 6px 14px !important;
              gap: 6px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 18px !important;
              height: 18px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 55px !important;
              height: 16px !important;
            }
            header .w-9 {
              width: 28px !important;
              height: 28px !important;
            }
            header .w-9 > div {
              width: 12px !important;
              height: 12px !important;
            }
          }

          /* Medium tablets (portrait): 768px - 1024px */
          @media screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
            header {
              padding: 12px 16px !important;
            }
            header > div {
              gap: 8px;
            }
            header > div > div:first-child {
              width: 85px !important;
              height: 24px !important;
            }
            header nav {
              gap: 12px !important;
            }
            header nav > div {
              height: 18px !important;
            }
            header .flex-1 {
              max-width: 280px !important;
              margin: 0 8px !important;
            }
            header .flex-1 div div {
              height: 34px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 6px 12px !important;
              gap: 6px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 16px !important;
              height: 16px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 50px !important;
              height: 16px !important;
            }
            header .w-9 {
              width: 30px !important;
              height: 30px !important;
            }
            header .w-9 > div {
              width: 13px !important;
              height: 13px !important;
            }
          }

          /* Medium tablets (landscape): 768px - 1024px */
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
            header nav > div {
              height: 20px !important;
            }
            header .flex-1 {
              max-width: 320px !important;
              margin: 0 12px !important;
            }
            header .flex-1 div div {
              height: 36px !important;
            }
            header .bg-\\[\\#502496\\] {
              padding: 8px 16px !important;
              gap: 8px !important;
            }
            header .bg-\\[\\#502496\\] > div:first-child > div {
              width: 18px !important;
              height: 18px !important;
            }
            header .bg-\\[\\#502496\\] > div:last-child {
              width: 60px !important;
              height: 18px !important;
            }
            header .w-9 {
              width: 34px !important;
              height: 34px !important;
            }
            header .w-9 > div {
              width: 15px !important;
              height: 15px !important;
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
    </>
  );
};

export default HeaderSkeleton;