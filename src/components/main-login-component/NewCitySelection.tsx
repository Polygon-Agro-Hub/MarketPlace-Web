"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Info,
  Loader2,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import {
  searchCities,
  getAllCities,
  CityResult,
} from "@/services/auth-service";
import ErrorPopup from "@/components/toast-messages/error-message";

type CityStatus = "idle" | "not-found" | "available" | "unavailable";

interface CitySelectionProps {
  onCityConfirmed: (city: CityResult) => void;
}

// Available cities first (A–Z), then Coming Soon cities (A–Z)
const sortCities = (cities: CityResult[]): CityResult[] =>
  [...cities].sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    return a.city.localeCompare(b.city, undefined, { sensitivity: "base" });
  });

export default function CitySelection({ onCityConfirmed }: CitySelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [allCities, setAllCities] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [status, setStatus] = useState<CityStatus>("idle");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCityRequiredError, setShowCityRequiredError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleArrowClick = useCallback(async () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }
    if (allCities.length > 0) {
      setResults(allCities);
      setIsDropdownOpen(true);
      inputRef.current?.focus();
      return;
    }

    setIsLoadingAll(true);
    setIsDropdownOpen(true);
    inputRef.current?.focus();

    try {
      const cities = await getAllCities();
      setAllCities(cities);
      setResults(cities);
    } catch {
      setResults([]);
    } finally {
      setIsLoadingAll(false);
    }
  }, [isDropdownOpen, allCities]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setSelectedCity(null);
      setStatus("idle");
      setHasSearched(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults(allCities);
        setIsDropdownOpen(allCities.length > 0);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setIsDropdownOpen(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const cities = await searchCities(value);
          setResults(cities);
          setHasSearched(true);
          if (cities.length === 0) setStatus("not-found");
        } catch {
          setResults([]);
          setHasSearched(true);
          setStatus("not-found");
        } finally {
          setIsSearching(false);
        }
      }, 350);
    },
    [allCities],
  );

  const handleSelectCity = (city: CityResult) => {
    setSelectedCity(city);
    setSearchTerm(city.city);
    setIsDropdownOpen(false);
    setResults([]);
    setHasSearched(false);
    setStatus(city.isAvailable ? "available" : "unavailable");
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedCity(null);
    setStatus("idle");
    setResults(allCities);
    setHasSearched(false);
    setIsDropdownOpen(allCities.length > 0);
    inputRef.current?.focus();
  };

  const handleConfirm = () => {
    if (!selectedCity) {
      setShowCityRequiredError(true);
      return;
    }

    if (selectedCity.isAvailable) {
      onCityConfirmed(selectedCity);
    }
  };

  const isConfirmDisabled = status === "unavailable" || status === "not-found";
  const showSpinner = isSearching || isLoadingAll;
  const displayList = useMemo(() => sortCities(results), [results]);

  return (
    <div className="w-full">
      <div className="w-full font-[Inter,sans-serif]">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight tracking-tight text-[#111827]">
            Create your account
          </h1>
          <span className="mt-1 flex-shrink-0 inline-flex items-center gap-2 rounded-full border border-[#FF6B35] bg-white px-4 py-1.5 text-sm font-semibold text-[#FF6B35] whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
            Step 1 of 2
          </span>
        </div>
        <p className="mt-1 mb-6 text-base text-[#4B5563]">
          Confirm your delivery zone to browse fresh harvest produce.
        </p>

        {/* ── City selection card ── */}
        <div
          ref={dropdownRef}
          className="rounded-3xl border border-[#E4DDFB] bg-white p-5 shadow-[0_2px_10px_rgba(139,92,246,0.08)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6B35]">
              <MapPin size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-[#111827]">
              Select Your City
            </span>
          </div>

          {/* Pill input */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F7F5FF] px-5 py-3 focus-within:border-[#8639FF] focus-within:ring-2 focus-within:ring-[#8639FF]/20 transition"
          >
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (
                  !isDropdownOpen &&
                  (results.length > 0 || allCities.length > 0)
                ) {
                  setResults(searchTerm.trim() ? results : allCities);
                  setIsDropdownOpen(true);
                }
              }}
              placeholder="Choose your delivery area..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#111827] placeholder-[#6B7280]"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (searchTerm) {
                  handleClear();
                } else {
                  handleArrowClick();
                }
              }}
              className="flex-shrink-0 text-[#111827] hover:text-[#8639FF] transition-colors cursor-pointer"
              aria-label={searchTerm ? "Clear" : "Show all cities"}
            >
              {showSpinner ? (
                <Loader2 size={18} className="animate-spin text-[#8639FF]" />
              ) : searchTerm ? (
                <XCircle size={18} className="text-gray-400" />
              ) : (
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="mt-3">
              {showSpinner ? (
                <div className="px-3 py-3 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  {isLoadingAll ? "Loading cities..." : "Searching..."}
                </div>
              ) : hasSearched && displayList.length === 0 ? (
                <div className="rounded-2xl bg-[#F2F2F6] px-4 py-3 text-sm text-[#4C5160]">
                  City Not Found
                </div>
              ) : displayList.length === 0 ? null : (
                <ul className="max-h-52 overflow-y-auto rounded-2xl border border-[#EEE9F5] bg-white p-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {displayList.map((city) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className="group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[#F7F5FF]"
                      >
                        <div>
                          <span className="font-medium text-gray-800">
                            {city.city}
                          </span>
                          {city.district && (
                            <span className="ml-1 text-xs text-gray-400">
                              — {city.district}
                            </span>
                          )}
                        </div>
                        {city.isAvailable ? (
                          <span className="text-xs font-medium text-[#229777] opacity-0 transition-opacity group-hover:opacity-100">
                            Available
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-orange-400 opacity-0 transition-opacity group-hover:opacity-100">
                            Coming Soon
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Status banners */}
          {status === "available" && selectedCity && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#D2ECE1] bg-[#EEFAF3] px-4 py-2.5">
              <Info size={16} className="flex-shrink-0 text-[#229777]" />
              <p className="text-sm font-medium text-[#229777]">
                Great news! We deliver to {selectedCity.city}!
              </p>
            </div>
          )}

          {status === "unavailable" && selectedCity && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[#FFDCB5] bg-[#FEF6ED] px-4 py-2.5">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-[#EC6821]" />
              <p className="text-sm text-[#EC6821]">
                Delivery not available in {selectedCity.city} yet, but
                we&apos;re working on it and coming to your area soon!
              </p>
            </div>
          )}
        </div>

        {/* ── Hotline pill ── */}
        <div className="flex justify-center my-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE3EC] bg-[#F1F5F9] px-5 py-2.5 text-sm text-[#374151]">
            <Phone size={15} className="text-[#4B5563]" />
            <span>
              Need Help? <span className="mx-1 text-gray-400">|</span>
              <strong className="font-bold text-[#111827]">
                Hotline: 011 431 3433
              </strong>
            </span>
          </div>
        </div>

        {/* ── Can't find your city ── */}
        <div className="mb-5 rounded-3xl bg-[#F8F7FF] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#13805F]">
              <CircleHelp size={18} className="text-white" />
            </div>
            <div>
              <p className="mb-2 text-base font-semibold text-[#111827]">
                Can&apos;t find your city?
              </p>
              <p className="text-[15px] leading-relaxed text-[#1F2937]">
                We&apos;re expanding our delivery network every day!
                <br />
                If your city isn&apos;t listed, please contact our support team
                and we&apos;ll notify you as soon as we deliver in your area.
              </p>
            </div>
          </div>
        </div>

        {/* ── Important Delivery Zone Policy ── */}
        <div className="mb-6 rounded-3xl bg-[#F0FBF5] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#13805F]">
              <Info size={18} className="text-white" />
            </div>
            <div>
              <p className="mb-2 text-base font-semibold text-[#0B4F3A]">
                Important Delivery Zone Policy
              </p>
              <p className="text-[15px] leading-relaxed text-[#4B5563]">
                Please select your actual delivery location carefully to ensure
                accurate product availability and delivery coverage.{" "}
                <strong className="font-bold text-[#374151]">
                  You will only be able to change this location after your first
                  successful delivery.
                </strong>{" "}
                Any location changes will require assistance from our support
                team.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-semibold transition-all duration-200 ${
            isConfirmDisabled
              ? "cursor-not-allowed bg-[#EBEEF2] text-gray-500"
              : "cursor-pointer bg-[#FF6B35] text-white shadow-md hover:bg-[#F25A22]"
          }`}
        >
          Continue to Personal Details
          <ArrowRight size={20} />
        </button>
      </div>

      <ErrorPopup
        isVisible={showCityRequiredError}
        onClose={() => setShowCityRequiredError(false)}
        title="City is required!"
        description="Please select your city to continue shopping."
      />
    </div>
  );
}
