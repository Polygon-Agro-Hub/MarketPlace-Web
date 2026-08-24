"use client";

import React, { useState, useEffect, useRef } from "react";
import { verifyOTP, sendOTPInSignup } from "@/services/auth-service";
import Image from "next/image";
import glogo from "../../../public/glogo.png";
import SuccessPopup from "@/components/toast-messages/success-message";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface OTPComponentProps {
  phoneNumber: string;
  phoneCode: string;        // ← add this
  referenceId: string;
  onVerificationSuccess: () => void;
  onVerificationFailure: () => void;
  onResendOTP: (newReferenceId: string) => void;
  onOTPExpired?: () => void;
  mode?: "phone" | "email";
  contactValue?: string;
  email?: string;
  initialTimer?: number;
}

export default function OTPComponent({
  phoneNumber,
  phoneCode,
  referenceId,
  onVerificationSuccess,
  onVerificationFailure,
  onResendOTP,
  onOTPExpired,
  mode = "phone",
  contactValue,
  email,
  initialTimer = 60,
}: OTPComponentProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(initialTimer);
  const [disabledResend, setDisabledResend] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isResendSuccess, setIsResendSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendSuccessPopup, setShowResendSuccessPopup] = useState(false);

  const isEmail = mode === "email";
  const displayContact = contactValue ?? phoneNumber;
  const isOtpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setDisabledResend(false);
      setIsOtpExpired(true);
      if (onOTPExpired) onOTPExpired();
    }
  }, [timer, onOTPExpired]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 4) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[idx] !== "") { newOtp[idx] = ""; setOtp(newOtp); return; }
      if (idx > 0) { newOtp[idx - 1] = ""; setOtp(newOtp); inputsRef.current[idx - 1]?.focus(); }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (digits.length > 0) {
      const newOtp = Array(5).fill("").map((_, i) => digits[i] ?? "");
      setOtp(newOtp);
      inputsRef.current[Math.min(digits.length, 4)]?.focus();
    }
  };

  const handleVerify = async () => {
    if (isVerifying) return;
    const code = otp.join("");
    if (code.length !== 5) { setIsError(true); setModalMessage("Please enter all 5 digits."); setIsModalOpen(true); return; }
    if (isOtpExpired || !referenceId) { setIsError(true); setModalMessage("OTP has expired. Please request a new one."); setIsModalOpen(true); return; }
    setIsVerifying(true);
    try {
      const response = await verifyOTP(code, referenceId);
      const { statusCode } = response;
      if (statusCode === "1000") {
        setIsVerified(true); setIsError(false);
        try {
          await onVerificationSuccess();
          setShowSuccessPopup(true);
          setTimeout(() => { setShowSuccessPopup(false); router.push("/signin"); }, 3000);
        } catch { setIsError(true); setModalMessage("Account creation failed. Please try again."); setIsModalOpen(true); }
      } else if (statusCode === "1001") {
        setIsError(true); setModalMessage("This OTP is Invalid. Please enter correct OTP."); setIsModalOpen(true);
      } else if (statusCode === "1002" || statusCode === "1003") {
        setIsOtpExpired(true); setIsError(true); setModalMessage("OTP has expired. Please request a new one."); setIsModalOpen(true);
      } else { setIsError(true); setModalMessage("Something went wrong. Please try again."); setIsModalOpen(true); }
    } catch (error: any) {
      if (error.message?.toLowerCase().includes("expired")) { setIsOtpExpired(true); setIsError(true); setModalMessage("OTP has expired. Please request a new one."); }
      else { setIsError(true); setModalMessage("Failed to verify OTP. Try again later."); }
      setIsModalOpen(true);
    } finally { setIsVerifying(false); }
  };

  const handleResendOTP = async () => {
    if (disabledResend || isResending) return;
    setIsResending(true);
    try {
      const phone = phoneNumber.substring(phoneCode.length);
      const res = await sendOTPInSignup(phone, phoneCode, { email });
      if (res.referenceId) {
        onResendOTP(res.referenceId);
        setTimer(initialTimer); setDisabledResend(true); setIsOtpExpired(false);
        setOtp(["", "", "", "", ""]);
        setShowResendSuccessPopup(true);
        inputsRef.current[0]?.focus();
      } else { throw new Error(`Failed to resend ${isEmail ? "email" : "OTP"}`); }
    } catch (error: any) {
      setIsError(true);
      setModalMessage(error.message || `Failed to resend ${isEmail ? "email" : "OTP"}`);
      setIsModalOpen(true);
    } finally { setIsResending(false); }
  };

  const timerText = `${Math.floor(timer / 60)} : ${String(timer % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEEEF5] px-4 py-8">

      {/* ── Card ── */}
      <div className="bg-white rounded-3xl w-full max-w-[480px] flex flex-col items-stretch
                      px-6 py-8
                      sm:px-10 sm:py-12">

        {/* Logo */}
        <div className="flex justify-center mb-5 sm:mb-7">
          <Image src={glogo} alt="GoViMart Logo" width={130} height={50} className="object-contain" priority />
        </div>

        {/* Title — single line on all sizes */}
        <h2
          className="w-full text-center mb-2 whitespace-nowrap
                     text-[17px] sm:text-[20px]"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#001535",
            lineHeight: "100%",
            letterSpacing: "0.05em",
          }}
        >
          {isEmail ? "Verify your email" : "Verify your mobile number"}
        </h2>

        {/* Subtitle */}
        <p className="w-full text-center text-gray-500 mb-4 text-[12px] sm:text-[13px]">
          We've sent a 5-digit verification code to :
        </p>

        {/* Contact pill */}
        <div className="self-center flex items-center gap-2 bg-gray-100 rounded-full
                        px-4 py-1.5 sm:px-5 sm:py-2 mb-5 sm:mb-6">
          {isEmail ? (
            <svg className="w-[14px] h-[14px] text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          ) : (
            <svg className="w-[14px] h-[14px] text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.59 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z" />
            </svg>
          )}
          <span className="text-[12px] sm:text-[13px] font-semibold text-gray-700">{displayContact}</span>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2 sm:gap-3 mb-5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              placeholder="—"
              disabled={isOtpExpired}
              className={[
                /* square — flex-1 makes width equal, aspect-square makes height = width */
                "flex-1 min-w-0 aspect-square max-h-[56px] sm:max-h-[60px]",
                "border-[1.5px] rounded-xl sm:rounded-2xl",
                "text-center text-[18px] sm:text-[22px] font-semibold text-gray-900",
                "outline-none transition-colors duration-150",
                "placeholder:text-gray-300 placeholder:text-[14px] sm:placeholder:text-[16px]",
                isOtpExpired
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 bg-white focus:border-[#3E206D] focus:border-2",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Expired banner */}
        {isOtpExpired && (
          <div className="flex items-center gap-3 bg-[#FFF4E8] border border-[#FFF4E8] rounded-xl px-3.5 py-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#FFE0B8] flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-[#EC6821]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-[#4C5160] font-semibold">Code Expired!</span>
              <span className="text-[12px] font-regular text-[#4C5160] leading-snug">
                Your verification code has expired.Please request a new code to continue.
              </span>
            </div>
          </div>
        )}

        {/* Email hint banner */}
        {isEmail && !isOtpExpired && (
          <div className="flex items-center gap-3 bg-[#F6F3FF] rounded-xl px-3.5 py-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#DFD7FB] flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-[#3E206D]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] sm:text-[13px] font-bold text-[#4C5160]">Can't find the email?</span>
              <span className="text-[12px] sm:text-[12px] text-[#4C5160] leading-snug">
                Please check your spam, junk or promotions folder.
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] sm:text-[12px] text-gray-400 whitespace-nowrap">
            {isEmail ? "Didn't receive the email ?" : "Didn't receive the code ?"}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <RotateCw style={{ width: 15, height: 15, color: "#4715C7", flexShrink: 0, fontWeight: "bold" }} />
          <button
            onClick={handleResendOTP}
            disabled={disabledResend || isResending}
            className={`text-[13px] bg-transparent border-none p-0 font-bold leading-none ${disabledResend || isResending
                ? "text-gray-500 cursor-not-allowed"
                : "text-[#4715C7] font-bold underline cursor-pointer"
              }`}
          >
            {isResending ? (
              "Sending..."
            ) : disabledResend ? (
              <>
                {isEmail ? "Resend Email" : "Resend SMS"} in{" "}
                <span className="text-[#4715C7] font-semibold">{timerText}</span>
              </>
            ) : (
              isEmail ? "Resend Email" : "Resend SMS"
            )}
          </button>
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || isOtpExpired || !isOtpComplete || isVerified}
          className={`w-full h-[48px] sm:h-[52px] rounded-xl text-[14px] sm:text-[15px] font-bold transition-colors ${isVerifying || isOtpExpired || !isOtpComplete || isVerified
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-[#3E206D] text-white hover:bg-[#2D1650] cursor-pointer"
            }`}
        >
          {isVerifying ? "Verifying..." : isVerified ? "Verified ✓" : "Verify"}
        </button>

        {/* Back link */}
        <button
          onClick={onVerificationFailure}
          className="text-[#3E206D] font-bold mt-4 text-[13px] sm:text-[14px] cursor-pointer hover:underline self-center"
        >
          Back to Registration
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl text-center w-full max-w-sm shadow-xl">
            <div className="flex justify-center mb-4">
              {isError ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6L18 18" />
                  </svg>
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">
              {isError ? "Error" : isResendSuccess ? "Success" : "OTP Verified"}
            </h2>
            <p className="text-gray-500 mb-6 text-[13px] sm:text-[14px]">{modalMessage}</p>
            <button
              onClick={() => { setIsModalOpen(false); setIsResendSuccess(false); }}
              className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-700 font-medium text-[14px]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => { setShowSuccessPopup(false); router.push("/signin"); }}
        title="OTP Verified Successfully!"
        description="Your account has been created."
        duration={3000}
      />

      <SuccessPopup
        isVisible={showResendSuccessPopup}
        onClose={() => setShowResendSuccessPopup(false)}
        title={isEmail ? "Email Resent!" : "OTP Resent!"}
        description={`A new ${isEmail ? "email" : "OTP"} has been sent to your ${isEmail ? "email address" : "phone number"}.`}
        duration={3000}
      />
    </div>
  );
}