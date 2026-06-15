"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  GoogleLoginButton,
  FacebookLoginButton,
} from "react-social-login-buttons";
import { getCartInfo, login } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import LoginImg from "../../../public/newbg.png";
import Image from "next/image";
import glogo from "../../../public/glogo.png";

const Page = () => {
  const router = useRouter();
  const [userType, setUserType] = useState("Retail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load saved credentials from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else {
      const emailInput = email.trim();

      if (emailInput.includes("@")) {
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
          setEmailError("Enter a valid email address");
          valid = false;
        } else {
          setEmailError("");
        }
      } else if (emailInput.startsWith("+")) {
        if (!/^\+947\d{8}$/.test(emailInput)) {
          setEmailError("Enter the number in +947XXXXXXXX");
          valid = false;
        } else {
          setEmailError("");
        }
      } else {
        setEmailError(
          "Enter a valid email address or phone number in +947XXXXXXXX format",
        );
        valid = false;
      }
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    try {
      setIsLoading(true);
      const data = await login({ email, password, buyerType: userType });

      setShowSuccessPopup(true);

      // Store token and credentials
      if (data.token) {
        dispatch(
          setCredentials({
            token: data.token,
            user: data.userData,
            cart: data.userData.cart,
            tokenExpiration: data.tokenExpiration,
          }),
        );

        // Save credentials to localStorage if "Remember me" is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        // Updated routing logic based on firstTimeUser and buyerType
        if (data.userData.buyerType === "Retail") {
          // For retail users, check if it's their first time
          if (data.userData.firstTimeUser === 0) {
            router.push("/exclude/exclude"); // First-time retail user goes to exclude page
          } else {
            router.push("/"); // Returning retail user goes to home
          }
        } else if (data.userData.buyerType === "Wholesale") {
          // Wholesale users always go to wholesale home (no exclude list needed)
          router.push("/wholesale/home");
        }
      }
    } catch (err: any) {
      setShowErrorPopup(true);

      const message = err.message;

      if (message === "Wrong password." || message === "Incorrect password.") {
        // Password is wrong - highlight password field
        setPasswordError("Incorrect password. Please try again!");
        setEmailError(""); // Clear email error
      } else if (
        message === "User not found." ||
        message === "User not found or invalid account type." ||
        message === "Invalid buyer type."
      ) {
        // User not found - highlight email/phone field
        setEmailError("User not found. Please check your email/phone number!");
        setPasswordError(""); // Clear password error
      } else if (message === "Invalid email or phone number format.") {
        // Invalid format - highlight email/phone field
        setEmailError("Invalid email or phone number format!");
        setPasswordError(""); // Clear password error
      } else if (
        message ===
        "Account found but no password is set. Please contact support to set up your password."
      ) {
        // No password set - highlight email/phone field (account issue)
        setEmailError(
          "Account found but no password is set. Please contact support!",
        );
        setPasswordError(""); // Clear password error
      } else if (
        message === "This account is not authorized for marketplace access."
      ) {
        // Not authorized - highlight email/phone field
        setEmailError("This account is not authorized for marketplace access!");
        setPasswordError(""); // Clear password error
      } else {
        setEmailError("");
        setPasswordError("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex lg:bg-gray-100 justify-center items-center w-full min-h-screen lg:py-10 lg:px-2">
      <div className="flex w-full lg:max-w-7xl">
        <div className="flex min-w-full mx-auto lg:shadow-lg rounded-lg bg-white overflow-auto">
          <SuccessPopup
            isVisible={showSuccessPopup}
            onClose={() => setShowSuccessPopup(false)}
            title="Signed in!"
            description="Let's find something amazing today"
          />
          <ErrorPopup
            isVisible={showErrorPopup}
            onClose={() => setShowErrorPopup(false)}
            title="Oops!"
            description={
              passwordError
                ? "Incorrect password. Please try again!"
                : emailError
                  ? "Incorrect email/phone number, Please Try again"
                  : "User not found. Please check your credentials!"
            }
          />

          {/* Left Panel (Login Form) */}
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
              Log in to your Account
            </h2>
            {/* Buyer Type Toggle - Updated for better mobile responsiveness */}
            <div className="flex mb-6 space-x-2">
              <button
                onClick={() => setUserType("Retail")}
                className={`flex-1 px-2 sm:px-4 py-2 border rounded-md flex items-center justify-start space-x-1 sm:space-x-2 text-xs sm:text-sm cursor-pointer ${
                  userType === "Retail"
                    ? "bg-purple-100 text-purple-800 border-purple-500"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <span
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    userType === "Retail"
                      ? "border-purple-800"
                      : "border-gray-400"
                  }`}
                >
                  {userType === "Retail" && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-800 rounded-full" />
                  )}
                </span>
                <span className="text-left leading-tight">
                  I'm Buying for Home
                </span>
              </button>

              <button
                onClick={() => setUserType("Wholesale")}
                className={`flex-1 px-2 sm:px-4 py-2 border rounded-md flex items-center justify-start space-x-1 sm:space-x-2 text-xs sm:text-sm cursor-pointer ${
                  userType === "Wholesale"
                    ? "bg-purple-100 text-purple-800 border-purple-500"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <span
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    userType === "Wholesale"
                      ? "border-purple-800"
                      : "border-gray-400"
                  }`}
                >
                  {userType === "Wholesale" && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-800 rounded-full" />
                  )}
                </span>
                <span className="text-left leading-tight">
                  I'm Buying for Business
                </span>
              </button>
            </div>

            {userType === "Retail" && (
              <div className="flex items-center mb-6">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="mx-2 text-sm text-gray-400">
                  continue with email
                </span>
                <div className="flex-grow h-px bg-gray-300" />
              </div>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="Email / Phone Number (e.g. +947XXXXXXXX)"
                  className={`w-full px-10 py-2 border rounded-md text-xs sm:text-base ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={email}
                  onChange={(e) => {
                    // Automatically trim leading spaces
                    const trimmedValue = e.target.value.replace(/^\s+/, "");
                    setEmail(trimmedValue);
                    setEmailError("");
                  }}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                {emailError && (
                  <p className="text-sm text-red-600 mt-1">{emailError}</p>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`w-full px-10 py-2 border rounded-md text-xs sm:text-base ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => {
                    // Automatically trim leading spaces
                    const trimmedValue = e.target.value.replace(/^\s+/, "");
                    setPassword(trimmedValue);
                    setPasswordError("");
                  }}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="w-5 h-5 cursor-pointer"
                  />
                </button>
                {passwordError && (
                  <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="accent-[#229e11] cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forget-password"
                  className="text-[#094EE8] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3E206D] text-white py-2 rounded-md mt-4 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="mt-4 text-sm text-center">
              Don’t have an account?{" "}
              <a href="../signup" className="text-[#094EE8] hover:underline">
                Create an account
              </a>
            </p>
          </div>

          {/* Right Panel (Image) - Hidden on small screens */}
          <div className="hidden lg:block lg:w-1/2 bg-purple-900 relative overflow-hidden">
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
};

export default Page;
