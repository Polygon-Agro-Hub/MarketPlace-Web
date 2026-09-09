// components/checkout/OrderListModal.tsx
import { getOrdinal, formatOrderDate } from "@/utils/schedule";

interface Props {
  orders: Date[];
  onClose: () => void;
}

export default function OrderListModal({ orders, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6">
        <h3 className="text-center font-bold text-lg text-[#252525] mb-4">
          Your Order List ({String(orders.length).padStart(2, "0")} Orders)
        </h3>

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