"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface CreditBalancePillProps {
  creditBalance: number;
}

const formatPrice = (price: number): string => {
  const fixedPrice = Math.abs(price).toFixed(2);
  const [integerPart, decimalPart] = fixedPrice.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}.${decimalPart}`;
};

export const CreditBalancePill = ({
  creditBalance,
}: CreditBalancePillProps) => {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const isZero = creditBalance === 0;
  const isNegative = creditBalance < 0;
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  const accentColor = isZero ? "#73747D" : isNegative ? "#E94C12" : "#007E20";
  const iconBgColor = isZero ? "#EAEAEC" : isNegative ? "#FCE7E0" : "#E6F4EA";
  const borderColor = isZero ? "#E0E0E2" : isNegative ? "#FCE7E0" : "#007E20";

  const handleClick = () => {
    if (isNegative) {
      router.push("/clear-balance-page");
    }
  };

  // Tooltip should only ever show for a positive balance.
  const handleMouseEnter = () => {
    if (!isZero && !isNegative) setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (!isZero && !isNegative) setShowTooltip(false);
  };

  return (
    <div
      ref={pillRef}
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: isNegative ? "pointer" : "default" }}
    >
      {/* Pill */}
      <div
        className="flex items-center gap-3 rounded-full px-4 py-2 bg-white shadow-sm"
        style={{
          border: `1.5px solid ${borderColor}`,
        }}
      >
        {/* Wallet icon */}
        <div
          className="rounded-full p-1.5 flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <FontAwesomeIcon
            icon={faWallet}
            style={{ color: accentColor, fontSize: "20px" }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium" style={{ color: "#4C4C4C" }}>
            Credit Balance
          </span>
          <span className="text-sm font-bold" style={{ color: accentColor }}>
            {isNegative ? "- " : ""}Rs. {formatPrice(creditBalance)}
          </span>
        </div>
      </div>

      {/* Tooltip — positive balance only */}
      {!isZero && !isNegative && showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-56 z-50"
          style={{
            transform: "translateX(-50%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* Arrow pointing up */}
          <div
            style={{
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid white",
              filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.06))",
            }}
          />

          {/* Tooltip header */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="rounded-full p-2 flex items-center justify-center"
              style={{ backgroundColor: "#E6F4EA" }}
            >
              <FontAwesomeIcon
                icon={faWallet}
                style={{ color: "#007E20", fontSize: "16px" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#4C4C4C" }}>
                Credit Balance
              </p>
              <p className="text-sm font-bold" style={{ color: "#007E20" }}>
                Rs. {formatPrice(creditBalance)}
              </p>
            </div>
          </div>

          {/* Available label */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 mt-2"
            style={{ backgroundColor: "#E6F4EA", width: "fit-content" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="7" cy="7" r="7" fill="#007E20" />
              <path
                d="M4 7L6 9L10 5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-xs whitespace-nowrap font-medium"
              style={{ color: "#007E20" }}
            >
              Available to use for next order
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
