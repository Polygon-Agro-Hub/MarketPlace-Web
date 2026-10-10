"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";
import { PaymentGatewayFactory } from "@/services/payment/payment.factory";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

const PaymentReturnContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const token = useSelector((state: RootState) => state.auth?.token) || null;

  const reference = searchParams.get("reference") || "";
  const statusParam = searchParams.get("status") || "";
  const checkoutId =
    searchParams.get("checkout") || searchParams.get("checkoutId") || "";

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (isSuccess && orderId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, orderId, router]);

  const getEffectiveToken = (): string | null => {
    if (token) return token;
    try {
      const rawPersist = localStorage.getItem("persist:root");
      if (rawPersist) {
        const parsed = JSON.parse(rawPersist);
        const authData = JSON.parse(parsed.auth || "{}");
        return authData.token || null;
      }
    } catch (e) {
      // fallback
    }
    return null;
  };

  useEffect(() => {
    if (statusParam === "cancel" || statusParam === "cancelled") {
      setIsCancelled(true);
      setLoading(false);
      return;
    }

    if (!reference) {
      setErrorMessage("No payment reference found in URL.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    let pollInterval: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      const activeToken = getEffectiveToken();
      if (!activeToken) {
        // Wait a tick for auth rehydration
        return;
      }

      attempts += 1;
      try {
        const adapter = PaymentGatewayFactory.getAdapter("payments_lk");
        const result = await adapter.checkOrderStatus(
          reference,
          activeToken,
          checkoutId
        );

        if (result.isCompleted && result.orderId) {
          if (pollInterval) clearInterval(pollInterval);
          setOrderId(result.orderId);
          setInvoiceNumber(result.invoiceNumber || null);
          setIsSuccess(true);
          setLoading(false);

          // Clear cart state
          try {
            const cartInfo = await getCartInfo(activeToken);
            dispatch(updateCartInfo(cartInfo));
          } catch (e) {
            console.warn("Failed to refresh cart count:", e);
          }

          localStorage.removeItem("deliveryCharge");
          sessionStorage.removeItem("PAYMENT_SESSION");
        } else if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval);
          setLoading(false);
          setErrorMessage(
            "We have received your payment, but the order confirmation is taking slightly longer than usual. Please check your Order History in a few minutes."
          );
        }
      } catch (err: any) {
        console.error("Error polling order status:", err);
        if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval);
          setLoading(false);
          setErrorMessage(
            err.message || "Failed to confirm payment status with server."
          );
        }
      }
    };

    checkStatus();
    pollInterval = setInterval(checkStatus, 1500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [reference, statusParam, checkoutId, token, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#3E206D] animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verifying Your Payment...
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            We are confirming the signed transaction with Payments.lk and placing your order. Please do not close or refresh this page.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#3E206D] h-1.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You cancelled the payment on Payments.lk. No charges were made, and your cart items remain safe.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/payment")}
              className="w-full py-3 bg-[#3E206D] text-white rounded-xl font-semibold hover:bg-[#2f1854] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess && orderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Order Placed Successfully!
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Thank you for your purchase. Your payment was processed securely via Payments.lk.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-200/60">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-semibold text-gray-900">#{orderId}</span>
            </div>
            {invoiceNumber && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-semibold text-[#3E206D]">{invoiceNumber}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/history/invoice/?orderId=${orderId}`)}
              className="w-full py-3.5 bg-[#3E206D] text-white rounded-xl font-semibold hover:bg-[#2f1854] transition cursor-pointer flex items-center justify-center gap-2"
            >
              View Invoice
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Back to Home</span>
              <span className="text-xs text-gray-400 font-normal">({countdown}s)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Payment Processing
        </h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {errorMessage ||
            "Your transaction has been submitted. It may take a moment for the order status to update."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/history")}
            className="w-full py-3 bg-[#3E206D] text-white rounded-xl font-semibold hover:bg-[#2f1854] transition cursor-pointer"
          >
            Go to Order History
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#3E206D] animate-spin" />
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
