import React, { useEffect, useState } from "react";

interface CancelOrderPopupProps {
  open: boolean;
  creditAmount?: number;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  logo?: React.ReactNode;
}

const CONFIRM_WORD = "CANCEL";

export const CancelOrderPopup = ({
  open,
  creditAmount,
  onClose,
  onConfirm,
  logo,
}: CancelOrderPopupProps) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = value === CONFIRM_WORD;

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!isValid || loading) return;
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = `Rs. ${(creditAmount ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const hasCredit = (creditAmount ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-3xl bg-white px-6 pb-6 pt-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute cursor-pointer right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Warning icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-red-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M10.3 3.9 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    fill="#ef1c1c"
                  />
                  <path
                    d="M12 9v5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="17.2" r="1.1" fill="#fff" />
                </svg>
              </div>
            </div>
            {logo && (
              <div className="absolute -bottom-1 -right-8 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
                {logo}
              </div>
            )}
          </div>
        </div>

        {/* Title + description */}
        <h2
          id="cancel-order-title"
          className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900"
        >
          Cancel This Order?
        </h2>
        <p className="mx-auto mt-2 max-w-[340px] text-center text-sm leading-relaxed text-[#576879]">
          {hasCredit ? (
            <>
              This action cannot be undone and your applied credit balance of{" "}
              <span className="font-bold text-slate-900">
                {formattedAmount}
              </span>{" "}
              will be refunded to your credit balance.
            </>
          ) : (
            "This action cannot be undone."
          )}
        </p>

        <hr className="my-5 border-slate-100" />

        {/* Confirmation input */}
        <label
          htmlFor="cancel-order-confirm"
          className="block text-xs text-[#576879]"
        >
          To confirm cancellation, please type{" "}
          <span className="select-none font-mono text-[11px] font-bold text-[#FF0000]">
            {CONFIRM_WORD}
          </span>{" "}
          in the box below:
        </label>
        <input
          id="cancel-order-confirm"
          type="text"
          value={value}
          onChange={(e) => {
            const formattedValue = e.target.value.replace(/\s/g, "").toUpperCase();
            setValue(formattedValue);
          }}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          placeholder={`Type ${CONFIRM_WORD} to confirm`}
          autoComplete="off"
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
        <p className="mt-2 text-[11px] text-[#576879]">
          *Requires uppercase &quot;{CONFIRM_WORD}&quot;.
        </p>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-[1fr_1.1fr] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl cursor-pointer border border-[#CBD5E1] bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            No, Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className="flex h-11 items-center cursor-pointer justify-center gap-2 rounded-xl bg-[#FF0000] text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            {loading ? "Cancelling…" : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};
