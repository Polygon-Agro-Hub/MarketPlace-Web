"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { RootState } from "@/store";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";
import { getOrderConfirmation } from "@/services/retail-service";
import { sendSms } from "@/services/product-service";
import { buildOrderConfirmationSms, splitSmsPhone } from "@/utils/order-sms";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import { PaymentGatewayFactory } from "@/services/payment/payment.factory";

const HOME_ROUTE = "/";
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 12;

const OrderConfirmationReturnContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth?.token) || null;

  const processedOrderId = searchParams.get("processedOrderId") || "";
  const statusParam = searchParams.get("status") || "";
  const isCancelled = statusParam === "cancel" || statusParam === "cancelled";

  const [loading, setLoading] = useState(!isCancelled);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [popupOpen, setPopupOpen] = useState(isCancelled);
  const smsSent = useRef(false);

  const reference = searchParams.get("reference") || "";
  const checkoutId =
    searchParams.get("checkout") || searchParams.get("checkoutId") || "";

  useEffect(() => {
    if (isCancelled) return;

    if (!processedOrderId || !reference) {
      setErrorMessage("No order reference found in the URL.");
      setPopupOpen(true);
      setLoading(false);
      return;
    }

    if (!token) return;

    let attempts = 0;
    let stopped = false;

    const check = async () => {
      if (stopped) return;
      attempts += 1;

      try {
        const adapter = PaymentGatewayFactory.getAdapter("payments_lk");
        const result = await adapter.checkOrderStatus(
          reference,
          token,
          checkoutId,
        );

        if (result.isCompleted) {
          stopped = true;
          clearInterval(timer);

          if (!smsSent.current) {
            smsSent.current = true;
            try {
              const order = await getOrderConfirmation(token, processedOrderId);
              const message = buildOrderConfirmationSms({
                paymentType: order.summary.paymentType,
                invNo: order.invoiceNumber,
                paymentCompleted: true,
              });
              const phone = splitSmsPhone(order.details.receiver.phones[0]);
              if (message && phone)
                void sendSms(phone.code, phone.number, message);
            } catch (e) {
              console.warn("Confirmation SMS skipped:", e);
            }
          }

          try {
            const cartInfo = await getCartInfo(token);
            dispatch(updateCartInfo(cartInfo));
          } catch (e) {
            console.warn("Failed to refresh cart info:", e);
          }

          setIsSuccess(true);
          setPopupOpen(true);
          setLoading(false);
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          stopped = true;
          clearInterval(timer);
          setErrorMessage(
            "We have received your payment, but the order confirmation is taking longer than usual. Please check your Order History in a few minutes.",
          );
          setPopupOpen(true);
          setLoading(false);
        }
      } catch (err: any) {
        if (attempts >= MAX_ATTEMPTS) {
          stopped = true;
          clearInterval(timer);
          setErrorMessage(err?.message || "Failed to verify your order.");
          setPopupOpen(true);
          setLoading(false);
        }
      }
    };

    const timer = setInterval(check, POLL_INTERVAL_MS);
    check();

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [isCancelled, processedOrderId, reference, checkoutId, token, dispatch]);

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => router.replace(HOME_ROUTE), 3000);
    return () => clearTimeout(t);
  }, [isSuccess, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      {loading && (
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#3E206D]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Verifying Your Payment...
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            We are confirming your payment and updating your order. Please do
            not close or refresh this page.
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-1.5 w-3/4 animate-pulse rounded-full bg-[#3E206D]" />
          </div>
        </div>
      )}

      <SuccessPopup
        isVisible={popupOpen && isSuccess}
        title="Order confirmed successfully!"
        description="Your payment was received and your order has been confirmed. Taking you home..."
        duration={0}
        onClose={() => router.replace(HOME_ROUTE)}
      />

      <ErrorPopup
        isVisible={popupOpen && !isSuccess}
        title={isCancelled ? "Payment Cancelled" : "Payment Processing"}
        description={
          isCancelled
            ? "You cancelled the payment. No charges were made. You can review and confirm your order again."
            : errorMessage ||
              "Your transaction has been submitted. It may take a moment for the order status to update."
        }
        onClose={() => {
          setPopupOpen(false);
          router.replace(
            isCancelled && processedOrderId
              ? `/order-confirmation?processedOrderId=${processedOrderId}`
              : HOME_ROUTE,
          );
        }}
      />
    </div>
  );
};

export default function OrderConfirmationReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3E206D]" />
        </div>
      }
    >
      <OrderConfirmationReturnContent />
    </Suspense>
  );
}
