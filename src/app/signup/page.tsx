"use client"
import React, { useState, FormEvent, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {  sendOTPInSignup, signup } from '@/services/auth-service';
import { useRouter } from 'next/navigation';
import CustomDropdown from '../../components/home/CustomDropdown';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';
import OTPComponent from '@/components/otp-registration/OTPComponent';

type FormErrors = {
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
};


export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHome, setIsHome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [selectedFruit, setSelectedFruit] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpReferenceId, setOtpReferenceId] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    phoneCode: '+94',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    if (name === 'password') {
      checkPasswordLive(value);
    }
  };

  const checkPasswordLive = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    if (passwordRegex.test(password)) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title) newErrors.title = 'Title is required';

    // First name validation - letters only
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters';
    }

    // Last name validation - letters only
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters';
    }

    // Phone number validation - exactly 9 digits
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 9 digits';
    }

    // Email validation - basic format and specific Gmail check
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms and conditions validation
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setErrors({});
  setSuccess(null);

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Send OTP
    const res = await sendOTPInSignup(formData.phoneNumber, formData.phoneCode);
    
    // Show success popup instead of alert
    setSuccess(`OTP code has been sent to ${formData.phoneCode}${formData.phoneNumber}`);
    setShowSuccessPopup(true);


    // Store reference ID and phone number in state
    if (res && res.referenceId) {
      setOtpReferenceId(res.referenceId);
      setFullPhoneNumber(`${formData.phoneCode}${formData.phoneNumber}`);
      setShowOTPVerification(true); // Show OTP verification component
    }

  } catch (err: any) {
    const errorMessage = err.message || 'Failed to send OTP. Please try again.';
    setErrorMessage(errorMessage);
    setShowErrorPopup(true);
  } finally {
    setLoading(false);
  }
};

  // MODIFIED completeSignup function - remove localStorage operations
  const completeSignup = async () => {
    setLoading(true);
    try {
      const response = await signup({
        ...formData,
        buyerType: isHome ? 'Retail' : 'Wholesale',
      });

      setShowSuccessPopup(true);
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // NEW callback functions for OTP component
  const handleOTPVerificationSuccess = () => {
    setShowOTPVerification(false);
    completeSignup();
  };

  const handleOTPVerificationFailure = () => {
    setShowOTPVerification(false);
  };

    const handleOTPResend = (newReferenceId: string) => {
    setOtpReferenceId(newReferenceId);
  };



  // Helper function to apply error styles
  const getInputClass = (fieldName: keyof FormErrors) => {
    return errors[fieldName]
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500';
  };

 if (showOTPVerification) {
    return (
      <OTPComponent
        phoneNumber={fullPhoneNumber}
        referenceId={otpReferenceId}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onVerificationFailure={handleOTPVerificationFailure}
        onResendOTP={handleOTPResend}
      />
    );
  }

  return(
    <div className="flex w-full bg-gray-100 min-h-screen overflow-auto ">
      <div className="flex min-w-full mx-auto shadow-lg rounded-lgbg-[white]  overflow-auto">

        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title="Your account created successfully!"
        />

        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />

        {/* Left side - Form */}
        <div className="w-full md:w-5/11 px-6 pt-8 md:px-10 md:pt-8">
          <h1 className="text-4xl font-bold text-[#3E206D] mb-4 text-center">MyFarm</h1>

          <h2 className="text-xl font-bold text-center md:text-left text-[#001535] mb-6">Create Your Account</h2>

          {/* Error and Success messages */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Account Type Selection */}
          <div className="flex space-x-3 mb-8 md:mb-10 justify-center">
            <label className="flex flex-nowrap text-[#3F3F3F] font-medium items-center justify-center w-1/2 border rounded-md px-4 py-2 cursor-pointer bg-white hover:text-[#3E206D]">
              <input
                type="radio"
                name="buyerType"
                checked={isHome}
                onChange={() => setIsHome(true)}
                className="mr-2 h-4 w-4 accent-[#3E206D]"
              />
              <span className="whitespace-nowrap text-xs md:text-base">I'm Buying for Home</span>
            </label>

            <label className="flex flex-nowrap text-[#3F3F3F] font-medium items-center justify-center w-1/2 border rounded-md px-4 py-2 cursor-pointer bg-white hover:text-[#3E206D]">
              <input
                type="radio"
                name="buyerType"
                checked={!isHome}
                onChange={() => setIsHome(false)}
                className="mr-2 h-4 w-4 accent-[#3E206D]"
              />
              <span className="whitespace-nowrap text-xs md:text-base">I'm Buying for Business</span>
            </label>
          </div>

          {/* Social Sign Up - Hidden on mobile, visible on md and up */}
          {isHome && (
            <div className="">
              <p className="text-[#4C5160] font-medium mb-6 text-center">Welcome! Select method to Signup :</p>

              {/* Social Sign Up */}
              <div className="flex space-x-3 mb-4 hover:text-[#3E206D]">
                <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4 text-blue-600" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center mt-10 mb-8">
                <div className="flex-grow border-t border-[#8D8D8D]"></div>
                <span className="px-4 text-sm text-gray-500">or continue with email</span>
                <div className="flex-grow border-t border-[#8D8D8D]"></div>
              </div>
            </div>
          )}

          <div className="flex items-center mb-4">
            <div className="text-[#3E206D] mr-4 whitespace-nowrap">Personal Details</div>
            <div className="flex-grow border-t border-[#E2E2E2]"></div>
          </div>

          <div className="px-2 md:px-0 md:pt-0">
            {/* Personal Details Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                {/* Row for Title + First Name */}
                <div className="flex flex-row w-full md:w-1/2 space-x-2">
                  {/* Title */}
                  <div className="w-1/4 md:w-2/9">
                    <CustomDropdown
                      options={[
                        { value: "Mr", label: "Mr." },
                        { value: "Mrs", label: "Mrs." },
                        { value: "Ms", label: "Ms." }
                      ]}
                      selectedValue={formData.title}
                      onSelect={(value) => {
                        handleChange({
                          target: {
                            name: 'title',
                            value: value
                          }
                        } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                      placeholder="Title"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  {/* First Name */}
                  <div className="w-3/4 md:w-7/9">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('firstName')}`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                </div>

                {/* Last Name */}
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('lastName')}`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                {/* Group: +94 + 7XXXXXXXX */}
                <div className="flex flex-row w-full md:w-1/2 space-x-3">
                  {/* +94 Select */}
                  <div className="w-1/4 md:w-2/9">
                    <CustomDropdown
                      options={[
                        { value: '+94', label: '+94' },
                        { value: '+1', label: '+1' },
                        { value: '+44', label: '+44' },
                      ]}
                      selectedValue={formData.phoneCode}
                      onSelect={(value) => {
                        handleChange({
                          target: {
                            name: 'phoneCode',
                            value: value
                          }
                        } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                      placeholder="Select code"
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="w-3/4 md:w-7/9">
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="7XXXXXXXX"
                      className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('phoneNumber')}`}
                    />
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                  </div>
                </div>

                {/* Email Input */}
                <div className="w-full md:w-1/2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('email')}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                <div className="w-full md:w-1/2 relative">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('password')}`}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-[#3E206D]" />
                      ) : (
                        <Eye size={20} className="text-[#3E206D]" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="w-full md:w-1/2 relative">
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass('confirmPassword')}`}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} className="text-[#3E206D]" />
                      ) : (
                        <Eye size={20} className="text-[#3E206D]" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {!isPasswordValid && (
                <div className="text-xs text-gray-600 pl-1 flex flex-row gap-2 md:flex-row items-start md:items-center">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mb-2 md:mb-0 md:mr-1">
                    <span className="text-xs text-[#ffffff]">i</span>
                  </div>
                  <div className="text-[#3E206D] text-xs md:text-sm">
                    Your password must contain a minimum of 6 characters with 1 Uppercase, Numbers & Special Characters.
                  </div>
                </div>
              )}

              <div className="flex flex-col mt-8 mb-4 ">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 accent-[#318831] cursor-pointer focus:ring-purple-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="terms" className="ml-2 block text-md text-[#777A7D]">
                    I agree to the Terms & Conditions
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-[#FF0000] ml-6">{errors.agreeToTerms}</p>
                )}
              </div>

              <div className="flex items-center mb-8 md:mb-8">
                <input
                  type="checkbox"
                  id="marketing"
                  name="agreeToMarketing"
                  checked={formData.agreeToMarketing}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#318831] cursor-pointer text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="marketing" className="ml-2 block text-md text-[#777A7D]">
                  I would prefer receiving promotion E-mails
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-3/5 md:text-lg items-center justify-center bg-[#3E206D] text-[#FFFFFF] rounded-md py-2 hover:bg-purple-800 transition duration-200 mx-auto disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Register'
                )}
              </button>

              <p className="text-center text-md text-[#6B6B6B] mt-4 md:mt-2 mb-4 md:mb-0">
                Already have an account? <a href="../signin" className="text-[#0f1013] hover:underline">Login here</a>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden md:block md:w-6/11 md:min-h-screen bg-purple-900 ">
          {/* Image can be added here if needed */}
        </div>
      </div>
    </div>
  )

}

