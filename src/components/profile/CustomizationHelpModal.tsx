"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCheck,
  faXmark,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

interface CustomizationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizationHelpModal({
  isOpen,
  onClose,
}: CustomizationHelpModalProps) {
  // `document` doesn't exist during server rendering, so only portal after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-help-title"
    >
      <div
        className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF0F3]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#F1F3F6] flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-[#1F2937]" />
            </span>
            <h3
              id="customization-help-title"
              className="text-[18px] sm:text-[22px] font-bold text-[#001535]"
            >
              How Customization Works
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#F1F3F6] hover:bg-[#E5E7EB] flex items-center justify-center cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-[#4B5563]" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {/* Include */}
          <div className="rounded-2xl border border-[#BFEBD3] bg-[#F0FFF7] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-white" />
              </span>
              <p className="text-[14px] sm:text-[15px] font-bold text-[#001535]">
                Prefer / Include (Green)
              </p>
              <span className="px-2 py-0.5 rounded bg-[#C9F3DC] text-[#0B6B45] text-[10px] font-bold tracking-wide">
                PRIORITY
              </span>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">
              Select products you love and want to receive when you let us
              customize your package including special items you enjoy having.
            </p>
          </div>

          {/* Exclude */}
          <div className="rounded-2xl border border-[#FBCFD6] bg-[#FFF5F6] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#F43F5E] flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3 text-white" />
              </span>
              <p className="text-[14px] sm:text-[15px] font-bold text-[#001535]">
                Exclude (Red)
              </p>
              <span className="px-2 py-0.5 rounded bg-[#FDD5DB] text-[#B4233A] text-[10px] font-bold tracking-wide">
                NEVER SEND
              </span>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#7A2E3A] leading-relaxed">
              Select items you never want to receive (allergies, dislikes,
              diets). We guarantee they are completely omitted.
            </p>
          </div>

          {/* Neutral */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#CBD5E1] flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faMinus} className="w-3 h-3 text-[#475569]" />
              </span>
              <p className="text-[14px] sm:text-[15px] font-bold text-[#001535]">
                Unmarked / Neutral
              </p>
              <span className="px-2 py-0.5 rounded bg-[#E2E8F0] text-[#475569] text-[10px] font-bold tracking-wide">
                STANDARD
              </span>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#4B5563] leading-relaxed">
              Items left off mean standard seasonal packing. We balance your box
              with no particular preference.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] italic text-[#64748B] leading-relaxed">
          "We can only consider these preferences if you allow us to customize
          your package, subject to seasonal supply."
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full h-12 rounded-xl bg-[#3E206D] hover:bg-[#341a5a] text-white font-semibold text-[16px] cursor-pointer transition-colors"
        >
          Got it <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>,
    document.body,
  );
}