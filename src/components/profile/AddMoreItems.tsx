"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FiSearch, FiX } from "react-icons/fi";
import Loader from "@/components/loader-spinner/Loader";
import SuccessPopup from "@/components/toast-messages/success-message";
import Lottie from "react-lottie";
import noAddItemAnimation from "../../../public/noAddItem.json";
import {
  getIncludedItems,
  addIncludedItems,
  deleteIncludedItems,
  getExcludedItems,
  excludeItems,
  deleteExcludedItems,
  getMarketplaceSuggestionsProfile,
} from "@/services/product-service";
import { Info } from "lucide-react";

type IncludeState = "include" | "none";
type ExcludeState = "exclude" | "none";

interface ItemState {
  displayName: string;
  image: string;
  includeToggle: IncludeState;
  includeOriginal: IncludeState;
  excludeToggle: ExcludeState;
  excludeOriginal: ExcludeState;
}

/* ── Reusable Toggle component ── */
const Toggle = ({
  on,
  color,
  disabled,
  onClick,
  ariaLabel,
}: {
  on: boolean;
  color: "green" | "red";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) => {
  const bgOn = color === "green" ? "bg-[#4CAF50]" : "bg-[#EF4444]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center flex-shrink-0
        ${on ? `${bgOn} justify-end pr-[3px]` : "bg-[#D1D5DB] justify-start pl-[3px]"}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className="w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
    </button>
  );
};

