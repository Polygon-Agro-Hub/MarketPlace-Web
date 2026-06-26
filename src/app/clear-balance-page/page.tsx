"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import walletIllustration from "../../../public/wallet-illustration.png";
import payNowIllustration from "../../../public/pay-now-illustration.png";
import { ShoppingCart , ReceiptText , Medal } from 'lucide-react';

export default function ClearBalancePage() {
  const router = useRouter();
  const cartState = useSelector((state: RootState) => state.auth.cart) || {
    creditBalance: 0,
  };

  const creditBalance = cartState.creditBalance ?? 0;

  useEffect(() => {
    if (creditBalance >= 0) {
      router.replace("/");
    }
  }, [creditBalance, router]);

  const handlePayNow = () => {
    router.push("/clear-balance/payment");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Breadcrumb */}
      <div className="px-4 sm:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <button
            onClick={() => router.push("/")}
            className="hover:text-gray-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-semibold">Clear Balance</span>
          <span className="text-gray-300">›</span>
          <span className="text-gray-400">Payment</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">

        {/* Wallet image — bigger */}
        <div className="mb-6">
          <Image
            src={walletIllustration}
            alt="Negative credit balance wallet"
            width={300}
            height={240}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-gray-800 mb-3 text-center">
          You have a{" "}
          <span style={{ color: "#FF0000" }}>negative credit balance</span>
        </h1>

        {/* Amount */}
        <p className="text-3xl font-bold mb-4" style={{ color: "#FF0000" }}>
          - Rs. {Math.abs(creditBalance).toFixed(2)}
        </p>

        {/* Description */}
        <p className="text-sm text-[#5B5B5B] text-center max-w-3xl mb-10 leading-relaxed">
          This amount is due to order return adjustments, handling fee and
          delivery charges, and increased delivery costs.
          <br className="hidden sm:block" />
          Please clear your balance to continue shopping.
        </p>

        {/* Why clear your balance — red tinted card */}
        <div
          className="w-full max-w-5xl mb-5 rounded-2xl px-4 sm:px-8 py-6 border border-[#FFC8C8]"
          style={{ backgroundColor: "#FFF1F1" }}
        >
          <h2
            className="text-base font-semibold text-center mb-6"
            style={{ color: "#D40000" }}
          >
            Why clear your balance?
          </h2>

          {/* Desktop: horizontal row | Mobile: vertical stack */}
          <div className="hidden sm:flex items-stretch">

            {/* Item 1 */}
            <div className="flex-1 flex flex-row items-center px-4 gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center border border-[#E08888] justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
               <ShoppingCart style={{ color: "#FF0000" }}/>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Shop without limits
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Clear your balance to add items to your cart.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                backgroundColor: "#D02124",
                margin: "0 4px",
                flexShrink: 0,
              }}
            />

            {/* Item 2 */}
            <div className="flex-1 flex flex-row items-center px-4 gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center border border-[#E08888] justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
               <ReceiptText style={{ color: "#FF0000" }}/>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Smooth Checkout
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enjoy a hassle-free checkout experience.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                backgroundColor: "#D02124",
                margin: "0 4px",
                flexShrink: 0,
              }}
            />

            {/* Item 3 */}
            <div className="flex-1 flex flex-row items-center px-4 gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center border border-[#E08888] justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
               <Medal style={{ color: "#FF0000" }}/>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Better Experience
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Keep your account in good standing and get the best service.
                </p>
              </div>
            </div>

          </div>

          {/* Mobile: vertical stack with horizontal dividers */}
          <div className="flex sm:hidden flex-col gap-0">

            {/* Item 1 */}
            <div className="flex flex-row items-center gap-3 py-3">
              <div
                className="w-11 h-11 rounded-full border border-[#E08888] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <ShoppingCart style={{ color: "#FF0000" }}/>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">
                  Shop without limits
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Clear your balance to add items to your cart.
                </p>
              </div>
            </div>

            {/* Horizontal divider */}
            <div style={{ height: "1px", backgroundColor: "#fca5a5" }} />

            {/* Item 2 */}
            <div className="flex flex-row items-center gap-3 py-3">
              <div
                className="w-11 h-11 rounded-full flex items-center border border-[#E08888] justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
               <ReceiptText style={{ color: "#FF0000" }}/>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">
                  Smooth Checkout
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enjoy a hassle-free checkout experience.
                </p>
              </div>
            </div>

            {/* Horizontal divider */}
            <div style={{ height: "1px", backgroundColor: "#fca5a5" }} />

            {/* Item 3 */}
            <div className="flex flex-row items-center gap-3 py-3">
              <div
                className="w-11 h-11 rounded-full border border-[#E08888] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF" }}
              >
              <Medal style={{ color: "#FF0000" }}/>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">
                  Better Experience
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Keep your account in good standing and get the best service.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Pay now card */}
        <div
          className="w-full max-w-5xl rounded-2xl px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
          style={{ border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}
        >

          {/* Pay now illustration image */}
          <div className="flex-shrink-0">
            <Image
              src={payNowIllustration}
              alt="Pay now illustration"
              width={110}
              height={88}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-black font-semibold text-base mb-1">
              Pay now to start your next order
            </p>
            <p className="text-[#323232] text-sm">
              Clear your negative credit balance securely using your card.
            </p>
          </div>

          {/* Button + card logos */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePayNow}
              className="font-semibold text-sm px-8 py-3 rounded-sm transition-colors whitespace-nowrap cursor-pointer text-white w-full sm:w-auto"
              style={{ backgroundColor: "#312e81" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = "#1e1b4b")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = "#312e81")
              }
            >
              Pay Now with Card
            </button>

            <div className="flex items-center gap-2">
              <div
                style={{
                  background: "#1a1f71",
                  borderRadius: 4,
                  padding: "3px 7px",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontWeight: 800,
                    fontStyle: "italic",
                    letterSpacing: 0.5,
                  }}
                >
                  VISA
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#eb001b",
                  }}
                />
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#f79e1b",
                    marginLeft: -7,
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}