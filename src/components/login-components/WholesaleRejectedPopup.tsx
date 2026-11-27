"use client";
import React, { useRef, useState } from "react";
import {
  ShieldX,
  Upload,
  Trash2,
  File as FileIcon,
  Check,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { resubmitWholesaleBr, WholesaleStatusInfo } from "@/services/auth-service";
import { formatReviewDate } from "./wholesaleUtils";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const BR_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const BR_MAX_SIZE = 10 * 1024 * 1024;

interface Props {
  isOpen: boolean;
  info: WholesaleStatusInfo | null;
  email: string;
  password: string;
  onResubmitted: (info: WholesaleStatusInfo) => void;
  onClose: () => void;
}

export default function WholesaleRejectedPopup({
  isOpen,
  info,
  email,
  password,
  onResubmitted,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !info) return null;

  const handleSelect = (f?: File | null) => {
    if (!f) return;
    if (!BR_ALLOWED_TYPES.includes(f.type)) {
      setError("Only JPG, PNG or PDF files are allowed");
      return;
    }
    if (f.size > BR_MAX_SIZE) {
      setError("File size must be 10MB or less");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleResubmit = async () => {
    if (!file) {
      setError("Please upload your business registration document");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const newInfo = await resubmitWholesaleBr(email, password, file);
      handleRemove();
      onResubmitted(newInfo);
    } catch (err: any) {
      setError(err.message || "Failed to resubmit documents");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!file && !submitting;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/60">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white px-6 pb-6 pt-10 shadow-xl">
          {/* Icon box with red X badge */}
          <div className="flex justify-center">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: "#FFF7F8",
                border: "1.5px solid #FFB3BF",
              }}
            >
              <ShieldX
                className="h-8 w-8"
                style={{ color: "#FF3B5C" }}
                strokeWidth={1.8}
              />
              <span
                className="absolute flex items-center justify-center"
                style={{
                  right: -8,
                  bottom: -8,
                  width: 26,
                  height: 26,
                  borderRadius: "9999px",
                  backgroundColor: "#FF3B5C",
                  border: "2px solid #fff",
                }}
              >
                <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
            </div>
          </div>

          <h3
            className={`${roboto.className} mt-6 text-center text-[24px] font-bold text-[#111827]`}
          >
            Verification Unsuccessful!
          </h3>
          <p
            className={`${roboto.className} mt-3 text-center text-[14px] leading-relaxed text-slate-600`}
          >
            Your wholesale account application could not be approved due to
            issues found with the submitted documentation. Please review the
            reason below and resubmit valid documents.
          </p>

          {/* Review info card */}
          <div className="mt-6 space-y-4 rounded-2xl border border-[#E4DFF7] bg-white p-5">
            <div className="flex items-center justify-between">
              <span
                className={`${roboto.className} text-[12px] font-medium text-slate-600`}
              >
                Review Status
              </span>
              <span
                className={`${roboto.className} flex items-center gap-2 rounded-full border border-[#FF6232] bg-white px-3 py-1 text-[12px] font-semibold text-[#FF6232]`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6232]" />
                Action Required
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`${roboto.className} text-[12px] font-medium text-slate-600`}
              >
                Reviewed Date
              </span>
              <span
                className={`${roboto.className} text-[12px] font-semibold text-black`}
              >
                {formatReviewDate(info.reviewedAt)}
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

          {/* Upload card */}
          <div className="mt-4 rounded-2xl border border-[#E4DFF7] bg-white p-5">
            <span
              className={`${roboto.className} block text-[13px] font-medium uppercase tracking-wide text-[#111827]`}
            >
              Business Registration (BR)
            </span>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => handleSelect(e.target.files?.[0])}
            />

            {!file ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleSelect(e.dataTransfer.files?.[0]);
                }}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed px-4 py-7 transition-colors ${
                  isDragging
                    ? "border-[#FF6232] bg-[#FFF6F2]"
                    : "border-[#CFC8F0] bg-[#FAF9FF]"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Upload className="h-5 w-5 text-[#FF6232]" />
                </span>
                <span
                  className={`${roboto.className} mt-1 text-[14px] text-slate-700`}
                >
                  <span className="font-bold text-[#FF6232]">Click to browse</span>{" "}
                  or drag and drop
                </span>
                <span
                  className={`${roboto.className} text-[12px] text-slate-600`}
                >
                  Supported formats: JPG, PNG, or PDF (Max 10MB)
                </span>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E4DFF7] bg-white p-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E4DFF7] bg-white">
                    <FileIcon className="h-5 w-5 text-[#111827]" />
                  </div>
                  <span
                    className="absolute flex items-center justify-center"
                    style={{
                      right: -6,
                      bottom: -6,
                      width: 20,
                      height: 20,
                      borderRadius: "9999px",
                      backgroundColor: "#FF6232",
                      border: "2px solid #fff",
                    }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`${roboto.className} truncate text-[14px] font-bold text-[#111827]`}
                  >
                    {file.name}
                  </p>
                  <span
                    className={`${roboto.className} text-[12px] text-slate-500`}
                  >
                    {(file.size / (1024 * 1024)).toFixed(1)} MB •{" "}
                    {file.type === "application/pdf"
                      ? "PDF document"
                      : "Image file"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  title="Remove file"
                  aria-label="Remove file"
                  className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-500 bg-white text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && (
              <p className={`${roboto.className} mt-3 text-[12px] text-red-600`}>
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleResubmit}
            disabled={!canSubmit}
            className={`${roboto.className} mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-xl font-semibold transition-colors ${
              canSubmit
                ? "cursor-pointer bg-[#FF6232] text-white hover:bg-[#e8561f]"
                : "cursor-not-allowed bg-[#E5E7EB] text-[#94A3B8]"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
              </>
            ) : (
              "Resubmit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}