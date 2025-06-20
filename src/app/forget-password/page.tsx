'use client';
import React, { useState, useEffect, useRef } from 'react';
import { sendResetEmail, sendOTP } from '@/services/auth-service';
import countryData from '../../../public/countryCodes.json';

const Page = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [countryCode, setCountryCode] = useState('+94'); // Default to US
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  // New state for searchable dropdown
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryData);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize timer from localStorage on component mount
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (countdown > 0 && resetMethod === 'email') {
          e.preventDefault();
          e.returnValue = 'You have an active timer running. Are you sure you want to leave?';
          return 'You have an active timer running. Are you sure you want to leave?';
        }
      };

      if (countdown > 0 && resetMethod === 'email') {
        window.addEventListener('beforeunload', handleBeforeUnload);
      }

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [countdown, resetMethod]);

  // Filter countries based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = countryData.filter(
        country => 
          country.name.toLowerCase().includes(query) || 
          country.dial_code.includes(query) ||
          country.code.toLowerCase().includes(query)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countryData);
    }
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setIsResendDisabled(false);
      }
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [countdown]);

    const startResendTimer = () => {
      setIsResendDisabled(true);
      setCountdown(60); // 60 seconds = 1 minute
    };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'This field is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  
    const validatePhoneNumber = (phone: string) => {
      if (!phone.trim()) {
        return 'This field is required';
      }
      const cleanedPhone = phone.replace(/\s+/g, "");
      if (cleanedPhone.length !== 9 || !/^\d{9}$/.test(cleanedPhone)) {
        return 'Phone number must be exactly 9 digits';
      }
      return '';
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPhoneNumber(value);
      
      // Clear error when user starts typing
      if (phoneError) {
        setPhoneError('');
      }
    };

        const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setEmail(value);
          
          // Clear error when user starts typing
          if (emailError) {
            setEmailError('');
          }
        };

      const handleReset = async () => {
        try {
          if (resetMethod === 'email') {
            // Validate email before sending
            const error = validateEmail(email);
            if (error) {
              setEmailError(error);
              setModalMessage(error);
              setIsError(true);
              setIsModalOpen(true);
              return;
            }

            setIsSendingEmail(true);
            const res = await sendResetEmail(email);
            setModalMessage(res.message || 'If an account exists, a password reset link has been sent.');
            
            // Check if the response indicates no account found
            if (res.message && res.message.includes("dont have a account with us")) {
              setIsError(true);
            } else {
              setIsEmailSent(true);
              setIsError(false);
              startResendTimer(); // Start timer only for successful email
              setEmail(''); // Clear email field after successful send
            }
            
            setIsModalOpen(true);
          } else {
            // Validate phone number before sending
            const error = validatePhoneNumber(phoneNumber);
            if (error) {
              setPhoneError(error);
              setModalMessage(error);
              setIsError(true);
              setIsModalOpen(true);
              return;
            }

            // Send OTP via SMS using Shoutout
            const res = await sendOTP(phoneNumber, countryCode);
            setModalMessage(`OTP code has been sent to ${countryCode}${phoneNumber}`);
            
            // Store reference ID if needed for verification later
            if (res && res.referenceId) {
              localStorage.setItem("otpReferenceId", res.referenceId);
            }

            const cleanedPhone = phoneNumber.replace(/\s+/g, "");
            const fullPhoneNumber = countryCode + cleanedPhone;

            console.log('country code -', countryCode);
            console.log('cleaned phone -', cleanedPhone);

            // Store phone number without country code and country code separately
            localStorage.setItem('otpPhoneOnly', cleanedPhone); // e.g., "728196767"
            localStorage.setItem('otpCountryCode', countryCode); // e.g., "+94"

            // Redirect only for phone reset
            window.location.href = `/otp`;
          }
        } catch (err: any) {
          setModalMessage(err.message || 'Failed to send reset code');
          setIsError(true);
          setIsModalOpen(true);
          console.error(err);
        } finally {
          setIsSendingEmail(false);
        }
      };

      const handleResendEmail = async () => {
        if (isResendDisabled || isSendingEmail) return;
        
        // Validate email before resending
        const error = validateEmail(email);
        if (error) {
          setEmailError(error);
          setModalMessage(error);
          setIsError(true);
          setIsModalOpen(true);
          return;
        }
        
        try {
          setIsSendingEmail(true);
          const res = await sendResetEmail(email);
          setModalMessage(res.message || 'Password reset link has been resent.');
          setIsError(false);
          startResendTimer();
          setEmail(''); // Clear email field after successful resend
        } catch (err: any) {
          setModalMessage(err.message || 'Failed to resend reset code');
          setIsError(true);
          console.error(err);
        } finally {
          setIsSendingEmail(false);
          setIsModalOpen(true);
        }
      };

  const selectCountry = (dialCode: string) => {
    setCountryCode(dialCode);
    setIsCountryDropdownOpen(false);
    setSearchQuery('');
  };

  // Find selected country
  const selectedCountry = countryData.find(country => country.dial_code === countryCode);

  // Get button text for send button
  const getSendButtonText = () => {
    if (isSendingEmail) return 'Sending...';
    if (isEmailSent && resetMethod === 'email' && isResendDisabled) return 'Sent !';
    return resetMethod === 'email' ? 'Send Password Reset Link' : 'Send OTP via SMS';
  };

  const handleBackToLogin = () => {
  window.location.href = '/signin'; // Adjust the path as needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">

      <button
        onClick={handleBackToLogin}
        className="absolute top-4 left-4 z-10 mt-[3%] ml-[6%] md:mt-[3%] md:ml-[6%] sm:mt-2 sm:ml-2 flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-300 rounded-[10px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3 md:h-4 md:w-4 text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-gray-600 text-xs md:text-sm font-medium">Back to Login</span>
      </button>



        {/* Left Illustration */}
        <div className="md:w-1/2 flex items-center justify-center bg-white p-8">
          <img
            src="/images/reset.png"
            alt="Forgot password illustration"
            className="w-[70%] h-auto object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password ?</h1>

            <p className="text-gray-600 mb-4">
              Choose how you'd like to receive your password reset code:
            </p>

            <div className="flex flex-row space-x-4 mb-6 items-center justify-center">
              <label
                className={`flex items-center space-x-2 cursor-pointer border rounded-md p-3 ${
                  resetMethod === 'email' ? 'border-[#3E206D]' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={resetMethod === 'email'}
                  onChange={() => setResetMethod('email')}
                  className="form-radio h-5 w-5 [#3E206D] cursor-pointer accent-[#3E206D]"
                />
                <span>Via Email</span>
              </label>
              <label
                className={`flex items-center space-x-2 cursor-pointer border rounded-md p-3 ${
                  resetMethod === 'sms' ? 'border-[#3E206D]' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={resetMethod === 'sms'}
                  onChange={() => setResetMethod('sms')}
                  className="form-radio h-5 w-5 text-[#3E206D] cursor-pointer accent-[#3E206D]"
                />
                <span>Via SMS</span>
              </label>
            </div>

            <p className="text-gray-600 mb-4">
              Enter the {resetMethod === 'email' ? 'Email' : 'Phone Number'} associated with your account
            </p>

            {/* Email Input */}
            {resetMethod === 'email' && (
              <div className="mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter the Email"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSendingEmail}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1 text-left">{emailError}</p>
                )}
              </div>
            )}

            {/* Country Code + Phone Number Input */}
           {resetMethod === 'sms' && (
  <div className="mb-6">
    <div className="flex space-x-4">
      {/* Searchable Country Code Dropdown - 1/4 */}
      <div className="w-1/4 relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 flex items-center justify-between bg-white cursor-pointer"
        >
          <span>
            {selectedCountry && (
              <>{(selectedCountry.code)} {selectedCountry.dial_code}</>
            )}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
       {isCountryDropdownOpen && (
        <div className="absolute z-10 mt-1 w-64 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>
          <div>
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => selectCountry(country.dial_code)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
              >
                <span>{(country.code)}</span>
                <span className="font-medium w-14">{country.dial_code}</span>
                <span className="text-gray-600 text-lg">{country.name}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-2 text-gray-500 italic">No countries found</div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Phone Number Input - 3/4 */}
      <div className="w-3/4">
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="7XXXXXXXX"
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 ${
            phoneError ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
      </div>
    </div>
    {phoneError && (
      <p className="text-red-500 text-sm mt-1 text-left">{phoneError}</p>
    )}
  </div>
)}

            <button
              onClick={handleReset}
              className={`w-full py-3 text-white rounded-md transition-colors mb-4 ${
                (resetMethod === 'email' && isEmailSent) || 
                (resetMethod === 'email' ? !email : !phoneNumber)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-800 hover:bg-purple-900 cursor-pointer'
              }`}
              disabled={
                (resetMethod === 'email' && isEmailSent) || 
                (resetMethod === 'email' ? !email : !phoneNumber)
              }
            >
              {getSendButtonText()}
            </button>

            {/* Show timer and resend button only for email */}
            {resetMethod === 'email' && isEmailSent && (
              <div className="flex flex-col items-center space-y-2 mt-4">
                {/* Timer display */}
                {isResendDisabled && (
                  <div className="text-gray-600 font-medium">
                    {String(Math.floor(countdown / 60)).padStart(2, '0')}:
                    {String(countdown % 60).padStart(2, '0')}
                  </div>
                )}
                
                {/* Resend button */}
                <button 
                  onClick={handleResendEmail}
                  disabled={isResendDisabled || isSendingEmail || !email}
                  className={`text-blue-600 hover:text-blue-800 underline ${
                    (isResendDisabled || isSendingEmail || !email) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSendingEmail ? 'Sending...' : 'Resend again'}
                </button>
              </div>
            )}
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
              {isError ? 'Error' : resetMethod === 'email' ? 'Reset Link Sent' : 'OTP Sent Successfully'}
            </h2>

            <p className="text-gray-700 mb-4">{modalMessage}</p>

            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
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