"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import CustomizationHelpModal from "@/components/profile/CustomizationHelpModal";

export default function NeedHelpLink({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`flex justify-center ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
          className="flex items-center gap-1.5 text-[13px] md:text-[14px] font-medium text-[#1A73E8] underline cursor-pointer"
        >
          <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5" />
          Need help?
        </button>
      </div>

      <CustomizationHelpModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}