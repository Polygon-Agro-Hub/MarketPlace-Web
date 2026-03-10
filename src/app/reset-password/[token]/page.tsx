'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { resetPassword, validateResetToken } from '@/services/auth-service';
import wrongImg from '../../../../public/images/wrong.png'
import resetImg from '../../../../public/images/resetPasswordImg.png'
import CorrectImg from '../../../../public/images/correct.png'
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!token) {
          throw new Error('No token provided');
        }

        const validation = await validateResetToken(token);
        if (validation.success) {
          setIsTokenValid(true);
        } else {
          throw new Error(validation.message || 'Invalid token');
        }
      } catch (err: any) {
        setIsError(true);
        setModalMessage(err.message || 'Invalid or expired token');
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetPassword = async () => {
    if (!isTokenValid) {
      setIsError(true);
      setModalMessage('Invalid reset token');
      setIsModalOpen(true);
      return;
    }

    // Check if fields are empty first
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setIsError(true);
      setModalMessage('All fields are required');
      setIsModalOpen(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setModalMessage('Passwords do not match');
      setIsModalOpen(true);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setIsError(true);
      setModalMessage('Password must contain at least 6 characters with 1 uppercase, number, and special character');
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await resetPassword(token, newPassword);
      setIsError(false);
      setModalMessage('Your password has been updated successfully.\nYou will be directing to the login page after few seconds.\n\nEnjoy your shopping!');
      setIsModalOpen(true);

      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      setIsError(true);
      // Check for specific error messages from backend
      const errorMessage = err.message || 'Failed to reset password';
      
      // Handle "same password" error specifically
      if (errorMessage.toLowerCase().includes('same') || 
          errorMessage.toLowerCase().includes('current password') ||
          errorMessage.toLowerCase().includes('old password')) {
        setModalMessage('New password cannot be the same as your current password. Please choose a different password.');
      } else {
        setModalMessage(errorMessage);
      }
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="bg-white p-8 rounded-xl text-center w-[90%] max-w-md shadow-xl">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20">
              <Image
                src={wrongImg}
                alt="Error"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{modalMessage}</p>
          <button
            onClick={() => router.push('/forget-password')}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex lg:bg-gray-100 justify-center items-center w-full min-h-screen lg:py-10 lg:px-2">
      <div className="flex w-full lg:max-w-7xl">
        <div className="flex min-w-full mx-auto lg:shadow-lg rounded-lg bg-white overflow-auto py-20">
          {/* Left Illustration */}
          <div className="hidden lg:flex lg:w-1/2 justify-center items-center relative overflow-hidden">
            <Image
              src={resetImg}
              alt="Forgot password illustration"
              className="w-[70%] h-auto object-cover"
            />
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-1/2 flex justify-center items-center px-6 sm:px-10">
            <div className="w-full max-w-md text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset</h1>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Password</h1>
              
              <p className="text-[16px] text-[#001535] mb-6">
                Please enter your new password below and confirm it to complete the reset.
              </p>

              <div className="mb-4 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  title=""
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>


              <div className="mb-4 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  title=""
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <p className="text-left text-sm mb-6 flex items-start gap-2" style={{ color: '#3E206D' }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  i
                </span>
                <span>Your password must contain a minimum of 6 characters with 1 Uppercase, Numbers & Special characters.</span>
              </p>

              <button
                onClick={handleResetPassword}
                className="w-full py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors cursor-pointer"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl text-center w-full max-w-md shadow-2xl mx-4">
            {isError ? (
              /* Error Icon - Using Image */
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <Image 
                    src={wrongImg} 
                    alt="Error" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              /* Success Icon - Using Image */
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <Image 
                    src={CorrectImg} 
                    alt="Success" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {isError ? (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ color: '#000000' }}>
                  Error
                </h2>
                <p className="text-sm sm:text-base mb-6" style={{ color: '#637285' }}>
                  {modalMessage}
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-gray-700 font-medium"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: '#000000' }}>
                  Password Updated !
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base mb-2" style={{ color: '#637285' }}>
                  Your password has been updated successfully. You will be directing to the login page after few seconds.
                </p>

                {/* Enjoy shopping message */}
                <p className="text-sm sm:text-base font-medium italic" style={{ color: '#3E206D' }}>
                  Enjoy your shopping!
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;