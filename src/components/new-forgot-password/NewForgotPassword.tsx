"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Roboto } from "next/font/google";
import { sendResetEmail, sendOTP } from "@/services/auth-service";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import OtpMainComponent from "@/components/new-otp/OtpMainComponent"; // adjust path
import ResetPassword from "@/components/new-forgot-password/ResetPassword"; // adjust path

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const COUNTRIES = [
  { code: "LK", dialCode: "+94", name: "Sri Lanka" },
  { code: "VN", dialCode: "+84", name: "Vietnam" },
  { code: "KH", dialCode: "+855", name: "Cambodia" },
  { code: "BD", dialCode: "+880", name: "Bangladesh" },
  { code: "IN", dialCode: "+91", name: "India" },
  { code: "NL", dialCode: "+31", name: "Netherlands" },
];

const FEATURES = [
  { id: 1, label: "Keep delivery details handy", Icon: MapPin },
  { id: 2, label: "Find your usuals, a little faster", Icon: ShoppingBag },
  { id: 3, label: "Follow your next delivery", Icon: Truck },
];

const inputBase = `${roboto.className} h-[52px] w-full rounded-full border bg-[#FAF9FF] px-6 text-[15px] text-[#111827] outline-none transition placeholder:text-[#6B7280] focus:border-[#FF6232] focus:ring-4 focus:ring-[#FF6232]/20 disabled:opacity-60`;

const labelClass = `${roboto.className} mb-2 block text-[13px] font-semibold text-[#111827]`;

interface NewForgotPasswordProps {
  /** Called by "Back to Log in". Defaults to routing to /signin. */
  onBack?: () => void;
}

