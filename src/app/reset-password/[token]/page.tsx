'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { resetPassword, validateResetToken } from '@/services/auth-service';
import wrongImg from '../../../../public/images/wrong.png'
import resetImg from '../../../../public/images/reset.png'
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
    console.log('Resetting password with token:', token);
    console.log('New password:', newPassword);

    try {
      const res = await resetPassword(token, newPassword);
      setIsError(false);
      setModalMessage('Your password has been updated successfully. You will be redirected to the login page.');
      setIsModalOpen(true);

      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      setIsError(true);
      setModalMessage(err.message || 'Failed to reset password');
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Validating token...</div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="bg-white p-8 rounded-xl text-center w-[90%] max-w-md shadow-xl">
          <img
            src={wrongImg as any}
            alt="Error"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{modalMessage}</p>
          <button
            onClick={() => router.push('/forget-password')}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 relative">
      <div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Illustration */}
        <div className="md:w-1/2 flex items-center justify-center bg-white p-8">
          <Image
            src={resetImg}
            alt="Forgot password illustration"
            className="w-[70%] h-auto object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset</h1>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Password</h1>

            <div className="mb-4 relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <p className="text-left text-sm text-gray-500 mb-6">
              <span className="font-semibold text-red-500">*</span> Your password must contain a minimum of 6 characters with 1 Uppercase, Number & Special character.
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center w-[90%] max-w-md shadow-xl">
            {isError ? (
              /* Error Icon with Animation */
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  {/* Animated Circle Background */}
                  <div
                    className="absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out scale-100 opacity-100"
                    style={{
                      transformOrigin: 'center',
                      animationDelay: '0.2s'
                    }}
                  />

                  {/* Animated X Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        className="opacity-100 transition-all duration-700 ease-out"
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: '24',
                          strokeDashoffset: '0',
                          transitionDelay: '0.6s'
                        }}
                      />
                    </svg>
                  </div>

                  {/* Pulse Animation */}
                  <div
                    className="absolute inset-0 rounded-full bg-red-500 scale-125 opacity-0 transition-all duration-1000"
                    style={{
                      animationDelay: '0.8s'
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Success Icon with Animation */
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  {/* Animated Circle */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-purple-500 scale-100 opacity-100 transition-all duration-700 ease-out"
                    style={{
                      transformOrigin: 'center',
                      animationDelay: '0.2s'
                    }}
                  />

                  {/* Animated Checkmark */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-[#8746ff]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        className="opacity-100 transition-all duration-700 ease-out"
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: '20',
                          strokeDashoffset: '0',
                          transitionDelay: '0.6s'
                        }}
                      />
                    </svg>
                  </div>

                  {/* Pulse Animation */}
                  <div
                    className="absolute inset-0 rounded-full bg-[#8746ff] scale-125 opacity-0 transition-all duration-1000"
                    style={{
                      animationDelay: '0.8s'
                    }}
                  />
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-2">
              {isError ? 'Error' : 'Success'}
            </h2>
            <p className="text-gray-700 mb-4">{modalMessage}</p>
            <button
              onClick={() => {
                setIsModalOpen(false);
                if (!isError) {
                  router.push('/signin');
                }
              }}
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

export default Page;