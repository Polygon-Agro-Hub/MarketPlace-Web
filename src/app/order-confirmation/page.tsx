"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BadgeCheck,
  Banknote,
  CalendarCheck,
  CalendarDays,
  Clock,
  CreditCard,
} from "lucide-react";
import UpdatedOrderSummary, {
  type FulfillmentType,
  type PaymentType,
} from "@/components/order-confirmation-components/UpdatedOrderSummary";
import ViewOrderComponent from "@/components/order-confirmation-components/ViewOrderComponent";
import { CancelOrderPopup } from "@/components/toast-messages/cancel-order-popup";
import SuccessPopup from "@/components/toast-messages/success-message";
import {
  cancelOrder,
  getOrderConfirmation,
  confirmOrder,
  type OrderConfirmationData,
} from "@/services/retail-service";
import { getCartInfo } from "@/services/auth-service";
import { updateCartInfo } from "@/store/slices/authSlice";
import { sendSms } from "@/services/product-service";
import { buildOrderConfirmationSms, splitSmsPhone } from "@/utils/order-sms";
import Loader from "@/components/loader-spinner/Loader";

const getPaymentPill = (
  paymentType: PaymentType,
  fulfillmentType: FulfillmentType,
): { label: string; icon: "cash" | "card" } | null => {
  const cashLabel =
    fulfillmentType === "delivery"
      ? "Pay on Delivery (Cash)"
      : "Pay on Pickup (Cash)";

  switch (paymentType) {
    case "COD":
    case "COP":
    case "CASH_CREDIT":
      return { label: cashLabel, icon: "cash" };
    case "CARD":
    case "CARD_CREDIT":
      return { label: "Card Payment", icon: "card" };
    case "FULLY_CREDIT":
    default:
      return null;
  }
};

const PaymentMethodCard: React.FC<{
  paymentType: PaymentType;
  fulfillmentType: FulfillmentType;
}> = ({ paymentType, fulfillmentType }) => {
  const pill = getPaymentPill(paymentType, fulfillmentType);
  if (!pill) return null;

  const Icon = pill.icon === "card" ? CreditCard : Banknote;

  return (
    <div className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-gray-700" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">Payment Method</p>
        <p className="text-sm font-medium text-gray-700">{pill.label}</p>
      </div>
      <BadgeCheck
        className="h-5 w-5 shrink-0 text-blue-600"
        aria-label="Selected"
      />
    </div>
  );
};

