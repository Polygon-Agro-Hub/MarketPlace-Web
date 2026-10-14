"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { RootState } from "@/store";
import { PaymentGatewayFactory } from "@/services/payment/payment.factory";
import { updateCreditBalance } from "@/store/slices/authSlice";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";

const getStoredToken = (): string | null => {
  try {
    const persisted = localStorage.getItem("persist:root");
    if (!persisted) return null;
    const auth = JSON.parse(JSON.parse(persisted).auth || "{}");
    return auth.token || null;
  } catch {
    return null;
  }
};

function BalancePaymentReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const reduxToken = useSelector((state: RootState) => state.auth.token);
  const originalAmount = useSelector((state: RootState) =>
    Math.abs(Number(state.auth.cart?.creditBalance ?? 0)),
  );
  const storedAmount =
    typeof window === "undefined"
      ? 0
      : Number(sessionStorage.getItem("creditBalancePaymentAmount") || 0);
  const amountToSettle = originalAmount || storedAmount;
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const settled = useRef(false);

  const reference = searchParams.get("reference") || "";
  const checkoutId =
    searchParams.get("checkout") || searchParams.get("checkoutId") || "";
  const status = (searchParams.get("status") || "").toLowerCase();

  useEffect(() => {
    if (settled.current) return;
    if (status === "cancel" || status === "cancelled") {
      settled.current = true;
      setErrorMessage(
        "You cancelled the payment. No balance changes were made.",
      );
      setIsLoading(false);
      return;
    }

    const token = reduxToken || getStoredToken();
    if (!token) return;

    if (!reference) {
      settled.current = true;
      setErrorMessage("No payment reference was found.");
      setIsLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    const adapter = PaymentGatewayFactory.getAdapter("payments_lk");

    const verifyPayment = async () => {
      attempts += 1;
      try {
        const result = await adapter.checkOrderStatus(
          reference,
          token,
          checkoutId,
        );
        if (result.isCompleted) {
          settled.current = true;

          const newBalance =
            typeof result.newBalance === "number" ? result.newBalance : 0;

          sessionStorage.removeItem("creditBalancePaymentAmount");
          sessionStorage.removeItem("creditBalancePaymentReference");

          dispatch(updateCreditBalance(newBalance));
          setIsSuccess(true);
          setIsLoading(false);
          return;
        }
        if (attempts >= maxAttempts) {
          settled.current = true;
          setErrorMessage(
            "We could not confirm the payment yet. Please contact support before trying again.",
          );
          setIsLoading(false);
        }
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          settled.current = true;
          setErrorMessage(error.message || "Unable to confirm your payment.");
          setIsLoading(false);
        }
      }
    };

    void verifyPayment();
    const interval = window.setInterval(() => {
      if (!settled.current) void verifyPayment();
    }, 1500);

    return () => {
      settled.current = true;
      window.clearInterval(interval);
    };
  }, [checkoutId, dispatch, reference, reduxToken, status]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {isLoading && (
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#3E206D]" />
          <h1 className="text-xl font-semibold text-gray-800">
            Verifying Your Payment...
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please do not close this page while we confirm your transaction.
          </p>
        </div>
      )}
      <SuccessPopup
        isVisible={isSuccess}
        title="Payment Successful!"
        description="Your credit balance has been cleared successfully. You will be redirected to the home page."
        onClose={() => router.replace("/")}
      />
      <ErrorPopup
        isVisible={Boolean(errorMessage)}
        title="Payment Not Completed"
        description={errorMessage}
        onClose={() => router.replace("/clear-balance-page")}
      />
    </div>
  );
}

export default function BalancePaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <BalancePaymentReturnContent />
    </Suspense>
  );
}
