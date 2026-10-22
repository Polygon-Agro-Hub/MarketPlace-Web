"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Lottie } from "lottie-react";
import { History } from "lucide-react";
import { RootState } from "@/store";
import successAnimation from "@/assets/animations/payment-success.json";
import {
  consumeOrderSuccess,
  hasPendingOrderSuccess,
} from "@/utils/order-success";

const ORDERS_ROUTE = "/history/order";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [allowed, setAllowed] = useState(false);
  const leftRef = useRef(false);

  const homeUrl = user?.buyerType === "Wholesale" ? "/wholesale/home" : "/";

  // Only ever called from a click (user gesture), so the history entry
  // for this page is NOT skippable by Chrome's back-button intervention.
  const leave = useCallback(
    (to: string) => {
      if (leftRef.current) return;
      leftRef.current = true;
      // Keep the flag when going to order history so Back can show this
      // page again; clear it when leaving for anywhere else.
      if (to !== ORDERS_ROUTE) consumeOrderSuccess();
      router.push(to);
    },
    [router]
  );

  useEffect(() => {
    // Typed URL / stale visit: go to history without showing anything
    if (!hasPendingOrderSuccess()) {
      router.replace(ORDERS_ROUTE);
      return;
    }
    setAllowed(true);
  }, [router]);

  // Page restored from bfcache, or returned to via Back: allow re-click
  useEffect(() => {
    const onPageShow = () => {
      leftRef.current = false;
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (!allowed) return null;

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="h-[200px] w-[200px] sm:h-[220px] sm:w-[220px]">
        <Lottie src={successAnimation} loop={false} autoplay />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-[#111827] sm:text-[26px]">
        Payment Successful!
      </h1>

      <p className="mt-5 max-w-2xl text-sm text-[#111827] sm:text-base">
        Thank you for choosing Polygon! We are committed to providing you with
        the best products, quality, and service possible.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => leave(ORDERS_ROUTE)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#3E206D] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#2f1854] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E206D] focus-visible:ring-offset-2"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          View Order History
        </button>

        <button
          type="button"
          onClick={() => leave(homeUrl)}
          className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 bg-[#F8F9FB] px-5 py-3 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}