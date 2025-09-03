"use client";
import React, { useState, FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { sendOTPInSignup, signup, verifyUserDetails } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import OTPComponent from "@/components/otp-registration/OTPComponent";
import Image from "next/image";
import LoginImg from '../../../public/images/login.png'

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
  companyName?: string;
  companyPhoneNumber?: string;
};

type PhoneCode = {
  code: string;
  dialCode: string;
  name: string;
};

interface CustomDropdownProps {
  options: { value: string; label: string; flag?: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  className = "",
}) => {
  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <select
      value={selectedValue}
      onChange={(e) => onSelect(e.target.value)}
      className={`h-10 w-full border rounded-md px-2 py-2 focus:outline-none focus:ring-1 cursor-pointer border-gray-300 focus:ring-purple-500 focus:border-purple-500 ${className} ${selectedValue ? "text-black" : "text-gray-500"}`}
      style={{
        backgroundImage: selectedOption?.flag ? `url("${selectedOption.flag}")` : 'none',
        backgroundPosition: '8px center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '20px 15px',
        paddingLeft: selectedOption?.flag ? '32px' : '8px'
      }}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="cursor-pointer"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};


export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHome, setIsHome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpReferenceId, setOtpReferenceId] = useState("");
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");
  const [currentReferenceId, setCurrentReferenceId] = useState('');

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phoneCode: "+94",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
    companyName: "",
    companyPhoneCode: "+94",
    companyPhoneNumber: "",
  });

  const countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' },
    { code: 'UK', dialCode: '+44', name: 'United Kingdom' },
    { code: 'US', dialCode: '+1', name: 'United States' }
  ];

  const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  };

  const countryOptions = countries.map(country => ({
    value: country.dialCode,
    label: `${country.dialCode} (${country.name})`,
    flag: getFlagUrl(country.code)
  }));



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    let processedValue = value;

    // Block leading spaces for all input fields
    if (type !== "checkbox" && value.startsWith(" ")) {
      return;
    }

    // Special handling for firstName and lastName
    if (name === "firstName" || name === "lastName") {
      // Block numbers and special characters, allow only letters and spaces
      const letterOnlyValue = value.replace(/[^A-Za-z\s]/g, "");

      // Capitalize first letter of each word
      processedValue = letterOnlyValue
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }

    // Special handling for phone numbers - allow only digits
    if (name === "phoneNumber" || name === "companyPhoneNumber") {
      processedValue = value.replace(/[^\d]/g, "");
    }

    // Special handling for company name - block leading spaces but allow other characters
    if (name === "companyName") {
      if (value.startsWith(" ")) {
        return;
      }
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    if (name === "password") {
      checkPasswordLive(processedValue);
    }
  };


  const checkPasswordLive = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    setIsPasswordValid(passwordRegex.test(password));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title) newErrors.title = "Title is required";

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters and spaces";
    } else if (formData.firstName !== formData.firstName.trim()) {
      newErrors.firstName = "First name cannot begin or end with a space";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters and spaces";
    } else if (formData.lastName !== formData.lastName.trim()) {
      newErrors.lastName = "Last name cannot begin or end with a space";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = `Please enter a valid mobile number (format: ${formData.phoneCode}7XXXXXXXX)`;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email in the format: example@domain.com";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Add company validation for business buyers
    if (!isHome) {
      if (!formData.companyName) {
        newErrors.companyName = "Company name is required";
      }

      if (!formData.companyPhoneNumber) {
        newErrors.companyPhoneNumber = "Company phone number is required";
      } else if (!/^\d{9}$/.test(formData.companyPhoneNumber)) {
        newErrors.companyPhoneNumber = `Please enter a valid mobile number (format: ${formData.companyPhoneCode}7XXXXXXXX)`;
      }
    }

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must accept the terms and conditions";

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

      await verifyUserDetails(formData.email, formData.phoneNumber, formData.phoneCode);

      // If verification passes, proceed with OTP sending
      const res = await sendOTPInSignup(formData.phoneNumber, formData.phoneCode);
      setSuccess(`OTP code has been sent to ${formData.phoneCode}${formData.phoneNumber}`);
      setShowSuccessPopup(true);

      if (res && res.referenceId) {
        setOtpReferenceId(res.referenceId);
        setFullPhoneNumber(`${formData.phoneCode}${formData.phoneNumber}`);
        setShowOTPVerification(true);
      }
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";

      // Handle specific verification errors
      if (err.message) {
        errorMessage = err.message;
      } else if (err.type === "email_exists") {
        errorMessage = "This email address is already registered. Please use a different email or try logging in.";
      } else if (err.type === "phone_exists") {
        errorMessage = "This phone number is already registered. Please use a different phone number or try logging in.";
      } else {
        errorMessage = err.message || "Failed to process request. Please try again.";
      }

      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    setLoading(true);
    try {
      const response = await signup({
        ...formData,
        buyerType: isHome ? "Retail" : "Wholesale",
      });

      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = () => {
    setShowOTPVerification(false);
    // Clear any existing success messages before completing signup
    setSuccess(null);
    setShowSuccessPopup(false);
    completeSignup();
  };

  const handleOTPVerificationFailure = () => {
    setShowOTPVerification(false);
    setErrorMessage("OTP verification failed. Please try again.");
    setShowErrorPopup(true);
  };

  const handleOTPExpired = () => {
    setCurrentReferenceId(''); // Clear the reference ID
    console.log('OTP expired, reference ID cleared');
  };

  const handleOTPResend = (newReferenceId: string) => {
    setOtpReferenceId(newReferenceId);
  };

  const getInputClass = (fieldName: keyof FormErrors) => {
    return errors[fieldName]
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-purple-500 focus:border-purple-500";
  };

  if (showOTPVerification) {
    return (
      <OTPComponent
        phoneNumber={fullPhoneNumber}
        referenceId={otpReferenceId}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onVerificationFailure={handleOTPVerificationFailure}
        onResendOTP={handleOTPResend}
        onOTPExpired={handleOTPExpired}
      />
    );
  }

  return (
    <div className="flex w-full bg-gray-100 min-h-screen overflow-auto">
      <div className="flex min-w-full mx-auto shadow-lg rounded-lg bg-white overflow-auto">
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title={
            success
              ? "OTP Sent Successfully"
              : "Your account created successfully!"
          }
          description={success as any}
        />

        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />

        {/* Left side - Form */}
        <div className="w-full md:w-5/11 px-6 pt-8 md:px-10 md:pt-8">
          <h1 className="text-4xl font-bold text-[#3E206D] mb-4 text-center">
            MyFarm
          </h1>
          <h2 className="text-xl font-bold text-center md:text-left text-[#001535] mb-6">
            Create Your Account
          </h2>

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
              <span className="whitespace-nowrap text-xs md:text-base">
                I'm Buying for Home
              </span>
            </label>

            <label className="flex flex-nowrap text-[#3F3F3F] font-medium items-center justify-center w-1/2 border rounded-md px-4 py-2 cursor-pointer bg-white hover:text-[#3E206D]">
              <input
                type="radio"
                name="buyerType"
                checked={!isHome}
                onChange={() => setIsHome(false)}
                className="mr-2 h-4 w-4 accent-[#3E206D]"
              />
              <span className="whitespace-nowrap text-xs md:text-base">
                I'm Buying for Business
              </span>
            </label>
          </div>

          {isHome && (
            <div>
              <p className="text-[#4C5160] font-medium mb-6 text-center">
                Welcome! Select method to Signup:
              </p>

              <div className="flex space-x-3 mb-4 hover:text-[#3E206D]">
                <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-4 text-blue-600"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="#1877F2"
                    />
                  </svg>
                  Facebook
                </button>
              </div>

              <div className="flex items-center mt-10 mb-8">
                <div className="flex-grow border-t border-[#8D8D8D]"></div>
                <span className="px-4 text-sm text-gray-500">
                  or continue with email
                </span>
                <div className="flex-grow border-t border-[#8D8D8D]"></div>
              </div>
            </div>
          )}

          <div className="flex items-center mb-4">
            <div className="text-[#3E206D] mr-4 whitespace-nowrap">
              Personal Details
            </div>
            <div className="flex-grow border-t border-[#E2E2E2]"></div>
          </div>

          <div className="px-2 md:px-0 md:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex flex-row w-full md:w-1/2 space-x-2">
                  <div className="w-23 md:w-26">


                    <CustomDropdown
                      options={[
                        { value: "Rev", label: "Rev." },
                        { value: "Mr", label: "Mr." },
                        { value: "Mrs", label: "Mrs." },
                        { value: "Ms", label: "Ms." },
                      ]}
                      selectedValue={formData.title}
                      onSelect={(value) =>
                        handleChange({
                          target: { name: "title", value },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      placeholder="Title"
                      className="cursor-pointer"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="w-3/4 md:w-7/9">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        // Block numbers and special characters while typing
                        if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace") {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        // Allow paste but filter out invalid characters
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const filteredText = pastedText
                          .replace(/[^A-Za-z\s]/g, "")
                          .split(" ")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(" ");

                        handleChange({
                          target: { name: "firstName", value: filteredText }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      placeholder="First Name"
                      className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                        "firstName"
                      )}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      // Block numbers and special characters while typing
                      if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Allow paste but filter out invalid characters
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const filteredText = pastedText
                        .replace(/[^A-Za-z\s]/g, "")
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(" ");

                      handleChange({
                        target: { name: "lastName", value: filteredText }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="Last Name"
                    className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                      "lastName"
                    )}`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                <div className="flex flex-row w-full md:w-1/2 space-x-3">

                  <div className="w-23 md:w-26">
                    <CustomDropdown
                      options={countryOptions}
                      selectedValue={formData.phoneCode}
                      onSelect={(value) =>
                        handleChange({
                          target: { name: "phoneCode", value },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      placeholder="Code"
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="w-3/4 md:w-7/9">
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        // Allow only digits
                        if (!/[\d]/.test(e.key) && e.key !== "Backspace") {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        // Allow paste but filter out non-digits
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const filteredText = pastedText.replace(/[^\d]/g, "");

                        handleChange({
                          target: { name: "phoneNumber", value: filteredText }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      placeholder="7XXXXXXXX"
                      className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                        "phoneNumber"
                      )}`}
                      maxLength={9}
                    />

                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      // Block leading space
                      if (e.key === " " && formData.email.length === 0) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Email"
                    className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                      "email"
                    )}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
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
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                        "password"
                      )}`}
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-1/2 relative">
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onPaste={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      placeholder="Confirm Password"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                        "confirmPassword"
                      )}`}
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {!isPasswordValid && formData.password && (
                <div className="text-xs text-gray-600 pl-1 flex flex-row gap-2 md:flex-row items-start md:items-center">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mb-2 md:mb-0 md:mr-1">
                    <span className="text-xs text-[#ffffff]">i</span>
                  </div>
                  <div className="text-[#3E206D] text-xs md:text-sm">
                    Your password must contain a minimum of 6 characters with 1
                    Uppercase, Numbers & Special Characters.
                  </div>
                </div>
              )}

              {!isHome && (
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <div className="text-[#3E206D] mr-4 whitespace-nowrap">
                      Company Details
                    </div>
                    <div className="flex-grow border-t border-[#E2E2E2]"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                      <div className="w-full md:w-1/2">
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          onKeyPress={(e) => {
                            // Block leading space
                            if (e.key === " " && formData.companyName.length === 0) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="Company Name"
                          className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                            "companyName"
                          )}`}
                        />
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row w-full md:w-1/2 space-x-3">
                        <div className="w-23 md:w-26">
                          <CustomDropdown
                            options={countryOptions}
                            selectedValue={formData.companyPhoneCode}
                            onSelect={(value) =>
                              handleChange({
                                target: { name: "companyPhoneCode", value },
                              } as React.ChangeEvent<HTMLSelectElement>)
                            }
                            placeholder="Code"
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="w-3/4 md:w-7/9">
                          <input
                            type="text"
                            name="companyPhoneNumber"
                            value={formData.companyPhoneNumber}
                            onChange={handleChange}
                            onKeyPress={(e) => {
                              // Allow only digits
                              if (!/[\d]/.test(e.key) && e.key !== "Backspace") {
                                e.preventDefault();
                              }
                            }}
                            onPaste={(e) => {
                              // Allow paste but filter out non-digits
                              e.preventDefault();
                              const pastedText = e.clipboardData.getData('text');
                              const filteredText = pastedText.replace(/[^\d]/g, "");

                              handleChange({
                                target: { name: "companyPhoneNumber", value: filteredText }
                              } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            placeholder="7XXXXXXXX"
                            className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                              "companyPhoneNumber"
                            )}`}
                            maxLength={9}
                          />
                          {errors.companyPhoneNumber && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.companyPhoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col mt-8 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 accent-[#318831] cursor-pointer focus:ring-purple-500 border-gray-300 rounded ${errors.agreeToTerms ? "border-red-500" : ""
                      }`}
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-md text-[#777A7D]"
                  >
                    I agree to the Terms & Conditions
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-[#FF0000] ml-6">
                    {errors.agreeToTerms}
                  </p>
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
                <label
                  htmlFor="marketing"
                  className="ml-2 block text-md text-[#777A7D]"
                >
                  I would prefer receiving promotion E-mails
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-3/5 md:text-lg items-center justify-center bg-[#3E206D] text-[#FFFFFF] rounded-md py-2 hover:bg-purple-800 transition duration-200 mx-auto disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Register"
                )}
              </button>

              <p className="text-center text-md text-[#6B6B6B] mt-4 md:mt-2 mb-4 md:mb-0">
                Already have an account?{" "}
                <a href="../signin" className="text-[#094EE8] hover:underline">
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden md:block md:w-6/11 md:min-h-screen bg-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={LoginImg}
              alt="MyFarm Registration"
              fill
              className="object-cover"
              priority
            />


          </div>
        </div>
      </div>
    </div>
  );
}