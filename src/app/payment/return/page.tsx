"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";
import { PaymentGatewayFactory } from "@/services/payment/payment.factory";
import {
  getCheckoutScheduleInfo,
  sendSms,
} from "@/services/product-service";
import { buildConfirmedSms, splitSmsPhone } from "@/utils/order-sms";
import { Loader2 } from "lucide-react";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import { markOrderSuccess, SUCCESS_ROUTE } from "@/utils/order-success";

const PAYMENT_SESSION_KEY = "paymentSessionExpiresAt";
const REDIRECT_DELAY_MS = 3000;
const ORDERS_ROUTE = "/history/order";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const confirmationSmsSent = useRef(false);
  const redirectedRef = useRef(false);

  // Auto-redirect to the orders page after the success popup has been shown
  // Redirect only once the user has clicked something (needed for the Back block to work)
  useEffect(() => {
    sessionStorage.setItem("cameFromGateway", "1");
  }, [router]);

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
      setIsModalOpen(true);
      setLoading(false);
      return;
    }

    if (!reference) {
      setErrorMessage("No payment reference found in URL.");
      setIsModalOpen(true);
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

          localStorage.removeItem("deliveryCharge");
          sessionStorage.removeItem(PAYMENT_SESSION_KEY);

          // Card payment finished: used by the payment-page guard and the order-history Back block
          sessionStorage.setItem("orderJustCompleted", "1");
          sessionStorage.setItem("blockBackOnOrderHistory", "1");

          const paidInvoiceNumber = result.invoiceNumber;
          if (!confirmationSmsSent.current && paidInvoiceNumber) {
            confirmationSmsSent.current = true;
            void (async () => {
              try {
                const scheduleInfo = await getCheckoutScheduleInfo(activeToken);
                const phone = splitSmsPhone(
                  scheduleInfo.data.phoneNumber,
                );
                const message = buildConfirmedSms(paidInvoiceNumber);

                if (phone) {
                  await sendSms(phone.code, phone.number, message);
                } else {
                  console.warn(
                    "Payment succeeded but no phone number was available for confirmation SMS",
                  );
                }
              } catch (smsError) {
                console.error(
                  "Failed to send payment confirmation SMS:",
                  smsError,
                );
              }
            })();
          }

          // Refresh the cart state first so everything is done before we show success
          try {
            const cartInfo = await getCartInfo(activeToken);
            dispatch(updateCartInfo(cartInfo));
          } catch (e) {
            console.warn("Failed to refresh cart count:", e);
          }

          if (redirectedRef.current) return;   // the 1.5s poll can overlap itself
          redirectedRef.current = true;
          markOrderSuccess();
          router.replace(SUCCESS_ROUTE);       // keep the spinner until the success page takes over
        } else if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval);
          setLoading(false);
          setErrorMessage(
            "We have received your payment, but the order confirmation is taking slightly longer than usual. Please check your Order History in a few minutes."
          );
          setIsModalOpen(true);
        }
      } catch (err: any) {
        console.error("Error polling order status:", err);
        if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval);
          setLoading(false);
          setErrorMessage(
            err.message || "Failed to confirm payment status with server."
          );
          setIsModalOpen(true);
        }
      }
    };

    checkStatus();
    pollInterval = setInterval(checkStatus, 1500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [reference, statusParam, checkoutId, token, dispatch]);

  const successDescription = [
    "Thank you for your purchase. Your payment was processed securely.",
    invoiceNumber ? `Your Invoice No: ${invoiceNumber}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {loading && (
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
      )}

      {/* Success: order placed */}
      <SuccessPopup
        isVisible={isModalOpen && isSuccess && !!orderId}
        // Success popup
        onClose={() => {
          setIsModalOpen(false);
          router.replace(ORDERS_ROUTE);          // was push
        }}
        title="Order Placed Successfully!"
        description={successDescription}
        duration={0}
      />

      {/* Error: cancelled payment, confirmation timeout, or server error */}
      <ErrorPopup
        isVisible={isModalOpen && !isSuccess}
        // Error / cancel popup
        onClose={() => {
          setIsModalOpen(false);
          router.replace(isCancelled ? "/cart" : ORDERS_ROUTE);   // was push
        }}
        title={isCancelled ? "Payment Cancelled" : "Payment Processing"}
        description={
          isCancelled
            ? "You cancelled the payment on Payments.lk. No charges were made."
            : errorMessage ||
            "Your transaction has been submitted. It may take a moment for the order status to update."
        }
      />
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