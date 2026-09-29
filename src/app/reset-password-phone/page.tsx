'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resetPasswordByPhone } from '@/services/auth-service';
import Image from 'next/image';
import resetImg from '../../../public/images/resetPasswordImg.png';
import { Eye, EyeOff } from 'lucide-react';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';

const Page = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  // Get phone number from localStorage on component mount
  useEffect(() => {
    const storedPhone = localStorage.getItem('otpPhoneOnly');
    if (!storedPhone) {
      showError('Phone number not found. Please restart the password reset process.');
    } else {
      setPhoneNumber(storedPhone);
    }
    setIsLoading(false);
  }, []);

  const handleResetPassword = async () => {
    if (!phoneNumber) {
      showError('Phone number not found');
      return;
    }

    if (!newPassword.trim() && !confirmPassword.trim()) {
      showError('All fields are required');
      return;
    }

    if (!newPassword.trim()) {
      showError('Please enter a new password');
      return;
    }

    if (!confirmPassword.trim()) {
      showError('Please re-enter your password');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      showError('Password must contain at least 6 characters with 1 uppercase, number, and special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      await resetPasswordByPhone(phoneNumber, newPassword);

      // Clear stored phone number after successful reset
      localStorage.removeItem('otpPhoneOnly');

      setShowSuccessPopup(true);

      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      const message = err?.message || 'Failed to reset password';

      // Handle "same password" error specifically
      if (
        message.toLowerCase().includes('same') ||
        message.toLowerCase().includes('current password') ||
        message.toLowerCase().includes('old password')
      ) {
        showError('New password cannot be the same as your current password. Please choose a different password.');
      } else {
        showError(message);
      }
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
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Password Updated!"
        description="Your password has been updated successfully. You will be redirected to the login page shortly. Enjoy your shopping!"
      />

      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error!"
        description={errorMessage}
      />

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
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
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
                style={{ color: '#3E206D' }}
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
    </div>
  );
};

export default Page;