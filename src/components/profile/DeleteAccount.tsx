"use client";

import React, { useEffect, useState } from "react";
import { FaAngleLeft, FaLock, FaTrash } from "react-icons/fa";
import { FaShieldHalved } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
    fetchDeleteAccountEligibility,
    deleteAccount,
    DeleteAccountEligibility,
} from "@/services/auth-service"; // <-- adjust to your service file path
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";

interface DeleteAccountProps {
    /** Called by "Go Back" and "Cancel" (e.g. () => setSelectedMenu("personalDetails")) */
    onBack: () => void;
    /** Called when the user taps "Clear Negative Credit Balance" */
    onClearNegativeBalance?: () => void;
    /** Called after the account is deleted. Default: clear storage + redirect to "/" */
    onDeleted?: () => void;
}

// Adjust to your Redux shape
interface RootState {
    auth: { token: string | null };
}

const CONFIRM_WORD = "DELETE";

const DeleteAccount: React.FC<DeleteAccountProps> = ({
    onBack,
    onClearNegativeBalance,
    onDeleted,
}) => {
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.token);

    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] =
        useState<DeleteAccountEligibility | null>(null);
    const [confirmText, setConfirmText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const showError = (message: string) => {
        setErrorMessage(message);
        setShowErrorPopup(true);
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!token) return;
            try {
                const data = await fetchDeleteAccountEligibility(token);
                if (!cancelled) setEligibility(data);
            } catch (e: any) {
                if (!cancelled) {
                    setLoadFailed(true);
                    showError(e.message || "Something went wrong");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const isMatch = confirmText === CONFIRM_WORD;

    const handleDelete = async () => {
        if (!token || !isMatch || submitting || deleted) return;
        setSubmitting(true);
        setShowErrorPopup(false);
        try {
            await deleteAccount(token);
            setDeleted(true);
            setShowSuccessPopup(true);

            // Let the user read the success popup, then finish up
            setTimeout(() => {
                if (onDeleted) {
                    onDeleted();
                } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                }
            }, 3000);
        } catch (e: any) {
            showError(e.message || "Failed to delete account");
            setSubmitting(false);
        }
    };

    const handleClearBalance = () => {
        if (onClearNegativeBalance) onClearNegativeBalance();
        // TODO: navigate to your payment / settle-balance page, e.g.
        // else router.push("/account/settle-credit");
    };

    const blockedByOrders = eligibility?.hasPendingOrders;
    const blockedByCredit = !blockedByOrders && eligibility?.hasNegativeCredit;
    const canDelete = !!eligibility && !blockedByOrders && !blockedByCredit;

    return (
        <div className="w-full bg-white min-h-full">
            <SuccessPopup
                isVisible={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Account Deleted!"
                description="Your account has been deleted successfully. You will be redirected shortly."
            />

            <ErrorPopup
                isVisible={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                title="Error!"
                description={errorMessage}
            />

            {/* Header */}
            <div className="px-6 pt-5">
                <h2 className="text-[16px] font-semibold text-[#111827]">
                    Delete Account
                </h2>
                <p className="text-[14px] text-[#6B7280] mt-1">
                    Permanently deactivate and delete your account data and services.
                </p>
                <div className="border-b border-[#D4D8DC] mt-3" />
            </div>

            <div className="px-6 py-4">
                {/* Go back */}
                <button
                    type="button"
                    onClick={onBack}
                    disabled={deleted}
                    className="flex items-center gap-2 text-[13px] text-black"
                >
                    <FaAngleLeft className="text-[12px]" />
                    <span className="underline">Go Back</span>
                </button>

                {/* Icon */}
                <div className="flex flex-col items-center mt-4">
                    <div className="w-[66px] h-[66px] rounded-full bg-[#FEEFEF] flex items-center justify-center">
                        <FaTrash className="text-[#EF4444] text-[22px]" />
                    </div>

                    <h3 className="mt-5 text-[20px] font-bold text-[#111827]">
                        Delete Your Account?
                    </h3>
                    <p className="mt-2 text-center text-[13px] text-[#374151] leading-5">
                        <span className="text-[#EF2B2B]">This action is permanent.</span>{" "}
                        Your account data will be deleted,
                        <br />
                        while certain information may be retained for legal or
                        record-keeping purposes.
                    </p>
                </div>

                {/* Info card */}
                <div className="mt-6 rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-5 max-w-[836px] mx-auto">
                    <h4 className="text-[14px] font-semibold text-[#111827]">
                        What will be deleted?
                    </h4>
                    <ul className="mt-3 space-y-2">
                        {[
                            "Your personal information and profile.",
                            "Saved addresses and payment methods.",
                            "Account preferences and settings.",
                            "Any remaining positive credit balance.",
                        ].map((t) => (
                            <li
                                key={t}
                                className="flex items-center gap-3 text-[12px] text-[#4B5563]"
                            >
                                <span className="w-[5px] h-[5px] rounded-full bg-[#9CA3AF]" />
                                {t}
                            </li>
                        ))}
                    </ul>

                    <h4 className="mt-4 text-[14px] font-semibold text-[#111827]">
                        What will retain?
                    </h4>
                    <ul className="mt-3">
                        <li className="flex items-start gap-3 text-[12px] text-[#4B5563]">
                            <span className="w-[5px] h-[5px] rounded-full bg-[#9CA3AF] mt-[6px] shrink-0" />
                            Certain information, including your NIC and order history, may be
                            retained where necessary for legal, regulatory, accounting,
                            fraud-prevention, or record-keeping purposes.
                        </li>
                    </ul>
                </div>

                {/* State area */}
                <div className="max-w-[836px] mx-auto">
                    {loading && (
                        <p className="mt-8 text-center text-[13px] text-[#6B7280]">
                            Checking your account...
                        </p>
                    )}

                    {/* State 3: processing orders */}
                    {!loading && blockedByOrders && (
                        <div className="mt-8 rounded-[8px] bg-[#FFEBEB] px-4 py-4 flex items-center gap-3">
                            <FaShieldHalved className="text-[#EF2B2B] text-[18px] shrink-0" />
                            <p className="text-[14px] text-[#111827]">
                                You have processing orders. Once all of them are completed, you
                                may delete your account.
                            </p>
                        </div>
                    )}

                    {/* State 4: negative credit balance */}
                    {!loading && blockedByCredit && (
                        <div className="mt-8 rounded-[8px] bg-[#FFEBEB] px-4 py-4">
                            <div className="flex items-center gap-3">
                                <FaShieldHalved className="text-[#EF2B2B] text-[18px] shrink-0" />
                                <p className="text-[14px] text-[#111827]">
                                    You have a negative credit balance on your account. Please
                                    clear the outstanding balance before deleting your account.
                                </p>
                            </div>
                            <div className="flex justify-center mt-3">
                                <button
                                    type="button"
                                    onClick={handleClearBalance}
                                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[16px] font-medium rounded-[6px] px-6 py-[10px] shadow-md cursor-pointer"
                                >
                                    Clear Negative Credit Balance
                                </button>
                            </div>
                        </div>
                    )}

                    {/* States 1 & 2: confirmation */}
                    {!loading && canDelete && (
                        <>
                            <p className="mt-10 text-center text-[13px] text-[#111827]">
                                To confirm account deletion, please type{" "}
                                <span className="text-[#EF2B2B]">{CONFIRM_WORD}</span> in the
                                box below.
                            </p>

                            <div className="mt-3 mx-auto max-w-[466px] flex items-center gap-3 border border-[#D4D8DC] rounded-[10px] px-3 h-[40px] bg-white">
                                <span className="w-[24px] h-[24px] rounded-full bg-[#F1F2F4] flex items-center justify-center shrink-0">
                                    <FaLock className="text-[10px] text-[#6B7280]" />
                                </span>
                                <input
                                    type="text"
                                    value={confirmText}
                                    maxLength={CONFIRM_WORD.length}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    placeholder={CONFIRM_WORD}
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    disabled={submitting || deleted}
                                    className={`flex-1 bg-transparent outline-none text-[12px] font-semibold tracking-wide uppercase placeholder:font-normal placeholder:text-[#9CA3AF] ${isMatch ? "text-[#DC2626]" : "text-[#111827]"
                                        }`}
                                />
                                <span className="text-[10px] text-[#6B7280]">
                                    {confirmText.length}/{CONFIRM_WORD.length}
                                </span>
                            </div>

                            <div className="mt-8 border-t border-[#D4D8DC]" />

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={submitting || deleted}
                                    className="bg-[#F1F2F4] text-[#6B7280] text-[16px] rounded-[6px] px-6 py-[10px] shadow-sm cursor-pointer hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={!isMatch || submitting || deleted}
                                    className={`text-white text-[16px] font-medium rounded-[6px] px-8 py-[10px] cursor-pointer transition-colors ${isMatch && !submitting && !deleted
                                            ? "bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer"
                                            : "bg-[#A8A8A8] cursor-not-allowed"
                                        }`}
                                >
                                    {deleted
                                        ? "Account Deleted"
                                        : submitting
                                            ? "Deleting..."
                                            : "Delete My Account"}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Fallback if eligibility could not be loaded (details are in the error popup) */}
                    {!loading && !eligibility && loadFailed && (
                        <p className="mt-8 text-center text-[13px] text-[#DC2626]">
                            Unable to check your account right now. Please try again later.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;