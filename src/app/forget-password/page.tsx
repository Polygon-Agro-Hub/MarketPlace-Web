"use client";

import React, { useState, useEffect, useRef } from "react";
import { sendResetEmail, sendOTP } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import Image from "next/image";
import reset from "../../../public/images/reset.png";
import success from "../../../public/images/correct.png";
import error from "../../../public/images/wrong.png";
import SuccessPopup from "@/components/toast-messages/success-message-with-button";

const Page = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "sms">("email");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [countryCode, setCountryCode] = useState("+94");
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const router = useRouter();

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);

  const countries = [
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (countdown > 0 && resetMethod === "email") {
        e.preventDefault();
        e.returnValue = "You have an active timer running. Are you sure you want to leave?";
        return "You have an active timer running. Are you sure you want to leave?";
      }
    };
    if (countdown > 0 && resetMethod === "email") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [countdown, resetMethod]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [countdown]);

  useEffect(() => {
    setIsEmailSent(false);
    setIsOTPSent(false);
    setIsSendingEmail(false);
    setIsSendingOTP(false);
    setCountdown(0);
    setIsResendDisabled(false);
    setEmailError("");
    setPhoneError("");
  }, [resetMethod]);

  const startResendTimer = () => {
    setIsResendDisabled(true);
    setCountdown(180);
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) return "Valid Mobile Number is required";
    const cleanedPhone = phone.replace(/\s+/g, "");
    if (cleanedPhone.startsWith("0")) return "Please enter your phone number in this format (e.g., 7XXXXXXXX)";
    if (cleanedPhone.length !== 9 || !/^\d{9}$/.test(cleanedPhone)) return "Phone number must be exactly 9 digits";
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
    setPhoneNumber(cleanedValue);
    if (phoneError) setPhoneError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleReset = async () => {
    try {
      if (resetMethod === "email") {
        const error = validateEmail(email);
        if (error) { setEmailError(error); return; }
        setIsSendingEmail(true);
        const res = await sendResetEmail(email);
        setModalMessage(res.message || "If an account exists, a password reset link has been sent.");
        if (
          res.message &&
          (res.message.includes("dont have a account with us") ||
            res.message.includes("do not have a account with us"))
        ) {
          setIsError(true);
          setIsEmailSent(false);
        } else {
          setIsEmailSent(true);
          setIsError(false);
          startResendTimer();
        }
        setIsModalOpen(true);
      } else {
        const error = validatePhoneNumber(phoneNumber);
        if (error) { setPhoneError(error); return; }
        const cleanedPhone = phoneNumber.replace(/\s+/g, "");
        if (cleanedPhone.startsWith("0")) {
          setPhoneError("Please enter your phone number in this format (e.g., 7XXXXXXXX)");
          return;
        }
        setIsSendingOTP(true);
        const res = await sendOTP(phoneNumber, countryCode);
        setModalMessage(`OTP code has been sent to ${countryCode}${phoneNumber}`);
        setIsOTPSent(true);
        if (res && res.referenceId) localStorage.setItem("otpReferenceId", res.referenceId);
        const fullPhoneNumber = countryCode + cleanedPhone;
        localStorage.setItem("otpPhoneOnly", cleanedPhone);
        localStorage.setItem("otpCountryCode", countryCode);
        setTimeout(() => { router.push("/otp"); }, 1000);
      }
    } catch (err: any) {
      setModalMessage(err.message || "Failed to send reset code");
      setIsError(true);
      setIsEmailSent(false);
      setIsModalOpen(true);
      console.error(err);
    } finally {
      setIsSendingEmail(false);
      setIsSendingOTP(false);
    }
  };

  const handleResendEmail = async () => {
    if (isResendDisabled || isSendingEmail) return;
    const error = validateEmail(email);
    if (error) { setEmailError(error); return; }
    try {
      setIsSendingEmail(true);
      const res = await sendResetEmail(email);
      if (
        res.message &&
        (res.message.includes("dont have a account with us") ||
          res.message.includes("do not have a account with us"))
      ) {
        setModalMessage(res.message);
        setIsError(true);
        setIsEmailSent(false);
      } else {
        setModalMessage(res.message || "Password reset link has been resent.");
        setIsError(false);
        startResendTimer();
      }
    } catch (err: any) {
      setModalMessage(err.message || "Failed to resend reset code");
      setIsError(true);
      setIsEmailSent(false);
      console.error(err);
    } finally {
      setIsSendingEmail(false);
      setIsModalOpen(true);
    }
  };

  const selectCountry = (dialCode: string) => {
    setCountryCode(dialCode);
    setIsCountryDropdownOpen(false);
  };

  const selectedCountry = countries.find((country) => country.dialCode === countryCode);

  const getSendButtonText = () => {
    if (resetMethod === "email") {
      if (isSendingEmail) return "Sending...";
      if (isEmailSent && isResendDisabled) return "Sent !";
      return "Send Password Reset Link";
    } else {
      if (isSendingOTP) return "Sending...";
      if (isOTPSent) return "Sent !";
      return "Send Password Reset OTP";
    }
  };

  const handleBackToLogin = () => {
    router.push("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative p-4">
      <div className="w-full max-w-6xl h-auto min-h-[90vh] md:h-[90vh] bg-white rounded-xl shadow-none md:shadow-lg flex flex-col md:flex-row overflow-hidden">

        {/* ── LEFT / TOP: Illustration ── */}
        <div className="relative w-full md:w-1/2 flex items-center justify-center bg-white p-4 md:p-8 order-1 md:order-1">
          <button
            onClick={handleBackToLogin}
            className="absolute top-2 left-2 z-10 md:top-4 md:left-4 flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-white border border-gray-300 rounded-[10px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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

          {/* mt-8 on mobile so image clears the back button; md:mt-0 restores desktop */}
          <Image
            src={reset}
            alt="Forgot password illustration"
            className="w-[55%] mt-8 md:mt-0 md:w-[70%] h-auto object-cover"
          />
        </div>

        {/* ── RIGHT / BOTTOM: Form ── */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-10 order-2 md:order-2 pt-2 md:pt-10">
          <div className="w-full max-w-md text-center">

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Forgot Password ?
            </h1>

            <p className="text-sm md:text-base text-gray-600 mb-4">
              Choose how you'd like to receive your password reset code:
            </p>

            {/* ── Radio options ──
                < sm  : full-width card with custom dot (matches screenshots)
                >= sm : original side-by-side native radio style               */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6 items-center justify-center">

              {/* Via Email */}
              <label
                className={`
                  flex items-center cursor-pointer border rounded-xl transition-colors
                  gap-3 w-full px-4 py-3
                  sm:gap-0 sm:space-x-2 sm:w-auto sm:rounded-md sm:p-3
                  ${resetMethod === "email" ? "border-[#3E206D]" : "border-gray-300"}
                `}
              >
                {/* Mobile custom dot — hidden on sm+ */}
                <span
                  className={`
                    flex sm:hidden w-5 h-5 rounded-full border-2 items-center justify-center flex-shrink-0
                    ${resetMethod === "email" ? "border-[#3E206D]" : "border-gray-400"}
                  `}
                >
                  {resetMethod === "email" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3E206D]" />
                  )}
                </span>
                {/* Desktop native radio — hidden on mobile */}
                <input
                  type="radio"
                  checked={resetMethod === "email"}
                  onChange={() => setResetMethod("email")}
                  className="hidden sm:block form-radio h-4 w-4 md:h-5 md:w-5 cursor-pointer accent-[#3E206D]"
                />
                <span className="text-sm md:text-base">Via Email</span>
              </label>

              {/* Via SMS */}
              <label
                className={`
                  flex items-center cursor-pointer border rounded-xl transition-colors
                  gap-3 w-full px-4 py-3
                  sm:gap-0 sm:space-x-2 sm:w-auto sm:rounded-md sm:p-3
                  ${resetMethod === "sms" ? "border-[#3E206D]" : "border-gray-300"}
                `}
              >
                <span
                  className={`
                    flex sm:hidden w-5 h-5 rounded-full border-2 items-center justify-center flex-shrink-0
                    ${resetMethod === "sms" ? "border-[#3E206D]" : "border-gray-400"}
                  `}
                >
                  {resetMethod === "sms" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3E206D]" />
                  )}
                </span>
                <input
                  type="radio"
                  checked={resetMethod === "sms"}
                  onChange={() => setResetMethod("sms")}
                  className="hidden sm:block form-radio h-4 w-4 md:h-5 md:w-5 cursor-pointer accent-[#3E206D]"
                />
                <span className="text-sm md:text-base">Via SMS</span>
              </label>
            </div>

            <p className="text-sm md:text-base text-gray-600 mb-4">
              Enter the {resetMethod === "email" ? "Email" : "Phone Number"} associated with your Email account.
            </p>

            {/* Email input */}
{resetMethod === "email" && (
  <div className="mb-6">
    <div className="w-full md:w-[80%] md:mx-auto">
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter Email Address"
        className={`
          w-full px-3 py-2.5 rounded-xl border text-sm
          md:px-4 md:py-3 md:rounded-md md:text-base
          focus:outline-none focus:ring-2 focus:ring-purple-600 transition
          ${emailError ? "border-red-500" : "border-gray-300"}
        `}
        disabled={isSendingEmail}
      />
      {emailError && (
        <p className="text-red-500 text-xs md:text-sm mt-1 text-left">{emailError}</p>
      )}
    </div>
  </div>
)}