const NewForgotPassword: React.FC<NewForgotPasswordProps> = ({ onBack }) => {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "sms">("email");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);

  const [otpData, setOtpData] = useState<{
    referenceId: string;
    phone: string;
    dialCode: string;
  } | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Warn before leaving while the email timer is running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You have an active timer running. Are you sure you want to leave?";
      return e.returnValue;
    };
    if (countdown > 0 && resetMethod === "email") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [countdown, resetMethod]);

  // Resend countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Reset state when switching method
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

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email address";
    return "";
  };

  /** Splits "947XXXXXXXX" into { dialCode: "+94", local: "7XXXXXXXX" } */
  const parsePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return { error: "Valid Mobile Number is required" };
    const match = [...COUNTRIES]
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((c) => digits.startsWith(c.dialCode.replace("+", "")));
    if (!match)
      return {
        error:
          "Please enter your number with the country code (e.g., 947XXXXXXXX)",
      };
    const local = digits.slice(match.dialCode.length - 1);
    return { dialCode: match.dialCode, local };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(e.target.value.replace(/[^\d]/g, "").slice(0, 15));
    if (phoneError) setPhoneError("");
  };

  const handleReset = async () => {
    try {
      if (resetMethod === "email") {
        const err = validateEmail(email);
        if (err) {
          setEmailError(err);
          return;
        }
        setIsSendingEmail(true);
        const res = await sendResetEmail(email);
        setModalMessage(
          res.message ||
            "If an account exists, a password reset link has been sent.",
        );
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
        const parsed = parsePhone(phoneInput);
        if (parsed.error || !parsed.dialCode) {
          setPhoneError(parsed.error || "Valid Mobile Number is required");
          return;
        }
        if (parsed.dialCode !== "+94") {
          setModalMessage(
            'SMS OTP is available only for Sri Lankan phone numbers (+94). For overseas phone numbers, please use the "Via Email" option to receive your OTP.',
          );
          setIsError(true);
          setIsModalOpen(true);
          return;
        }
        const local = parsed.local || "";
        if (local.startsWith("0")) {
          setPhoneError(
            "Please enter your number in this format (e.g., 947XXXXXXXX)",
          );
          return;
        }
        if (!/^\d{9}$/.test(local)) {
          setPhoneError("Phone number must be 94 followed by exactly 9 digits");
          return;
        }

        setIsSendingOTP(true);
        const res = await sendOTP(local, parsed.dialCode);
        setIsOTPSent(true);
        if (res && res.referenceId)
          localStorage.setItem("otpReferenceId", res.referenceId);
        localStorage.setItem("otpPhoneOnly", local);
        localStorage.setItem("otpCountryCode", parsed.dialCode);
        setOtpData({
          referenceId: res?.referenceId ?? "",
          phone: local,
          dialCode: parsed.dialCode,
        });
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
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
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

  const handleBack = () => {
    if (onBack) onBack();
    else router.push("/signin");
  };

  const buttonDisabled =
    (resetMethod === "email" && (isSendingEmail || isResendDisabled)) ||
    (resetMethod === "sms" && (isSendingOTP || isOTPSent));

  const buttonText =
    resetMethod === "email"
      ? isSendingEmail
        ? "Sending..."
        : isEmailSent && isResendDisabled
          ? "Sent !"
          : "Send OTP"
      : isSendingOTP
        ? "Sending..."
        : isOTPSent
          ? "Sent !"
          : "Send OTP";

  const showArrow = buttonText === "Send OTP";

  // Keep these after all hooks
  if (showReset) return <ResetPassword onBack={onBack} />;

  if (otpData) {
    return (
      <OtpMainComponent
        phoneNumber={otpData.phone}
        phoneCode={otpData.dialCode}
        email=""
        referenceId={otpData.referenceId}
        mode="phone"
        contactValue={`${otpData.dialCode}${otpData.phone}`}
        initialTimer={60}
        backLabel="Back to forgot password"
        submitLabel="Verify OTP"
        onBack={() => {
          setOtpData(null);
          setIsOTPSent(false);
        }}
        resendRequest={async () => {
          const res: any = await sendOTP(otpData.phone, otpData.dialCode);
          const newRef = res?.referenceId ?? "";
          if (newRef) localStorage.setItem("otpReferenceId", newRef);
          return newRef;
        }}
        onResendOTP={(newRef) =>
          setOtpData((prev) => (prev ? { ...prev, referenceId: newRef } : prev))
        }
        onVerificationSuccess={() => {
          // otpPhoneOnly is kept because ResetPassword reads it
          localStorage.removeItem("otpReferenceId");
          localStorage.removeItem("otpCountryCode");
          setShowReset(true);
        }}
      />
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 md:px-6 md:py-4"
      style={{ zIndex: 2147483000 }}
      role="dialog"
      aria-modal="true"
      aria-label="Forgot password"
    >
      <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:min-h-[640px] md:max-h-[calc(100vh-2rem)] md:max-w-[1040px] md:flex-row md:overflow-hidden md:rounded-[28px] md:shadow-2xl">
        {/* ===== Left image panel ===== */}
        <div className="relative order-2 mx-5 mb-6 mt-6 h-[360px] shrink-0 overflow-hidden rounded-[28px] md:order-1 md:m-0 md:h-auto md:w-[46%] md:rounded-none">
          <Image
            src="/images/MobileResponsiveBg.png"
            alt="Fresh vegetables in a wooden crate"
            fill
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />
          <Image
            src="/images/AuthenticationBg.png"
            alt="Fresh vegetables in a wooden crate"
            fill
            sizes="480px"
            className="hidden object-cover md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B0B3A] via-[#2B0B3A]/75 to-transparent to-65%" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col px-6 pb-7 md:px-8 md:pb-9 lg:px-9">
            <h2 className="text-[24px] font-bold leading-[1.15] text-white md:hidden">
              A little ease.
              <br />
              Every day.
            </h2>
            <h2
              className="hidden text-[40px] font-medium leading-[1.1] text-white md:block"
              style={{
                fontFamily:
                  "'Playfair Display', Georgia, 'Times New Roman', serif",
              }}
            >
              A little ease.
              <br />
              Every day.
            </h2>

            <p className="mt-3 max-w-[340px] text-[13px] leading-relaxed text-white/80 md:mt-4 md:text-sm">
              A home for your orders, your delivery details and the next good
              meal.
            </p>

            <ul className="mt-4 flex flex-col gap-3 border-t border-white/20 pt-4 md:mt-6 md:gap-4 md:border-0 md:pt-0">
              {FEATURES.map(({ id, label, Icon }) => (
                <li
                  key={id}
                  className="flex items-center gap-3 text-[13px] text-white md:text-sm"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-white/90"
                    strokeWidth={1.75}
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== Right form panel ===== */}
        <div className="relative order-1 flex shrink-0 flex-col px-5 pt-5 sm:px-8 md:order-2 md:min-h-0 md:min-w-0 md:flex-1 md:shrink md:overflow-y-auto md:pb-8 md:pt-8 lg:px-10">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              onClick={handleBack}
              className={`${roboto.className} inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563] transition hover:text-[#111827] focus:outline-none md:text-base`}
            >
              <ArrowLeft size={18} />
              Back to Log in
            </button>
            <Image
              src="/images/POLYGON LOGO26.png"
              alt="Polygon"
              width={120}
              height={53}
              priority
              className="h-[40px] w-auto md:h-[46px]"
            />
          </div>

          <div className="border-t border-[#DDD6FE]" />

          <div className="flex-1 pb-6 pt-6 md:pb-0">
            <h1
              className={`${roboto.className} text-[30px] font-bold leading-tight tracking-tight text-[#111827] md:text-[34px]`}
            >
              Let&apos;s get you back in.
            </h1>

            <p
              className={`${roboto.className} mt-2 text-[14px] text-[#4B5563] md:text-base`}
            >
              Forgotten passwords happen. We&apos;ll help you get started again
              in seconds.
            </p>

            {/* Recovery method toggle */}
            <p
              className={`${roboto.className} mb-2 mt-5 text-[14px] font-medium text-[#4B5563]`}
            >
              Choose Recovery Method
            </p>
            <div
              className="grid grid-cols-2 rounded-full border border-[#374151] p-[4px]"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                aria-selected={resetMethod === "email"}
                onClick={() => setResetMethod("email")}
                className={`${roboto.className} flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors ${
                  resetMethod === "email"
                    ? "bg-[#111827] font-bold text-white"
                    : "text-[#4B5563]"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Via Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={resetMethod === "sms"}
                onClick={() => setResetMethod("sms")}
                className={`${roboto.className} flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors ${
                  resetMethod === "sms"
                    ? "bg-[#111827] font-bold text-white"
                    : "text-[#4B5563]"
                }`}
              >
                <MessageSquare
                  className="h-[18px] w-[18px]"
                  fill="currentColor"
                  strokeWidth={0}
                />
                Via SMS
              </button>
            </div>

            {/* Input */}
            <div className="mt-5">
              {resetMethod === "email" ? (
                <>
                  <label htmlFor="fp-email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    placeholder="Enter your email address"
                    disabled={isSendingEmail}
                    className={`${inputBase} ${
                      emailError ? "border-red-500" : "border-[#DDD6FE]"
                    }`}
                  />
                  {emailError && (
                    <p
                      className={`${roboto.className} mt-2 px-4 text-[12px] text-red-500`}
                    >
                      {emailError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label htmlFor="fp-phone" className={labelClass}>
                    Mobile Number
                  </label>
                  <input
                    id="fp-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    placeholder="Enter your Mobile Number (e.g. 947XXXXXXXX)"
                    disabled={isSendingOTP}
                    className={`${inputBase} ${
                      phoneError ? "border-red-500" : "border-[#DDD6FE]"
                    }`}
                  />
                  {phoneError && (
                    <p
                      className={`${roboto.className} mt-2 px-4 text-[12px] text-red-500`}
                    >
                      {phoneError}
                    </p>
                  )}
                </>
              )}
              <p
                className={`${roboto.className} mt-2 px-4 text-[12px] text-[#6B7280]`}
              >
                {resetMethod === "email"
                  ? "Use the email associated with your account."
                  : "Use the mobile number associated with your account."}
              </p>
            </div>

            {/* Info box */}
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FF6232]/50 bg-[#FFF5F2] px-4 py-3">
              <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-[#FF6232]" />
              <p
                className={`${roboto.className} text-[13px] leading-relaxed text-[#111827]`}
              >
                We&apos;ll send an OTP to verify your identity and reset your
                password.
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleReset}
              disabled={buttonDisabled}
              className={`${roboto.className} mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF6232] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(255,98,50,0.3)] transition-all hover:bg-[#e8561f] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8] disabled:shadow-none md:h-[56px] md:text-[17px]`}
            >
              {buttonText}
              {showArrow && <ArrowRight size={18} />}
            </button>

            {/* Resend (email only) */}
            {resetMethod === "email" && isEmailSent && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {isResendDisabled && (
                  <span
                    className={`${roboto.className} text-sm font-medium text-[#4B5563]`}
                  >
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                    {String(countdown % 60).padStart(2, "0")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResendDisabled || isSendingEmail}
                  className={`${roboto.className} text-sm font-semibold text-[#FF6232] underline underline-offset-2 ${
                    isResendDisabled || isSendingEmail
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  {isSendingEmail ? "Sending..." : "Resend again"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessPopup
        isVisible={isModalOpen && !isError}
        onClose={() => setIsModalOpen(false)}
        title={
          resetMethod === "email"
            ? "Email has been sent!"
            : "OTP Sent Successfully"
        }
        description={modalMessage}
        duration={0}
      />

      <ErrorPopup
        isVisible={isModalOpen && isError}
        onClose={() => setIsModalOpen(false)}
        title="Error!"
        description={modalMessage}
      />
    </div>,
    document.body,
  );
};

export default NewForgotPassword;
