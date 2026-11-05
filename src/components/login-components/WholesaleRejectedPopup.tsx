"use client";
import React, { useRef, useState } from "react";
import {
    ShieldX, Upload, Trash2, FileText, Image as ImageIcon,
    CheckCircle2, FilePlus2, Loader2,
} from "lucide-react";
import { resubmitWholesaleBr, WholesaleStatusInfo } from "@/services/auth-service";
import { formatReviewDate } from "./wholesaleUtils";

const BR_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const BR_MAX_SIZE = 5 * 1024 * 1024;

interface Props {
    isOpen: boolean;
    info: WholesaleStatusInfo | null;
    email: string;
    password: string;
    onResubmitted: (info: WholesaleStatusInfo) => void;
    onClose: () => void;
}

export default function WholesaleRejectedPopup({
    isOpen, info, email, password, onResubmitted, onClose,
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
            setError("File size must be 5MB or less");
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
            <div className="my-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                        <ShieldX className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <h3 className="mt-3 text-center text-xl font-bold text-[#0F172A]">
                    Verification Unsuccessful
                </h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Your wholesale account application could not be approved due to issues
                    found with the submitted documentation. Please review the details below
                    and resubmit valid documents.
                </p>

                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Application Reference</span>
                        <span className="rounded border border-gray-300 bg-white px-2 py-0.5 font-mono text-xs font-semibold">
                            {info.reference}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Review Status</span>
                        <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Action Required
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Reviewed Date</span>
                        <span className="font-medium text-gray-800">
                            {formatReviewDate(info.reviewedAt)}
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

                {/* Upload */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-gray-700 uppercase">
                            Business Registration (BR)
                        </span>
                        <span className="text-[10px] border border-purple-300 text-purple-700 bg-white rounded px-1.5 py-0.5">
                            Business Only
                        </span>
                    </div>

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
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleSelect(e.dataTransfer.files?.[0]);
                            }}
                            className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg py-6 cursor-pointer bg-white transition-colors ${
                                isDragging ? "border-[#3E206D] bg-purple-50" : "border-gray-300"
                            }`}
                        >
                            <Upload className="w-5 h-5 text-[#3E206D]" />
                            <span className="text-sm font-medium text-[#3E206D] underline">
                                Click to browse or drag and drop
                            </span>
                            <span className="text-xs text-gray-400">
                                Supported formats: JPG, PNG, or PDF (Max 5MB)
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 border border-green-300 bg-white rounded-lg p-3">
                            <div className="w-10 h-10 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                                {file.type === "application/pdf" ? (
                                    <FileText className="w-5 h-5 text-red-500" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <span className="text-xs text-gray-400">
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </span>
                            </div>
                            <button type="button" onClick={handleRemove} className="p-1 text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <button
                    type="button"
                    onClick={handleResubmit}
                    disabled={submitting}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E206D] py-3 font-semibold text-white hover:bg-purple-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            <FilePlus2 className="h-4 w-4" /> Resubmit Documents
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    Close
                </button>
            </div>
        </div>
    );
}