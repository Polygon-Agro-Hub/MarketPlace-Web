
'use client'; // Add this if using in app router (Next.js 13+)

import React from 'react';

interface LoaderProps {
  isVisible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-t-[#3E206D] border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;