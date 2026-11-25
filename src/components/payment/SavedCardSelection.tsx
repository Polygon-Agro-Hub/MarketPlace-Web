"use client";

import React, { useEffect, useRef, useState } from "react";
import { getSavedCard, SavedCard } from "@/services/card-service";

export type PaymentChoice = "saved" | "new";

type Props = {
  token: string | null;
  value: PaymentChoice;
  onChange: (choice: PaymentChoice) => void;
  actionLabel?: string;
  // Lets the parent know which card was loaded (null = no saved card)
  onCardLoaded?: (card: SavedCard | null) => void;
};

const Radio = ({ checked }: { checked: boolean }) => (
  <span
    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
      checked ? "border-[#3E206D] bg-[#3E206D]" : "border-gray-300 bg-white"
    }`}
  >
    {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
  </span>
);

const SavedCardSelection: React.FC<Props> = ({
  token,
  value,
  onChange,
  actionLabel = "Pay Now",
  onCardLoaded,
}) => {
  const [card, setCard] = useState<SavedCard | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the latest callbacks without re-running the load effect
  const onChangeRef = useRef(onChange);
  const onCardLoadedRef = useRef(onCardLoaded);
  onChangeRef.current = onChange;
  onCardLoadedRef.current = onCardLoaded;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      onChangeRef.current("new");
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const found = await getSavedCard(token);
        if (cancelled) return;
        setCard(found);
        onCardLoadedRef.current?.(found);
        onChangeRef.current(found ? "saved" : "new"); // default to the saved card when there is one
      } catch {
        if (cancelled) return;
        // A failed lookup must never block paying: fall back to a new card
        setCard(null);
        onCardLoadedRef.current?.(null);
        onChangeRef.current("new");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const expiry =
    card?.expiryMonth && card?.expiryYear
      ? `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`
      : "--/--";

  const selectOnKey = (choice: PaymentChoice) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(choice);
    }
  };

  return (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
      {/* Header */}
      {card && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1a1a2e] sm:text-2xl">
                Saved Card Info
              </h2>
              <p className="mt-1 text-xs text-[#626D72] sm:text-sm">
                Please visit My Account Section if you want to replace the card.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-[11px] text-gray-600 sm:text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-gray-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Only 1 card can be saved at a time.
            </span>
          </div>
          <hr className="my-5 border-gray-100" />
        </>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-56 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Option 1: saved card (only when one exists) */}
          {card && (
            <div
              role="radio"
              aria-checked={value === "saved"}
              tabIndex={0}
              onClick={() => onChange("saved")}
              onKeyDown={selectOnKey("saved")}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-colors sm:p-5 ${
                value === "saved" ? "border-[#3E206D] bg-[#F7F5FD]" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Radio checked={value === "saved"} />
                  <span className="text-sm font-semibold text-[#1a1a2e]">Pay with Saved Card</span>
                </div>
                <span className="hidden text-[10px] text-gray-400 sm:block">
                  Visit My Account section if you want to replace the card
                </span>
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400 sm:ml-[30px]">
                Selected payment method
              </p>

              {/* Card visual */}
              <div className="mt-2 sm:ml-[30px]">
                <div className="relative aspect-[1.586/1] w-full max-w-[270px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700/20 to-slate-600/30" />
                  <div className="relative flex h-full flex-col justify-between p-4 text-white">
                    {/* Chip + contactless */}
                    <div className="flex items-start justify-between">
                      <div className="relative h-5 w-8 overflow-hidden rounded bg-gradient-to-br from-yellow-300 to-yellow-500">
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-yellow-600/30" />
                          ))}
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4 text-gray-400"
                      >
                        <path d="M6 8a8 8 0 010 8" />
                        <path d="M9 6a11 11 0 010 12" />
                        <path d="M12 4a14 14 0 010 16" />
                      </svg>
                    </div>

                    {/* Number */}
                    <div>
                      <p className="mb-1 text-[8px] font-medium uppercase tracking-widest text-gray-400">
                        Card Number
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium tracking-widest">
                        <span className="text-gray-300">••••</span>
                        <span className="text-gray-300">••••</span>
                        <span className="text-gray-300">••••</span>
                        <span className="text-white">{card.last4}</span>
                      </div>
                    </div>

                    {/* Email + expiry */}
                    <div className="flex items-end justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="mb-0.5 text-[8px] font-medium uppercase tracking-widest text-gray-400">
                          Email
                        </p>
                        <p className="truncate text-[10px] font-semibold tracking-wide">
                          {card.email || "-"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="mb-0.5 text-[8px] font-medium uppercase tracking-widest text-gray-400">
                          Expires
                        </p>
                        <p className="text-[10px] font-semibold tracking-wide">{expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Option 2: another / new card */}
          <div
            role="radio"
            aria-checked={value === "new"}
            tabIndex={0}
            onClick={() => onChange("new")}
            onKeyDown={selectOnKey("new")}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-colors sm:p-5 ${
              value === "new"
                ? "border-[#3E206D] bg-white"
                : "border-gray-200 bg-white"
            }`}
          >
            {!card ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-[#3E206D]"
                      aria-hidden="true"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e] sm:text-base">
                        Credit or Debit Card
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                        Secure payment via online gateway
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="inline-flex h-7 items-center rounded border border-gray-200 bg-white px-2.5 text-sm font-extrabold italic tracking-tight text-[#1A1F71]">
                      VISA
                    </span>
                    <span className="inline-flex h-7 w-10 items-center justify-center rounded border border-gray-200 bg-white">
                      <svg viewBox="0 0 32 20" className="h-3.5">
                        <circle cx="12" cy="10" r="7" fill="#EB001B" />
                        <circle cx="20" cy="10" r="7" fill="#F79E1B" fillOpacity="0.9" />
                        <path d="M16 4.5a7 7 0 000 11 7 7 0 000-11z" fill="#FF5F00" />
                      </svg>
                    </span>
                    <span className="inline-flex h-7 w-10 items-center justify-center rounded bg-[#2E77BC] text-[8px] font-bold text-white">
                      AMEX
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#E6F4EA]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </span>
                  <p className="text-xs leading-5 text-gray-700">
                    You will be redirected to the secure payment gateway to enter your card details
                    upon clicking <span className="font-bold">{actionLabel}</span>.
                    <span className="mt-1 block text-[10px] text-gray-500 sm:text-xs">
                      Supports Visa, Mastercard, American Express, and other major debit/credit cards.
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Radio checked={value === "new"} />
                    <span className="text-sm font-semibold text-[#1a1a2e]">
                      Pay with Another Card
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">Credit or Debit card</span>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:ml-[30px] sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EDE9FB]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3E206D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs leading-snug text-gray-700">
                        You will be redirected to the secure payment gateway to enter your card details
                        upon clicking <span className="font-bold">{actionLabel}</span>.
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        Supports Visa, Mastercard, American Express, and other major debit/credit cards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="inline-flex h-7 items-center rounded border border-gray-200 bg-white px-2.5 text-sm font-extrabold italic tracking-tight text-[#1A1F71]">
                      VISA
                    </span>
                    <span className="inline-flex h-7 w-10 items-center justify-center rounded border border-gray-200 bg-white">
                      <svg viewBox="0 0 32 20" className="h-3.5">
                        <circle cx="12" cy="10" r="7" fill="#EB001B" />
                        <circle cx="20" cy="10" r="7" fill="#F79E1B" fillOpacity="0.9" />
                        <path d="M16 4.5a7 7 0 000 11 7 7 0 000-11z" fill="#FF5F00" />
                      </svg>
                    </span>
                    <span className="inline-flex h-7 w-10 items-center justify-center rounded bg-[#2E77BC] text-[8px] font-bold text-white">
                      AMEX
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCardSelection;