'use client';
import React, { useState } from 'react';
import { sendResetEmail } from '@/services/auth-service';

const page = () => {
  const [email, setEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleReset = async () => {
    try {
      const res = await sendResetEmail(email);
      setModalMessage(res.message || 'If an account with that email exists, a password reset link has been sent.');
      setIsError(false);
    } catch (err: any) {
      setModalMessage(err.message || 'Failed to send reset link');
      setIsError(true);
      console.error(err);
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Illustration */}
        <div className="md:w-1/2 flex items-center justify-center bg-white p-8 mb-[20%]">
          <img
            src="/images/forgot.png"
            alt="Forgot password illustration"
            className="max-w-full h-auto"
          />
        </div>

        {/* Right Form */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10 mb-[13%]">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot</h1>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Password ?</h1>

            <p className="text-gray-600 mb-8">
              Enter the email associated with your account
            </p>

            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors"
            >
              Send Password Reset Link
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center w-[90%] max-w-md shadow-xl">
            <img
              src={isError ? '/images/wrong.png' : '/images/correct.png'}
              alt={isError ? 'Error' : 'Success'}
              className="w-20 h-20 mx-auto mb-4"
            />

            <h2 className="text-xl font-bold mb-2">
              {isError ? 'Error' : 'Email Sent'}
            </h2>

            <p className="text-gray-700 mb-4">{modalMessage}</p>

            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;