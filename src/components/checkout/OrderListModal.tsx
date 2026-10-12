// components/checkout/OrderListModal.tsx
import { getOrdinal, formatOrderDate, parseDateStr } from "@/utils/schedule";
import type { CheckoutScheduleInfo } from "@/services/product-service";

interface Props {
  orders: Date[];
  scheduleInfo: CheckoutScheduleInfo | null;
  onClose: () => void;
}

// "October 20" (adds the year only when it isn't the current year)
const formatExpiry = (dateStr: string): string => {
  const d = parseDateStr(dateStr);
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
};

export default function OrderListModal({ orders, scheduleInfo, onClose }: Props) {
  const noOrders = orders.length === 0;

  // The one-time package that limits scheduling (earliest expiry)
  const limitingPackage =
    scheduleInfo?.oneTimePackages?.find(
      (p) => p.packageId === scheduleInfo.limitingPackageId,
    ) ?? null;

  // No orders because a one-time package expires too soon
  const blockedByExpiry = noOrders && !!limitingPackage;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6">
        <h3 className="text-center font-bold text-lg text-[#252525] mb-4 pb-3 border-b border-[#DBD0F4]">
          Your Order List ({String(orders.length).padStart(2, "0")} Orders)
        </h3>

        {/* Gap note + available range (only when there are orders to show) */}
        {!noOrders && scheduleInfo && (
          <div className="mb-4 rounded-xl px-4 py-3 border bg-[#FFF3E8] border-[#FFE3CC]">
            <p className="text-[12px] sm:text-[13px] text-[#414347]">
              <span className="font-bold">Note : </span>
              {scheduleInfo.note}
            </p>
            <p className="mt-1 flex items-start gap-2 text-[12px] sm:text-[13px] text-[#414347]">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              {scheduleInfo.rangeText}
            </p>
          </div>
        )}

        {/* Apology message: package expires before any order date is possible */}
        {blockedByExpiry && (
          <div className="mb-5 rounded-lg bg-[#F1F2F7] px-5 py-5 text-center text-[#4A4A7A] text-sm sm:text-base leading-relaxed">
            <p>
              We&apos;re sorry, but we&apos;re unable to fulfill your request at this time.
              Unfortunately, there are no available dates within the next two weeks, and your
              package expires on {formatExpiry(limitingPackage!.endDate)}.
            </p>
            <p className="mt-4">
              We apologize for the inconvenience and appreciate your understanding.
            </p>
          </div>
        )}

        {/* Fallback: no orders, but not because of a package expiry */}
        {noOrders && !blockedByExpiry && (
          <p className="text-center text-sm text-red-600 mb-5">
            No orders can be scheduled for the selected day(s). Please choose a different day.
          </p>
        )}

        {/* Order list */}
        {!noOrders && (
          <div className="flex justify-center mb-5">
            <div className="inline-flex flex-col space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {orders.map((date, idx) => (
                <div key={idx}>
                  <div className="grid grid-cols-[100px_14px_1fr] items-baseline text-sm sm:text-base">
                    <p className="font-medium text-[#414347]">{getOrdinal(idx + 1)} Order</p>
                    <p className="text-[#414347]">:</p>
                    <p className="text-[#414347]">{formatOrderDate(date)}</p>
                  </div>
                  {idx === 0 && (
                    <div className="mt-2 flex justify-center">
                      <div className="px-5 py-3 rounded-[10px] border border-[#6156FF] bg-white text-[#6156FF] text-xs font-medium text-center">
                        You only need to pay for this 1st order today.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "110px",
              height: "41px",
              borderRadius: "10px",
              backgroundColor: "#F3F4F7",
              boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
            }}
            className="font-semibold text-[#757E87] hover:bg-[#e9ebee] transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}