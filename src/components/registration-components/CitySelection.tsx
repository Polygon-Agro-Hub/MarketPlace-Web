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
import LoginImg from "../../../public/newbg.png";

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
        if (selectedCity?.isAvailable) {
            onCityConfirmed(selectedCity);
        }
    };

    const canConfirm = selectedCity !== null && selectedCity.isAvailable;
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
                                <MapPin size={16} className="text-[#3E206D]" />
                                <span className="text-sm font-semibold text-[#3E206D]">Select Your City</span>
                            </div>

                            {/* Input row */}
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => {
                                        // Re-open if there's something to show
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
                                    className="flex-shrink-0 text-gray-400 hover:text-[#3E206D] transition-colors"
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
                            {isDropdownOpen && (
                                <div className="mt-2 border-t border-gray-100">
                                    {showSpinner ? (
                                        <div className="py-3 flex items-center gap-2 text-sm text-gray-500">
                                            <Loader2 size={14} className="animate-spin" />
                                            {isLoadingAll ? "Loading cities..." : "Searching..."}
                                        </div>
                                    ) : hasSearched && displayList.length === 0 ? (
                                        <div className="py-3 text-sm text-gray-400">City Not Found</div>
                                    ) : displayList.length === 0 ? null : (
                                        <ul className="max-h-52 overflow-y-auto">
                                            {displayList.map((city) => (
                                                <li key={city.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectCity(city)}
                                                        className="w-full text-left px-1 py-2 text-sm hover:bg-gray-50 rounded flex items-center justify-between group transition-colors"
                                                    >
                                                        <div>
                                                            <span className="font-medium text-gray-800">{city.city}</span>
                                                            {city.district && (
                                                                <span className="text-xs text-gray-400 ml-1">— {city.district}</span>
                                                            )}
                                                        </div>
                                                        {city.isAvailable ? (
                                                            <span className="text-xs text-[#2E7D32] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Coming soon
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
                                    <CheckCircle size={16} className="text-[#229777] flex-shrink-0" />
                                    <p className="text-sm text-[#229777] font-medium">
                                        Great news! We deliver to {selectedCity.city}!
                                    </p>
                                </div>
                            )}

                            {status === "unavailable" && selectedCity && (
                                <div className="mt-3 flex items-start gap-2 bg-[#FEF6ED] border border-[#FFDCB5] rounded-lg px-3 py-2">
                                    <AlertCircle size={16} className="text-[#E65100] flex-shrink-0 mt-0.5" />
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
                                <Phone size={13} className="text-[#4C5160]" />
                                <span className="text-xs text-[#4C5160]">Hotline : +94 770111999</span>
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="space-y-3 mb-8">
                            <div className="bg-[#F6F2FB] rounded-xl p-4">
                                <div className="flex items-start gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-[#3E206D] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                                <div className="flex items-start gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-[#0B6A45] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={`w-full py-3 rounded-xl text-base font-semibold transition-all duration-200 ${canConfirm
                                ? "bg-[#3E206D] text-white hover:bg-[#2d1750] cursor-pointer shadow-md"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
                            <Image src={LoginImg} alt="GoViMart Fresh Delivery" fill className="object-cover" priority />
                        </div>
                        <div className="absolute bottom-8 left-0 right-0 px-8">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex justify-between shadow-lg">
                                <div>
                                    <p className="text-sm font-bold text-[#3E206D]">Fast Delivery</p>
                                    <p className="text-xs text-gray-500 mt-0.5">On-time and everytime</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#2E7D32]">Farm Fresh</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Get our fresh vegetables & fruits</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#E65100]">Safe & Secure</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Hygienic packing you can trust</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}