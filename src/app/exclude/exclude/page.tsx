"use client";

import { RootState } from "@/store";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FiSearch, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import {
  getMarketplaceSuggestions,
  excludeItems,
  getExcludedItems,
  deleteExcludedItems,
  getIncludedItems,
  addIncludedItems,
  deleteIncludedItems,
} from "@/services/product-service";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import noResultsAnimation from "../../../../public/noAddItem.json";
import { Info } from "lucide-react";
import HeartIcon from "../../../../public/icons/heart-solid.png";
import CancerIcon from "../../../../public/icons/xmark-solid.png";
import BoxIcon from "../../../../public/icons/box-solid.png";

interface Item {
  displayName: string;
  image: string;
}

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

/* ── Toggle component ── */
const Toggle = ({
  on,
  color,
  disabled,
  legendOnly,
  onClick,
  ariaLabel,
}: {
  on: boolean;
  color: "green" | "red";
  disabled?: boolean;
  legendOnly?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) => {
  const bgOn = color === "green" ? "bg-[#4CAF50]" : "bg-[#EF4444]";
  return (
    <button
      onClick={onClick}
      disabled={disabled || legendOnly}
      aria-label={ariaLabel}
      className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center flex-shrink-0
        ${on ? `${bgOn} justify-end pr-[3px]` : "bg-[#D1D5DB] justify-start pl-[3px]"}
        ${legendOnly ? "cursor-not-allowed" : disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className="w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
    </button>
  );
};

export default function ExcludeItems() {
  const router = useRouter();
  const authToken = useSelector((state: RootState) => state.auth.token) || null;

  const [items, setItems] = useState<ItemState[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError("Authentication token is missing");
        setLoading(false);
        return;
      }

      try {
        const [suggestionsData, excludedData, includedData] = await Promise.all(
          [
            getMarketplaceSuggestions(authToken),
            getExcludedItems(authToken),
            getIncludedItems(authToken),
          ],
        );

        const excludedNames = new Set<string>(
          Array.isArray(excludedData.items)
            ? excludedData.items.map((i: Item) => i.displayName)
            : [],
        );
        const includedNames = new Set<string>(
          includedData.status && Array.isArray(includedData.items)
            ? includedData.items.map((i: Item) => i.displayName)
            : [],
        );

        if (suggestionsData.status && Array.isArray(suggestionsData.items)) {
          const mapped: ItemState[] = suggestionsData.items
            .filter(
              (item: any) =>
                typeof item.displayName === "string" &&
                typeof item.image === "string",
            )
            .map((item: any) => {
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
        } else {
          setError(suggestionsData.message || "Failed to fetch items");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [authToken]);

  // ── Toggles ───────────────────────────────────────────────────────
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

  const handleContinue = async () => {
    if (!authToken) return;
    setSaving(true);

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
        await addIncludedItems(toInclude, authToken);
      }
      if (toDeleteInclude.length > 0) {
        await deleteIncludedItems(toDeleteInclude, authToken);
      }
      if (toExclude.length > 0) {
        await excludeItems(toExclude, authToken);
      }
      if (toDeleteExclude.length > 0) {
        await deleteExcludedItems(toDeleteExclude, authToken);
      }

      router.push("/exclude/summary");
    } catch (err: any) {
      setError(err.message || "Failed to save preferences");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen p-4 md:p-6 bg-white">
      {/* Heading */}
      <h2 className="text-[20px] md:text-[28px] font-bold mb-2 text-center text-[#001535]">
        Customize Your Package
      </h2>
      <p className="text-[13px] md:text-[16px] text-[#4C5160] mb-5 text-center px-2 md:px-4">
        Choose items you'd prefer to include or exclude from your package.
        <br />
        An item cannot be both preferred and excluded.
      </p>

      <div className="w-full max-w-2xl">
        {/* Search */}
        <div className="mb-5 relative">
          <input
            type="text"
            placeholder="Search for Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 pl-5 pr-10 rounded rounded-4xl bg-[#EFE4FF] text-[#3E206D] placeholder-[#3E206D] italic text-center text-[14px] md:text-[16px] outline-none"
            aria-label="Search products"
          />
          {searchQuery ? (
            <FiX
              className="absolute right-6 cursor-pointer top-1/2 -translate-y-1/2 text-[#3E206D] text-bold"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            />
          ) : (
            <FiSearch
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#3E206D] text-bold cursor-pointer"
              aria-label="Search icon"
            />
          )}
        </div>

        {/* Top legend cards */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          {/* Prefer to Include */}
          <div className="flex items-center gap-2 border border-[#E6F2E5] rounded-lg px-3 py-2 bg-[#F6FCF5] flex-1">
            <div className="w-7 h-7 bg-[#F6FCF5] flex items-center justify-center flex-shrink-0">
              <Image
                src={HeartIcon}
                alt="Prefer to Include"
                width={16}
                height={16}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#4CAF50]">
                Prefer to Include
              </p>
              <p className="text-[10px] text-[#626D76]">
                We'll prioritize adding these
              </p>
            </div>
          </div>
          {/* No Preference */}
          <div className="flex items-center gap-2 border border-[#EFF0F1] rounded-lg px-3 py-2 bg-[#FCFCFC] flex-1">
            <div className="w-7 h-7 bg-[#FCFCFC] flex items-center justify-center flex-shrink-0">
              <Image src={BoxIcon} alt="No Preference" width={16} height={16} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#576574]">
                No Preference
              </p>
              <p className="text-[10px] text-[#626D76]">We'll decide for you</p>
            </div>
          </div>
          {/* Prefer to Exclude */}
          <div className="flex items-center gap-2 border border-[#FDE4E5] rounded-lg px-3 py-2 bg-[#FEF7F7] flex-1">
            <div className="w-7 h-7 bg-[#FEF7F7] flex items-center justify-center flex-shrink-0">
              <Image
                src={CancerIcon}
                alt="Prefer to Exclude"
                width={16}
                height={16}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#EF4444]">
                Prefer to Exclude
              </p>
              <p className="text-[10px] text-[#626D76]">
                We'll leave these out.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* Loading */}
        {loading && <p className="text-center text-[#4C5160]">Loading...</p>}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <Lottie
              options={{
                loop: false,
                autoplay: true,
                animationData: noResultsAnimation,
                rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
              }}
              height={200}
              width={200}
            />
            <p className="text-center text-[#4C5160] text-sm italic mt-4">
              No items found
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="custom-scrollbar max-h-[420px] overflow-y-auto pr-1 md:pr-3">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-[#BDBDBD]">
                  <th className="text-[11px] md:text-[12px] font-semibold text-[#4CAF50] py-2 text-center w-[20%] md:w-[15%]">
                    Include
                  </th>
                  <th className="text-[11px] md:text-[12px] font-semibold text-[#4B5563] py-2 text-left w-[35%] md:w-[35%] pl-1 md:pl-2">
                    Product
                  </th>
                  <th className="w-[20%] md:w-[30%]" />
                  <th className="text-[11px] md:text-[12px] font-semibold text-[#EF4444] py-2 text-center w-[20%] md:w-[20%]">
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
                      {/* Include toggle */}
                      <td className="py-3 text-center px-1">
                        <div className="flex justify-center">
                          <Toggle
                            on={isIncluded}
                            color="green"
                            disabled={isExcluded}
                            onClick={() =>
                              handleIncludeToggle(item.displayName)
                            }
                            ariaLabel={`Toggle include ${item.displayName}`}
                          />
                        </div>
                      </td>
                      {/* Product name */}
                      <td className="py-3 pl-1 md:pl-2">
                        <span className="text-[12px] md:text-[15px] font-medium text-black break-words">
                          {item.displayName}
                        </span>
                      </td>
                      {/* Product image */}
                      <td className="py-3">
                        <img
                          src={item.image}
                          alt={item.displayName}
                          className="w-9 h-9 md:w-12 md:h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/images/fallback.png";
                          }}
                        />
                      </td>
                      {/* Exclude toggle */}
                      <td className="py-3 text-center px-1">
                        <div className="flex justify-center">
                          <Toggle
                            on={isExcluded}
                            color="red"
                            disabled={isIncluded}
                            onClick={() =>
                              handleExcludeToggle(item.displayName)
                            }
                            ariaLabel={`Toggle exclude ${item.displayName}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom legend */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row gap-0 border border-[#E1E0E5] rounded-lg overflow-hidden">
            <div className="p-4 flex-1">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Toggle on={true} color="green" legendOnly />
                  <span className="text-[11px] text-[#8A899E]">
                    Preferred to Include
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle on={true} color="red" legendOnly />
                  <span className="text-[11px] text-[#8A899E]">
                    Preferred to Exclude
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle on={false} color="green" legendOnly />
                  <span className="text-[11px] text-[#8A899E]">
                    No Preference
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block border-l border-[#E1E0E5]" />
            <div className="sm:hidden border-t border-[#E1E0E5]" />
            <div className="p-4 flex-1 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#000000] flex-shrink-0" />
              <p className="text-[11px] text-[#8A899E] leading-relaxed">
                Items marked as "Include" will be prioritized when possible.
                <br />
                Items marked as "Exclude" will be left out of your package.
              </p>
            </div>
          </div>
        )}

        {/* Continue button — always enabled */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={saving}
            className={`w-full max-w-xl bg-[#3E206D] text-white p-2 rounded-lg mt-6 font-semibold text-base md:text-lg transition-opacity
            ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="Continue"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
