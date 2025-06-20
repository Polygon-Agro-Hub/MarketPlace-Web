'use client';
import React, { useState, useEffect, useRef } from 'react';
import { sendResetEmail, sendOTP } from '@/services/auth-service';
import countryData from '../../../public/countryCodes.json';

// Convert ISO country code to emoji flag
const getFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const Page = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [countryCode, setCountryCode] = useState('+1'); // Default to US
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  
  // New state for searchable dropdown
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryData);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

const handleReset = async () => {
  try {
    if (resetMethod === 'email') {
      const res = await sendResetEmail(email);
      setModalMessage(res.message || 'If an account exists, a password reset link has been sent.');
      startResendTimer(); // Start timer only for email
    } else {
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

    setIsError(false);
  } catch (err: any) {
    setModalMessage(err.message || 'Failed to send reset code');
    setIsError(true);
    console.error(err);
  } finally {
    setIsModalOpen(true);
  }
};



  const handleResendEmail = async () => {
    if (isResendDisabled) return;
    
    try {
      const res = await sendResetEmail(email);
      setModalMessage(res.message || 'Password reset link has been resent.');
      setIsError(false);
      startResendTimer();
    } catch (err: any) {
      setModalMessage(err.message || 'Failed to resend reset code');
      setIsError(true);
      console.error(err);
    } finally {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot</h1>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Password ?</h1>

            <p className="text-gray-600 mb-4">
              Choose how you'd like to receive your password reset code:
            </p>

            <div className="flex flex-row space-x-4 mb-6 items-center justify-center">
              <label
                className={`flex items-center space-x-2 cursor-pointer border rounded-md p-3 ${
                  resetMethod === 'email' ? 'border-purple-600' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={resetMethod === 'email'}
                  onChange={() => setResetMethod('email')}
                  className="form-radio h-5 w-5 text-purple-600"
                />
                <span>Via Email</span>
              </label>
              <label
                className={`flex items-center space-x-2 cursor-pointer border rounded-md p-3 ${
                  resetMethod === 'sms' ? 'border-purple-600' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  checked={resetMethod === 'sms'}
                  onChange={() => setResetMethod('sms')}
                  className="form-radio h-5 w-5 text-purple-600"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            )}

            {/* Country Code + Phone Number Input */}
            {resetMethod === 'sms' && (
              <div className="flex space-x-4 mb-6">
                {/* Searchable Country Code Dropdown - 1/4 */}
                <div className="w-1/4 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 flex items-center justify-between bg-white"
                  >
                    <span>
                      {selectedCountry && (
                        <>{getFlagEmoji(selectedCountry.code)} {selectedCountry.dial_code}</>
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
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <span>{getFlagEmoji(country.code)}</span>
                            <span className="font-medium">{country.dial_code}</span>
                            <span className="text-gray-600 text-sm truncate">{country.name}</span>
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
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter Phone Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors mb-4"
              disabled={resetMethod === 'email' ? !email : !phoneNumber}
            >
              {resetMethod === 'email' ? 'Send Password Reset Link' : 'Send OTP via SMS'}
            </button>

            {/* Show resend button only for email */}
            {resetMethod === 'email' && (
              <button 
                onClick={handleResendEmail}
                disabled={isResendDisabled}
                className={`text-purple-600 hover:text-purple-800 ${isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isResendDisabled ? `Resend in ${countdown}s` : 'Resend again'}
              </button>
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