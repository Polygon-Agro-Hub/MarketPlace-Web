"use client";
import React, { useState } from "react";

export type PhoneCode = {
    code: string;
    dialCode: string;
    name: string;
};

export const countries: PhoneCode[] = [
    { code: "LK", dialCode: "+94", name: "Sri Lanka" },
    { code: "VN", dialCode: "+84", name: "Vietnam" },
    { code: "KH", dialCode: "+855", name: "Cambodia" },
    { code: "BD", dialCode: "+880", name: "Bangladesh" },
    { code: "IN", dialCode: "+91", name: "India" },
    { code: "NL", dialCode: "+31", name: "Netherlands" },
];

const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
};

export const countryOptions = countries.map((country) => ({
    value: country.dialCode,
    label: country.dialCode,
    flag: getFlagUrl(country.code),
    countryName: country.name,
}));

export type PhoneValidationRule = {
    lengths: number[];
    startDigits: string[]; // empty array = any starting digit is allowed
    example: string;
};

export const phoneValidationRules: Record<string, PhoneValidationRule> = {
    "+94": { lengths: [9], startDigits: ["7"], example: "712345678" }, // Sri Lanka
    "+84": { lengths: [9], startDigits: ["3", "5", "7", "8", "9"], example: "912345678" }, // Vietnam
    "+855": { lengths: [8, 9], startDigits: [], example: "12345678" }, // Cambodia
    "+880": { lengths: [10], startDigits: ["1"], example: "1712345678" }, // Bangladesh
    "+91": { lengths: [10], startDigits: ["6", "7", "8", "9"], example: "9876543210" }, // India
    "+31": { lengths: [9], startDigits: ["6"], example: "612345678" }, // Netherlands
};

export const getMaxPhoneLength = (phoneCode: string): number => {
    const rule = phoneValidationRules[phoneCode];
    return rule ? Math.max(...rule.lengths) : 9;
};

/**
 * Returns an error message if invalid, or null if the phone number is valid
 * for the given dial code.
 */
export const validatePhoneNumber = (
    phoneCode: string,
    phoneNumber: string,
): string | null => {
    const rule = phoneValidationRules[phoneCode];

    if (!phoneNumber) {
        return "Phone number is required";
    }

    if (!rule) {
        // Fallback for any dial code without a specific rule
        return /^\d{7,15}$/.test(phoneNumber)
            ? null
            : "Please enter a valid phone number";
    }

    if (!rule.lengths.includes(phoneNumber.length)) {
        return `Phone number must be ${rule.lengths.join(" or ")} digits (e.g. ${rule.example})`;
    }

    if (
        rule.startDigits.length > 0 &&
        !rule.startDigits.includes(phoneNumber[0])
    ) {
        return `Phone number must start with ${rule.startDigits.join(", ")} (e.g. ${rule.example})`;
    }

    return null;
};

/**
 * Real-time validator for use while the user is still typing.
 * Checks the starting digit immediately (regardless of how many digits
 * have been entered so far), and only checks length once the user has
 * typed as many digits as the longest valid option for that country.
 * Returns null while input is incomplete but not yet definitively wrong.
 */
export const validatePhoneNumberLive = (
    phoneCode: string,
    phoneNumber: string,
): string | null => {
    if (!phoneNumber) {
        return null; // don't show an error before the user starts typing
    }

    const rule = phoneValidationRules[phoneCode];

    if (!rule) {
        return /^\d*$/.test(phoneNumber) ? null : "Please enter a valid phone number";
    }

    // Wrong starting digit is invalid no matter how many digits typed so far
    if (
        rule.startDigits.length > 0 &&
        !rule.startDigits.includes(phoneNumber[0])
    ) {
        return `Phone number must start with ${rule.startDigits.join(", ")} (e.g. ${rule.example})`;
    }

    const maxLen = Math.max(...rule.lengths);

    // Only flag length once they've typed as many digits as the longest valid option
    if (phoneNumber.length >= maxLen && !rule.lengths.includes(phoneNumber.length)) {
        return `Phone number must be ${rule.lengths.join(" or ")} digits (e.g. ${rule.example})`;
    }

    return null;
};

interface PhoneCodeDropdownProps {
    selectedValue: string;
    onSelect: (value: string) => void;
    className?: string;
}

const PhoneCodeDropdown: React.FC<PhoneCodeDropdownProps> = ({
    selectedValue,
    onSelect,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = countryOptions.find(
        (option) => option.value === selectedValue,
    );

    return (
        <div className="relative ">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 cursor-pointer border-gray-300 focus:ring-purple-500 focus:border-purple-500 ${className} ${selectedValue ? "text-black" : "text-gray-500"} flex items-center justify-between bg-white`}
            >
                <div className="flex items-center gap-2 flex-1">
                    {selectedOption?.flag && (
                        <img
                            src={selectedOption.flag}
                            alt=""
                            className="w-7 h-6 object-cover flex-shrink-0"
                        />
                    )}
                    <span className="font-medium text-m mr-1">
                        {selectedOption ? selectedOption.label : "Code"}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {countryOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-3 hover:bg-gray-100 flex items-center gap-2 transition-colors ${selectedValue === option.value
                                ? "bg-purple-50 text-purple-700 border-l-4 border-purple-700"
                                : "text-gray-900"
                                }`}
                        >
                            {option.flag && (
                                <img
                                    src={option.flag}
                                    alt=""
                                    className="w-5 h-4 object-cover flex-shrink-0"
                                />
                            )}
                            <span className="truncate font-medium text-m">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default PhoneCodeDropdown;