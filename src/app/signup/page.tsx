"use client";
import React, { useState, FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  sendOTPInSignup,
  signup,
  verifyUserDetails,
} from "@/services/auth-service";
import { useRouter } from "next/navigation";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import OTPComponent from "@/components/otp-registration/OTPComponent";
import Image from "next/image";
import LoginImg from "../../../public/newbg.png";
import glogo from "../../../public/glogo.png";

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
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <div className="relative">
      {/* Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 cursor-pointer border-gray-300 focus:ring-purple-500 focus:border-purple-500 ${className} ${selectedValue ? "text-black" : "text-gray-500"} flex items-center justify-between bg-white`}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedOption?.flag && (
            <img
              src={selectedOption.flag}
              alt=""
              className="w-7 h-6 object-cover flex-shrink-0"
            />
          )}
          <span className="font-medium text-m mr-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-3 hover:bg-gray-100 flex items-center gap-2 transition-colors ${
                selectedValue === option.value
                  ? "bg-purple-50 text-purple-700 border-l-4 border-purple-700"
                  : "text-gray-900"
              }`}
            >
              {option.flag && (
                <img
                  src={option.flag}
                  alt=""
                  className="w-5 h-4 object-cover flex-shrink-0"
                />
              )}
              <span className="truncate font-medium text-m">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
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
  const [currentReferenceId, setCurrentReferenceId] = useState("");

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
    { code: "LK", dialCode: "+94", name: "Sri Lanka" },
    { code: "VN", dialCode: "+84", name: "Vietnam" },
    { code: "KH", dialCode: "+855", name: "Cambodia" },
    { code: "BD", dialCode: "+880", name: "Bangladesh" },
    { code: "IN", dialCode: "+91", name: "India" },
    { code: "NL", dialCode: "+31", name: "Netherlands" },
  ];

  const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  };

  const countryOptions = countries.map((country) => ({
    value: country.dialCode,
    label: country.dialCode,
    flag: getFlagUrl(country.code),
    countryName: country.name,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
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

    if (name === "email") {
      checkEmailLive(processedValue);
    }
  };

  const checkPasswordLive = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    setIsPasswordValid(passwordRegex.test(password));
  };

  const checkEmailLive = (email: string) => {
    if (!email) {
      return;
    }

    const trimmedEmail = email.trim();
    let errorMessage = "";

    // Check for specific invalid patterns with descriptive messages
    if (trimmedEmail.includes('..')) {
      errorMessage = "Email cannot contain consecutive dots (..)";
    } else if (trimmedEmail.startsWith('.')) {
      errorMessage = "Email cannot start with a dot (.)";
    } else if (trimmedEmail.includes('.@')) {
      errorMessage = "Email cannot have a dot (.) immediately before @";
    } else if (trimmedEmail.includes('@.')) {
      errorMessage = "Email cannot have a dot (.) immediately after @";
    } else if (trimmedEmail.endsWith('.')) {
      errorMessage = "Email cannot end with a dot (.)";
    } else if (/[!#$%^&*()+=\[\]{};':"\\|,<>\/?]/.test(trimmedEmail.split('@')[0])) {
      errorMessage = "Email contains invalid special characters";
    } else if (!trimmedEmail.includes('@')) {
      errorMessage = "Email must contain @ symbol";
    } else if (trimmedEmail.split('@').length > 2) {
      errorMessage = "Email can only contain one @ symbol";
    } else if (!trimmedEmail.includes('.', trimmedEmail.indexOf('@'))) {
      errorMessage = "Email domain must contain a dot (.)";
    } else {
      const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        errorMessage = "Please enter a valid email (e.g., example@domain.com)";
      }
    }

    if (errorMessage) {
      setErrors((prev) => ({
        ...prev,
        email: errorMessage
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
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
    } else {
      const email = formData.email.trim();
      let emailError = "";

      // Check for specific invalid patterns with descriptive messages
      if (email.includes('..')) {
        emailError = "Email cannot contain consecutive dots (..)";
      } else if (email.startsWith('.')) {
        emailError = "Email cannot start with a dot (.)";
      } else if (email.includes('.@')) {
        emailError = "Email cannot have a dot (.) immediately before @";
      } else if (email.includes('@.')) {
        emailError = "Email cannot have a dot (.) immediately after @";
      } else if (email.endsWith('.')) {
        emailError = "Email cannot end with a dot (.)";
      } else if (/[!#$%^&*()+=\[\]{};':"\\|,<>\/?]/.test(email.split('@')[0])) {
        emailError = "Email contains invalid special characters";
      } else if (!email.includes('@')) {
        emailError = "Email must contain @ symbol";
      } else if (email.split('@').length > 2) {
        emailError = "Email can only contain one @ symbol";
      } else if (!email.includes('.', email.indexOf('@'))) {
        emailError = "Email domain must contain a dot (.)";
      } else {
        const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          emailError = "Please enter a valid email (e.g., example@domain.com)";
        }
      }

      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
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
      await verifyUserDetails(
        formData.email,
        formData.phoneNumber,
        formData.phoneCode,
      );

      // If verification passes, proceed with OTP sending
      const res = await sendOTPInSignup(
        formData.phoneNumber,
        formData.phoneCode,
      );
      setSuccess(
        `OTP code has been sent to ${formData.phoneCode}${formData.phoneNumber}`,
      );
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
        errorMessage =
          "This email address is already registered. Please use a different email or try logging in.";
      } else if (err.type === "phone_exists") {
        errorMessage =
          "This phone number is already registered. Please use a different phone number or try logging in.";
      } else {
        errorMessage =
          err.message || "Failed to process request. Please try again.";
      }

      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (skipSuccessPopup: boolean = false) => {
    setLoading(true);
    try {
      const response = await signup({
        ...formData,
        buyerType: isHome ? "Retail" : "Wholesale",
      });

      if (skipSuccessPopup) {
        router.push("/signin");
      } else {
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    setLoading(true);
    
    try {
      await signup({
        ...formData,
        buyerType: isHome ? "Retail" : "Wholesale",
      });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setShowOTPVerification(false);
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
      throw err; 
    }
  };

  const handleOTPVerificationFailure = () => {
    setShowOTPVerification(false);
    setErrorMessage("OTP verification failed. Please try again.");
    setShowErrorPopup(true);
  };

  const handleOTPExpired = () => {
    setCurrentReferenceId(""); // Clear the reference ID
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
    <div className="flex lg:bg-gray-100 justify-center items-center w-full min-h-screen lg:py-10 lg:px-2">
      <div className="flex w-full lg:max-w-7xl">
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
          <div className="w-full lg:w-1/2 px-6 pt-8 sm:px-10 sm:p-8">
            <div className="flex justify-center mb-4">
              <Image
                src={glogo}
                alt="MyFarm Logo"
                width={150}
                height={60}
                className="object-contain"
                priority
              />
            </div>
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
                    <div className="w-42 md:w-42">
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
                        <p className="mt-1 text-sm text-red-600">
                          {errors.title}
                        </p>
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
                          if (
                            !/[A-Za-z\s]/.test(e.key) &&
                            e.key !== "Backspace"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          // Allow paste but filter out invalid characters
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          const filteredText = pastedText
                            .replace(/[^A-Za-z\s]/g, "")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(" ");

                          handleChange({
                            target: { name: "firstName", value: filteredText },
                          } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        placeholder="First Name"
                        className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                          "firstName",
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
                        if (
                          !/[A-Za-z\s]/.test(e.key) &&
                          e.key !== "Backspace"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        // Allow paste but filter out invalid characters
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData("text");
                        const filteredText = pastedText
                          .replace(/[^A-Za-z\s]/g, "")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase(),
                          )
                          .join(" ");

                        handleChange({
                          target: { name: "lastName", value: filteredText },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      placeholder="Last Name"
                      className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                        "lastName",
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
                    <div className="w-42 md:w-28">
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
                          const pastedText = e.clipboardData.getData("text");
                          const filteredText = pastedText.replace(/[^\d]/g, "");

                          handleChange({
                            target: {
                              name: "phoneNumber",
                              value: filteredText,
                            },
                          } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        placeholder="7XXXXXXXX"
                        className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                          "phoneNumber",
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
                        "email",
                      )}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
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
                          "password",
                        )}`}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
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
                          "confirmPassword",
                        )}`}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center mb-2 md:mb-0 md:mr-1">
                      <span className="text-xs text-[#ffffff] font-semibold">
                        i
                      </span>
                    </div>
                    <div className="text-[#3E206D] text-xs md:text-sm">
                      Your password must contain a minimum of 6 characters with
                      1 Uppercase, Numbers & Special Characters.
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
                              if (
                                e.key === " " &&
                                formData.companyName.length === 0
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="Company Name"
                            className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                              "companyName",
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
                                if (
                                  !/[\d]/.test(e.key) &&
                                  e.key !== "Backspace"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              onPaste={(e) => {
                                // Allow paste but filter out non-digits
                                e.preventDefault();
                                const pastedText =
                                  e.clipboardData.getData("text");
                                const filteredText = pastedText.replace(
                                  /[^\d]/g,
                                  "",
                                );

                                handleChange({
                                  target: {
                                    name: "companyPhoneNumber",
                                    value: filteredText,
                                  },
                                } as React.ChangeEvent<HTMLInputElement>);
                              }}
                              placeholder="7XXXXXXXX"
                              className={`h-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${getInputClass(
                                "companyPhoneNumber",
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
                      className={`h-4 w-4 accent-[#318831] cursor-pointer focus:ring-purple-500 border-gray-300 rounded ${
                        errors.agreeToTerms ? "border-red-500" : ""
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
                  <a
                    href="../signin"
                    className="text-[#094EE8] hover:underline"
                  >
                    Login here
                  </a>
                </p>
              </form>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/2 bg-purple-900 relative overflow-hidden">
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
    </div>
  );
}
