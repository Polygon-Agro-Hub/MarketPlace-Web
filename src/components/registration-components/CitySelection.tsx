"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    MapPin,
    Phone,
    ChevronDown,
    CheckCircle,
    AlertCircle,
    Loader2,
    XCircle,
} from "lucide-react";
import { searchCities, getAllCities, CityResult } from "@/services/auth-service";
import glogo from "../../../public/glogo.png";
import Banner from "../../../public/images/SignupPageBanner.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone, faCircleCheck, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import ErrorPopup from "@/components/toast-messages/error-message";

type CityStatus = "idle" | "not-found" | "available" | "unavailable";

interface CitySelectionProps {
    onCityConfirmed: (city: CityResult) => void;
}

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

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showCityRequiredError, setShowCityRequiredError] = useState(false);



    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Load all cities A-Z when arrow is clicked ──────────────────────────────
    const handleArrowClick = useCallback(async () => {
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
            return;
        }

        // If we've already loaded them, just open
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

    // ── Debounced backend search while typing ──────────────────────────────────
    const handleSearch = useCallback(
        (value: string) => {
            setSearchTerm(value);
            setSelectedCity(null);
            setStatus("idle");
            setHasSearched(false);

            if (debounceRef.current) clearTimeout(debounceRef.current);

            // Empty input → show all cities A-Z
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

    const canConfirm = selectedCity !== null && selectedCity.isAvailable;
    const isConfirmDisabled = status === "unavailable" || status === "not-found";
    const showSpinner = isSearching || isLoadingAll;
    // What to display inside the list
    const displayList = results;

    return (
        <div className="flex lg:bg-[#EEE9F5] justify-center items-center w-full min-h-screen lg:py-10 lg:px-2">
            <div className="flex w-full lg:max-w-7xl">
                <div className="flex min-w-full mx-auto shadow-lg rounded-lg bg-white overflow-hidden">

                    {/* ── Left panel ── */}
                    <div className="w-full lg:w-1/2 px-6 pt-8 pb-10 sm:px-10 sm:p-10 flex flex-col">

                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <Image src={glogo} alt="GoViMart Logo" width={150} height={60} className="object-contain" priority />
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 700,
                                    lineHeight: "100%",
                                    letterSpacing: "0.05em",
                                }}
                                className="text-[#001535] text-[28px] sm:text-[34px] lg:text-[40px] whitespace-nowrap"
                            >
                                From Farm
                            </h1>
                            <span
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 700,
                                    lineHeight: "100%",
                                    letterSpacing: "0.05em",
                                    display: "block",
                                }}
                                className="text-[#2E7D32] text-[32px] sm:text-[40px] lg:text-[48px] whitespace-nowrap"
                            >
                                to your door step!
                            </span>
                        </div>

                        {/* ── City Selector Card ── */}
                        <div className="border border-[#8639FF] rounded-xl p-4 mb-4" ref={dropdownRef}>

                            {/* Label */}
                            <div className="flex items-center gap-2 mb-3">
                                <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 16 }} className="text-[#4A4A4A]" />
                                <span className="text-sm font-semibold text-[#3E206D]">Select Your City</span>
                            </div>

                            {/* Input row */}
                            <div className="flex items-center gap-2" style={{ border: "1px solid #B8C2D5", borderRadius: "6px", padding: "0 8px" }}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => {
                                        if (!isDropdownOpen && (results.length > 0 || allCities.length > 0)) {
                                            setResults(searchTerm.trim() ? results : allCities);
                                            setIsDropdownOpen(true);
                                        }
                                    }}
                                    placeholder="Search your city"
                                    className="flex-1 py-1.5 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
                                />

                                {/* Right icon: spinner / clear X / chevron */}
                                <button
                                    type="button"
                                    onClick={() => (searchTerm ? handleClear() : handleArrowClick())}
                                    className="flex-shrink-0 text-gray-400 hover:text-[#3E206D] transition-colors cursor-pointer"
                                    aria-label={searchTerm ? "Clear" : "Show all cities"}
                                >
                                    {showSpinner ? (
                                        <Loader2 size={16} className="animate-spin text-[#3E206D]" />
                                    ) : searchTerm ? (
                                        <XCircle size={16} />
                                    ) : (
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* ── Dropdown list ── */}
                            {/* ── Dropdown list ── */}
                            {isDropdownOpen && (
                                <div
                                    className={
                                        hasSearched && displayList.length === 0 && !showSpinner
                                            ? ""
                                            : "mt-2 border-t border-gray-100"
                                    }
                                >
                                    {showSpinner ? (
                                        <div className="py-3 flex items-center gap-2 text-sm text-gray-500">
                                            <Loader2 size={14} className="animate-spin" />
                                            {isLoadingAll ? "Loading cities..." : "Searching..."}
                                        </div>
                                    ) : hasSearched && displayList.length === 0 ? (
                                        <div className="px-4 py-3 text-sm font-inter font-[300] text-[#4C5160] bg-[#F2F2F6] rounded-b-lg">
                                            City Not Found
                                        </div>
                                    ) : displayList.length === 0 ? null : (
                                        <ul className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:cursor-pointer [&::-webkit-scrollbar-thumb]:cursor-pointer [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                            {displayList.map((city) => (
                                                <li key={city.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectCity(city)}
                                                        className="w-full cursor-pointer text-left px-1 py-2 text-sm hover:bg-gray-50 rounded flex items-center justify-between group transition-colors"
                                                    >
                                                        <div>
                                                            <span className="font-medium text-gray-800">{city.city}</span>
                                                            {city.district && (
                                                                <span className="text-xs text-gray-400 ml-1">— {city.district}</span>
                                                            )}
                                                        </div>
                                                        {city.isAvailable ? (
                                                            <span className="text-xs text-[#229777] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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

                            {/* ── Status banners ── */}
                            {status === "available" && selectedCity && (
                                <div className="mt-3 flex items-center gap-2 bg-[#EEFAF3] border border-[#D2ECE1] rounded-lg px-3 py-2">
                                    <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-[#229777] flex-shrink-0" />
                                    <p className="text-sm text-[#229777] font-medium">
                                        Great news! We deliver to {selectedCity.city}!
                                    </p>
                                </div>
                            )}

                            {status === "unavailable" && selectedCity && (
                                <div className="mt-3 flex items-start gap-2 bg-[#FEF6ED] border border-[#FFDCB5] rounded-lg px-3 py-2">
                                    <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-[#EC6821] flex-shrink-0 mt-2.5" />
                                    <p className="text-sm text-[#EC6821]">
                                        Delivery not available in {selectedCity.city} yet, but we're working on it
                                        and coming to your area soon!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Hotline */}
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 bg-[#F2F2F6] rounded-full px-4 py-1.5">
                                <FontAwesomeIcon icon={faPhone} className="w-[13px] h-[13px] text-[#4C5160]" />
                                <span className="text-xs font-medium font-[500] text-[#4C5160]">Hotline : +94 770111999</span>
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="space-y-3 mb-8">
                            <div className="bg-[#F6F2FB] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-[#3E206D] flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">?</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#55228D]">Can't find your city?</p>
                                </div>
                                <p className="text-sm text-[#383838] ml-7 leading-relaxed">
                                    We're expanding our delivery network every day!<br />
                                    If your city isn't listed, please contact our support team and we'll notify
                                    you as soon as we deliver in your area.
                                </p>
                            </div>

                            <div className="bg-[#EAF8EE] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-[#0B6A45] flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">i</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#0B6A45]">Important Notice</p>
                                </div>
                                <p className="text-sm text-[#383838] ml-7 leading-relaxed">
                                    Please select your actual delivery location carefully to ensure accurate
                                    product availability and delivery coverage.
                                </p>
                                <p className="text-sm text-[#383838] ml-7 mt-2 leading-relaxed">
                                    <strong>
                                        You will only be able to change this location after your first successful delivery.
                                    </strong>{" "}
                                    Any location changes will require assistance from our support team.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        {/* CTA */}
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                            className={`w-full py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-md ${isConfirmDisabled
                                ? "bg-[#EBEEF2] text-gray-500 cursor-not-allowed"
                                : "bg-[#3E206D] text-white hover:bg-[#2d1750] cursor-pointer"
                                }`}
                        >
                            Confirm & Continue
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-4">
                            Already have an account?{" "}
                            <a href="/signin" className="text-[#094EE8] hover:underline font-medium">
                                Login here
                            </a>
                        </p>
                    </div>

                    {/* ── Right decorative panel ── */}
                    <div className="hidden lg:block lg:w-1/2 bg-[#EEE9F5] relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image src={Banner} alt="GoViMart Fresh Delivery" fill className="object-cover" priority />
                        </div>
                    </div>

                </div>
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