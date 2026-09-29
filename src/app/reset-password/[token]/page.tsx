"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { resetPassword, validateResetToken } from "@/services/auth-service";
import wrongImg from "../../../../public/images/wrong.png";
import resetImg from "../../../../public/images/resetPasswordImg.png";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const token = (params?.token as string) || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!token) {
          throw new Error("No token provided");
        }

        const validation = await validateResetToken(token);
        if (validation.success) {
          setIsTokenValid(true);
        } else {
          throw new Error(validation.message || "Invalid token");
        }
      } catch (err: any) {
        // The full-page invalid token screen displays this message
        setErrorMessage(err?.message || "Invalid or expired token");
        setIsTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetPassword = async () => {
    if (!isTokenValid) {
      showError("Invalid reset token");
      return;
    }

    if (!newPassword.trim() && !confirmPassword.trim()) {
      showError("All fields are required");
      return;
    }

    if (!newPassword.trim()) {
      showError("Please enter a new password");
      return;
    }

    if (!confirmPassword.trim()) {
      showError("Please re-enter your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      showError(
        "Password must contain at least 6 characters with 1 uppercase, number, and special character",
      );
      return;
    }

    try {
      await resetPassword(token, newPassword);

      setShowSuccessPopup(true);

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      const message = err?.message || "Failed to reset password";
      const lower = message.toLowerCase();

      if (
        lower.includes("expired") ||
        lower.includes("invalid") ||
        lower.includes("token")
      ) {
        // Switch to the full-page invalid token screen
        setErrorMessage(
          "Your password reset link has expired or is invalid. Please request a new password reset link.",
        );
        setIsTokenValid(false);
      } else if (
        lower.includes("same") ||
        lower.includes("current password") ||
        lower.includes("old password")
      ) {
        showError(
          "New password cannot be the same as your current password. Please choose a different password.",
        );
      } else {
        showError(message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl text-center w-full max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative">
              <Image
                src={wrongImg}
                alt="Error"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            {errorMessage}
          </p>
          <button
            onClick={() => router.push("/forget-password")}
            className="px-4 sm:px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-sm sm:text-base"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 justify-center items-center w-full min-h-screen p-4">
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Password Updated!"
        description="Your password has been updated successfully. You will be redirected to the login page shortly. Enjoy your shopping!"
      />

      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error!"
        description={errorMessage}
      />

      <div className="flex w-full max-w-6xl">
        <div className="flex min-w-full mx-auto bg-white rounded-lg overflow-hidden flex-col md:flex-row">
          {/* Left Illustration - Visible on mobile with increased size */}
          <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-8 bg-white">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 relative mx-auto">
              <Image
                src={resetImg}
                alt="Reset password illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 flex justify-center items-center p-6 sm:p-8 md:p-10">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Reset Password
                </h1>
              </div>

              <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                Please enter your new password below and confirm it to complete
                the reset.
              </p>

              <div className="mb-4 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="mb-4 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/\s/.test(value)) return;
                    setConfirmPassword(value);
                  }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <div
                className="text-left text-xs sm:text-sm mb-6 flex items-start gap-2 p-3 rounded-lg"
                style={{ color: "#3E206D" }}
              >
                <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mt-0.5">
                  i
                </span>
                <span>
                  Your password must contain a minimum of 6 characters with 1
                  Uppercase, Numbers & Special characters.
                </span>
              </div>

              <button
                onClick={handleResetPassword}
                className="w-full py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors cursor-pointer text-sm sm:text-base font-medium"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;