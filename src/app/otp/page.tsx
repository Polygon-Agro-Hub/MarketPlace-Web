'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOTP, sendOTP } from '@/services/auth-service';
import CorrectImg from '../../../public/images/correct.png'
import WrongImg from '../../../public/images/wrong.png'

export default function Page() {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [disabledResend, setDisabledResend] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // New states for OTP expiration and button protection
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);


  useEffect(() => {
    // Load referenceId, phone number, and country code from localStorage
    const refId = localStorage.getItem('otpReferenceId');
    const phone = localStorage.getItem('otpPhoneOnly');
    const country = localStorage.getItem('otpCountryCode');

    console.log('Phone:', phone);
    console.log('Country Code:', country);

    if (refId) setReferenceId(refId);
    if (phone) setPhoneNumber(phone);
    if (country) setCountryCode(country);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setDisabledResend(false);
      setIsOtpExpired(true);

      // Show OTP expired modal
      setIsError(true);
      setModalMessage('OTP has expired. Please request a new one.');
      setIsModalOpen(true);

      // Delete expired referenceId from localStorage
      localStorage.removeItem('otpReferenceId');
      setReferenceId(''); // Clear from state as well
    }
  }, [timer]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    if (value && idx < 4) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      const newOtp = [...otp];

      // If current field has a value, just clear it
      if (newOtp[idx] !== '') {
        newOtp[idx] = '';
        setOtp(newOtp);
        return;
      }

      // If current field is empty, shift all values from right to left
      if (newOtp[idx] === '') {
        // Find the last non-empty field from current position onwards
        let lastFilledIndex = -1;
        for (let i = idx; i < newOtp.length; i++) {
          if (newOtp[i] !== '') {
            lastFilledIndex = i;
          }
        }

        // If there are values to the right, shift them left
        if (lastFilledIndex > idx) {
          // Shift all values from idx to lastFilledIndex one position left
          for (let i = idx; i < lastFilledIndex; i++) {
            newOtp[i] = newOtp[i + 1];
          }
          newOtp[lastFilledIndex] = '';
          setOtp(newOtp);
        } else if (idx > 0) {
          // If no values to the right, move to previous field and clear it
          newOtp[idx - 1] = '';
          setOtp(newOtp);
          inputsRef.current[idx - 1]?.focus();
        }
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();

      const newOtp = [...otp];

      // Clear current field and shift remaining values left
      if (newOtp[idx] !== '') {
        // Find the last non-empty field from current position onwards
        let lastFilledIndex = -1;
        for (let i = idx; i < newOtp.length; i++) {
          if (newOtp[i] !== '') {
            lastFilledIndex = i;
          }
        }

        // Shift all values from idx+1 to lastFilledIndex one position left
        for (let i = idx; i < lastFilledIndex; i++) {
          newOtp[i] = newOtp[i + 1];
        }
        if (lastFilledIndex >= idx) {
          newOtp[lastFilledIndex] = '';
        }
        setOtp(newOtp);
      }
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 5);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 5; i++) {
        newOtp[i] = digits[i];
      }
      // Clear remaining fields if pasted data is shorter
      for (let i = digits.length; i < 5; i++) {
        newOtp[i] = '';
      }
      setOtp(newOtp);

      // Focus on the next empty field or the last field
      const nextFocusIndex = Math.min(digits.length, 4);
      inputsRef.current[nextFocusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    // Prevent duplicate clicks
    if (isVerifying) return;

    const code = otp.join('');
    
    // Check if OTP is complete
    if (code.length !== 5) {
      setIsError(true);
      setModalMessage('Please enter all 5 digits.');
      setIsModalOpen(true);
      return;
    }

    // Check if OTP has expired before making API call
    if (isOtpExpired || !referenceId) {
      setIsError(true);
      setModalMessage('OTP has expired. Please request a new one.');
      setIsModalOpen(true);
      return;
    }

    setIsVerifying(true); // Disable button

    try {
      const response = await verifyOTP(code, referenceId);
      const { statusCode } = response;

      if (statusCode === '1000') {
        setIsVerified(true);
        setIsError(false);
        setModalMessage('OTP Verified Successfully!');
        setIsModalOpen(true);

        // Clean up localStorage on successful verification
        localStorage.removeItem('otpReferenceId');
        // localStorage.removeItem('otpPhoneOnly');
        localStorage.removeItem('otpCountryCode');

        setTimeout(() => router.push('/reset-password-phone'), 2000);
      } else if (statusCode === '1001') {
        setIsError(true);
        setModalMessage('Invalid OTP. Please try again.');
        setIsModalOpen(true);
      } else if (statusCode === '1002' || statusCode === '1003') {
        // Handle expired OTP from server response
        setIsOtpExpired(true);
        setIsError(true);
        setModalMessage('OTP has expired. Please request a new one.');
        setIsModalOpen(true);

        // Remove expired referenceId
        localStorage.removeItem('otpReferenceId');
        setReferenceId('');
      } else {
        setIsError(true);
        setModalMessage('Something went wrong. Please try again.');
        setIsModalOpen(true);
      }
    } catch (error: any) {
      // Check if error indicates expired OTP
      if (error.message && error.message.toLowerCase().includes('expired')) {
        setIsOtpExpired(true);
        setIsError(true);
        setModalMessage('OTP has expired. Please request a new one.');
        setIsModalOpen(true);

        // Remove expired referenceId
        localStorage.removeItem('otpReferenceId');
        setReferenceId('');
      } else {
        setIsError(true);
        setModalMessage('Failed to verify OTP. Try again later.');
        setIsModalOpen(true);
      }
    } finally {
      setIsVerifying(false); // Re-enable button
    }
  };

  const handleResendOTP = async () => {
    // Prevent duplicate clicks and check if already disabled
    if (disabledResend || isResending) return;

    // Ensure we have phone number and country code
    if (!phoneNumber || !countryCode) {
      setIsError(true);
      setModalMessage('Phone number information is missing. Please go back and try again.');
      setIsModalOpen(true);
      return;
    }

    setIsResending(true); // Disable button during API call

    try {
      const res = await sendOTP(phoneNumber, countryCode);

      if (res.referenceId) {
        setReferenceId(res.referenceId);
        localStorage.setItem('otpReferenceId', res.referenceId);

        // Reset timer and states
        setTimer(60);
        setDisabledResend(true);
        setIsOtpExpired(false); // Reset expiration status
        setOtp(['', '', '', '', '']); // Clear current OTP inputs

        // Reset modal states properly before showing success message
        setIsVerified(false); // Reset verification status
        setIsError(false);
        setModalMessage('New OTP has been sent to your mobile number.');
        setIsModalOpen(true);

        // Focus on first input field
        inputsRef.current[0]?.focus();
      } else {
        throw new Error('Failed to get reference ID for new OTP');
      }
    } catch (error: any) {
      setIsError(true);
      setModalMessage(error.message || 'Failed to resend OTP');
      setIsModalOpen(true);
    } finally {
      setIsResending(false); // Re-enable button
    }
  };

  const timerText = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-4">
      <div className="bg-white rounded-[10px] shadow-xl flex flex-col items-center p-10 w-full max-w-md">
        <h1 className="text-[36px] sm:text-[40px] font-[700] text-center text-[#3E206D] font-inter mb-2">
          MyFarm
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-1 text-[#001535]">
          Please Verify your OTP
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
          The OTP has been sent to your mobile number
        </p>

        <div className="flex justify-center space-x-2 sm:space-x-3 mb-4">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputsRef.current[idx] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              placeholder="×"
              className="w-10 sm:w-11 h-10 sm:h-11 text-center border border-gray-300 rounded-md text-xl sm:text-2xl focus:outline-none focus:border-[#3E206D] placeholder:text-[#DCDCDC]"
            />
          ))}
        </div>

        <div className="text-xs sm:text-sm text-gray-500 text-center mb-1">
          I didn't receive the OTP message
        </div>
        <button
          onClick={handleResendOTP}
          disabled={disabledResend || isResending}
          className={`text-xs sm:text-sm mb-6 ${disabledResend || isResending
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-[#3E206D] font-semibold hover:underline cursor-pointer'
            }`}
        >
          {isResending
            ? 'Sending...'
            : disabledResend
              ? `Resend in ${timerText}`
              : 'Resend OTP'
          }
        </button>

        <button
          onClick={handleVerify}
          disabled={isVerifying || isVerified}
          className={`font-semibold w-full max-w-[307px] h-[45px] rounded-[10px] mt-1 transition-colors ${isVerifying || isVerified
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-[#3E206D] text-white hover:bg-[#2D1A4F] cursor-pointer'
            }`}
        >
          {isVerifying ? 'Verifying...' :
            isVerified ? 'Verified ✓' :
              'Verify'}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center w-[90%] max-w-md shadow-xl">
            {isError ? (
              /* Error Icon with Animation */
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
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
                <div className="relative w-28 h-28">
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

            <h2 className="text-xl font-bold mb-2 text-gray-900">
              {isError ? 'Error' : isVerified ? 'OTP Verified' : 'Success'}
            </h2>
            <p className="text-gray-500 mb-6">{modalMessage}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}