const UpdatePreferences = () => {
  const authToken = useSelector((state: RootState) => state.auth.token);

  const [items, setItems] = useState<ItemState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Fetch
  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [includedRes, excludedRes, suggestionsRes] = await Promise.all([
          getIncludedItems(authToken),
          getExcludedItems(authToken),
          getMarketplaceSuggestionsProfile(authToken),
        ]);

        const includedNames = new Set(
          includedRes.status && Array.isArray(includedRes.items)
            ? includedRes.items.map((i: any) => i.displayName)
            : [],
        );
        const excludedNames = new Set(
          excludedRes.status && Array.isArray(excludedRes.items)
            ? excludedRes.items.map((i: any) => i.displayName)
            : [],
        );

        const excludedItems =
          excludedRes.status && Array.isArray(excludedRes.items)
            ? excludedRes.items
            : [];
        const suggestions =
          suggestionsRes.status && Array.isArray(suggestionsRes.items)
            ? suggestionsRes.items
            : [];

        const excludedDisplayNames = new Set(
          excludedItems.map((i: any) => i.displayName),
        );
        const allItems = [
          ...excludedItems,
          ...suggestions.filter(
            (s: any) => !excludedDisplayNames.has(s.displayName),
          ),
        ];

        const mapped: ItemState[] = allItems.map((item: any) => {
          const incState: IncludeState = includedNames.has(item.displayName)
            ? "include"
            : "none";
          const excState: ExcludeState = excludedNames.has(item.displayName)
            ? "exclude"
            : "none";
          return {
            displayName: item.displayName,
            image: item.image,
            includeToggle: incState,
            includeOriginal: incState,
            excludeToggle: excState,
            excludeOriginal: excState,
          };
        });

        setItems(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [authToken]);

  // Toggles 
  const handleIncludeToggle = (displayName: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.displayName !== displayName) return item;
        if (item.excludeToggle === "exclude") return item;
        return {
          ...item,
          includeToggle: item.includeToggle === "include" ? "none" : "include",
        };
      }),
    );
  };

  const handleExcludeToggle = (displayName: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.displayName !== displayName) return item;
        if (item.includeToggle === "include") return item;
        return {
          ...item,
          excludeToggle: item.excludeToggle === "exclude" ? "none" : "exclude",
        };
      }),
    );
  };

  const handleSave = async () => {
    if (!authToken) return;
    setSaving(true);
    setError(null);
    try {
      const toInclude = items
        .filter(
          (i) =>
            i.includeToggle === "include" && i.includeOriginal !== "include",
        )
        .map((i) => i.displayName);

      const toDeleteInclude = items
        .filter(
          (i) => i.includeToggle === "none" && i.includeOriginal === "include",
        )
        .map((i) => i.displayName);

      const toExclude = items
        .filter(
          (i) =>
            i.excludeToggle === "exclude" && i.excludeOriginal !== "exclude",
        )
        .map((i) => i.displayName);

      const toDeleteExclude = items
        .filter(
          (i) => i.excludeToggle === "none" && i.excludeOriginal === "exclude",
        )
        .map((i) => i.displayName);

      if (toInclude.length > 0) {
        const res = await addIncludedItems(toInclude, authToken);
        if (!res.status)
          throw new Error(res.message || "Failed to save include items");
      }
      if (toDeleteInclude.length > 0) {
        const res = await deleteIncludedItems(toDeleteInclude, authToken);
        if (!res.status)
          throw new Error(res.message || "Failed to remove include items");
      }
      if (toExclude.length > 0) {
        const res = await excludeItems(toExclude, authToken);
        if (!res.status)
          throw new Error(res.message || "Failed to save exclude items");
      }
      if (toDeleteExclude.length > 0) {
        const res = await deleteExcludedItems(toDeleteExclude, authToken);
        if (!res.status) throw new Error("Failed to remove exclude items");
      }

      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          includeOriginal: item.includeToggle,
          excludeOriginal: item.excludeToggle,
        })),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save preferences");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.displayName?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const hasChanges =
    items.some((i) => i.includeToggle !== i.includeOriginal) ||
    items.some((i) => i.excludeToggle !== i.excludeOriginal);

  // Render 
  return (
    <div className="relative z-10 px-4 sm:px-6 md:px-8 min-h-screen bg-white py-6">
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success!"
        description="Your preferences have been saved."
      />
      <Loader isVisible={loading || saving} />

      {/* Header */}
      <h2 className="font-medium text-sm sm:text-base md:text-[18px] mb-1">
        Update My Preferences
      </h2>
      <p className="text-xs sm:text-sm md:text-[14px] text-[#626D76] mb-3">
        Please indicate which items should be included and which should be
        excluded.
      </p>
      <div className="border-t border-[#BDBDBD] mb-5 mt-2" />

      {/* Sub heading */}
      <p className="text-xs sm:text-sm text-center text-[#4C5160] mb-4">
        Choose items you'd prefer to include or exclude from your package.
        <br />
        An item cannot be both preferred and excluded.
      </p>

      <div className="flex flex-col items-center">
        <div className="w-full max-w-5xl">
          {/* Search */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Search for Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-4 pr-10 rounded bg-[#EFE4FF] text-[#3E206D] placeholder-[#3E206D] italic text-center text-[12px] md:text-[16px] outline-none"
              aria-label="Search products"
            />
            {searchQuery ? (
              <FiX
                className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-[#3E206D]"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              />
            ) : (
              <FiSearch
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3E206D]"
                aria-label="Search icon"
              />
            )}
          </div>

          {/* Top legend cards */}
          <div className="flex gap-2 sm:gap-3 mb-5 flex-wrap sm:flex-nowrap">
            {/* Prefer to Include */}
            <div className="flex items-center gap-2 sm:gap-3 border border-[#E6F2E5] rounded-lg px-3 py-2 sm:px-4 sm:py-3 bg-[#F6FCF5] flex-1 min-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#34C759]">
                  Prefer to Include
                </p>
                <p className="text-[11px] text-[#626D76]">
                  We'll prioritize adding these
                </p>
              </div>
            </div>
            {/* No Preference */}
            <div className="flex items-center gap-2 sm:gap-3 border border-[#EFF0F1] rounded-lg px-3 py-2 sm:px-4 sm:py-3 bg-[#FCFCFC] flex-1 min-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9CA3AF">
                  <rect x="3" y="6" width="18" height="2" rx="1" />
                  <rect x="3" y="11" width="18" height="2" rx="1" />
                  <rect x="3" y="16" width="18" height="2" rx="1" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#576574]">
                  No Preference
                </p>
                <p className="text-[11px] text-[#626D76]">
                  We'll decide for you
                </p>
              </div>
            </div>
            {/* Prefer to Exclude */}
            <div className="flex items-center gap-2 sm:gap-3 border border-[#FDE4E5] rounded-lg px-3 py-2 sm:px-4 sm:py-3 bg-[#FEF7F7] flex-1 min-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#DA080A]">
                  Prefer to Exclude
                </p>
                <p className="text-[11px] text-[#626D76]">
                  We'll leave these out.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-red-500 text-sm mb-3">{error}</p>
          )}

          {!loading && filteredItems.length > 0 && (
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[#BDBDBD]">
                  <th className="text-[13px] font-semibold text-[#4CAF50] py-2 px-2 text-center w-[12%]">
                    Include
                  </th>
                  <th className="text-[13px] font-semibold text-[#4B5563] py-2 px-25 text-left w-[44%]">
                    Product
                  </th>
                  <th className="text-[13px] font-semibold text-[#4B5563] py-2 px-2 text-left w-[30%]"></th>
                  <th className="text-[13px] font-semibold text-[#EF4444] py-2 px-2 text-center w-[14%]">
                    Exclude
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isIncluded = item.includeToggle === "include";
                  const isExcluded = item.excludeToggle === "exclude";

                  return (
                    <tr
                      key={item.displayName}
                      className="border-t border-[#E5E7EB]"
                    >
                      {/* Include Toggle */}
                      <td className="py-3 px-2 text-center">
                        <Toggle
                          on={isIncluded}
                          color="green"
                          disabled={isExcluded}
                          onClick={() => handleIncludeToggle(item.displayName)}
                          ariaLabel={`Toggle include ${item.displayName}`}
                        />
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-25">
                        <span className="text-sm md:text-[15px] font-medium text-[#000000] whitespace-nowrap">
                          {item.displayName}
                        </span>
                      </td>

                      {/* Product Image */}
                      <td className="py-3 px-2">
                        <img
                          src={item.image}
                          alt={item.displayName}
                          className="w-12 h-12 md:w-16 md:h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/images/fallback.png";
                          }}
                        />
                      </td>

                      {/* Exclude Toggle */}
                      <td className="py-3 px-2 text-center">
                        <Toggle
                          on={isExcluded}
                          color="red"
                          disabled={isIncluded}
                          onClick={() => handleExcludeToggle(item.displayName)}
                          ariaLabel={`Toggle exclude ${item.displayName}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Empty state */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <Lottie
                options={{
                  loop: false,
                  autoplay: true,
                  animationData: noAddItemAnimation,
                  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
                }}
                height={200}
                width={200}
              />
              <p className="text-center text-[#4C5160] text-sm md:text-base italic mt-4">
                No Search Results Found
              </p>
            </div>
          )}

          {/* Bottom legend */}
          {!loading && filteredItems.length > 0 && (
            <div className="mt-6 flex gap-3 flex-wrap border border-[#E1E0E5] rounded-lg overflow-hidden">
              <div className="p-4 flex-1 min-w-[150px]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Toggle on={true} color="green" disabled />
                    <span className="text-[12px] text-[#8A899E]">
                      Preferred to Include
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle on={true} color="red" disabled />
                    <span className="text-[12px] text-[#8A899E]">
                      Preferred to Exclude
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle on={false} color="green" disabled />
                    <span className="text-[12px] text-[#8A899E]">
                      No Preference
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-l border-[#E1E0E5]" />
              <div className="p-4 flex-1 min-w-[150px] flex items-center gap-2">
                <Info className="w-5 h-5 text-[#000000] flex-shrink-0" />
                <p className="text-[12px] text-[#8A899E] leading-relaxed">
                  Items marked as "Include" will be prioritized when possible.
                  <br />
                  Items marked as "Exclude" will be left out of your package.
                </p>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-center">
            {!loading && filteredItems.length > 0 && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`w-2xl p-2.5 rounded-full mt-6 font-semibold text-sm text-white transition-opacity
                  ${
                    hasChanges && !saving
                      ? "bg-[#3E206D] cursor-pointer"
                      : "bg-[#3E206D] opacity-50 cursor-not-allowed"
                  }`}
                aria-label="Save preferences"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePreferences;
