import React from 'react';

const ExistCardDetails = () => {
    const onRemoveCard = () => {
        console.log('Removing card...');
        // Here you would typically call an API to remove the card.
        // After successful API call, you might want to update the state in the parent component to show EmptyCardDetails.
    }
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5 sm:gap-6">

      {/* Info Banner */}
      <div className="flex items-start sm:items-center gap-2.5 bg-gray-100 rounded-full px-4 py-2.5 sm:px-5 sm:py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-xs sm:text-sm text-gray-700 leading-snug">
          Only 1 payment card can be saved at a time for 1-click expedited checkout.
        </p>
      </div>

      {/* Card Visual */}
      <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[1.586/1] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700/20 to-slate-600/30" />

        {/* Card content */}
        <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 text-white">

          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Chip + Contactless */}
            <div className="flex items-center gap-2">
              {/* Chip */}
              <div className="w-8 h-6 sm:w-10 sm:h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-yellow-600/30" />
                  ))}
                </div>
              </div>
              {/* Contactless */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300"
              >
                <path d="M6 8a8 8 0 010 8" />
                <path d="M9 6a11 11 0 010 12" />
                <path d="M12 4a14 14 0 010 16" />
              </svg>
            </div>

            {/* Primary badge */}
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-white/10 border border-white/20 rounded-full px-2.5 py-1 text-gray-200">
              Primary Card
            </span>
          </div>

          {/* Card Number */}
          <div>
            <p className="text-[9px] sm:text-[10px] font-medium tracking-widest text-gray-400 uppercase mb-1.5">
              Card Number
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl font-medium tracking-wider">
              <span className="text-gray-400">••••</span>
              <span className="text-gray-400">••••</span>
              <span className="text-gray-400">••••</span>
              <span className="text-white">4821</span>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] sm:text-[10px] font-medium tracking-widest text-gray-400 uppercase mb-1">
                Card Holder
              </p>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-white">
                SAMANTHA KULARATHNA
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] font-medium tracking-widest text-gray-400 uppercase mb-1">
                Expires
              </p>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-white">
                08/27
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand + Status row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="inline-flex items-center justify-center h-6 sm:h-7 px-2 bg-gray-100 rounded text-xs sm:text-sm font-bold text-blue-700 italic tracking-tight">
          VISA
        </span>
        <span className="text-sm sm:text-base text-gray-700">
          Card ending in <span className="font-semibold text-gray-900">4821</span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-[10px] sm:text-xs font-semibold rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          Active Default
        </span>
      </div>

      {/* Encrypted Vault Storage */}
      <div className="flex items-start gap-3 bg-gray-100 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0 mt-0.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div>
          <p className="text-sm sm:text-base font-medium text-gray-900 mb-0.5">
            Encrypted Vault Storage
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Your card details are tokenized securely with your issuing bank. Only
            one primary payment card can be kept active at a time.
          </p>
        </div>
      </div>

      {/* Remove Card Button */}
      <div>
        <button
          onClick={onRemoveCard}
          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm sm:text-base font-medium rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          Remove Card
        </button>
        <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed max-w-xl">
          To add another card, delete your current active card above and link a
          new payment method during checkout or right here.
        </p>
      </div>

      {/* Feature footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
        {/* Encrypted Protection */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">
              Encrypted Protection
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              100% Safe token-based transactions
            </p>
          </div>
        </div>

        {/* Fast Checkout */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"
            >
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">
              Fast 1-Click Checkout
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Instant order dispatch approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistCardDetails;