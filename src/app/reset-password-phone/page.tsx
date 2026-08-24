'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resetPasswordByPhone } from '@/services/auth-service';
import Image from 'next/image';
import wrongImg from '../../../public/images/wrong.png';
import resetImg from '../../../public/images/resetPasswordImg.png';
import CorrectImg from '../../../public/images/correct.png';
import { Eye, EyeOff } from 'lucide-react';

const Page = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get phone number from localStorage on component mount
  useEffect(() => {
    const storedPhone = localStorage.getItem('otpPhoneOnly');
    if (!storedPhone) {
      setIsError(true);
      setModalMessage('Phone number not found. Please restart the password reset process.');
      setIsModalOpen(true);
    } else {
      setPhoneNumber(storedPhone);
    }
    setIsLoading(false);
  }, []);

  const handleResetPassword = async () => {
    if (!phoneNumber) {
      setIsError(true);
      setModalMessage('Phone number not found');
      setIsModalOpen(true);
      return;
    }

    // Check if both fields are empty first
    if (!newPassword.trim() && !confirmPassword.trim()) {
      setIsError(true);
      setModalMessage('All fields are required');
      setIsModalOpen(true);
      return;
    }

    // Check if individual fields are empty
    if (!newPassword.trim()) {
      setIsError(true);
      setModalMessage('Please enter a new password');
      setIsModalOpen(true);
      return;
    }

    if (!confirmPassword.trim()) {
      setIsError(true);
      setModalMessage('Please re-enter your password');
      setIsModalOpen(true);
      return;
    }

    // Check password validation first
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setIsError(true);
      setModalMessage('Password must contain at least 6 characters with 1 uppercase, number, and special character');
      setIsModalOpen(true);
      return;
    }

    // Then check if passwords match
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setModalMessage('Passwords do not match');
      setIsModalOpen(true);
      return;
    }

    try {
      await resetPasswordByPhone(phoneNumber, newPassword);

      // Clear stored phone number after successful reset
      localStorage.removeItem('otpPhoneOnly');

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 justify-center items-center w-full min-h-screen p-4">
      <div className="flex w-full max-w-6xl">
        <div className="flex min-w-full mx-auto bg-white rounded-lg overflow-hidden flex-col md:flex-row">
          {/* Left Illustration */}
          <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-8 bg-white">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 relative mx-auto">
              <Image
                src={resetImg}
                alt="Reset password illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 flex justify-center items-center p-6 sm:p-8 md:p-10">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Reset Password
                </h1>
              </div>

              <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                Updating password for: {phoneNumber.substring(0, 3)}****{phoneNumber.slice(-3)}
              </p>

              <div className="mb-4 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
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
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div
                className="text-left text-xs sm:text-sm mb-6 flex items-start gap-2 p-3 rounded-lg"
                style={{ color: "#3E206D" }}
              >
                <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mt-0.5">
                  i
                </span>
                <span>
                  Your password must contain a minimum of 6 characters with 1
                  Uppercase, Numbers & Special characters.
                </span>
              </div>

              <button
                onClick={handleResetPassword}
                className="w-full py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors cursor-pointer text-sm sm:text-base font-medium"
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl text-center w-full max-w-sm sm:max-w-md">
            {isError ? (
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 relative">
                  <Image
                    src={wrongImg}
                    alt="Error"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 relative">
                  <Image
                    src={CorrectImg}
                    alt="Success"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {isError ? (
              <>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">
                  Error
                </h2>
                <p className="text-sm sm:text-base mb-6 text-gray-500 whitespace-pre-line">
                  {modalMessage}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-gray-700 font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">
                  Password Updated!
                </h2>
                <p className="text-sm sm:text-base mb-2 text-gray-500">
                  Your password has been updated successfully. You will be
                  directing to the login page after few seconds.
                </p>
                <p className="text-sm sm:text-base font-medium italic text-[#3E206D]">
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