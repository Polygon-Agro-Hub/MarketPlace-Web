"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { sendOTPInSignup, verifyOTP } from "@/services/auth-service";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const OTP_LENGTH = 5;

interface OtpMainComponentProps {
  phoneNumber: string;
  phoneCode: string;
  email: string;
  referenceId: string;
  mode: "phone" | "email";
  contactValue: string;
  initialTimer: number;
  onBack: () => void;
  onVerificationSuccess: () => Promise<void> | void;
  onVerificationFailure?: () => void;
  onResendOTP: (newReferenceId: string) => void;
  onOTPExpired?: () => void;
  children?: React.ReactNode; // e.g. success / error popups
}

const FEATURES = [
  { id: 1, label: "Keep delivery details handy", Icon: MapPin },
  { id: 2, label: "Find your usuals, a little faster", Icon: ShoppingBag },
  { id: 3, label: "Follow your next delivery", Icon: Truck },
];

const formatTime = (s: number) => {
  const safe = Math.max(0, Number.isFinite(s) ? s : 0);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60,
  ).padStart(2, "0")}`;
};

const OtpMainComponent: React.FC<OtpMainComponentProps> = ({
  phoneNumber,
  phoneCode,
  email,
  referenceId,
  mode,
  contactValue,
  initialTimer,
  onBack,
  onVerificationSuccess,
  onVerificationFailure,
  onResendOTP,
  onOTPExpired,
  children,
}) => {
  const isEmail = mode === "email";

  // Fallbacks so the countdown and the number/email pill are never empty
  const startTime =
    Number.isFinite(initialTimer) && initialTimer > 0
      ? initialTimer
      : isEmail
        ? 240
        : 60;
  const displayContact =
    contactValue || (isEmail ? email : `${phoneCode}${phoneNumber}`) || "";

  const [mounted, setMounted] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(startTime);
  const [refId, setRefId] = useState(referenceId);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const expired = timeLeft <= 0;
  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH;

  useEffect(() => setMounted(true), []);

  // Keep the reference id in sync if the parent updates it
  useEffect(() => {
    if (referenceId) setRefId(referenceId);
  }, [referenceId]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (mounted) inputsRef.current[0]?.focus();
  }, [mounted]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      onOTPExpired?.();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "").slice(-1);
    setError(null);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    setError(null);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    if (!isComplete || expired || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      const response = await verifyOTP(code, refId);
      const statusCode = String(response?.statusCode ?? "");
      if (statusCode !== "1000") {
        if (statusCode === "1002" || statusCode === "1003") {
          setTimeLeft(0);
          throw new Error("Your verification code has expired.");
        }
        throw new Error(
          statusCode === "1001"
            ? "This code is invalid. Please check it and try again."
            : response?.message || "Unable to verify the code. Please try again.",
        );
      }

      await onVerificationSuccess();
    } catch (err: any) {
      setError(err?.message || "Invalid code. Please try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      onVerificationFailure?.();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setError(null);
    try {
      const res: any = await sendOTPInSignup(phoneNumber, phoneCode, { email });
      const newRef = res?.referenceId ?? res?.reference_id ?? "";
      if (newRef) {
        setRefId(newRef);
        onResendOTP(newRef);
      }
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeLeft(startTime);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 md:px-6 md:py-4"
      style={{ zIndex: 2147483000 }}
      role="dialog"
      aria-modal="true"
      aria-label="Verify your account"
    >
      <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:min-h-[700px] md:max-h-[calc(100vh-2rem)] md:max-w-[1040px] md:flex-row md:overflow-hidden md:rounded-[28px] md:shadow-2xl">
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

        {/* ===== Right OTP panel ===== */}
        <div className="relative order-1 flex shrink-0 flex-col px-5 pt-5 font-[Roboto,Inter,sans-serif] sm:px-8 md:order-2 md:min-h-0 md:min-w-0 md:flex-1 md:shrink md:overflow-y-auto md:pb-8 md:pt-8 lg:px-10">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563] transition hover:text-[#111827] focus:outline-none md:text-base"
            >
              <ArrowLeft size={18} />
              Back to registration
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

          {/* OTP form */}
          <div className="flex-1 pb-6 pt-8 md:pb-0">
            <h1 className={`${roboto.className} text-[30px] font-[700] leading-tight tracking-tight text-[#111827] md:text-[34px]`}>
              {isEmail
                ? "Verify your email address"
                : "Verify your mobile number"}
            </h1>

            <p className={`${roboto.className} mt-3 text-[14px] text-[#4B5563] md:text-base`}>
              We&apos;ve sent a 5-digit verification code via{" "}
              {isEmail ? "Email" : "SMS"} to:
            </p>

            <span className="mt-3 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-semibold text-[#111827] md:text-base">
              {displayContact}
            </span>

            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[#4B5563] md:text-sm">
              Enter 5-digit code
            </p>

            <div className="flex gap-2 md:gap-4">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  placeholder="-"
                  disabled={expired}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Digit ${i + 1}`}
                  className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-[#DDD6FE] bg-white text-center text-xl font-bold text-[#111827] caret-[#FF6B35] outline-none transition placeholder:text-[#111827] focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:placeholder:text-[#D1D5DB] md:h-[80px] md:rounded-[18px] md:text-2xl"
                />
              ))}
            </div>

            {(expired || error) && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FF6B35]/50 bg-[#FFF5F2] px-4 py-4 md:px-5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 fill-[#DC2626] text-white" />
                <div className="text-sm">
                  <p className="font-bold text-[#B91C1C]">
                    {expired ? "Code expired" : "Verification failed"}
                  </p>
                  <p className="mt-1 leading-relaxed text-[#DC2626]">
                    {expired
                      ? "Your 5-digit confirmation code has expired for security reasons. Please request a new code to continue."
                      : error}
                  </p>
                </div>
              </div>
            )}

            {expired ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#FF6B35] underline underline-offset-2 disabled:opacity-60 md:text-base"
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Resend Code
              </button>
            ) : (
              <div className="mt-5 flex items-center gap-2 text-sm text-[#4B5563] md:text-base">
                <Clock className="h-4 w-4" />
                <span>Resend code in</span>
                <span className="font-bold text-[#111827]">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={!isComplete || expired || verifying}
              className={`mt-6 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF6B35] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(255,107,53,0.3)] transition-all hover:bg-[#F25A22] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8] disabled:shadow-none md:h-[70px] md:text-xl ${
                expired ? "md:mt-7" : "md:mt-10"
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify &amp; Complete Registration
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>,
    document.body,
  );
};

export default OtpMainComponent;
