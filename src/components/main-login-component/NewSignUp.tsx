"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  IdCard,
  BookOpen,
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  Check,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import {
  sendOTPInSignup,
  signup,
  verifyUserDetails,
  DeletedAccountInfo,
} from "@/services/auth-service";
import RestoreAccountPopup from "@/components/registration-components/Restoreaccountpopup";
import { useRouter } from "next/navigation";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import OtpMainComponent from "@/components/new-otp/OtpMainComponent";
import { CityResult } from "@/services/auth-service";
import PhoneCodeDropdown, {
  validatePhoneNumber,
  validatePhoneNumberLive,
  getMaxPhoneLength,
} from "@/components/registration-components/PhoneCodeDropdown";

type FormErrors = {
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nicNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
  companyName?: string;
  companyPhoneNumber?: string;
  brFile?: string;
};

const BR_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const BR_MAX_MB = 5; // your design shows 10MB; change this only if the backend allows it
const BR_MAX_SIZE = BR_MAX_MB * 1024 * 1024;

interface CustomDropdownProps {
  options: { value: string; label: string; flag?: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  className?: string;
}

interface NewSignUpProps {
  selectedCity?: CityResult;
  onOtpActiveChange?: (active: boolean) => void;
}

/* ── Shared style tokens ── */
const PILL_INPUT =
  "h-11 w-full rounded-full border bg-[#F7F5FF] px-4 text-sm text-[#111827] placeholder-[#6B7280] outline-none transition focus:ring-2 md:px-5 md:text-base";

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full cursor-pointer items-center justify-between gap-1 rounded-full border border-[#DDD6FE] bg-[#F7F5FF] px-4 text-sm font-medium outline-none transition focus:border-[#8639FF] focus:ring-2 focus:ring-[#8639FF]/20 md:text-base ${selectedValue ? "text-[#111827]" : "text-[#6B7280]"} ${className}`}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.flag && (
            <img
              src={selectedOption.flag}
              alt=""
              className="h-4 w-5 flex-shrink-0 object-cover"
            />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[110px] overflow-y-auto rounded-2xl border border-[#E4DDFB] bg-white p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F7F5FF] ${
                selectedValue === option.value
                  ? "bg-[#F7F5FF] font-semibold text-[#FF6B35]"
                  : "text-gray-900"
              }`}
            >
              {option.flag && (
                <img
                  src={option.flag}
                  alt=""
                  className="h-4 w-5 flex-shrink-0 object-cover"
                />
              )}
              <span className="truncate">{option.label}</span>
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

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 pl-4 text-xs text-red-600">{message}</p> : null;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-[#4B5563] md:text-xs">
      {children}
    </span>
    <div className="flex-grow border-t border-[#E4DDFB]" />
  </div>
);

export default function NewSignUp({
  selectedCity,
  onOtpActiveChange,
}: NewSignUpProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHome, setIsHome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpReferenceId, setOtpReferenceId] = useState("");
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");
  const [currentReferenceId, setCurrentReferenceId] = useState("");
  const [linkedAccount, setLinkedAccount] = useState<DeletedAccountInfo | null>(
    null,
  );
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [restoreConfirmed, setRestoreConfirmed] = useState(false);

  // Tell the parent modal when the OTP screen is showing, so it can hide itself
  useEffect(() => {
    onOtpActiveChange?.(showOTPVerification);
    return () => onOtpActiveChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOTPVerification]);

  const getInitialFormData = () => ({
    title: "",
    firstName: "",
    lastName: "",
    phoneCode: "+94",
    phoneNumber: "",
    docType: "NIC" as "NIC" | "PASS",
    nicNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
    companyName: "",
    companyPhoneCode: "+94",
    companyPhoneNumber: "",
    city: selectedCity?.city || "",
    cityId: selectedCity?.id || null,
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [brFile, setBrFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const brInputRef = useRef<HTMLInputElement>(null);

  const checkPhoneLive = (
    fieldName: "phoneNumber" | "companyPhoneNumber",
    phoneCode: string,
    phoneNumber: string,
  ) => {
    if (!phoneNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return;
    }

    const error = validatePhoneNumberLive(phoneCode, phoneNumber);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  const checkNicLive = (nic: string) => {
    // While typing we can't know if the user is building toward
    // 9-digits+V or 12-digits, so just clear any stale error.
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.nicNumber;
      return newErrors;
    });
  };

  const handleDocTypeChange = (type: "NIC" | "PASS") => {
    if (type === formData.docType) return;
    setFormData((prev) => ({ ...prev, docType: type, nicNumber: "" }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.nicNumber;
      return next;
    });
    setLinkedAccount(null);
    setRestoreConfirmed(false);
  };

  const handleBrSelect = (file?: File | null) => {
    if (!file) return;

    if (!BR_ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        brFile: "Only JPG, PNG or PDF files are allowed",
      }));
      return;
    }
    if (file.size > BR_MAX_SIZE) {
      setErrors((prev) => ({
        ...prev,
        brFile: `File size must be ${BR_MAX_MB}MB or less`,
      }));
      return;
    }

    setBrFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.brFile;
      return next;
    });
  };

  const handleBrRemove = () => {
    setBrFile(null);
    if (brInputRef.current) brInputRef.current.value = "";
  };

  const handleBrPreview = () => {
    if (!brFile) return;
    window.open(URL.createObjectURL(brFile), "_blank");
  };

  const formatFileSize = (bytes: number) =>
    `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const checkNicOnBlur = (nic: string) => {
    if (!nic) return;

    const isPassport = formData.docType === "PASS";
    const isValid = isPassport
      ? /^[A-Z0-9]{6,12}$/.test(nic)
      : /^(\d{9}V|\d{12})$/.test(nic);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!isValid) {
        newErrors.nicNumber = isPassport
          ? "Enter a valid Passport ID (6-12 letters/numbers)"
          : nic.includes("V")
            ? "NIC must be 9 digits followed by V"
            : "NIC must be exactly 12 digits";
      } else {
        delete newErrors.nicNumber;
      }
      return newErrors;
    });
  };

  const checkEmailLive = (email: string) => {
    if (!email) {
      return;
    }

    const trimmedEmail = email.trim();
    let errorMessage = "";

    if (trimmedEmail.includes("..")) {
      errorMessage = "Email cannot contain consecutive dots (..)";
    } else if (trimmedEmail.startsWith(".")) {
      errorMessage = "Email cannot start with a dot (.)";
    } else if (trimmedEmail.includes(".@")) {
      errorMessage = "Email cannot have a dot (.) immediately before @";
    } else if (trimmedEmail.includes("@.")) {
      errorMessage = "Email cannot have a dot (.) immediately after @";
    } else if (trimmedEmail.endsWith(".")) {
      errorMessage = "Email cannot end with a dot (.)";
    } else if (
      /[!#$%^&*()+=\[\]{};':"\\|,<>\/?]/.test(trimmedEmail.split("@")[0])
    ) {
      errorMessage = "Email contains invalid special characters";
    } else if (!trimmedEmail.includes("@")) {
      errorMessage = "Email must contain @ symbol";
    } else if (trimmedEmail.split("@").length > 2) {
      errorMessage = "Email can only contain one @ symbol";
    } else if (!trimmedEmail.includes(".", trimmedEmail.indexOf("@"))) {
      errorMessage = "Email domain must contain a dot (.)";
    } else {
      const emailRegex =
        /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        errorMessage = "Please enter a valid email (e.g., example@domain.com)";
      }
    }

    if (errorMessage) {
      setErrors((prev) => ({
        ...prev,
        email: errorMessage,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    let processedValue = value;

    if (type !== "checkbox" && value.startsWith(" ")) {
      return;
    }

    if (name === "firstName" || name === "lastName") {
      const letterOnlyValue = value.replace(/[^A-Za-z\s]/g, "");
      processedValue = letterOnlyValue
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    }

    if (name === "nicNumber") {
      if (formData.docType === "PASS") {
        processedValue = value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 12);
      } else {
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
      if (linkedAccount) {
        setLinkedAccount(null);
        setRestoreConfirmed(false);
      }
    }

    if (name === "companyName") {
      if (value.startsWith(" ")) {
        return;
      }
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    // Clear stale error for this field first
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    // Live checks run AFTER the generic clear, so they can't be wiped
    if (name === "password") {
      checkPasswordLive(processedValue);
    }

    if (name === "email") {
      checkEmailLive(processedValue);
    }

    if (name === "nicNumber") {
      checkNicLive(processedValue);
    }

    if (name === "phoneNumber") {
      checkPhoneLive("phoneNumber", formData.phoneCode, processedValue);
    }

    if (name === "companyPhoneNumber") {
      checkPhoneLive(
        "companyPhoneNumber",
        formData.companyPhoneCode,
        processedValue,
      );
    }
  };

  const checkPasswordLive = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;
    setIsPasswordValid(passwordRegex.test(password));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title) newErrors.title = "Title is required";

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters and spaces";
    } else if (formData.firstName !== formData.firstName.trim()) {
      newErrors.firstName = "First name cannot begin or end with a space";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters and spaces";
    } else if (formData.lastName !== formData.lastName.trim()) {
      newErrors.lastName = "Last name cannot begin or end with a space";
    }

    const phoneError = validatePhoneNumber(
      formData.phoneCode,
      formData.phoneNumber,
    );
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }
    if (!formData.nicNumber) {
      newErrors.nicNumber =
        formData.docType === "PASS"
          ? "Passport ID is required"
          : "NIC number is required";
    } else if (formData.docType === "PASS") {
      if (!/^[A-Z0-9]{6,12}$/.test(formData.nicNumber)) {
        newErrors.nicNumber =
          "Enter a valid Passport ID (6-12 letters/numbers)";
      }
    } else if (!/^(\d{9}V|\d{12})$/.test(formData.nicNumber)) {
      newErrors.nicNumber = "Enter a valid NIC (9 digits + V, or 12 digits)";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else {
      const email = formData.email.trim();
      let emailError = "";

      if (email.includes("..")) {
        emailError = "Email cannot contain consecutive dots (..)";
      } else if (email.startsWith(".")) {
        emailError = "Email cannot start with a dot (.)";
      } else if (email.includes(".@")) {
        emailError = "Email cannot have a dot (.) immediately before @";
      } else if (email.includes("@.")) {
        emailError = "Email cannot have a dot (.) immediately after @";
      } else if (email.endsWith(".")) {
        emailError = "Email cannot end with a dot (.)";
      } else if (/[!#$%^&*()+=\[\]{};':"\\|,<>\/?]/.test(email.split("@")[0])) {
        emailError = "Email contains invalid special characters";
      } else if (!email.includes("@")) {
        emailError = "Email must contain @ symbol";
      } else if (email.split("@").length > 2) {
        emailError = "Email can only contain one @ symbol";
      } else if (!email.includes(".", email.indexOf("@"))) {
        emailError = "Email domain must contain a dot (.)";
      } else {
        const emailRegex =
          /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          emailError = "Please enter a valid email (e.g., example@domain.com)";
        }
      }

      if (emailError) {
        newErrors.email = emailError;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isHome) {
      if (!formData.companyName) {
        newErrors.companyName = "Company name is required";
      }

      const companyPhoneError = validatePhoneNumber(
        formData.companyPhoneCode,
        formData.companyPhoneNumber,
      );
      if (companyPhoneError) {
        newErrors.companyPhoneNumber = companyPhoneError;
      }
      if (!brFile) {
        newErrors.brFile = "Business registration document is required";
      }
    }

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOtpAndContinue = async () => {
    const res: any = await sendOTPInSignup(
      formData.phoneNumber,
      formData.phoneCode,
      { email: formData.email },
    );
    console.log("sendOTPInSignup response:", res); // remove once confirmed

    // Always set these so the number/email pill and timer have data
    setOtpReferenceId(
      res?.referenceId ?? res?.reference_id ?? res?.data?.referenceId ?? "",
    );
    setFullPhoneNumber(`${formData.phoneCode}${formData.phoneNumber}`);
    setShowOTPVerification(true);

    setSuccess(
      formData.phoneCode !== "+94"
        ? `Verification code has been sent to ${formData.email}`
        : `OTP code has been sent to ${formData.phoneCode}${formData.phoneNumber}`,
    );
    setShowSuccessPopup(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const verifyRes = await verifyUserDetails(
        formData.email,
        formData.phoneNumber,
        formData.phoneCode,
        formData.nicNumber,
        formData.docType,
      );

      if (verifyRes.deletedAccount) {
        setLinkedAccount(verifyRes.deletedAccount);
        if (!restoreConfirmed) {
          // Stop here and ask the user what to do
          setShowRestorePopup(true);
          return; // `finally` resets loading
        }
      } else {
        setLinkedAccount(null);
        setRestoreConfirmed(false);
      }

      await sendOtpAndContinue();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to process request. Please try again.",
      );
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithAccount = async () => {
    setShowRestorePopup(false);
    setRestoreConfirmed(true);
    setLoading(true);
    try {
      await sendOtpAndContinue();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to process request. Please try again.",
      );
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBackAndEditNic = () => {
    setShowRestorePopup(false);
    setLinkedAccount(null);
    setRestoreConfirmed(false);
    setFormData((prev) => ({ ...prev, nicNumber: "" }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.nicNumber;
      return next;
    });
    setSuccess(null);
  };

  const completeSignup = async (skipSuccessPopup: boolean = false) => {
    setLoading(true);
    try {
      await signup({
        ...formData,
        companyName: isHome ? "" : formData.companyName,
        companyPhoneCode: isHome ? "" : formData.companyPhoneCode,
        companyPhoneNumber: isHome ? "" : formData.companyPhoneNumber,
        buyerType: isHome ? "Retail" : "Wholesale",
        restoreAccount: restoreConfirmed && !!linkedAccount,
        brFile: isHome ? null : brFile,
      });
      if (skipSuccessPopup) {
        router.push("/signin");
      } else {
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    setLoading(true);

    try {
      await signup({
        ...formData,
        companyName: isHome ? "" : formData.companyName,
        companyPhoneCode: isHome ? "" : formData.companyPhoneCode,
        companyPhoneNumber: isHome ? "" : formData.companyPhoneNumber,
        buyerType: isHome ? "Retail" : "Wholesale",
        restoreAccount: restoreConfirmed && !!linkedAccount,
        brFile: isHome ? null : brFile,
      });
      setLoading(false);

      // Clear the "OTP sent" text so the popup shows the account-created title
      setSuccess(null);
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setShowOTPVerification(false);
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
      throw err;
    }
  };

  const handleOTPVerificationFailure = () => {
    // Intentionally empty: OtpMainComponent shows its own error and clears the
    // boxes, so the user can retry without leaving the OTP screen.
  };

  const handleOTPExpired = () => {
    setCurrentReferenceId(""); // Clear the reference ID
  };

  const handleOTPResend = (newReferenceId: string) => {
    setOtpReferenceId(newReferenceId);
  };

  const getInputClass = (fieldName: keyof FormErrors) => {
    return errors[fieldName]
      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
      : "border-[#DDD6FE] focus:ring-[#8639FF]/20 focus:border-[#8639FF]";
  };

  const blockNonLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[A-Za-z\s]/.test(e.key) && e.key !== "Backspace") {
      e.preventDefault();
    }
  };

  const pasteLettersOnly = (
    e: React.ClipboardEvent<HTMLInputElement>,
    name: "firstName" | "lastName",
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const filteredText = pastedText
      .replace(/[^A-Za-z\s]/g, "")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    handleChange({
      target: { name, value: filteredText },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  if (showOTPVerification) {
    const isEmailMode = formData.phoneCode !== "+94";
    return (
      <OtpMainComponent
        phoneNumber={formData.phoneNumber}
        phoneCode={formData.phoneCode}
        email={formData.email}
        referenceId={otpReferenceId}
        mode={isEmailMode ? "email" : "phone"}
        contactValue={isEmailMode ? formData.email : fullPhoneNumber}
        initialTimer={isEmailMode ? 240 : 60}
        onBack={() => setShowOTPVerification(false)}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onVerificationFailure={handleOTPVerificationFailure}
        onResendOTP={handleOTPResend}
        onOTPExpired={handleOTPExpired}
      >
        {/* Popups live inside the portal so they stay visible while the
            parent signup modal is hidden */}
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title={
            success
              ? "OTP Sent Successfully"
              : "Your account created successfully!"
          }
          description={success as any}
        />
        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />
      </OtpMainComponent>
    );
  }

  const buyerTypeClass = (selected: boolean) =>
    `flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border px-3 py-2.5 text-xs font-semibold transition-colors md:text-base ${
      selected
        ? "border-[#FF6B35] bg-[#FF6B35] text-white"
        : "border-[#E4DDFB] bg-white text-[#111827] hover:border-[#FF6B35]"
    }`;

  const radioDot = (selected: boolean) => (
    <span
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-white" : "border-[#111827]"
      }`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  );

  return (
    <div className="w-full">
      <div className="w-full font-[Inter,sans-serif]">
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title={
            success
              ? "OTP Sent Successfully"
              : "Your account created successfully!"
          }
          description={success as any}
        />

        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />
        <RestoreAccountPopup
          isOpen={showRestorePopup && !!linkedAccount}
          nicNumber={formData.nicNumber}
          pastOrders={linkedAccount?.pastOrders ?? 0}
          memberSince={linkedAccount?.memberSince ?? null}
          deletedOn={linkedAccount?.deletedOn ?? null}
          onContinue={handleContinueWithAccount}
          onGoBack={handleGoBackAndEditNic}
          onClose={() => setShowRestorePopup(false)}
        />

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <h1 className="text-[20px] font-bold leading-tight tracking-tight text-[#111827] md:text-[34px]">
            Create your account
          </h1>
          <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FF6B35] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#FF6B35] md:mt-1 md:gap-2 md:px-4 md:py-1.5 md:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] md:h-2 md:w-2" />
            Step 2 of 2
          </span>
        </div>
        <p className="mb-4 mt-1 text-[13px] leading-snug text-[#4B5563] md:mb-6 md:text-base">
          Please select your buyer type and fill in all the required details to
          create your account
        </p>

        {errors.general && (
          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ── Buyer type ── */}
        <div className="mb-5 flex gap-2 md:gap-3">
          <button
            type="button"
            role="radio"
            aria-checked={isHome}
            onClick={() => setIsHome(true)}
            className={buyerTypeClass(isHome)}
          >
            {radioDot(isHome)}
            I&apos;m Buying for Home
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!isHome}
            onClick={() => setIsHome(false)}
            className={buyerTypeClass(!isHome)}
          >
            {radioDot(!isHome)}
            I&apos;m Buying for Business
          </button>
        </div>

        <SectionTitle>Personal Details</SectionTitle>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 md:space-y-4">
          {/* Title + first + last name */}
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-[84px] flex-shrink-0 md:w-[100px]">
              <CustomDropdown
                options={[
                  { value: "Rev", label: "Rev." },
                  { value: "Mr", label: "Mr." },
                  { value: "Mrs", label: "Mrs." },
                  { value: "Ms", label: "Ms." },
                ]}
                selectedValue={formData.title}
                onSelect={(value) =>
                  handleChange({
                    target: { name: "title", value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Title"
              />
              <FieldError message={errors.title} />
            </div>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onKeyPress={blockNonLetters}
                onPaste={(e) => pasteLettersOnly(e, "firstName")}
                placeholder="First Name"
                className={`${PILL_INPUT} ${getInputClass("firstName")}`}
              />
              <FieldError message={errors.firstName} />
            </div>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onKeyPress={blockNonLetters}
                onPaste={(e) => pasteLettersOnly(e, "lastName")}
                placeholder="Last Name"
                className={`${PILL_INPUT} ${getInputClass("lastName")}`}
              />
              <FieldError message={errors.lastName} />
            </div>
          </div>

          {/* Phone row */}
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-[96px] flex-shrink-0 md:w-[100px]">
              <PhoneCodeDropdown
                selectedValue={formData.phoneCode}
                onSelect={(value) => {
                  handleChange({
                    target: { name: "phoneCode", value },
                  } as React.ChangeEvent<HTMLSelectElement>);
                  checkPhoneLive("phoneNumber", value, formData.phoneNumber);
                }}
                className="cursor-pointer !rounded-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (!/[\d]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData("text");
                  const filteredText = pastedText.replace(/[^\d]/g, "");
                  handleChange({
                    target: { name: "phoneNumber", value: filteredText },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                placeholder="Mobile Number (e.g. 7XXXXXXXX)"
                className={`${PILL_INPUT} ${getInputClass("phoneNumber")}`}
                maxLength={getMaxPhoneLength(formData.phoneCode)}
              />
              <FieldError message={errors.phoneNumber} />
            </div>
          </div>

          {/* Overseas notice */}
          {formData.phoneCode !== "+94" && (
            <div className="flex items-start gap-2 rounded-xl bg-[#FEF6ED] px-3 py-2.5">
              <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-[#111827] text-[9px] font-bold leading-none text-white">
                i
              </span>
              <p className="text-xs leading-snug text-[#374151]">
                Delivery is limited to Sri Lankan addresses.
                <br />
                Overseas customers may place orders for recipients in Sri Lanka.
              </p>
            </div>
          )}

          {/* Verification card */}
          <div className="w-full rounded-2xl border border-[#E4DDFB] bg-white p-3 md:p-4">
            <p className="mb-2 text-xs font-semibold text-[#111827] md:text-sm">
              Verification
            </p>

            <div className="mb-3 flex rounded-full border border-[#E4DDFB] bg-white p-1">
              <button
                type="button"
                onClick={() => handleDocTypeChange("NIC")}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 py-2 text-xs font-semibold transition-colors md:text-sm ${
                  formData.docType === "NIC"
                    ? "bg-[#FF6B35] text-white"
                    : "text-[#111827]"
                }`}
              >
                <IdCard className="h-4 w-4 flex-shrink-0" />
                National ID (NIC)
              </button>
              <button
                type="button"
                onClick={() => handleDocTypeChange("PASS")}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 py-2 text-xs font-semibold transition-colors md:text-sm ${
                  formData.docType === "PASS"
                    ? "bg-[#FF6B35] text-white"
                    : "text-[#111827]"
                }`}
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                Passport ID
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="nicNumber"
                value={formData.nicNumber}
                onChange={handleChange}
                onBlur={(e) => checkNicOnBlur(e.target.value)}
                placeholder={
                  formData.docType === "PASS"
                    ? "e.g. N1234567"
                    : "e.g. 199012345678 or 901234567V"
                }
                className={`${PILL_INPUT} truncate placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base ${
                  linkedAccount && restoreConfirmed ? "pr-20" : ""
                } ${
                  linkedAccount && restoreConfirmed
                    ? "border-[#FF6B35] bg-[#FFF1EB]"
                    : getInputClass("nicNumber")
                }`}
              />
              {linkedAccount && restoreConfirmed && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                  Linked
                </span>
              )}
            </div>
            <FieldError message={errors.nicNumber} />
          </div>

          {/* Email */}
          <div className="w-full">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-[#111827] md:text-sm"
            >
              Email Address
            </label>
            <input
              id="email"
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (e.key === " " && formData.email.length === 0) {
                  e.preventDefault();
                }
              }}
              placeholder="yourname@gmail.com"
              className={`${PILL_INPUT} ${getInputClass("email")}`}
            />
            <FieldError message={errors.email} />
          </div>

          {/* Passwords */}
          <div className="flex items-start gap-2 md:gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-[#111827] md:text-sm"
              >
                Create Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`${PILL_INPUT} pr-11 ${getInputClass("password")}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#111827]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <div className="min-w-0 flex-1">
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-semibold text-[#111827] md:text-sm"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  placeholder="Re-Enter Password"
                  className={`${PILL_INPUT} pr-11 ${getInputClass("confirmPassword")}`}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#111827]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <FieldError message={errors.confirmPassword} />
            </div>
          </div>

          {!isPasswordValid && formData.password && (
            <div className="flex items-start gap-2 pl-1 text-xs text-[#4B5563]">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#111827] text-[10px] font-semibold text-white">
                i
              </span>
              <span>
                Your password must contain a minimum of 6 characters with 1
                Uppercase, Numbers &amp; Special Characters.
              </span>
            </div>
          )}

          {/* ── Company details ── */}
          {!isHome && (
            <div className="space-y-3 pt-2 md:space-y-4">
              <SectionTitle>Company Details</SectionTitle>

              <div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (e.key === " " && formData.companyName.length === 0) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Company Name"
                  className={`${PILL_INPUT} ${getInputClass("companyName")}`}
                />
                <FieldError message={errors.companyName} />
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-[96px] flex-shrink-0 md:w-[110px]">
                  <PhoneCodeDropdown
                    selectedValue={formData.companyPhoneCode}
                    onSelect={(value) => {
                      handleChange({
                        target: { name: "companyPhoneCode", value },
                      } as React.ChangeEvent<HTMLSelectElement>);
                      checkPhoneLive(
                        "companyPhoneNumber",
                        value,
                        formData.companyPhoneNumber,
                      );
                    }}
                    className="cursor-pointer !rounded-full"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    name="companyPhoneNumber"
                    value={formData.companyPhoneNumber}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      if (!/[\d]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData("text");
                      const filteredText = pastedText.replace(/[^\d]/g, "");
                      handleChange({
                        target: {
                          name: "companyPhoneNumber",
                          value: filteredText,
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="Company Phone Number (e.g. XXXXXXXXX)"
                    className={`${PILL_INPUT} truncate placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base ${getInputClass("companyPhoneNumber")}`}
                    maxLength={getMaxPhoneLength(formData.companyPhoneCode)}
                  />
                  <FieldError message={errors.companyPhoneNumber} />
                </div>
              </div>

              {/* Business registration card */}
              <div className="rounded-2xl border border-[#E4DDFB] bg-white p-3 md:p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#111827] md:text-xs">
                  Business Registration (BR)
                </p>

                <input
                  ref={brInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleBrSelect(e.target.files?.[0])}
                />

                {!brFile ? (
                  <div
                    onClick={() => brInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleBrSelect(e.dataTransfer.files?.[0]);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-6 text-center transition-colors ${
                      isDragging
                        ? "border-[#FF6B35] bg-[#FFF1EB]"
                        : "border-[#DDD6FE] bg-[#F7F5FF]"
                    }`}
                  >
                    <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-5 w-5 text-[#FF6B35]" />
                    </span>
                    <p className="text-xs text-[#4B5563] md:text-sm">
                      <span className="font-semibold text-[#FF6B35]">
                        Click to browse
                      </span>{" "}
                      or drag and drop
                    </p>
                    <span className="text-[11px] text-[#4B5563] md:text-xs">
                      Supported formats: JPG, PNG, or PDF (Max {BR_MAX_MB}MB)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-[#E4DDFB] bg-white p-3">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4DDFB] bg-white">
                        {brFile.type === "application/pdf" ? (
                          <FileText className="h-5 w-5 text-[#111827]" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[#111827]" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B35] ring-2 ring-white">
                        <Check
                          className="h-2.5 w-2.5 text-white"
                          strokeWidth={3}
                        />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111827]">
                        {brFile.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {formatFileSize(brFile.size)} • Verified{" "}
                        {brFile.type === "application/pdf" ? "PDF" : "image"}{" "}
                        document
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Preview file"
                      onClick={handleBrPreview}
                      className="flex-shrink-0 cursor-pointer p-1 text-[#111827] hover:text-[#FF6B35]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={handleBrRemove}
                      className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-500 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <FieldError message={errors.brFile} />
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`h-4 w-4 flex-shrink-0 cursor-pointer accent-black ${
                  errors.agreeToTerms ? "outline outline-1 outline-red-500" : ""
                }`}
              />
              <label
                htmlFor="terms"
                className="text-[11px] text-[#374151] md:text-sm"
              >
                I agree to Polygon&apos;s{" "}
                <Link
                  href="/terms-conditions"
                  className="font-medium text-[#111827] underline underline-offset-2"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and understand the{" "}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-[#111827] underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="ml-6 mt-1 text-xs text-red-600">
                {errors.agreeToTerms}
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF6B35] py-3 text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#F25A22] disabled:cursor-not-allowed disabled:opacity-60 md:py-4 md:text-lg"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
