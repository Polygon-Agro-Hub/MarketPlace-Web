"use client";
import React from "react";
import { Lottie } from "lottie-react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import pendingAnimation from "@/assets/animations/pending.json";
import { WholesaleStatusInfo } from "@/services/auth-service";
import { formatReviewDate } from "./wholesaleUtils";

interface Props {
    isOpen: boolean;
    info: WholesaleStatusInfo | null;
    onClose: () => void;
}

export default function WholesalePendingPopup({ isOpen, info, onClose }: Props) {
    if (!isOpen || !info) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Lottie in a bordered box with shield badge */}
                <div className="flex justify-center">
                    <div
                        className="relative flex items-center justify-center"
                        style={{
                            width: 84,
                            height: 84,
                            borderRadius: 18,
                            backgroundColor: "#FFFAE6",
                            border: "2px solid #FDE9A2",
                            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
                        }}
                    >
                        <div style={{ width: 52, height: 52 }}>
                            <Lottie
                                src={pendingAnimation}
                                loop
                                autoplay
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>

                        <span
                            className="absolute flex items-center justify-center"
                            style={{
                                right: -8,
                                bottom: -8,
                                width: 28,
                                height: 28,
                                borderRadius: "9999px",
                                backgroundColor: "#3E206D",
                                border: "2px solid #fff",
                            }}
                        >
                            <ShieldCheck className="h-3.5 w-3.5 text-white" />
                        </span>
                    </div>
                </div>

                <h3 className="mt-4 text-center text-xl font-bold text-[#0F172A]">
                    Wholesale Verification Pending
                </h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Your wholesale account registration and business documents are currently
                    being verified by our team. This process typically takes 24–48 hours to
                    ensure all trade compliance standards are met.
                </p>

                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Review Status</span>
                        <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending Approval
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Submitted Date</span>
                        <span className="font-medium text-gray-800">
                            {formatReviewDate(info.submittedAt)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-500 flex-shrink-0">Submitted Document</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-medium min-w-0">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{info.fileName ?? "Business Registration"}</span>
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 w-full rounded-lg bg-[#3E206D] py-3 font-semibold text-white hover:bg-purple-800 transition-colors cursor-pointer"
                >
                    Got it, check back later
                </button>
            </div>
        </div>
    );
}