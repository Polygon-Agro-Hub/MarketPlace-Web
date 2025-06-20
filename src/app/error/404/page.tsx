'use client';
import Image from 'next/image';
import { useEffect } from 'react';

useEffect(()=>{
  console.log("NEXT_PUBLIC_BASE_PATH:",process.env.NEXT_PUBLIC_BASE_PATH );
  console.log("NODE_ENV:",process.env.NODE_ENV );
  console.log("NEXT_PUBLIC_API_BASE_URL:",process.env.NEXT_PUBLIC_API_BASE_URL );
  
})
export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white px-4 text-center">
      <Image
       src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/404.jpg`}
        alt="Page Not Found"
        width={400}
        height={400}
        priority // Add this if it's above the fold
      />
      <h1 className="text-4xl font-bold mt-6">Page Not Found!</h1>
      <p className="mt-4 text-sm text-[#8492A3]">
        Looks like you have knocked on the wrong
        <span className="block sm:inline"> door.</span>
      </p>

    </div>
  );
}