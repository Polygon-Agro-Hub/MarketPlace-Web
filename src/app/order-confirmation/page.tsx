"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
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
import {
  getOrderConfirmation,
  type OrderConfirmationData,
} from "@/services/retail-service";

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

  const [order, setOrder] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(!!processedOrderId);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-pulse text-gray-600">Loading your order...</div>
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

  // TODO: confirm / cancel API calls (separate step)
  const handleConfirm = () =>
    console.log("Order confirmed", order.invoiceNumber);
  const handleCancel = () =>
    console.log("Order cancelled", order.invoiceNumber);

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
          <UpdatedOrderSummary
            data={order.summary}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
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
    </main>
  );
};

const OrderConfirmationPage = () => (
  <Suspense fallback={null}>
    <OrderConfirmationContent />
  </Suspense>
);

export default OrderConfirmationPage;