{/* Phone input */}
{resetMethod === "sms" && (
  <div className="mb-6">
    <div className="w-full md:w-[80%] md:mx-auto">
      <div className="flex gap-2 sm:space-x-2">
        {/* Country Code Dropdown */}
        <div className="relative w-[30%] sm:w-2/5 md:w-1/3 flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className={`w-full h-full px-2 py-2.5 md:py-3 border rounded-xl md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 flex items-center justify-between bg-white cursor-pointer text-sm md:text-base ${
              phoneError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <span className="truncate flex items-center gap-1">
              {selectedCountry && (
                <>
                  <img
                    src={getFlagUrl(selectedCountry.code)}
                    alt={selectedCountry.name}
                    className="inline-block w-5 h-3.5 md:w-6 md:h-4"
                  />
                  <span className="text-xs md:text-sm font-medium">{selectedCountry.dialCode}</span>
                </>
              )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 md:h-4 md:w-4 ml-1 transition-transform flex-shrink-0 ${isCountryDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCountryDropdownOpen && (
            <div className="absolute z-10 mt-1 left-0 w-40 max-h-60 overflow-auto bg-white border border-gray-300 rounded-xl md:rounded-md shadow-lg">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => selectCountry(country.dialCode)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <img src={getFlagUrl(country.code)} alt={country.name} className="w-5 h-3.5 md:w-6 md:h-4 flex-shrink-0" />
                  <span className="font-medium flex-shrink-0">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="7XXXXXXXX"
            maxLength={9}
            className={`
              w-full px-3 py-2.5 rounded-xl border text-sm
              md:px-4 md:py-3 md:rounded-md md:text-base
              focus:outline-none focus:ring-2 focus:ring-purple-600 transition
              ${phoneError ? "border-red-500" : "border-gray-300"}
            `}
            required
          />
        </div>
      </div>
      {phoneError && (
        <p className="text-red-500 text-xs md:text-sm mt-1 text-left">{phoneError}</p>
      )}
    </div>
  </div>
)}

            {/* Submit button */}
            <button
              onClick={handleReset}
              className={`
                w-full py-3 rounded-xl text-sm font-semibold transition-colors mb-4
                md:w-[80%] md:rounded-xl md:text-base
                ${
                  (resetMethod === "email" && (isSendingEmail || isResendDisabled)) ||
                  (resetMethod === "sms" && isSendingOTP)
                    ? "bg-[#CEBAF4] text-[#3E206D] cursor-not-allowed"
                    : "bg-[#3E206D] hover:bg-purple-900 text-white cursor-pointer"
                }
              `}
              disabled={
                (resetMethod === "email" && (isSendingEmail || isResendDisabled)) ||
                (resetMethod === "sms" && isSendingOTP)
              }
            >
              {getSendButtonText()}
            </button>

            {/* Resend section */}
            {resetMethod === "email" && isEmailSent && (
              <div className="flex flex-col items-center space-y-2 mt-4">
                {isResendDisabled && (
                  <div className="text-gray-600 font-medium text-sm md:text-base">
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                    {String(countdown % 60).padStart(2, "0")}
                  </div>
                )}
                <button
                  onClick={handleResendEmail}
                  disabled={isResendDisabled || isSendingEmail}
                  className={`text-[#094EE8] hover:text-blue-800 underline text-sm md:text-base ${
                    isResendDisabled || isSendingEmail ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {isSendingEmail ? "Sending..." : "Resend again"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isVisible={isModalOpen && !isError}
        onClose={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        title={resetMethod === "email" ? "Email has been sent!" : "OTP Sent Successfully"}
        description={modalMessage}
        duration={0}
      />

      {/* Error Modal */}
      {isModalOpen && isError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-8 rounded-xl text-center w-full max-w-md shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 md:w-28 md:h-28">
                <div
                  className="absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out scale-100 opacity-100"
                  style={{ transformOrigin: "center", animationDelay: "0.2s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-white" viewBox="0 0 24 24" fill="none">
                    <path
                      className="opacity-100 transition-all duration-700 ease-out"
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeDasharray: "24", strokeDashoffset: "0", transitionDelay: "0.6s" }}
                    />
                  </svg>
                </div>
                <div
                  className="absolute inset-0 rounded-full bg-red-500 scale-125 opacity-0 transition-all duration-1000"
                  style={{ animationDelay: "0.8s" }}
                />
              </div>
            </div>
            <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Error</h2>
            <p className="text-gray-500 mb-4 text-sm md:text-base">{modalMessage}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 md:px-6 py-2 bg-[#F3F4F7] rounded hover:bg-gray-300 text-[#757E87] transition cursor-pointer text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;