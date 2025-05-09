'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Page() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(76);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Swal.fire('Incomplete OTP', 'Please enter all 6 digits.', 'warning');
      return;
    }
    try {
      await Swal.fire({
        title: 'OTP Verified!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: '!border-t-4 !border-t-[#3E206D]' },
        iconColor: '#3E206D',
      });
      router.push('/');
    } catch {
      Swal.fire('Error', 'Invalid OTP. Please try again.', 'error');
    }
  };

  const timerText = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-4">
      <div
        className="bg-white rounded-[10px] shadow-xl flex flex-col items-center p-10"
        style={{
          width: '90%',
          maxWidth: '523px',
          height: 'auto',
          position: 'absolute',
          top: '97px',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0px 6px 40px rgba(0, 149, 125, 0.1)',
        }}
      >
        <h1 className="text-[36px] sm:text-[40px] font-[700] text-center text-[#3E206D] font-inter mb-2">
          MyFarm
        </h1>
        {/* <h2 className="text-lg sm:text-xl font-semibold text-center mb-1">
          Please Verify your OTP
        </h2> */}
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
              ref={el => (inputsRef.current[idx] = el)}
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
        <div className="text-xs sm:text-sm text-[#3E206D] font-semibold text-center mb-6">
          Resend in {timerText}
        </div>

        <button
          onClick={handleVerify}
          className="bg-[#3E206D] text-white font-semibold"
          style={{
            width: '307px',
            height: '45px',
            borderRadius: '10px',
            marginTop: '5px',
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
