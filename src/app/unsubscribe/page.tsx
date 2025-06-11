"use client";

import Head from 'next/head';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '@/store';

export default function Unsubscribe() {
  const [clickedButton, setClickedButton] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token
    = useSelector((state: RootState) => state.auth.token
    ) || null;
  const handleUnsubscribeClick = async () => {
    try {
      const response = await fetch('http://localhost:3200/api/auth/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'user@example.com',
          action: 'unsubscribe'
        }),
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);

        if (data.status) {
          setClickedButton('unsubscribe'as any );
          setShowModal(true);
        } else {
          console.error("Unsubscribe failed:", data.message);
        }
      } catch (jsonErr) {
        console.error("Unsubscribe JSON parse error:", jsonErr, "\nRaw response:", text);
      }

    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  };

  const handleStayClick = () => {
    setClickedButton('stay' as any);
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Unsubscribe</title>
      </Head>

      <div className="relative min-h-screen bg-white px-4">
        {/* Wrap page content here */}
        <div className={`transition-filter duration-300 ${showModal ? 'blur-sm' : ''}`}>
          <div className="flex justify-center">
            <div className="bg-white text-center w-full max-w-xl sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
              <img src="/unsubscribe.jpg" alt="Thinking man" className="mx-auto w-48 sm:w-56 md:w-64 lg:w-72 h-auto" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mt-4">
                Are you sure about unsubscribing?
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                If you unsubscribe now, you might miss our nice deals.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleStayClick}
                  className={`w-full sm:w-48 px-4 py-2 rounded-md border ${clickedButton === 'stay'
                      ? 'bg-[#3E206D] text-white border-[#3E206D]'
                      : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
                    }`}
                >
                  I’d rather stay
                </button>
                <button
                  onClick={handleUnsubscribeClick}
                  className={`w-full sm:w-48 px-4 py-2 rounded-md border ${clickedButton === 'unsubscribe'
                      ? 'bg-[#3E206D] text-white border-[#3E206D]'
                      : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
                    }`}
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl text-center w-full max-w-md">
              <img src="/un.png" alt="Modal Icon" className="mx-auto w-20 mb-4" />
              {clickedButton === 'unsubscribe' ? (
                <>
                  <h2 className="text-lg sm:text-xl font-semibold text-black">You’ve Successfully Unsubscribed!</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    We’re sorry to see you go!<br /> You will no longer receive updates from us.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-semibold text-black">We're Glad You're Staying!</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Thanks for sticking with us.<br /> We’ll keep the updates coming your way.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
