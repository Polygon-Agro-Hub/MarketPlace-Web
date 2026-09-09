// components/checkout/PackageHandlingModal.tsx
import Image from "next/image";
import { X, AlertTriangle } from "lucide-react";
import packageBasketImg from "../../../public/pp1.png";
import reviewCalendarImg from "../../../public/pp2.png";
import packageVeggiesImg from "../../../public/pp3.png";
import cardPaymentImg from "../../../public/pp4.png";

interface Props {
  option: "review" | "finalize";
  onOptionChange: (opt: "review" | "finalize") => void;
  onClose: () => void;
  onContinue: () => void;
  isLoading: boolean;
}

const OPTIONS = [
  {
    key: "review" as const,
    img: reviewCalendarImg,
    title: "Review and confirm before delivery",
    desc: "Two days before your delivery or pickup, you'll receive an in-app notification with the exact produce and quantities. Confirm your order between 8:00 AM and 6:00 PM to finalize it for dispatch or pickup.",
  },
  {
    key: "finalize" as const,
    img: cardPaymentImg,
    title: "Finalize Immediately",
    badge: "Card Payment Required",
    desc: "Want to secure your delivery slot now? Confirm your order right away and we'll prepare it using the standard package items assigned for your delivery date. Please note that once confirmed, this order cannot be changed or canceled.",
  },
];

export default function PackageHandlingModal({ option, onOptionChange, onClose, onContinue, isLoading }: Props) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-5 pr-8">
          <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 relative">
            <Image src={packageBasketImg} alt="Package items" fill className="object-contain" />
          </div>
          <h2 className="text-[15px] sm:text-xl font-bold text-[#252525] leading-snug">
            How would you like us to handle your order&apos;s
            <br />
            package items?
          </h2>
        </div>

        {OPTIONS.map((opt) => {
          const selected = option === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onOptionChange(opt.key)}
              style={{
                background: selected ? "linear-gradient(180deg, #F7F2FF 0%, #F6F0FF 100%)" : "#FFFFFF",
                border: `1px solid ${selected ? "#B186EF" : "#E5E7EE"}`,
                boxShadow: "0px 4px 10px 5px #F8F2FF",
              }}
              className="w-full text-left rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? "border-[#3E206D]" : "border-gray-300"}`}>
                  {selected && <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#3E206D]" />}
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                  <Image src={opt.img} alt={opt.title} fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <p className="font-bold text-[15px] sm:text-[18px]" style={{ color: selected ? "#47108E" : "#2A272E" }}>
                      {opt.title}
                    </p>
                    {opt.badge && (
                      <span className="text-[10px] sm:text-[11px] font-medium text-blue-700 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] sm:text-[14px] text-gray-600 leading-snug">{opt.desc}</p>
                </div>
              </div>

              {opt.key === "review" && (
                <div className="mt-3 flex items-stretch gap-2 sm:gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 bg-[#FFF9F5] border border-orange-200 rounded-lg p-2.5 sm:p-3 flex-1">
                    <AlertTriangle size={18} className="text-[#EE7719] flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] sm:text-[14px] text-[#EE7719] leading-snug flex-1">
                      This facility is available on a first-come, first-served basis and is limited to a
                      certain number of customers. If we do not receive your confirmation on time and all
                      slots for your preferred delivery date are filled, we will be unable to process your
                      order. You may check again later for any available slots.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-16 sm:w-28 relative">
                    <Image src={packageVeggiesImg} alt="" fill className="object-contain drop-shadow-md" />
                  </div>
                </div>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="w-full font-semibold text-[14px] sm:text-base rounded-xl py-3 sm:py-3.5 bg-[#3E206D] text-white hover:bg-[#2f1854] transition cursor-pointer disabled:opacity-70"
        >
          {isLoading ? "Processing..." : "Continue to Payment"}
        </button>
      </div>
    </div>
  );
}