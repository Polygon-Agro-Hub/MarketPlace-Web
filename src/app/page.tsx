import React from 'react';
import Link from 'next/link'

const page = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Our App</h1>
      <p className="mb-6">This is the home page of our application.</p>
      <Link 
        href="/signup" 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign Up Now
      </Link>
    </div>
  )
}

export default page
