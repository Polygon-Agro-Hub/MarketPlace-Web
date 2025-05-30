
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { verifyOTP, sendOTPInSignup } from '@/services/auth-service';

interface OTPComponentProps {
  phoneNumber: string;
  referenceId: string;
  onVerificationSuccess: () => void;
  onVerificationFailure: () => void;
  onResendOTP: (newReferenceId: string) => void;
}

export default function OTPComponent({ 
  phoneNumber, 
  referenceId, 
  onVerificationSuccess, 
  onVerificationFailure,
  onResendOTP 
}: OTPComponentProps) {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [disabledResend, setDisabledResend] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setDisabledResend(false);
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

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 5) {
      setIsError(true);
      setModalMessage('Please enter all 5 digits.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await verifyOTP(code, referenceId);
      const { statusCode } = response;
      
      if (statusCode === '1000') {
        setIsVerified(true);
        setIsError(false);
        setModalMessage('OTP Verified Successfully!');
        setIsModalOpen(true);
        setTimeout(() => {
          setIsModalOpen(false);
          onVerificationSuccess();
        }, 2000);
      } else if (statusCode === '1001') {
        setIsError(true);
        setModalMessage('Invalid OTP. Please try again.');
        setIsModalOpen(true);
      } else {
        setIsError(true);
        setModalMessage('Something went wrong. Please try again.');
        setIsModalOpen(true);
      }
    } catch (error) {
      setIsError(true);
      setModalMessage('Failed to verify OTP. Try again later.');
      setIsModalOpen(true);
    }
  };

  const handleResendOTP = async () => {
    if (disabledResend) return;
    
    try {
      const countryCode = phoneNumber.substring(0, phoneNumber.length - 10);
      const phone = phoneNumber.substring(countryCode.length);

      console.log('send otp', phone, countryCode);
      
      const res = await sendOTPInSignup(phone, countryCode);
      
      if (res.referenceId) {
        onResendOTP(res.referenceId);
        setTimer(60);
        setDisabledResend(true);
        setIsError(false);
        setModalMessage('New OTP has been sent to your mobile number.');
        setIsModalOpen(true);
      }
    } catch (error: any) {
      setIsError(true);
      setModalMessage(error.message || 'Failed to resend OTP');
      setIsModalOpen(true);
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
          disabled={disabledResend}
          className={`text-xs sm:text-sm mb-6 ${
            disabledResend 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[#3E206D] font-semibold hover:underline'
          }`}
        >
          {disabledResend ? `Resend in ${timerText}` : 'Resend OTP'}
        </button>

        <button
          onClick={handleVerify}
          className="bg-[#3E206D] text-white font-semibold w-full max-w-[307px] h-[45px] rounded-[10px] mt-1"
        >
          Verify
        </button>

        <button
          onClick={onVerificationFailure}
          className="text-[#3E206D] font-semibold mt-4 hover:underline"
        >
          Back to Registration
        </button>
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
              {isError ? 'Error' : 'OTP Verified'}
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
}