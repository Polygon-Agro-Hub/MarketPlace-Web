"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { Lock, Calendar } from "lucide-react";
import walletIllustration from "../../../../public/wallet-illustration.png";
import { updateCreditBalance } from "@/services/auth-service";
import visaLogo from "../../../../public/icons/Visa-Logo.png";
import mastercardLogo from "../../../../public/icons/Master-Card.png";
import masterCardText from "../../../../public/icons/MasterCardText.png";
import checkMark from "../../../../public/un.png";
import { useDispatch } from "react-redux";
import { updateCreditBalance as setCreditBalanceInStore } from "@/store/slices/authSlice";

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth.token) as
    | string
    | null;
  const user = useSelector((state: RootState) => state.auth.user);
  const cartState = useSelector((state: RootState) => state.auth.cart) || {
    creditBalance: 0,
  };

  const creditBalance = cartState.creditBalance ?? 0;
  const amountToPay = Math.abs(creditBalance);

  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    cardNumber?: string;
    nameOnCard?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const formatCardNumberInput = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    return digitsOnly.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiryInput = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  };

  const validateFields = (): boolean => {
    const errors: typeof fieldErrors = {};

    const cardDigits = cardNumber.replace(/\s/g, "");
    if (!cardDigits) {
      errors.cardNumber = "Card number is required.";
    } else if (cardDigits.length !== 16) {
      errors.cardNumber = "Card number must be 16 digits.";
    }

    if (!nameOnCard.trim()) {
      errors.nameOnCard = "Name on card is required.";
    }

    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiry.trim()) {
      errors.expiry = "Expiration date is required.";
    } else if (!expiryMatch) {
      errors.expiry = "Use MM/YY format.";
    } else {
      const month = Number(expiryMatch[1]);
      const year = Number(expiryMatch[2]);
      if (month < 1 || month > 12) {
        errors.expiry = "Enter a valid month.";
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (
          year < currentYear ||
          (year === currentYear && month < currentMonth)
        ) {
          errors.expiry = "Card has expired.";
        }
      }
    }

    if (!cvv.trim()) {
      errors.cvv = "CVV is required.";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = "CVV must be 3 or 4 digits.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validateFields()) {
      return;
    }

    if (!token || !user?.id) {
      setErrorMessage("You need to be signed in to complete this payment.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      await updateCreditBalance(token, {
        id: user.id,
        creditBalance: amountToPay,
      });

      dispatch(setCreditBalanceInStore(amountToPay));

      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Something went wrong while processing your payment.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.replace("/");
  };

  return (
    <div className="bg-white pb-8 pl-4 sm:pl-6 pr-4 sm:pr-6">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-8 pt-7 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <button
            onClick={() => router.push("/")}
            className="hover:text-gray-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-gray-300">›</span>
          <button
            onClick={() => router.push("/clear-balance-page")}
            className="hover:text-gray-600 transition-colors cursor-pointer"
          >
            Clear Balance
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-semibold">Payment</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-8 pb-2 pt-5">
        <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl">
          {/* Left: Payment form card */}
          <div className="flex-1 w-full border border-[#CFCFCF] rounded-2xl px-6 sm:px-8 py-6">
            <h1 className="text-lg font-semibold text-gray-800 mb-2">
              Clear Credit Balance
            </h1>

            <p className="text-2xl font-bold mb-2" style={{ color: "#E94C12" }}>
              Rs. {formatPrice(amountToPay)}
            </p>

            <p className="text-sm text-[#5B5B5B] mb-4">
              You need to pay this amount to clear your negative credit balance.
            </p>

            <div className="border-t border-[#CFCFCF] mb-5" />

            {/* Card number */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumberInput(e.target.value))
                  }
                  placeholder="Enter Card Number"
                  inputMode="numeric"
                  className="w-full py-3 pl-4 pr-32 rounded-lg text-sm text-[#808FA2] placeholder-[#808FA2] bg-[#F2F4F7] focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div
                    style={{
                      background: "#424241",
                      borderRadius: 6,
                      padding: "10px 13px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src={visaLogo}
                        alt="Visa logo"
                        width={26}
                        height={26}
                      />
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#424241",
                      borderRadius: 6,
                      padding: "4px 6px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Image
                      src={mastercardLogo}
                      alt="Mastercard logo"
                      width={20}
                      height={20}
                    />
                    <Image
                      src={masterCardText}
                      alt="Mastercard text"
                      width={43}
                      height={43}
                    />
                  </div>
                </div>
              </div>
              {fieldErrors.cardNumber && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.cardNumber}
                </p>
              )}
            </div>

            {/* Name on card */}
            <div className="mb-3">
              <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                placeholder="Enter Name on Card"
                className="w-full py-3 px-4 rounded-lg text-sm text-[#808FA2] placeholder:text-[#808FA2] bg-[#F2F4F7] focus:outline-none"
              />
              {fieldErrors.nameOnCard && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.nameOnCard}
                </p>
              )}
            </div>

            {/* Expiry + CVV */}
            <div className="flex gap-3 mb-1">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(formatExpiryInput(e.target.value))
                    }
                    placeholder="Enter Expiration Date (MM/YY)"
                    inputMode="numeric"
                    className="w-full py-3 pl-4 pr-10 rounded-lg text-sm text-[#808FA2] placeholder:text-[#808FA2] bg-[#F2F4F7] focus:outline-none"
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808FA2]"
                  />
                </div>
                {fieldErrors.expiry && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.expiry}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="Enter CVV"
                  inputMode="numeric"
                  className="w-full py-3 px-4 rounded-lg text-sm text-[#808FA2] placeholder:text-[#808FA2] bg-[#F2F4F7] focus:outline-none"
                />
                {fieldErrors.cvv && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.cvv}</p>
                )}
              </div>
            </div>

            <div className="mb-6" />

            {errorMessage && (
              <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
            )}

            {/* Pay button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[#FFFFFF] text-sm font-medium transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#3E206D" }}
            >
              <Lock size={16} />
              {isProcessing
                ? "Processing..."
                : `Pay Rs. ${formatPrice(amountToPay)} Now`}
            </button>

            <p className="text-xs text-[#6C6C6C] mt-3 font-medium text-center px-2 leading-relaxed">
              <Lock
                size={12}
                className="inline-block align-middle mr-1 -mt-0.5"
              />
              By proceeding, you agree to our{" "}
              <a
                href="#"
                className="text-[#3E206D] hover:underline whitespace-nowrap"
              >
                Terms &amp; Conditions
              </a>
            </p>
          </div>

          {/* Right: Payment summary card */}
          <div className="w-full max-w-7xl lg:w-80 border border-[#CFCFCF] rounded-2xl px-6 py-6 flex-shrink-0">
            <h2 className="text-sm font-semibold text-[#212121] mb-4">
              Payment Summary
            </h2>

            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 border"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#FFC8C8" }}
            >
              <div className="rounded-full flex items-center justify-center flex-shrink-0">
                <Image
                  src={walletIllustration}
                  alt="Wallet"
                  width={70}
                  height={70}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div>
                <p className="text-xs text-[#3D4451]">Your Credit Balance</p>
                <p className="text-sm font-bold" style={{ color: "#FF0000" }}>
                  - Rs. {formatPrice(amountToPay)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#414347]">Amount to Pay</span>
              <span className="text-base font-bold text-[#212121]">
                Rs. {formatPrice(amountToPay)}
              </span>
            </div>

            <p className="text-xs text-[#5B5B5B] font-inter font-[400] leading-relaxed">
              Your outstanding balance is due to order return adjustments,
              handling fees, delivery charges, and increased delivery costs.
              Please settle the balance to continue shopping. Once the payment
              is successful, your account balance will be updated and any
              negative balance will be cleared.
            </p>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm px-8 py-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center mb-5">
              <Image
                src={checkMark}
                alt="Payment successful"
                width={96}
                height={96}
                style={{ objectFit: "contain" }}
              />
            </div>

            <h2 className="text-lg font-semibold text-[#000000] mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-[#8492A3] mb-6">
              Your payment has been completed successfully.
            </p>

            <button
              onClick={handleCloseSuccess}
              className="px-8 py-2 rounded-lg text-sm shadow shadow-md font-medium text-[#757E87] bg-[#F3F4F7] hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
