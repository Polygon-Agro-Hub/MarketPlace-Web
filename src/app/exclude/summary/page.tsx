"use client";

import { RootState } from "@/store";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { Trash, Plus, Info } from "lucide-react";
import {
  getExcludedItems,
  deleteExcludedItems,
  getIncludedItems,
  deleteIncludedItems,
  updateUserStatus,
} from "@/services/product-service";
import { useRouter } from "next/navigation";
import SuccessPopup from "@/components/toast-messages/success-message";
import Loader from "@/components/loader-spinner/Loader";
import Lottie from "react-lottie";
import addNewAnimation from "@/assets/animations/GoViMartAddNew.json";
import HeartIcon from "../../../../public/icons/heart-solid.png";
import CancerIcon from "../../../../public/icons/xmark-solid.png";

interface Item {
  displayName: string;
  image: string;
}

export default function ExcludedItems() {
  const router = useRouter();
  const authToken = useSelector((state: RootState) => state.auth.token) || null;

  const [includeItems, setIncludeItems] = useState<Item[]>([]);
  const [selectedIncludeItems, setSelectedIncludeItems] = useState<string[]>(
    [],
  );
  const [excludeItems, setExcludeItems] = useState<Item[]>([]);
  const [selectedExcludeItems, setSelectedExcludeItems] = useState<string[]>(
    [],
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);
  const [deleteType, setDeleteType] = useState<"include" | "exclude">(
    "exclude",
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [continueLoading, setContinueLoading] = useState<boolean>(false);

  // ── Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }
      try {
        const [includedData, excludedData] = await Promise.all([
          getIncludedItems(authToken),
          getExcludedItems(authToken),
        ]);
        if (includedData.status && Array.isArray(includedData.items)) {
          setIncludeItems(includedData.items);
        }
        if (excludedData.status && Array.isArray(excludedData.items)) {
          setExcludeItems(excludedData.items);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [authToken]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleIncludeToggle = (name: string) =>
    setSelectedIncludeItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );

  const handleIncludeSelectAll = () =>
    setSelectedIncludeItems(
      selectedIncludeItems.length === includeItems.length
        ? []
        : includeItems.map((i) => i.displayName),
    );

  const handleExcludeToggle = (name: string) =>
    setSelectedExcludeItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );

  const handleExcludeSelectAll = () =>
    setSelectedExcludeItems(
      selectedExcludeItems.length === excludeItems.length
        ? []
        : excludeItems.map((i) => i.displayName),
    );

  const handleDeleteClick = (
    displayName: string,
    type: "include" | "exclude",
  ) => {
    setItemToDelete(displayName);
    setIsBulkDelete(false);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteSelectedClick = (type: "include" | "exclude") => {
    const sel =
      type === "include" ? selectedIncludeItems : selectedExcludeItems;
    if (sel.length > 0) {
      setIsBulkDelete(true);
      setDeleteType(type);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!authToken) return;
    const itemsToDelete = isBulkDelete
      ? deleteType === "include"
        ? selectedIncludeItems
        : selectedExcludeItems
      : itemToDelete
        ? [itemToDelete]
        : [];
    if (itemsToDelete.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    try {
      const deleteFn =
        deleteType === "include" ? deleteIncludedItems : deleteExcludedItems;
      const response = await deleteFn(itemsToDelete, authToken);
      if (response.status) {
        if (deleteType === "include") {
          setIncludeItems((prev) =>
            prev.filter((i) => !itemsToDelete.includes(i.displayName)),
          );
          setSelectedIncludeItems((prev) =>
            prev.filter((i) => !itemsToDelete.includes(i)),
          );
        } else {
          setExcludeItems((prev) =>
            prev.filter((i) => !itemsToDelete.includes(i.displayName)),
          );
          setSelectedExcludeItems((prev) =>
            prev.filter((i) => !itemsToDelete.includes(i)),
          );
        }
        setSuccessMessage("Items removed successfully!");
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete items");
      setTimeout(() => setError(null), 3000);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setIsBulkDelete(false);
    }
  };

  // ── Continue ──────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!authToken) return;
    setContinueLoading(true);
    try {
      const statusResponse = await updateUserStatus(authToken);
      if (!statusResponse.status) {
        setError(statusResponse.message || "Failed to update user status.");
        return;
      }
      router.push("/signin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setContinueLoading(false);
    }
  };

  // ── Panel ─────────────────────────────────────────────────────────
  const renderPanel = (
    items: Item[],
    selectedItems: string[],
    onToggle: (n: string) => void,
    onSelectAll: () => void,
    onDelete: (n: string) => void,
    onDeleteSelected: () => void,
    type: "include" | "exclude",
  ) => {
    const isInclude = type === "include";
    const hasItems = items.length > 0;
    const allSelected =
      selectedItems.length === items.length && items.length > 0;

    return (
      <div
        className={`flex-1 rounded-2xl border-2 overflow-hidden flex flex-col ${
          isInclude
            ? "border-[#E8F5E9] bg-[#F9FFF9]"
            : "border-[#FEE2E2] bg-[#FFF9F9]"
        }`}
      >
        {/* Panel header */}
        <div
          className={`flex items-start justify-between px-4 py-3 ${isInclude ? "bg-[#F0FBF0]" : "bg-[#FFF0F0]"}`}
        >
          <div className="flex items-start gap-2">
            {isInclude ? (
              <div className="w-8 h-8 rounded-full border border-[#E6F2E5] bg-[#FFFFFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Image
                  src={HeartIcon}
                  alt="Prefer to Include"
                  width={16}
                  height={16}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-[#FDE4E5] bg-[#FFFFFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Image
                  src={CancerIcon}
                  alt="Prefer to Exclude"
                  width={16}
                  height={16}
                />
              </div>
            )}
            <div>
              <p
                className={`text-[13px] font-bold leading-tight ${isInclude ? "text-[#4CAF50]" : "text-[#EF4444]"}`}
              >
                {isInclude
                  ? "Items you prefer to Include"
                  : "Prefer to Exclude"}
              </p>
              <p className="text-[11px] text-[#626D76] leading-tight mt-0.5 whitespace-nowrap">
                {isInclude
                  ? "We'll prioritize adding these to your package."
                  : "We'll leave these out."}
              </p>
            </div>
          </div>
          {/* Delete selected — only when items checked */}
          {hasItems && selectedItems.length > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-1 text-[#EF4444] underline text-[11px] font-semibold flex-shrink-0 ml-2 mt-0.5 cursor-pointer"
            >
              <Trash fill="red" className="w-3 h-3" />
              Delete Selected Products
            </button>
          )}
        </div>

        {/* Panel body */}
        <div className="flex-1 flex flex-col bg-white">
          {hasItems ? (
            <>
              {/* Table header */}
              <div className="flex items-center px-3 py-2 border-b border-[#E5E7EB]">
                <div className="w-7 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="accent-[#4C5160] cursor-pointer w-[14px] h-[14px]"
                  />
                </div>
                <span className="text-[11px] text-[#8492A3] font-medium w-24 flex-shrink-0">
                  Item ({String(items.length).padStart(2, "0")})
                </span>
                <span className="text-[11px] text-[#8492A3] font-medium flex-1">
                  Name
                </span>
                <span className="text-[11px] text-[#8492A3] font-medium w-12 text-right pr-1">
                  Action
                </span>
              </div>

              {/* Scrollable rows */}
              <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                {items.map((item) => (
                  <div
                    key={item.displayName}
                    className="flex items-center px-3 py-2 border-b border-[#F3F4F6] last:border-0 hover:bg-gray-50"
                  >
                    <div className="w-7 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.displayName)}
                        onChange={() => onToggle(item.displayName)}
                        className="cursor-pointer accent-[#4C5160] w-[14px] h-[14px]"
                      />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.displayName}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/images/fallback.png";
                        }}
                      />
                    </div>
                    <span className="flex-1 text-[13px] font-medium text-black">
                      {item.displayName}
                    </span>
                    <div className="w-12 flex justify-end pr-1">
                      <button onClick={() => onDelete(item.displayName)}>
                        <Trash
                          fill="red"
                          className="text-red-600 cursor-pointer w-5 h-5"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
              <button
                onClick={() => router.push("/exclude/exclude")}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="relative cursor-pointer">
                  <Lottie
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: addNewAnimation,
                      rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                      },
                    }}
                    height={90}
                    width={90}
                  />
                </div>
                <span className="text-[14px] font-semibold onehover:underline text-[#8C46FB] cursor-pointer">
                  Add Now
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen p-6 bg-white">
      <Loader isVisible={continueLoading || loading} />
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success!"
        description={successMessage}
        duration={3000}
      />

      {/* Back + Add More */}
      <div className="w-full mb-8 flex items-center gap-3">
        <button
          onClick={() => router.push("/exclude/exclude")}
          className="flex items-center justify-center w-9 h-9 border border-[#D4D8DC] rounded-lg bg-white shadow-md hover:bg-[#D4D8DC] active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[16px] w-[16px] text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => router.push("/exclude/exclude")}
          className="text-[#233242] font-medium text-sm md:text-[14px] border-b border-gray-800 leading-tight hover:text-gray-500 hover:border-gray-500 transition-colors cursor-pointer"
        >
          Add More
        </button>
      </div>

      {/* Heading */}
      <div className="w-full flex flex-col items-center mb-6">
        <h2 className="text-[18px] md:text-[26px] font-semibold mb-2 text-center text-[#001535]">
          Review Your Preferences
        </h2>
        <p className="text-[12px] md:text-[15px] text-[#4C5160] text-center">
          We'll customize your package based on your choices.
          <br />
          You can update your preferences anytime.
        </p>
      </div>

      {error && (
        <p className="text-center text-red-500 text-sm mb-3">{error}</p>
      )}

      {/* Two-column panels */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 max-w-4xl mx-auto">
        {renderPanel(
          includeItems,
          selectedIncludeItems,
          handleIncludeToggle,
          handleIncludeSelectAll,
          (n) => handleDeleteClick(n, "include"),
          () => handleDeleteSelectedClick("include"),
          "include",
        )}
        {renderPanel(
          excludeItems,
          selectedExcludeItems,
          handleExcludeToggle,
          handleExcludeSelectAll,
          (n) => handleDeleteClick(n, "exclude"),
          () => handleDeleteSelectedClick("exclude"),
          "exclude",
        )}
      </div>

      {/* Info box */}
      <div className="flex items-center gap-3 bg-[#F5F8FD] border border-[#E1E8F8] rounded-xl px-5 py-4 max-w-[450px] mx-auto mb-6">
        <Info className="w-5 h-5 text-[#41519E] flex-shrink-0" />
        <p className="text-[12px] font-medium sm:text-[13px] text-[#41519E] leading-relaxed">
          Items marked as "Include" will be prioritized when possible.
          <br />
          Items marked as "Exclude" will be left out of your package.
        </p>
      </div>

      {/* Continue button */}
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={handleContinue}
          disabled={continueLoading}
          className={`w-full bg-[#3E206D] text-white p-2 rounded-lg font-semibold text-base md:text-lg transition-opacity
            ${continueLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#341a5a]"}`}
        >
          {continueLoading ? "Processing..." : "Continue Shopping"}
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl text-center w-full max-w-md">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash fill="red" className="text-red-600 w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {isBulkDelete
                ? "Remove selected items?"
                : `Remove "${itemToDelete}"?`}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isBulkDelete
                ? "These items will be removed from your list."
                : "This item will be removed from your list."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                  setIsBulkDelete(false);
                }}
                className="px-6 py-2.5 rounded-lg border border-[#3E206D] text-[#3E206D] bg-white font-medium hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