const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const processedOrderId = searchParams.get("processedOrderId");
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  const [order, setOrder] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(!!processedOrderId);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [cancelSuccessVisible, setCancelSuccessVisible] = useState(false);
  const confirmationSmsSent = useRef(false);

  const notifyOrderConfirmed = (paymentCompleted: boolean) => {
    if (confirmationSmsSent.current || !order) return;

    const message = buildOrderConfirmationSms({
      paymentType: order.summary.paymentType,
      invNo: order.invoiceNumber,
      paymentCompleted,
    });
    const phone = splitSmsPhone(order.details.receiver.phones[0]);
    if (!message || !phone) return;

    confirmationSmsSent.current = true;
    void sendSms(phone.code, phone.number, message);
  };

  useEffect(() => {
    if (!processedOrderId || !token) return;
    let cancelled = false;

    setLoading(true);
    getOrderConfirmation(token, processedOrderId)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load order confirmation:", err);
        setError("Failed to load your order. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [processedOrderId, token]);

  useEffect(() => {
    if (!processedOrderId || !token || !order || order.isConfirmed) return;
    if (searchParams.get("returned") !== "1") return;

    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      try {
        const fresh = await getOrderConfirmation(token, processedOrderId);
        setOrder(fresh);
        if (fresh.isConfirmed || tries >= 10) clearInterval(id);
      } catch {
        clearInterval(id);
      }
    }, 3000);

    return () => clearInterval(id);
  }, [processedOrderId, token, order?.isConfirmed, searchParams]);

  useEffect(() => {
    if (searchParams.get("returned") === "1" && order?.isConfirmed) {
      setSubmitting(false);
      notifyOrderConfirmed(true);
      setSuccessVisible(true);
    }
  }, [order?.isConfirmed, searchParams, order]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <Loader isVisible={true} />
      </div>
    );
  }

  if (error) {
    return <div className="py-16 text-center text-red-600">{error}</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center text-gray-500">No order selected.</div>
    );
  }

  const handleConfirm = async () => {
    if (!token || !processedOrderId || submitting) return;
    try {
      setSubmitting(true);
      setActionError(null);

      const result = await confirmOrder(token, processedOrderId);

      if (result.paymentUrl) {
        window.location.replace(result.paymentUrl);
        return;
      }

      notifyOrderConfirmed(true);
      setSuccessVisible(true);
    } catch (err: any) {
      setActionError(
        err?.message || "Could not confirm your order. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setActionError(null);
    setCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!token || !processedOrderId || submitting) return;

    try {
      setSubmitting(true);
      setActionError(null);
      await cancelOrder(token, processedOrderId);
      try {
        const updatedCartInfo = await getCartInfo(token);
        dispatch(updateCartInfo(updatedCartInfo));
      } catch (balanceError) {
        console.error(
          "Failed to refresh credit balance after cancellation:",
          balanceError,
        );
      }
      setCancelOpen(false);
      setCancelSuccessVisible(true);
    } catch (err: any) {
      setActionError(
        err?.message || "Could not cancel your order. Please try again.",
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Status pill */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        Order Status: {order.statusLabel}
      </span>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Order Confirmation
      </h1>
      <p className="mt-1 text-base text-gray-600">
        Here is the updated total for your order{" "}
        <span className="text-gray-900">
          Invoice Number {order.invoiceNumber}
        </span>{" "}
        placed at {order.placedAt}.
      </p>

      {/* Action required */}
      <div className="mt-5 flex items-center gap-3 rounded-3xl bg-gray-100 px-5 py-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
          !
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">Action Required</p>
          <p className="text-xs text-gray-600 sm:text-sm">
            Review your updated order details below. Please confirm to proceed
            with scheduling before {order.confirmBefore} or cancel if no longer
            needed.
          </p>
        </div>
      </div>
      {actionError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {/* Two columns */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Left: schedule */}
        <section
          aria-label="Order schedule"
          className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
              <CalendarCheck
                className="h-4 w-4 text-blue-600"
                aria-hidden="true"
              />
              Order Schedule
            </h2>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 cursor-pointer"
            >
              View Order Details
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black">
                <CalendarDays
                  className="h-4 w-4 text-white"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-xs text-gray-600">Schedule Date</p>
                <p className="text-base font-semibold text-gray-900">
                  {order.schedule.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black">
                <Clock className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-gray-600">Schedule Time Slot</p>
                <p className="text-base font-semibold text-gray-900">
                  {order.schedule.timeSlot}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: summary + payment method */}
        <aside className="space-y-4">
          {order.isConfirmed ? (
            <div className="rounded-3xl bg-green-50 p-5 text-sm text-green-800">
              This order has already been confirmed.
            </div>
          ) : (
            <UpdatedOrderSummary
              data={order.summary}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              submitting={submitting}
            />
          )}
          <PaymentMethodCard
            paymentType={order.summary.paymentType}
            fulfillmentType={order.summary.fulfillmentType}
          />
        </aside>
      </div>

      {/* View order details drawer */}
      <ViewOrderComponent
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={order.details}
        summary={order.summary}
      />

      <CancelOrderPopup
        open={cancelOpen}
        creditAmount={order.summary.creditApplied}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
      />

      <SuccessPopup
        isVisible={successVisible}
        title="Order confirmed successfully!"
        description="Your order has been confirmed."
        onClose={() => router.replace("/")}
      />

      <SuccessPopup
        isVisible={cancelSuccessVisible}
        title="Order cancelled successfully!"
        description={
          order.summary.creditApplied
            ? "Your order has been cancelled and your credit balance has been refunded."
            : "Your order has been cancelled."
        }
        onClose={() => router.replace("/")}
      />
    </main>
  );
};

const OrderConfirmationPage = () => (
  <Suspense fallback={null}>
    <OrderConfirmationContent />
  </Suspense>
);

export default OrderConfirmationPage;
