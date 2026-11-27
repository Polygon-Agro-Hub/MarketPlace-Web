"use client";
import React from "react";
import { Hourglass, CheckCircle2, ShieldCheck } from "lucide-react";
import { WholesaleStatusInfo } from "@/services/auth-service";
import { formatReviewDate } from "./wholesaleUtils";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface Props {
  isOpen: boolean;
  info: WholesaleStatusInfo | null;
  onClose: () => void;
}

export default function WholesalePendingPopup({
  isOpen,
  info,
  onClose,
}: Props) {
  if (!isOpen || !info) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white px-6 pb-6 pt-12 shadow-xl">
        {/* Hourglass icon box with green shield badge */}
        <div className="flex justify-center">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 104,
              height: 104,
              borderRadius: 24,
              backgroundColor: "#FFF6F2",
              border: "2px solid #FF6232",
            }}
          >
            <Hourglass
              className="h-10 w-10"
              style={{ color: "#FF6232" }}
              fill="#FF6232"
              strokeWidth={1.5}
            />

            <span
              className="absolute flex items-center justify-center"
              style={{
                right: -10,
                bottom: -10,
                width: 34,
                height: 34,
                borderRadius: "9999px",
                backgroundColor: "#15896B",
                border: "3px solid #fff",
              }}
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
          </div>
        </div>

        <h3
          className={`${roboto.className} mt-8 text-center text-[24px] font-bold text-[#111827]`}
        >
          Wholesale Verification Pending
        </h3>
        <p
          className={`${roboto.className} mt-3 text-center text-[14px] leading-relaxed text-slate-600`}
        >
          Your wholesale account registration and business documents are
          currently being verified by our team. This process typically takes
          24–48 hours to ensure all trade compliance standards are met.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-[#E4DFF7] bg-white p-5">
          <div className="flex items-center justify-between">
            <span
              className={`${roboto.className} text-[12px] font-medium text-slate-600`}
            >
              Review Status
            </span>
            <span
              className={`${roboto.className} flex items-center gap-2 rounded-full border border-[#FF6232] bg-white px-3 py-1 text-[12px] font-semibold text-[#FF6232]`}
            >
              <span className="h-2 w-2 rounded-full bg-[#FF6232]" />
              Pending Approval
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`${roboto.className} text-[12px] font-medium text-slate-600`}
            >
              Submitted Date
            </span>
            <span
              className={`${roboto.className} text-[12px] font-semibold text-black`}
            >
              {formatReviewDate(info.submittedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span
              className={`${roboto.className} flex-shrink-0 text-[12px] font-medium text-slate-600`}
            >
              Submitted Document
            </span>
            <span
              className={`${roboto.className} flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-[#15896B]`}
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {info.fileName ?? "Business Registration"}
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="${roboto.className} mt-6 w-full cursor-pointer rounded-full bg-[#FF6232] py-4 text-[20px] font-semibold text-white transition-colors hover:bg-[#e8561f]"
        >
          Got it, check back later
        </button>
      </div>
    </div>
  );
}
