"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { FaCloudUploadAlt, FaTimes, FaPaperPlane, FaHourglassHalf, FaCommentDots, FaEnvelope } from "react-icons/fa";
import { RootState } from "@/store";
import { submitComplaint } from "@/services/auth-service";
import type { OrderComplaint } from "@/services/retail-order-service";

/** Complaints raised from order history always use this category ("Complain about my order"). */
export const ORDER_COMPLAINT_CATEGORY_ID = 1;

/** Values of marcketplacecomplain.status, lower-cased. Change "replied" if admin uses another word. */
export const COMPLAINT_STATUS = { OPENED: "opened", REPLIED: "replied", CLOSED: "closed" } as const;

const MAX_IMAGES = 6;
const MAX_SIZE = 5 * 1024 * 1024;

/* ───────────────────────── helpers ───────────────────────── */

// Renders stored text that contains <br/> as real line breaks, without using innerHTML
function Lines({ text }: { text: string }) {
    return (
        <>
            {text.split(/<br\s*\/?>/i).map((line, i) => (
                <span key={i}>
                    {i > 0 && <br />}
                    {line}
                </span>
            ))}
        </>
    );
}

function formatSent(iso?: string | null): string {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    const time = d
        .toLocaleTimeString("en-US", { timeZone: "Asia/Colombo", hour: "numeric", minute: "2-digit", hour12: true })
        .replace(" ", "");
    const date = d.toLocaleDateString("en-US", { timeZone: "Asia/Colombo", month: "long", day: "numeric", year: "numeric" });
    return `At ${time} on ${date}`;
}

const compressImage = (file: File, maxW = 1600, maxH = 1600, quality = 0.8): Promise<File> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width > maxW || height > maxH) {
                const r = Math.min(maxW / width, maxH / height);
                width = Math.round(width * r);
                height = Math.round(height * r);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas not supported"));
            ctx.drawImage(img, 0, 0, width, height);
            const type = file.type === "image/png" ? "image/png" : "image/jpeg";
            canvas.toBlob(
                (blob) => (blob ? resolve(new File([blob], file.name, { type, lastModified: Date.now() })) : reject(new Error("toBlob failed"))),
                type,
                quality,
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image"));
        };
        img.src = url;
    });

/* ───────────────────────── modal shell (portal) ───────────────────────── */

