"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Roboto } from "next/font/google";
import { resetPasswordByPhone } from "@/services/auth-service";
import SuccessPopup from "@/components/toast-messages/success-message";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const PASSWORD_RULES_TEXT =
  "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const FEATURES = [
  { id: 1, label: "Keep delivery details handy", Icon: MapPin },
  { id: 2, label: "Find your usuals, a little faster", Icon: ShoppingBag },
  { id: 3, label: "Follow your next delivery", Icon: Truck },
];

const inputClass = `${roboto.className} h-[48px] w-full rounded-full border border-[#DDD6FE] bg-[#FAF9FF] px-6 text-[15px] text-[#111827] outline-none transition placeholder:text-[#6B7280] focus:border-[#FF6232] focus:ring-4 focus:ring-[#FF6232]/20 md:h-[52px]`;

const labelClass = `${roboto.className} mb-2 block text-[13px] font-semibold text-[#111827]`;

interface ResetPasswordProps {
  /** Called by "Back to Log in". Defaults to routing to /signin. */
  onBack?: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const canSubmit = !!newPassword && !!confirmPassword && !submitting;

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Get phone number saved by the OTP step
  useEffect(() => {
    const storedPhone = localStorage.getItem("otpPhoneOnly");
    if (!storedPhone) {
      setError(
        "Phone number not found. Please restart the password reset process.",
      );
    } else {
      setPhoneNumber(storedPhone);
    }
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else router.push("/signin");
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;

    if (!phoneNumber) {
      setError("Phone number not found");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("Please re-enter your password");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      setError(PASSWORD_RULES_TEXT);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await resetPasswordByPhone(phoneNumber, newPassword);

      // Clear stored phone number after successful reset
      localStorage.removeItem("otpPhoneOnly");

      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      const message = err?.message || "Failed to reset password";
      const lower = message.toLowerCase();

      if (
        lower.includes("same") ||
        lower.includes("current password") ||
        lower.includes("old password")
      ) {
        setError(
          "New password cannot be the same as your current password. Please choose a different password.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 md:px-6 md:py-4"
      style={{ zIndex: 2147483000 }}
      role="dialog"
      aria-modal="true"
      aria-label="Set a new password"
    >
      <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:min-h-[620px] md:max-h-[calc(100vh-2rem)] md:max-w-[1040px] md:flex-row md:overflow-hidden md:rounded-[28px] md:shadow-2xl">
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

          {/* Form */}
          <form
            onSubmit={handleResetPassword}
            className="flex-1 pb-6 pt-6 md:pb-0"
          >
            <h1
              className={`${roboto.className} text-[30px] font-bold leading-tight tracking-tight text-[#111827] md:text-[34px]`}
            >
              Set a new password
            </h1>

            <p
              className={`${roboto.className} mt-2 text-[14px] text-[#4B5563] md:text-base`}
            >
              Choose a strong password to protect your Polygon Account.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="rp-new-password" className={labelClass}>
                  Enter New Password
                </label>
                <input
                  id="rp-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  placeholder="Type Here"
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="rp-confirm-password" className={labelClass}>
                  Re-enter New Password
                </label>
                <input
                  id="rp-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  placeholder="Type Here"
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Rules / error box */}
            <div
              className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
                error
                  ? "border-[#DC2626]/50 bg-[#FEF2F2]"
                  : "border-[#FF6232]/50 bg-[#FFF5F2]"
              }`}
              role={error ? "alert" : undefined}
            >
              <span
                className={`mt-[7px] h-2 w-2 flex-shrink-0 rounded-full ${
                  error ? "bg-[#DC2626]" : "bg-[#FF6232]"
                }`}
              />
              <p
                className={`${roboto.className} text-[13px] leading-relaxed ${
                  error ? "text-[#B91C1C]" : "text-[#111827]"
                }`}
              >
                {error ?? PASSWORD_RULES_TEXT}
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`${roboto.className} mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF6232] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(255,98,50,0.3)] transition-all hover:bg-[#e8561f] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8] disabled:shadow-none md:h-[56px] md:text-[17px]`}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password &amp; Go to Log in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Password Updated!"
        description="Your password has been updated successfully. You will be redirected to the login page shortly. Enjoy your shopping!"
      />
    </div>,
    document.body,
  );
};

export default ResetPassword;