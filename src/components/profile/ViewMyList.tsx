"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { Info, Trash } from "lucide-react";
import {
  getIncludedItems,
  deleteIncludedItems,
  getExcludedItems,
  deleteExcludedItems,
} from "@/services/product-service";
import Loader from "@/components/loader-spinner/Loader";
import SuccessPopup from "@/components/toast-messages/success-message";
import Lottie from "react-lottie";
import addNewAnimation from "../../assets/animations/GoViMartAddNew.json";
import HeartIcon from "../../../public/icons/heart-solid.png";
import CancerIcon from "../../../public/icons/xmark-solid.png";

interface Item {
  displayName: string;
  image: string;
}

interface ViewMyListProps {
  setSelectedMenu?: (menu: string) => void;
}

const ViewMyList = ({ setSelectedMenu }: ViewMyListProps) => {
  const authToken = useSelector((state: RootState) => state.auth.token);

  const [includeItems, setIncludeItems] = useState<Item[]>([]);
  const [selectedIncludeItems, setSelectedIncludeItems] = useState<string[]>(
    [],
  );
  const [excludeItems, setExcludeItems] = useState<Item[]>([]);
  const [selectedExcludeItems, setSelectedExcludeItems] = useState<string[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [deleteType, setDeleteType] = useState<"include" | "exclude">(
    "include",
  );

  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [includeData, excludeData] = await Promise.all([
          getIncludedItems(authToken),
          getExcludedItems(authToken),
        ]);
        if (includeData.status && Array.isArray(includeData.items)) {
          setIncludeItems(includeData.items);
        }
        if (excludeData.status && Array.isArray(excludeData.items)) {
          setExcludeItems(excludeData.items);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [authToken]);

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
    const currentDeleteType = deleteType;

    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsBulkDelete(false);

    if (itemsToDelete.length === 0) return;

    setLoading(true);
    try {
      const deleteFn =
        currentDeleteType === "include"
          ? deleteIncludedItems
          : deleteExcludedItems;
      await deleteFn(itemsToDelete, authToken);

      if (currentDeleteType === "include") {
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

      // 3) Show success popup after completion
      setSubmitStatus("Items deleted successfully!");
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete items");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsBulkDelete(false);
  };

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
      <div className="flex-1 min-w-0">
        {/* Card */}
        <div className="border border-[#CFCFCF] rounded-2xl bg-white overflow-hidden h-full flex flex-col">
          {/* Card header */}
          <div
            className={`flex flex-col sm:flex-row sm:items-start sm:justify-between px-4 py-3 ${isInclude ? "bg-[#F0FDF4]" : "bg-[#FFF5F5]"
              }`}
          >
            <div className="flex items-start gap-2">
              {isInclude ? (
                <div className="w-7 h-7 bg-[#FFFFFF] border border-[#E6F2E5] rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    src={HeartIcon}
                    alt="Prefer to Include"
                    width={16}
                    height={16}
                  />
                </div>
              ) : (
                <div className="w-7 h-7 bg-[#FFFFFF] border border-[#FDE4E5] rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    src={CancerIcon}
                    alt="Prefer to Exclude"
                    width={16}
                    height={16}
                  />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className={`text-[13px] font-semibold leading-tight ${isInclude ? "text-[#4CAF50]" : "text-[#EF4444]"}`}
                >
                  {isInclude
                    ? "Items you prefer to Include"
                    : "Prefer to Exclude"}
                </p>
                <p className="text-[11px] text-[#354052] leading-tight mt-0.5">
                  {isInclude
                    ? "We'll prioritize adding these to your package."
                    : "We'll leave these out."}
                </p>

                {/* Delete Selected — mobile: right under subtitle */}
                {hasItems && selectedItems.length > 0 && (
                  <button
                    onClick={onDeleteSelected}
                    className="sm:hidden flex items-center gap-1 text-[#EF4444] underline text-[11px] font-semibold cursor-pointer mt-1.5"
                  >
                    <Trash
                      fill="red"
                      className="w-3 h-3 cursor-pointer flex-shrink-0"
                    />
                    Delete Selected Products
                  </button>
                )}
              </div>
            </div>

            {/* Delete Selected — desktop: top-right, original position */}
            {hasItems && selectedItems.length > 0 && (
              <button
                onClick={onDeleteSelected}
                className="hidden sm:flex items-center gap-1 text-[#EF4444] underline text-[11px] font-semibold flex-shrink-0 ml-2 mt-0.5 cursor-pointer"
              >
                <Trash fill="red" className="w-3 h-3 cursor-pointer" />
                Delete Selected Products
              </button>
            )}
          </div>

          {/* Card body */}
          <div className="flex-1 flex flex-col">
            {hasItems ? (
              <>
                {/* Table header row */}
                <div className="flex items-center px-3 sm:px-4 py-2 border-b border-[#E5E7EB]">
                  <div className="w-7 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      className="accent-[#4C5160] cursor-pointer w-[14px] h-[14px]"
                    />
                  </div>
                  <span className="text-[11px] text-[#8492A3] font-medium w-16 sm:w-24 flex-shrink-0">
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
                <div
                  className="custom-scrollbar overflow-y-auto"
                  style={{ maxHeight: "300px" }}
                >
                  {items.map((item) => (
                    <div
                      key={item.displayName}
                      className="flex items-center px-3 sm:px-4 py-2 border-b border-[#F3F4F6] last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-7 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.displayName)}
                          onChange={() => onToggle(item.displayName)}
                          className="cursor-pointer accent-[#4C5160] w-[14px] h-[14px]"
                        />
                      </div>
                      <div className="w-16 sm:w-24 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.displayName}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/images/fallback.png";
                          }}
                        />
                      </div>
                      <span className="flex-1 text-[12px] sm:text-[13px] font-medium text-black break-words pr-1 min-w-0">
                        {item.displayName}
                      </span>
                      <div className="w-12 flex justify-end pr-1 flex-shrink-0">
                        <button
                          onClick={() => onDelete(item.displayName)}
                          aria-label={`Delete ${item.displayName}`}
                          className="p-1"
                        >
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
              /* Empty state — Lottie + Add Now */
              <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
                <button
                  className="flex flex-col items-center gap-1 group"
                  onClick={() => {
                    if (setSelectedMenu) {
                      setSelectedMenu("AddMoreItems");
                    }
                  }}
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
                  <span className="text-[14px] font-semibold hover:underline text-[#8C46FB] cursor-pointer">
                    Add Now
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 px-4 sm:px-6 md:px-8 min-h-screen bg-white py-6">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 9999px;
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
          cursor: pointer;
        }
      `}</style>
      <Loader isVisible={loading} />

      {/* Header */}
      <h2 className="font-medium text-sm sm:text-base md:text-[18px] mb-1">
        My Preferences
      </h2>
      <p className="text-xs sm:text-sm md:text-[14px] text-[#626D76] mb-3">
        Packaging will be customized based on your preferences.
      </p>
      <div className="border-t border-[#BDBDBD] mb-5 mt-2" />

      <p className="text-xs sm:text-sm text-center text-[#4C5160] mb-6">
        We'll customize your package based on your choices.
        <br />
        You can update your preferences anytime.
      </p>

      {error && (
        <p className="text-center text-red-500 text-sm mb-3">{error}</p>
      )}

      {/* Two-column panels */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
      <div className="flex items-center gap-3 bg-[#F5F8FD] border border-[#E1E8F8] rounded-xl px-5 py-4 max-w-[450px] mx-auto">
        <Info className="w-5 h-5 text-[#41519E] flex-shrink-0" />
        <p className="text-[8px] whitespace-nowrap font-medium sm:text-[13px] text-[#41519E] leading-relaxed">
          Items marked as "Include" will be prioritized when possible.
          <br />
          Items marked as "Exclude" will be left out of your package.
        </p>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl text-center w-full max-w-[300px] sm:max-w-md mx-4">
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
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2 cursor-pointer rounded-lg border border-[#3E206D] text-[#3E206D] bg-white text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 rounded-lg cursor-pointer bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessPopup
        isVisible={!!submitStatus}
        onClose={() => setSubmitStatus(null)}
        title="Successfully Deleted!"
        description={submitStatus || ""}
        duration={3000}
      />
    </div>
  );
};

export default ViewMyList;
