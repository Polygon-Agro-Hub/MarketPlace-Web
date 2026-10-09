import React from 'react';

type EmptyCardDetailsProps = {
  onAddCard: () => void;
};

export const EmptyCardDetails = ({ onAddCard }: EmptyCardDetailsProps) => {
  return (
    <div className="w-full flex justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-10 sm:px-10 sm:py-16 flex flex-col items-center text-center">
        
        {/* Card Icon with Plus Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
            {/* Credit Card SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="w-9 h-9 sm:w-11 sm:h-11 text-gray-800"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" />
              <rect x="2" y="9" width="20" height="3" fill="#4b5563" />
              <circle cx="17" cy="15" r="2" fill="#9ca3af" />
            </svg>
          </div>
          {/* Plus Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              className="w-3 h-3 sm:w-3.5 sm:h-3.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3">
          No Card Added Yet
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed mb-6">
          You don't have any saved payment cards linked to your account. Add a
          credit or debit card for faster, friction-free checkout.
        </p>

        {/* Note */}
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-xs sm:text-sm text-gray-600">
            Note: You can save{' '}
            <span className="font-semibold text-gray-800">1 active card</span> at
            a time
          </span>
        </div>

        {/* Add New Card Button */}
        <button
          onClick={onAddCard}
          className="w-full sm:w-auto sm:min-w-[320px] inline-flex items-center justify-center gap-2 bg-[#3E206D] hover:bg-purple-900 active:bg-purple-950 text-white font-medium text-sm sm:text-base rounded-lg px-6 py-3 sm:py-3.5 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-4 h-4"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Card
        </button>

        {/* Supported Footer */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-6 sm:mt-8">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Supported:
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Visa */}
            <span className="inline-flex items-center justify-center h-5 sm:h-6 px-1.5 bg-gray-100 rounded text-[10px] sm:text-xs font-bold text-blue-700 tracking-tight">
              VISA
            </span>
            {/* Mastercard */}
            <span className="inline-flex items-center justify-center h-5 sm:h-6 w-8 sm:w-9 bg-gray-100 rounded">
              <svg viewBox="0 0 32 20" className="h-3 sm:h-3.5">
                <circle cx="12" cy="10" r="7" fill="#EB001B" />
                <circle cx="20" cy="10" r="7" fill="#F79E1B" fillOpacity="0.9" />
                <path
                  d="M16 4.5a7 7 0 000 11 7 7 0 000-11z"
                  fill="#FF5F00"
                />
              </svg>
            </span>
            {/* 3D Secure */}
            <span className="inline-flex items-center gap-1 h-5 sm:h-6 px-1.5 bg-gray-100 rounded text-[10px] sm:text-xs font-medium text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-2.5 h-2.5 sm:w-3 sm:h-3"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              3D Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};