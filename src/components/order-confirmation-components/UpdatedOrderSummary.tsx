import React from "react";
import { ArrowRight, Check, Wallet } from "lucide-react";
export type FulfillmentType = "delivery" | "pickup";
export type CardBrand = "visa" | "mastercard";

export type PaymentType =
  | "COD" // Cash on delivery
  | "COP" // Cash on pickup
  | "CARD" // Saved card
  | "CASH_CREDIT" // Credit balance + cash
  | "CARD_CREDIT" // Credit balance + saved card
  | "FULLY_CREDIT"; // Credit balance = full total

export interface SavedCard {
  brand: CardBrand;
  last4: string;
}

export interface OrderSummaryData {
  fulfillmentType: FulfillmentType;
  paymentType: PaymentType;
  packagesTotal?: number;
  alaCarteTotal?: number;
  discount?: number;
  couponDiscount?: number;
  deliveryFee?: number;
  couponApplied?: boolean;
  total: number;
  creditApplied?: number;
  savedCard?: SavedCard;
  chargeAmount?: number;
  refundAmount?: number;
}

interface UpdatedOrderSummaryProps {
  data: OrderSummaryData;
  onConfirm?: () => void;
  onCancel?: () => void;
  submitting?: boolean;
}

export const formatMoney = (amount: number) =>
  `Rs. ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CardBrandLogo: React.FC<{ brand: CardBrand }> = ({ brand }) => {
  if (brand === "visa") {
    return (
      <span className="text-sm font-extrabold italic text-[#1A1F71]">VISA</span>
    );
  }
  return (
    <span className="relative inline-block h-4 w-6" aria-hidden="true">
      <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-[#EB001B]" />
      <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-multiply" />
    </span>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName = "text-gray-900" }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600">{label}</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);

const UpdatedOrderSummary: React.FC<UpdatedOrderSummaryProps> = ({
  data,
  onConfirm,
  onCancel,
  submitting = false,
}) => {
  const {
    fulfillmentType,
    paymentType,
    packagesTotal,
    alaCarteTotal,
    discount,
    couponDiscount,
    deliveryFee,
    couponApplied,
    total,
    savedCard,
    chargeAmount,
  } = data;

  const rawCredit = data.creditApplied ?? 0;
  const creditApplied = Math.min(rawCredit, total);
  const refundAmount = data.refundAmount ?? Math.max(rawCredit - total, 0);
  const hasCredit = rawCredit > 0;
  const remaining = Math.max(total - creditApplied, 0);

  const hasDiscount = discount !== undefined || couponDiscount !== undefined;
  const showRemainingLabel = hasDiscount && !hasCredit;

  const showDeliveryFee =
    fulfillmentType === "delivery" && deliveryFee !== undefined;
  const payWhen = fulfillmentType === "delivery" ? "delivery" : "pickup";

  const isCashOnly = paymentType === "COD" || paymentType === "COP";
  const isCard = paymentType === "CARD" || paymentType === "CARD_CREDIT";

  const isRefundNote = paymentType === "FULLY_CREDIT" && refundAmount > 0;

  const remainingNote =
    paymentType === "CASH_CREDIT"
      ? `Payable upon ${payWhen}`
      : paymentType === "FULLY_CREDIT" && !isRefundNote
        ? "You've paid the full amount using your wallet. You won't be charged again."
        : null;

  const cardCharge = chargeAmount ?? remaining;

  return (
    <section
      aria-label="Updated order summary"
      className="rounded-3xl border border-slate-400 bg-white p-5"
    >
      <h2 className="text-base font-semibold text-gray-900">
        Updated Order Summary
      </h2>

      {/* Price rows */}
      <div className="mt-5 space-y-2.5">
        {packagesTotal !== undefined && (
          <Row label="Package(s)" value={formatMoney(packagesTotal)} />
        )}
        {alaCarteTotal !== undefined && (
          <Row label="Ala Carte Items" value={formatMoney(alaCarteTotal)} />
        )}
        {discount !== undefined && (
          <Row
            label="Discount"
            value={`- ${formatMoney(discount)}`}
            valueClassName="text-red-600"
          />
        )}
        {couponDiscount !== undefined && (
          <Row
            label="Coupon Discount"
            value={`- ${formatMoney(couponDiscount)}`}
            valueClassName="text-red-600"
          />
        )}
        {showDeliveryFee && (
          <Row
            label="Delivery Fee"
            value={
              deliveryFee! > 0
                ? `+ ${formatMoney(deliveryFee!)}`
                : formatMoney(0)
            }
          />
        )}
        {couponApplied && (
          <p className="text-sm font-medium text-green-600">(Coupon Applied)</p>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-sm font-bold text-[#0F172A]">
          {showRemainingLabel ? "Remaining to Pay" : "Total"}
        </span>
        <span
          className={`text-xl font-bold ${
            showRemainingLabel ? "text-[#3E206D]" : "text-[#0F172A]"
          }`}
        >
          {formatMoney(total)}
        </span>
      </div>

      {/* Credit balance + remaining to pay */}
      {hasCredit && (
        <>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-green-800">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Credit Balance Applied
            </span>
            <span className="text-xs font-semibold text-green-800 whitespace-nowrap">
              - {formatMoney(refundAmount > 0 ? rawCredit : creditApplied)}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                Remaining to Pay
              </p>
              <span className="text-2xl font-bold text-[#3E206D]">
                {formatMoney(remaining)}
              </span>
            </div>

            {isRefundNote ? (
              <p className="mt-1 text-xs text-gray-500">
                Once you accept the order, {formatMoney(refundAmount)} will be
                refunded to your credit balance.
              </p>
            ) : (
              remainingNote && (
                <p className="mt-1 max-w-[60%] text-[11px] text-gray-500">
                  {remainingNote}
                </p>
              )
            )}
          </div>
        </>
      )}

      {/* Notice - COD / COP */}
      {isCashOnly && (
        <div className="mt-5 flex items-center gap-3 rounded-lg bg-green-100 px-3 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-400">
            <Check className="h-3.5 w-3.5 text-gray-900" strokeWidth={3} />
          </span>
          <p className="text-xs text-green-900">
            Once you accept this order, you can pay upon {payWhen}.
          </p>
        </div>
      )}

      {/* Notice - saved card (CARD / CARD + CREDIT) */}
      {/* {isCard && cardCharge > 0 && (
        <div className="mt-5 rounded-lg bg-indigo-50 px-3 py-3">
          <p className="text-sm text-gray-800">
            You will be redirected to the secure payment gateway to pay{" "}
            <strong>{formatMoney(cardCharge)}</strong> upon clicking confirm.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports Visa and Mastercard debit/credit cards.
          </p>
        </div>
      )} */}

      {/* Actions */}
      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full cursor-pointer shadow-md rounded-lg border border-red-500 bg-white py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          Cancel My Order
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="flex w-full cursor-pointer shadow-md items-center justify-center gap-1.5 rounded-lg bg-[#3E206D] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f1854] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E206D] focus-visible:ring-offset-2"
        >
          {submitting ? "Processing..." : "Confirm & Accept My Order"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </section>
  );
};

export default UpdatedOrderSummary;
