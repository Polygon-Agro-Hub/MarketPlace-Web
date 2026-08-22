"use client";
import React, { useState, FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import SecurityImg from "../../../public/security-shield.png";
import glogo from "../../../public/glogo.png";
import { updatePasswordByNic } from "@/services/auth-service";

type FormErrors = {
    nicNumber?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
};

export default function SetPasswordForm() {
    const router = useRouter();
    const [showNic, setShowNic] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        nicNumber: "",
        password: "",
        confirmPassword: "",
    });

    const checkNicLive = (nic: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.nicNumber;
            return newErrors;
        });
    };

    const checkNicOnBlur = (nic: string) => {
        if (!nic) return;
        const isValid = /^(\d{9}V|\d{12})$/.test(nic);

        setErrors((prev) => {
            const newErrors = { ...prev };
            if (!isValid) {
                newErrors.nicNumber = nic.includes("V")
                    ? "NIC must be 9 digits followed by V"
                    : "NIC must be exactly 12 digits";
            } else {
                delete newErrors.nicNumber;
            }
            return newErrors;
        });
    };

    const checkPasswordLive = (password: string) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
        setIsPasswordValid(passwordRegex.test(password));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (value.startsWith(" ")) return;

        let processedValue = value;

        if (name === "nicNumber") {
            const raw = value.toUpperCase().replace(/[^0-9V]/g, "");
            const hasV = raw.includes("V");
            let digits = raw.replace(/V/g, "");

            if (hasV) {
                digits = digits.slice(0, 9);
                processedValue = digits + "V";
            } else {
                digits = digits.slice(0, 12);
                processedValue = digits;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: processedValue }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }

        if (name === "password") checkPasswordLive(processedValue);
        if (name === "nicNumber") checkNicLive(processedValue);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.nicNumber) {
            newErrors.nicNumber = "NIC number is required";
        } else if (!/^(\d{9}V|\d{12})$/.test(formData.nicNumber)) {
            newErrors.nicNumber = "Enter a valid NIC (9 digits + V, or 12 digits)";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*[0-9])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one number";
        } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one special character";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getInputClass = (fieldName: keyof FormErrors) => {
        return errors[fieldName]
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-purple-500 focus:border-purple-500";
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        setLoading(true);

        try {
            await updatePasswordByNic({
                nicNumber: formData.nicNumber,
                password: formData.password,
            });

            setShowSuccessPopup(true);

            setTimeout(() => {
                router.push("/signin");
            }, 1500);
        } catch (err: any) {
            const message =
                err?.message || "Something went wrong. Please try again.";

            if (message.toLowerCase().includes("not registered")) {
                setErrors((prev) => ({
                    ...prev,
                    nicNumber: "This NIC is not registered. Please check the NIC and try again.",
                }));
            }

            setErrorMessage(message);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex lg:bg-gray-100 justify-center items-center w-full min-h-screen lg:py-10 lg:px-2">
            <div className="flex w-full lg:max-w-6xl">
                <div className="flex min-w-full mx-auto shadow-lg rounded-lg bg-white overflow-hidden">
                    <SuccessPopup
                        isVisible={showSuccessPopup}
                        onClose={() => setShowSuccessPopup(false)}
                        title="Password Updated"
                        description="Your password has been changed successfully."
                    />

                    <ErrorPopup
                        isVisible={showErrorPopup}
                        onClose={() => setShowErrorPopup(false)}
                        title="Error!"
                        description={errorMessage}
                    />

                    <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-full max-w-sm">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src={glogo}
                                    alt="Polygon Logo"
                                    width={150}
                                    height={60}
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#001535] mb-2">
                                Welcome!
                                <br />
                                Set Your New Password
                            </h2>
                            <p className="text-sm md:text-base text-center text-[#6B6B6B] mb-8">
                                For your security, please set a new password to continue to
                                your account.
                            </p>

                            {errors.general && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-left">
                                    {errors.general}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div className="w-full relative">
                                    <div className="relative">
                                        <input
                                            type={showNic ? "text" : "password"}
                                            name="nicNumber"
                                            value={formData.nicNumber}
                                            onChange={handleChange}
                                            onBlur={(e) => checkNicOnBlur(e.target.value)}
                                            placeholder="Your NIC Number"
                                            maxLength={12}
                                            autoComplete="off"
                                            className={`h-11 w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-1 ${getInputClass(
                                                "nicNumber",
                                            )}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowNic(!showNic)}
                                            tabIndex={-1}
                                        >
                                            {showNic ? (
                                                <EyeOff size={20} className="text-[#3E206D]" />
                                            ) : (
                                                <Eye size={20} className="text-[#3E206D]" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.nicNumber && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.nicNumber}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full relative">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter New Password"
                                            className={`h-11 w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-1 ${getInputClass(
                                                "password",
                                            )}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} className="text-[#3E206D]" />
                                            ) : (
                                                <Eye size={20} className="text-[#3E206D]" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full relative">
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onPaste={(e) => e.preventDefault()}
                                            onDrop={(e) => e.preventDefault()}
                                            onDragOver={(e) => e.preventDefault()}
                                            placeholder="Re-enter New Password"
                                            className={`h-11 w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-1 ${getInputClass(
                                                "confirmPassword",
                                            )}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} className="text-[#3E206D]" />
                                            ) : (
                                                <Eye size={20} className="text-[#3E206D]" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                {!isPasswordValid && formData.password && (
                                    <div className="text-xs text-gray-600 pl-1 flex flex-row gap-2 items-start md:items-center">
                                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center mt-0.5 md:mt-0">
                                            <span className="text-xs text-white font-semibold">
                                                i
                                            </span>
                                        </div>
                                        <div className="text-[#3E206D] text-xs md:text-sm">
                                            Your password must contain a minimum of 6 characters
                                            with 1 Uppercase, Numbers & Special Characters.
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full md:text-lg items-center justify-center bg-[#3E206D] text-white rounded-md py-3 hover:bg-purple-800 transition duration-200 disabled:opacity-50 cursor-pointer mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Continue"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:w-1/2 lg:aspect-[750/956] lg:self-start lg:shrink-0 relative overflow-hidden">
                        <Image
                            src={SecurityImg}
                            alt="Your Security, Our Priority"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}