function ModalShell({
    isOpen,
    onClose,
    maxWidth = "max-w-[560px]",
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    maxWidth?: string;
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className={`w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}

/* ───────────────────────── 1. Report a Complaint ───────────────────────── */

export function ReportComplaintModal({
    isOpen,
    invoiceNo,
    onClose,
    onSubmitted,
}: {
    isOpen: boolean;
    invoiceNo: string;
    onClose: () => void;
    onSubmitted: () => void;
}) {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [dragging, setDragging] = useState(false);

    // Reset every time the popup opens
    useEffect(() => {
        if (isOpen) {
            setText("");
            setImages([]);
            setError(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
    useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

    const handleClose = () => {
        if (!submitting) onClose();
    };

    const addFiles = async (files: File[]) => {
        const valid: File[] = [];
        let badType = false;
        let tooBig = false;
        let duplicate = false;

        files.forEach((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            const okType = ["image/jpeg", "image/png"].includes(file.type) && ["jpg", "jpeg", "png"].includes(ext);
            const isDup = images.some((i) => i.name === file.name && i.size === file.size);
            if (isDup) duplicate = true;
            else if (!okType) badType = true;
            else if (file.size > MAX_SIZE) tooBig = true;
            else valid.push(file);
        });

        if (images.length + valid.length > MAX_IMAGES) {
            setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }
        if (badType) setError("Invalid file type. Please upload only JPEG or PNG images.");
        else if (tooBig) setError("File size too large. Maximum size allowed is 5MB.");
        else if (duplicate) setError("You have already uploaded this image.");
        else setError(null);

        if (valid.length > 0) {
            const compressed = await Promise.all(valid.map((f) => compressImage(f).catch(() => f)));
            setImages((prev) => [...prev, ...compressed]);
        }
    };

    const handleSend = async () => {
        if (!token || !user?.id) {
            setError("You are not authenticated. Please log in first.");
            return;
        }
        if (!text.trim()) {
            setError("Please explain your complaint.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await submitComplaint({
                userId: user.id,
                token,
                complaintCategoryId: ORDER_COMPLAINT_CATEGORY_ID,
                // Prefix links the complaint to the invoice; <br/> puts the customer's text on a new line
                complaint: `Complaint regarding Invoice No : ${invoiceNo}<br/>${text.trim()}`,
                images,
                imagesToDelete: [],
            });
            onSubmitted();
        } catch (err: any) {
            setError(err.message || "Failed to submit your complaint. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell isOpen={isOpen} onClose={handleClose} maxWidth="max-w-[560px]">
            <div className="px-6 py-4 border-b border-[#F0F0F0]">
                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#001535]">Report a Complaint</h3>
            </div>

            <div className="px-6 py-4 overflow-y-auto">
                <div className="rounded-lg bg-[#EAEFF8] px-4 py-3 text-center text-[13px] text-[#001535]">
                    Complain regarding Invoice No : <span className="font-bold">{invoiceNo}</span>
                </div>

                <label htmlFor="order-complaint-text" className="block mt-4 mb-1 text-[12px] md:text-[13px] text-[#4B5563]">
                    Please explain the complaint
                </label>
                <textarea
                    id="order-complaint-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type here.."
                    disabled={submitting}
                    className="w-full h-32 resize-none rounded-lg border border-[#CECECE] p-3 text-[13px] focus:outline-none focus:border-[#3E206D] disabled:opacity-50"
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <label
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            if (!submitting) addFiles(Array.from(e.dataTransfer.files));
                        }}
                        className={`flex-1 min-h-[130px] flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-[#CECECE] px-3 cursor-pointer ${dragging ? "bg-gray-100" : ""} ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <FaCloudUploadAlt className="text-3xl text-[#626D76] mb-2" />
                        <span className="text-[12px] text-[#626D76]">
                            Click or drag files here to upload
                            <br />
                            one or more photos.
                        </span>
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            className="hidden"
                            disabled={submitting}
                            onChange={(e) => {
                                if (e.target.files) addFiles(Array.from(e.target.files));
                                e.target.value = "";
                            }}
                        />
                    </label>

                    <div className="flex-1 min-h-[130px] rounded-lg border border-[#CECECE] p-3">
                        {images.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[12px] text-[#848D95]">
                                --No photos added to preview--
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {previews.map((src, i) => (
                                    <div key={src} className="relative w-16 h-16">
                                        <img src={src} alt={images[i].name} className="w-full h-full object-cover rounded" />
                                        <button
                                            type="button"
                                            aria-label="Remove photo"
                                            disabled={submitting}
                                            onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FA0000] text-white flex items-center justify-center cursor-pointer"
                                        >
                                            <FaTimes className="text-[9px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="h-10 px-6 rounded-lg bg-[#F3F4F7] hover:bg-[#e1e2e5] text-[#757E87] text-[14px] font-medium shadow-sm cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={submitting || !text.trim()}
                    className="h-10 px-6 rounded-lg bg-[#3E206D] hover:bg-[#341a5a] text-white text-[14px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Sending..." : "Send"}
                </button>
            </div>
        </ModalShell>
    );
}

/* ───────────────────────── 2. View Complaint (Under Review) ───────────────────────── */

export function ViewComplaintModal({
    isOpen,
    loading,
    complaint,
    error,
    onClose,
}: {
    isOpen: boolean;
    loading: boolean;
    complaint: OrderComplaint | null;
    error: string | null;
    onClose: () => void;
}) {
    const steps = complaint
        ? [
            { icon: <FaPaperPlane />, active: true, title: "Complaint Submitted", text: "Your complaint has been submitted.", time: formatSent(complaint.createdAt) },
            { icon: <FaHourglassHalf />, active: true, title: "Under Review", text: "We are reviewing your complaint." },
            { icon: <FaCommentDots />, active: false, title: "Pending Resolution", text: "Our team will get back to you soon." },
        ]
        : [];

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-[520px]">
            <div className="px-6 py-4 border-b border-[#F0F0F0]">
                <h3 className="text-[16px] font-bold text-[#001535]">View Complaint</h3>
            </div>

            <div className="px-5 py-4 overflow-y-auto space-y-4">
                {loading && <p className="text-center text-[13px] text-[#626D76] py-10">Loading...</p>}
                {!loading && error && <p className="text-center text-[13px] text-red-500 py-10">{error}</p>}

                {!loading && complaint && (
                    <>
                        <div className="rounded-xl border border-[#E5E7EB] p-4 text-[#001535]">
                            <p className="text-[11px] text-[#626D76]">Complaint ID</p>
                            <p className="text-[15px] font-bold">{complaint.refId}</p>
                            <p className="text-[11px] mt-0.5">Sent : {formatSent(complaint.createdAt)}</p>

                            <hr className="my-3 border-[#F0F0F0]" />
                            <p className="text-[11px] text-[#626D76]">Category</p>
                            <p className="text-[14px] font-bold">{complaint.category}</p>

                            <hr className="my-3 border-[#F0F0F0]" />
                            <p className="text-[11px] text-[#626D76]">Description</p>
                            <p className="text-[13px] leading-relaxed break-words">
                                <Lines text={complaint.description} />
                            </p>

                            {complaint.images.length > 0 && (
                                <>
                                    <hr className="my-3 border-[#F0F0F0]" />
                                    <p className="text-[11px] text-[#626D76] mb-2">Photos ({complaint.images.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {complaint.images.map((img) => (
                                            <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={img.url}
                                                    alt="Complaint photo"
                                                    className="w-16 h-16 object-cover rounded-lg border border-[#E5E7EB]"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-xl border border-[#E5E7EB] p-4">
                            {steps.map((s, i) => (
                                <div key={s.title} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] ${s.active ? "bg-black text-white" : "bg-[#F1F3F6] text-[#626D76]"}`}>
                                            {s.icon}
                                        </span>
                                        {i < steps.length - 1 && <span className="w-px flex-1 bg-[#D1D5DB] my-1" />}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[14px] font-bold text-[#001535]">{s.title}</p>
                                        <p className="text-[11px] text-[#626D76]">{s.text}</p>
                                        {s.time && <p className="text-[11px] text-[#626D76]">{s.time}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="px-6 py-4 border-t border-[#F0F0F0] flex justify-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-8 rounded-lg bg-[#F3F4F7] hover:bg-[#e1e2e5] text-[#757E87] text-[14px] font-medium shadow-sm cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        </ModalShell>
    );
}

/* ───────────────────────── 3. Complaint Reply ───────────────────────── */

export function ComplaintReplyModal({
    isOpen,
    loading,
    complaint,
    error,
    onClose,
}: {
    isOpen: boolean;
    loading: boolean;
    complaint: OrderComplaint | null;
    error: string | null;
    onClose: () => void;
}) {
    const user = useSelector((state: RootState) => state.auth.user) as any;
    const customerName = user?.firstName || "Customer";

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-[560px]">
            <div className="p-6 flex flex-col items-center overflow-y-auto">
                <img src="/icons/reply.png" alt="Reply Icon" className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold mb-4">Reply for your complaint</h3>

                {loading && <p className="text-center text-sm text-gray-500 py-10">Loading...</p>}
                {!loading && error && <p className="text-center text-sm text-red-500 py-10">{error}</p>}

                {!loading && complaint && (
                    <div className="w-full border border-gray-300 rounded-md p-4 mb-4 max-h-60 overflow-y-auto">
                        <p className="text-sm mb-2">Dear {customerName},</p>
                        <p className="text-sm mb-4 whitespace-pre-wrap break-words">
                            {complaint.reply ? <Lines text={complaint.reply} /> : "No reply available yet."}
                        </p>
                        <p className="text-sm">Sincerely,</p>
                        <p className="text-sm">Polygon Customer Support Team</p>
                        <p className="text-sm">{formatSent(complaint.replyTime)}</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="w-24 h-9 text-sm text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                    style={{ backgroundColor: "#F3F4F7" }}
                >
                    Go Back
                </button>
            </div>
        </ModalShell>
    );
}