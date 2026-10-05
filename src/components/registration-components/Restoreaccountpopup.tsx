"use client";

import React from "react";
import { X } from "lucide-react";

interface RestoreAccountPopupProps {
  isOpen: boolean;
  nicNumber: string;
  pastOrders: number;
  memberSince: string | null;
  deletedOn: string | null;
  onContinue: () => void;
  onGoBack: () => void;
  onClose: () => void;
}

const formatMonthYear = (value: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const RestoreAccountPopup: React.FC<RestoreAccountPopupProps> = ({
  isOpen,
  nicNumber,
  pastOrders,
  memberSince,
  deletedOn,
  onContinue,
  onGoBack,
  onClose,
}) => {
  if (!isOpen) return null;

  const stats = [
    { value: String(pastOrders), label: "Past Orders" },
    { value: formatMonthYear(memberSince), label: "Member Since" },
    { value: formatMonthYear(deletedOn), label: "Deleted On" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-account-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] rounded-[28px] bg-white px-6 pt-3 pb-5 shadow-xl"
      >
        {/* handle */}
        <div className="mx-auto h-1 w-12 rounded-full bg-gray-300" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title row */}
        <div className="mt-4 flex items-center gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF3D6]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] text-[13px] font-bold text-white">
              !
            </span>
          </div>
          <h3
            id="restore-account-title"
            className="text-[18px] font-semibold leading-tight text-[#111827]"
          >
            Account Found with Previous Order History
          </h3>
        </div>

        <p className="mt-3 pl-[52px] text-[14px] leading-6 text-[#6B7280]">
          An existing profile registered under NIC{" "}
          <span className="font-medium text-[#111827]">{nicNumber}</span> was
          located. You can restore this account to keep your order history.
        </p>

        {/* Stats */}
        <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-3">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[#E5E7EB] bg-white px-2 py-3 text-center"
              >
                <p className="text-[18px] font-bold text-[#111827]">{s.value}</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onGoBack}
            className="rounded-full border border-[#D1D5DB] bg-white py-3 text-[14px] font-medium text-[#111827] hover:bg-gray-50 cursor-pointer"
          >
            Go back &amp; Edit NIC
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-black py-3 text-[14px] font-medium text-white hover:bg-[#222] cursor-pointer"
          >
            Continue with Account
          </button>
        </div>

        <p className="mt-4 text-center text-[12px] text-[#6B7280]">
          Not your account?{" "}
          <a
            href="tel:+94114313433"
            className="text-[#094EE8] underline underline-offset-2"
          >
            Hotline : +94 11 431 3433
          </a>
        </p>
      </div>
    </div>
  );
};

export default RestoreAccountPopup;