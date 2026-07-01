"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FaAngleDown } from "react-icons/fa";
import {
  fetchBillingDetails,
  saveBillingDetails,
  fetchCities,
  BillingDetails,
} from "@/services/auth-service";
import SuccessPopup from "@/components/toast-messages/success-message";
import ErrorPopup from "@/components/toast-messages/error-message";
import Loader from "@/components/loader-spinner/Loader";
import GeoLocationModal from "@/components/delivery-map/GeoLocationModal";
import Lottie from "react-lottie";
import noAddItemAnimation from "@/assets/animations/GoViMartNotFound.json";
import {
  LocateFixed,
  MoreVertical,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";

// Define form data type
type BillingFormData = {
  saveAs: string;
  billingTitle: string;
  billingName: string;
  title: string;
  firstName: string;
  lastName: string;
  houseNo: string;
  buildingNo: string;
  buildingType: string;
  apartmentName?: string;
  flatNumber?: string;
  apartmentFloor?: string;
  apartmentHouseNo?: string;
  houseStreet: string;
  houseCity: string;
  apartmentStreet: string;
  apartmentCity: string;
  phonecode1: string;
  phone1: string;
  phonecode2?: string;
  phone2?: string;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
};

// Custom Dropdown Component
interface CustomDropdownProps {
  register: UseFormRegister<BillingFormData>;
  setValue: UseFormSetValue<BillingFormData>;
  name: keyof BillingFormData;
  value: string | undefined;
  errors?: FieldErrors<BillingFormData>;
  options: { value: string; label: string; countryCode?: string }[];
  placeholder: string;
  withSearch?: boolean;
  maxVisibleItems?: number;
}

const CustomDropdown = ({
  register,
  setValue,
  name,
  value,
  errors,
  options,
  placeholder,
  withSearch = false,
  maxVisibleItems = 6,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setValue(name, optionValue, { shouldValidate: true });
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = withSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative cursor-pointer" ref={dropdownRef}>
      <input type="hidden" {...register(name)} />
      <div
        className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px] pr-8 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.countryCode && (
            <img
              src={`https://flagcdn.com/24x18/${selectedOption.countryCode.toLowerCase()}.png`}
              alt={selectedOption.countryCode}
              className="w-5 h-4 object-cover"
            />
          )}
          <span>{(value && selectedOption?.label) || placeholder}</span>
        </span>
        <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-[#CECECE] rounded-lg mt-1 shadow-lg">
          {withSearch && (
            <div className="p-2 border-b border-[#CECECE]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full p-2 text-xs md:text-sm border border-[#CECECE] rounded focus:outline-none focus:ring-1 focus:ring-[#3E206D]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul
            className={`overflow-y-auto ${withSearch ? "max-h-[240px]" : ""}`}
            style={{ maxHeight: `${maxVisibleItems * 40}px` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="p-2 text-[12px] md:text-[14px] cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.countryCode && (
                    <img
                      src={`https://flagcdn.com/24x18/${option.countryCode.toLowerCase()}.png`}
                      alt={option.countryCode}
                      className="w-5 h-4 object-cover"
                    />
                  )}
                  <span>{option.label}</span>
                </li>
              ))
            ) : (
              <li className="p-2 text-[12px] md:text-[14px] text-gray-500 text-center">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
      <p className="text-red-500 text-xs">{errors?.[name]?.message}</p>
    </div>
  );
};

// Cancel Success Popup Component
interface CancelSuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  duration?: number;
}

const CancelSuccessPopup = ({
  isVisible,
  onClose,
  title,
  duration,
}: CancelSuccessPopupProps) => {
  useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
      <p>{title}</p>
    </div>
  );
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [billingNameError, setBillingNameError] = useState("");
  const [initialFormData, setInitialFormData] =
    useState<BillingFormData | null>(null);
  const [addressBook, setAddressBook] = useState<BillingDetails[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [openAddressMenuId, setOpenAddressMenuId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [hasFormChanged, setHasFormChanged] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    6.9271, 79.8612,
  ]);
  const [isViewingLocation, setIsViewingLocation] = useState(false);
  const [hasGeoLocation, setHasGeoLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const addressBookMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressBookMenuRef.current &&
        !addressBookMenuRef.current.contains(event.target as Node)
      ) {
        setOpenAddressMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const makeAddressId = () => Date.now();

  const getAddressSummary = (details: BillingDetails) => {
    const address = details.address;
    const parts = [
      address.houseNo,
      address.buildingNo,
      address.buildingName,
      address.unitNo,
      address.streetName,
      address.city,
    ]
      .filter((part) => Boolean(part))
      .map((part) => String(part));

    return parts.length > 0 ? parts.join(", ") : "No address details available";
  };

  const mapBillingDetailsToFormData = (
    data: BillingDetails,
    fetchedCities: string[],
  ): BillingFormData => ({
    saveAs: data.address?.saveAs || "",
    billingTitle: data.billingTitle || "",
    billingName: data.billingName || "",
    title: data.title || "Mr.",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    buildingType: data.buildingType ? data.buildingType.toLowerCase() : "",
    houseNo:
      data.buildingType?.toLowerCase() === "house"
        ? data.address?.houseNo || ""
        : "",
    buildingNo:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.buildingNo || ""
        : "",
    apartmentName:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.buildingName || ""
        : "",
    flatNumber:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.unitNo || ""
        : "",
    apartmentFloor:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.floorNo || ""
        : "",
    apartmentHouseNo:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.houseNo || ""
        : "",
    houseStreet:
      data.buildingType?.toLowerCase() === "house"
        ? data.address?.streetName || ""
        : "",
    houseCity:
      data.buildingType?.toLowerCase() === "house"
        ? findMatchingCity(data.address?.city || "", fetchedCities)
        : "",
    apartmentStreet:
      data.buildingType?.toLowerCase() === "apartment"
        ? data.address?.streetName || ""
        : "",
    apartmentCity:
      data.buildingType?.toLowerCase() === "apartment"
        ? findMatchingCity(data.address?.city || "", fetchedCities)
        : "",
    phonecode1: data.phoneCode || "+94",
    phone1: data.phoneNumber || "",
    phonecode2: data.phoneCode2 || "+94",
    phone2: data.phoneNumber2 || "",
    geoLatitude: data.geoLatitude || data.address?.geoLatitude || null,
    geoLongitude: data.geoLongitude || data.address?.geoLongitude || null,
  });

  const splitBillingName = (
    fullName: string,
  ): { firstName: string; lastName: string } => {
    const trimmed = (fullName || "").trim().replace(/\s+/g, " ");
    if (!trimmed) return { firstName: "", lastName: "" };

    const parts = trimmed.split(" ");
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    return { firstName, lastName };
  };

  const mapFormDataToBillingDetails = (
    data: BillingFormData,
    existingId?: number | null,
  ): BillingDetails => {
    const { firstName, lastName } = splitBillingName(data.billingName);

    return {
      id: existingId || undefined,
      billingTitle: data.billingTitle,
      billingName: data.billingName || "",
      title: data.title || data.billingTitle,
      firstName: data.firstName || firstName, // ← fallback added
      lastName: data.lastName || lastName, // ← fallback added
      phoneCode: data.phonecode1 || "+94",
      phoneNumber: data.phone1 || "",
      phoneCode2: data.phonecode2 || "+94",
      phoneNumber2: data.phone2 || "",
      buildingType: data.buildingType || "",
      geoLatitude: data.geoLatitude || undefined,
      geoLongitude: data.geoLongitude || undefined,
      address: {
        id: existingId || undefined,
        saveAs: data.saveAs || undefined,
        title: data.title || "Mr.",
        firstName: data.firstName || firstName, // ← fallback added
        lastName: data.lastName || lastName, // ← fallback added
        phoneCode: data.phonecode1 || "+94",
        phoneNumber: data.phone1 || "",
        houseNo:
          data.buildingType === "house"
            ? data.houseNo || undefined
            : data.buildingType === "apartment"
              ? data.apartmentHouseNo || undefined
              : undefined,
        buildingNo:
          data.buildingType === "apartment"
            ? data.buildingNo || undefined
            : undefined,
        buildingName:
          data.buildingType === "apartment"
            ? data.apartmentName || undefined
            : undefined,
        unitNo:
          data.buildingType === "apartment"
            ? data.flatNumber || undefined
            : undefined,
        floorNo:
          data.buildingType === "apartment"
            ? data.apartmentFloor || undefined
            : undefined,
        streetName:
          data.buildingType === "house"
            ? data.houseStreet || undefined
            : data.buildingType === "apartment"
              ? data.apartmentStreet || undefined
              : undefined,
        city:
          data.buildingType === "house"
            ? data.houseCity || undefined
            : data.buildingType === "apartment"
              ? data.apartmentCity || undefined
              : undefined,
        geoLatitude: data.geoLatitude || undefined,
        geoLongitude: data.geoLongitude || undefined,
      },
    };
  };

  const startCreateAddress = () => {
    setSelectedAddressId(null);
    setOpenAddressMenuId(null);
    setInitialFormData(null);
    setHasFormChanged(false);
    setIsEditingAddress(true);
    reset({
      saveAs: "",
      billingTitle: "",
      billingName: "",
      title: "Mr.",
      firstName: "",
      lastName: "",
      houseNo: "",
      buildingNo: "",
      buildingType: "",
      apartmentName: "",
      flatNumber: "",
      apartmentFloor: "",
      apartmentHouseNo: "",
      houseStreet: "",
      houseCity: "",
      apartmentStreet: "",
      apartmentCity: "",
      phonecode1: "+94",
      phone1: "",
      phonecode2: "+94",
      phone2: "",
      geoLatitude: null,
      geoLongitude: null,
    });
  };

  const startEditAddress = (address: BillingDetails) => {
    const formData = mapBillingDetailsToFormData(address, cities);
    const addressId = address.id || makeAddressId();

    setSelectedAddressId(addressId);
    setOpenAddressMenuId(null);
    setInitialFormData(formData);
    setHasFormChanged(false);
    setIsEditingAddress(true);
    reset(formData);
    setValue("buildingType", formData.buildingType);
    setValue("geoLatitude", formData.geoLatitude ?? null, {
      shouldValidate: false,
    });
    setValue("geoLongitude", formData.geoLongitude ?? null, {
      shouldValidate: false,
    });
  };

  const closeAddressForm = () => {
    setIsEditingAddress(false);
    setOpenAddressMenuId(null);
    if (selectedAddressId) {
      const selectedAddress = addressBook.find(
        (entry) => (entry.id || null) === selectedAddressId,
      );
      if (selectedAddress) {
        const formData = mapBillingDetailsToFormData(selectedAddress, cities);
        setInitialFormData(formData);
        reset(formData);
      }
    }
  };

  const handleViewLocation = () => {
    const lat = watch("geoLatitude");
    const lng = watch("geoLongitude");
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setIsViewingLocation(true);
      setIsGeoModalOpen(true);
    }
  };

  const handleAttachLocation = () => {
    setIsViewingLocation(false);
    setIsGeoModalOpen(true);
  };

  // ── Helper: match city case-insensitively against fetched list ──────────────
  const findMatchingCity = (
    cityValue: string,
    citiesList: string[],
  ): string => {
    if (!cityValue) return "";
    const match = citiesList.find(
      (c) =>
        typeof c === "string" && c.toLowerCase() === cityValue.toLowerCase(),
    );
    return match || cityValue;
  };

  const compareFormData = (
    current: BillingFormData,
    initial: BillingFormData | null,
  ): boolean => {
    if (!initial) return false;

    const stringFieldsToCompare: (keyof BillingFormData)[] = [
      "saveAs",
      "billingTitle",
      "billingName",
      "title",
      "firstName",
      "lastName",
      "houseNo",
      "buildingNo",
      "buildingType",
      "apartmentName",
      "flatNumber",
      "apartmentFloor",
      "apartmentHouseNo",
      "houseStreet",
      "houseCity",
      "apartmentStreet",
      "apartmentCity",
      "phonecode1",
      "phone1",
      "phonecode2",
      "phone2",
    ];

    const stringFieldsChanged = stringFieldsToCompare.some((field) => {
      const currentValue = current[field] || "";
      const initialValue = initial[field] || "";
      return currentValue !== initialValue;
    });

    if (stringFieldsChanged) return true;

    const geoLatChanged =
      (current.geoLatitude ?? null) !== (initial.geoLatitude ?? null);
    const geoLngChanged =
      (current.geoLongitude ?? null) !== (initial.geoLongitude ?? null);

    return geoLatChanged || geoLngChanged;
  };

  const billingTitleOptions = [
    { value: "Mr.", label: "Mr" },
    { value: "Mrs.", label: "Mrs" },
    { value: "Ms.", label: "Ms" },
    { value: "Rev.", label: "Rev" },
  ];

  const buildingTypeOptions = [
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
  ];

  const cityOptions = cities.map((city) => ({
    value: city,
    label: city,
  }));

  const countries = [
    { code: "LK", dialCode: "+94", name: "Sri Lanka" },
    { code: "VN", dialCode: "+84", name: "Vietnam" },
    { code: "KH", dialCode: "+855", name: "Cambodia" },
    { code: "BD", dialCode: "+880", name: "Bangladesh" },
    { code: "IN", dialCode: "+91", name: "India" },
    { code: "NL", dialCode: "+31", name: "Netherlands" },
  ];

  const phoneCodeOptions = countries.map((country) => ({
    value: country.dialCode,
    label: country.dialCode,
    countryCode: country.code,
  }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<BillingFormData>({
    defaultValues: {
      saveAs: "",
      billingTitle: "",
      billingName: "",
      title: "Mr.",
      firstName: "",
      lastName: "",
      houseNo: "",
      buildingNo: "",
      buildingType: "",
      apartmentName: "",
      flatNumber: "",
      apartmentFloor: "",
      apartmentHouseNo: "",
      houseStreet: "",
      houseCity: "",
      apartmentStreet: "",
      apartmentCity: "",
      phonecode1: "+94",
      phone1: "",
      phonecode2: "+94",
      phone2: "",
      geoLatitude: null,
      geoLongitude: null,
    },
    mode: "onChange",
  });

  const buildingType = watch("buildingType");
  const billingTitleValue = watch("billingTitle");
  const houseCityValue = watch("houseCity");
  const apartmentCityValue = watch("apartmentCity");
  const phonecode1Value = watch("phonecode1");
  const phonecode2Value = watch("phonecode2");
  const canSave = isEditingAddress
    ? selectedAddressId
      ? hasFormChanged
      : isValid
    : false;

  useEffect(() => {
    if (buildingType !== "apartment") {
      setValue("apartmentName", "");
      setValue("flatNumber", "");
      setValue("apartmentFloor", "");
      setValue("apartmentHouseNo", "");
      setValue("apartmentStreet", "");
      setValue("apartmentCity", "");
    }
    if (buildingType !== "house") {
      setValue("houseNo", "");
      setValue("houseStreet", "");
      setValue("houseCity", "");
    }
    if (!buildingType) {
      setValue("houseNo", "");
      setValue("buildingNo", "");
    }
  }, [buildingType, setValue]);

  // ── Combined load: cities first, then billing details ──────────────────────
  useEffect(() => {
    const loadAll = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        // 1. Fetch cities first so we can match against them immediately
        const fetchedCitiesRaw = await fetchCities(token as string);
        const fetchedCities: string[] = Array.isArray(fetchedCitiesRaw)
          ? fetchedCitiesRaw
              .map(
                (c: any) =>
                  c?.city_name ?? c?.cityName ?? c?.name ?? c?.city ?? "",
              )
              .filter((c: string) => c.trim() !== "")
          : [];

        setCities(fetchedCities);

        // 2. Fetch billing details using the freshly fetched cities list
        const data = await fetchBillingDetails({ token });

        if (!data) {
          setAddressBook([]);
          setSelectedAddressId(null);
          setInitialFormData(null);
          setHasFormChanged(false);
          setIsEditingAddress(false);
          reset({
            saveAs: "",
            billingTitle: "",
            billingName: "",
            title: "Mr.",
            firstName: "",
            lastName: "",
            houseNo: "",
            buildingNo: "",
            buildingType: "",
            apartmentName: "",
            flatNumber: "",
            apartmentFloor: "",
            apartmentHouseNo: "",
            houseStreet: "",
            houseCity: "",
            apartmentStreet: "",
            apartmentCity: "",
            phonecode1: "+94",
            phone1: "",
            phonecode2: "+94",
            phone2: "",
            geoLatitude: null,
            geoLongitude: null,
          });
          setHasGeoLocation(false);
          return;
        }

        const normalizedDetails: BillingDetails = {
          ...data,
          id: data.id || makeAddressId(),
          address: {
            ...data.address,
            id: data.address?.id || data.id || makeAddressId(),
            saveAs: data.address?.saveAs || "",
          },
        };

        const formData = mapBillingDetailsToFormData(
          normalizedDetails,
          fetchedCities,
        );

        setAddressBook([normalizedDetails]);
        setSelectedAddressId(normalizedDetails.id || null);
        setInitialFormData(formData);
        reset(formData);
        setValue("buildingType", formData.buildingType);

        setTimeout(() => {
          if (formData.geoLatitude && formData.geoLongitude) {
            setValue("geoLatitude", formData.geoLatitude, {
              shouldValidate: false,
            });
            setValue("geoLongitude", formData.geoLongitude, {
              shouldValidate: false,
            });
            setHasGeoLocation(true);
          } else {
            setHasGeoLocation(false);
          }
        }, 100);
      } catch (error: any) {
        console.error("Error loading data:", error);
        setErrorMessage(error.message || "Failed to load billing details");
        setShowErrorPopup(true);
        // Fallback cities in case fetchCities fails
        setCities([
          "Colombo",
          "Kandy",
          "Galle",
          "Jaffna",
          "Negombo",
          "Anuradhapura",
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadAll();
    }
  }, [token, reset, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (initialFormData) {
        const currentFormData = value as BillingFormData;
        const hasChanged = compareFormData(currentFormData, initialFormData);
        setHasFormChanged(hasChanged);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, initialFormData]);

  useEffect(() => {
    register("buildingType", { required: "Building Type is required" });
    register("saveAs", { required: "Save Address As is required" });

    register("houseNo", {
      validate: (value) =>
        buildingType === "house" && !value ? "House No is required" : true,
    });
    register("houseStreet", {
      validate: (value) =>
        buildingType === "house" && !value ? "Street Name is required" : true,
    });
    register("houseCity", {
      validate: (value) =>
        buildingType === "house" && !value ? "City is required" : true,
    });

    register("buildingNo", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "Building No is required"
          : true,
    });
    register("apartmentName", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "Apartment/Building Name is required"
          : true,
    });
    register("flatNumber", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "Flat/Unit Number is required"
          : true,
    });
    register("apartmentFloor", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "Floor Number is required"
          : true,
    });
    register("apartmentHouseNo", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "House Number is required"
          : true,
    });
    register("apartmentStreet", {
      validate: (value) =>
        buildingType === "apartment" && !value
          ? "Street Name is required"
          : true,
    });
    register("apartmentCity", {
      validate: (value) =>
        buildingType === "apartment" && !value ? "City is required" : true,
    });

    register("phonecode1", { required: "Phone code is required" });
    register("geoLatitude");
    register("geoLongitude");
  }, [register, buildingType]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("geoLatitude", lat, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("geoLongitude", lng, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setHasGeoLocation(true);

    if (initialFormData) {
      const currentData = getValues();
      const hasChanged = compareFormData(
        currentData as BillingFormData,
        initialFormData,
      );
      setHasFormChanged(hasChanged);
    }
  };

  const onSubmit: SubmitHandler<BillingFormData> = async (data) => {
    setIsLoading(true);

    await trigger();

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    if (!token) {
      setErrorMessage("You are not authenticated. Please login first.");
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (
      !data.billingTitle ||
      !["Rev.", "Mr.", "Ms.", "Mrs."].includes(data.billingTitle)
    ) {
      setErrorMessage(
        "Please select a valid billing title ( Mr., Ms., or Mrs. ,Rev.).",
      );
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (!data.buildingType) {
      setErrorMessage("Please select a building type.");
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (data.buildingType === "house") {
      if (!data.houseNo || !data.houseStreet || !data.houseCity) {
        setErrorMessage(
          "Please fill all required house address fields including city.",
        );
        setShowErrorPopup(true);
        setIsLoading(false);
        return;
      }
      if (!data.geoLatitude || !data.geoLongitude) {
        setErrorMessage(
          "Geo Location is required. Please attach your geo location.",
        );
        setShowErrorPopup(true);
        setIsLoading(false);
        return;
      }
    } else if (data.buildingType === "apartment") {
      if (
        !data.buildingNo ||
        !data.apartmentName ||
        !data.flatNumber ||
        !data.apartmentFloor ||
        !data.apartmentHouseNo ||
        !data.apartmentStreet ||
        !data.apartmentCity
      ) {
        setErrorMessage(
          "Please fill all required apartment address fields including city.",
        );
        setShowErrorPopup(true);
        setIsLoading(false);
        return;
      }
      if (!data.geoLatitude || !data.geoLongitude) {
        setErrorMessage(
          "Geo Location is required. Please attach your geo location.",
        );
        setShowErrorPopup(true);
        setIsLoading(false);
        return;
      }
    }

    if (!data.phonecode1 || !data.phone1) {
      setErrorMessage("Phone Number 1 is required.");
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    const billingDetails = mapFormDataToBillingDetails(data, selectedAddressId);
    const addressId = billingDetails.id || makeAddressId();
    const normalizedDetails: BillingDetails = {
      ...billingDetails,
      id: addressId,
      address: {
        ...billingDetails.address,
        id: addressId,
        saveAs: data.saveAs,
      },
    };

    try {
      await saveBillingDetails({ token, data: normalizedDetails });
      setAddressBook((prev) => {
        const index = prev.findIndex((entry) => entry.id === addressId);
        if (index >= 0) {
          const next = [...prev];
          next[index] = normalizedDetails;
          return next;
        }
        return [...prev, normalizedDetails];
      });
      setSelectedAddressId(addressId);
      setInitialFormData(data);
      setHasFormChanged(false);
      setIsEditingAddress(false);
      setOpenAddressMenuId(null);
      reset(data);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save billing details");
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
    }
  };

  const handleBillingNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const isNumber = /[0-9]/.test(e.key);
    const isInvalidChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(e.key);

    if (e.key === " " && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      return;
    }

    if (isNumber) {
      e.preventDefault();
    } else if (
      isInvalidChar &&
      !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (allowedKeys.includes(e.key)) return;

    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase())
    )
      return;

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "phone1" | "phone2",
  ) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setValue(fieldName, numericValue, { shouldValidate: true });
  };

  const handleCancel = () => {
    closeAddressForm();
    setHasFormChanged(false);
    setShowCancelSuccessPopup(true);
    setTimeout(() => {
      setShowCancelSuccessPopup(false);
    }, 2000);
  };

  const handleDeleteAddress = (addressId: number) => {
    setAddressBook((prev) => {
      const next = prev.filter((entry) => (entry.id || 0) !== addressId);

      if (selectedAddressId === addressId) {
        const nextSelected = next[0];
        if (nextSelected) {
          setSelectedAddressId(nextSelected.id || null);
          const formData = mapBillingDetailsToFormData(nextSelected, cities);
          setInitialFormData(formData);
          reset(formData);
        } else {
          setSelectedAddressId(null);
          setInitialFormData(null);
          reset({
            saveAs: "",
            billingTitle: "",
            billingName: "",
            title: "Mr.",
            firstName: "",
            lastName: "",
            houseNo: "",
            buildingNo: "",
            buildingType: "",
            apartmentName: "",
            flatNumber: "",
            apartmentFloor: "",
            apartmentHouseNo: "",
            houseStreet: "",
            houseCity: "",
            apartmentStreet: "",
            apartmentCity: "",
            phonecode1: "+94",
            phone1: "",
            phonecode2: "+94",
            phone2: "",
            geoLatitude: null,
            geoLongitude: null,
          });
          setIsEditingAddress(false);
        }
      }

      return next;
    });

    setOpenAddressMenuId(null);
  };

  return (
    <div className="relative z-10 px-4 sm:px-6 min-h-screen bg-white blur-effect py-4 mt-2">
      <Loader isVisible={isLoading} />
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Billing details saved successfully!"
        duration={3000}
      />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error!"
        description={errorMessage}
      />

      {!isEditingAddress && (
        <div className="bg-white">
          <h2 className="font-medium text-[14px] text-base md:text-[17.5px]">
            Account
          </h2>
          <p className="text-[12px] md:text-[16px] text-[#626D76] mb-3">
            Real-time information and activities of your property.
          </p>
          <div className="border-t border-[#BDBDBD] mb-5 mt-1" />

          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-medium text-[14px] md:text-[18px]">
              My Address Book
            </h2>
            <button
              type="button"
              onClick={startCreateAddress}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E206D] px-4 py-3 text-white text-[13px] md:text-[16px] font-medium shadow-[0_6px_16px_rgba(62,32,109,0.24)] hover:bg-[#341a5a] transition-colors"
            >
              <Plus size={18} />
              Add New Address
            </button>
          </div>

          {addressBook.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-[#E5D9FF] bg-[#FAF7FF] px-6 py-10 text-center">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: noAddItemAnimation,
                  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
                }}
                height={180}
                width={180}
              />
              <p className="mt-2 text-[18px] font-semibold text-[#3E206D]">
                No saved addresses yet
              </p>
              <p className="mt-1 max-w-md text-[13px] text-[#626D76]">
                Add an address to create your address book and quickly reuse it
                at checkout.
              </p>
              <button
                type="button"
                onClick={startCreateAddress}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3E206D] px-5 py-3 text-white text-[14px] font-medium hover:bg-[#341a5a] transition-colors"
              >
                <Plus size={18} />
                Add New Address
              </button>
            </div>
          ) : (
            <div
              ref={addressBookMenuRef}
              className="rounded-[18px] border border-[#DCCEF6] bg-[#FAF7FF] p-4 md:p-5"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {addressBook.map((address) => {
                  const addressId = address.id || makeAddressId();
                  const isMenuOpen = openAddressMenuId === addressId;

                  return (
                    <div
                      key={addressId}
                      className="relative rounded-[12px] border border-[#D7D7D7] bg-white px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[16px] font-medium text-[#111827]">
                            {address.address.saveAs || "Address"}
                          </h3>
                          <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                            {getAddressSummary(address)}
                          </p>
                        </div>

                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenAddressMenuId(
                                isMenuOpen ? null : addressId,
                              )
                            }
                            className="rounded-full p-1 text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                            aria-label={`Open actions for ${address.address.saveAs || "address"}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 z-20 w-32 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => startEditAddress(address)}
                                className="flex cursor-pointer w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F9FAFB]"
                              >
                                <PencilLine size={15} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addressId)}
                                className="flex cursor-pointer w-full items-center gap-2 border-t border-[#E5E7EB] px-3 py-2 text-left text-[13px] text-[#DC2626] hover:bg-[#FEF2F2]"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={isEditingAddress ? "bg-white" : "hidden"}
      >
        <h2 className="font-medium text-[14px] text-base md:text-[17.5px]">
          Account
        </h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-3">
          Real-time information and activities of your property.
        </p>
        <div className="border-t border-[#BDBDBD] mb-5 mt-1" />

        <div className="mb-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-[#000000] text-sm font-medium underline underline-offset-2 cursor-pointer"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            <span>Go Back</span>
          </button>
        </div>

        <h2 className="font-medium text-[14px] md:text-[18px] mb-4">
          Add New Address
        </h2>

        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
              Save Address As
            </label>
          </div>

          <input
            {...register("saveAs")}
            type="text"
            placeholder="e.g. Home"
            className="border border-[#CECECE] rounded-lg p-2 w-[50%] h-[42px] text-[12px] md:text-[14px]"
          />
          <p className="text-red-500 text-xs">{errors.saveAs?.message}</p>
        </div>

        <div className="border-t border-[#BDBDBD] mt-6 mb-6" />

        <h2 className="font-medium text-[14px] md:text-[18px] mb-4">
          Billing Name
        </h2>

        <div className="md:w-[90%]">
          <div className="flex gap-4 md:gap-8">
            <div className="w-[10%] min-w-[70px]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Title
              </label>
              <CustomDropdown
                register={register}
                setValue={setValue}
                name="billingTitle"
                value={billingTitleValue}
                errors={errors}
                options={billingTitleOptions}
                placeholder="Title"
              />
            </div>

            <div className="w-[90%]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Full Name
              </label>
              <input
                {...register("billingName", {
                  required: "Full Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Full Name must contain only letters and spaces",
                  },
                })}
                className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                onKeyDown={handleBillingNameKeyDown}
                placeholder="Full Name"
              />
              {billingNameError && (
                <p className="text-red-500 text-xs">{billingNameError}</p>
              )}
              <p className="text-red-500 text-xs">
                {errors.billingName?.message}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#BDBDBD] my-6" />

        <div className="md:w-[89%]">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Building Type
              </label>
              <CustomDropdown
                register={register}
                setValue={setValue}
                name="buildingType"
                value={buildingType}
                errors={errors}
                options={buildingTypeOptions}
                placeholder="Select Building Type"
              />
            </div>

            {buildingType === "house" && (
              <div className="w-full lg:w-1/2">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                  House No
                </label>
                <input
                  {...register("houseNo")}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  placeholder="House Number"
                  onKeyDown={handleInputKeyDown}
                />
                <p className="text-red-500 text-xs">
                  {errors.houseNo?.message}
                </p>
              </div>
            )}

            {buildingType === "apartment" && (
              <div className="w-full lg:w-1/2">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                  Building No
                </label>
                <input
                  {...register("buildingNo")}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  placeholder="Building Number"
                  onKeyDown={handleInputKeyDown}
                />
                <p className="text-red-500 text-xs">
                  {errors.buildingNo?.message}
                </p>
              </div>
            )}
          </div>

          {buildingType === "house" && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Street Name
                  </label>
                  <input
                    {...register("houseStreet")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="Street Name"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.houseStreet?.message}
                  </p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Nearest City
                  </label>
                  <CustomDropdown
                    register={register}
                    setValue={setValue}
                    name="houseCity"
                    value={houseCityValue}
                    errors={errors}
                    options={cityOptions}
                    placeholder="Select City"
                    withSearch={true}
                    maxVisibleItems={6}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Geo Location
                  </label>
                  {isMounted &&
                  (hasGeoLocation ||
                    (watch("geoLatitude") && watch("geoLongitude"))) ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleAttachLocation}
                        className="w-full h-[42px] border-2 border-[#CECECE] bg-[#E6D9F5] rounded-lg flex items-center justify-center gap-2 text-[#3E206D] font-medium hover:bg-[#d9c9ed] transition-colors cursor-pointer"
                      >
                        <LocateFixed size={18} />
                        <span className="text-[12px] md:text-[14px]">
                          Re-attach My Geo Location
                        </span>
                      </button>
                      <div
                        className="flex items-start gap-2 text-[#D32F2F] cursor-pointer"
                        onClick={handleViewLocation}
                      >
                        <LocateFixed
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-[11px] md:text-[13px] underline hover:text-[#b02525]">
                          View Here
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAttachLocation}
                      className="w-full h-[42px] border-2 border-[#CECECE] bg-[#E6D9F5] rounded-lg flex items-center justify-center gap-2 text-[#3E206D] font-medium hover:bg-[#d9c9ed] transition-colors cursor-pointer"
                    >
                      <LocateFixed size={18} />
                      <span className="text-[12px] md:text-[14px]">
                        Attach My Geo Location
                      </span>
                    </button>
                  )}
                </div>
                <div className="w-full lg:w-1/2" />
              </div>
            </>
          )}

          {buildingType === "apartment" && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Apartment or Building Name
                  </label>
                  <input
                    {...register("apartmentName")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="Apartment or Building Name"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.apartmentName?.message}
                  </p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Flat/Unit Number
                  </label>
                  <input
                    {...register("flatNumber")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="Flat/Unit Number"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.flatNumber?.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Floor Number
                  </label>
                  <input
                    {...register("apartmentFloor")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="Floor Number"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.apartmentFloor?.message}
                  </p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    House Number
                  </label>
                  <input
                    {...register("apartmentHouseNo")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="House Number"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.apartmentHouseNo?.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Street Name
                  </label>
                  <input
                    {...register("apartmentStreet")}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="Street Name"
                    onKeyDown={handleInputKeyDown}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.apartmentStreet?.message}
                  </p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Nearest City
                  </label>
                  <CustomDropdown
                    register={register}
                    setValue={setValue}
                    name="apartmentCity"
                    value={apartmentCityValue}
                    errors={errors}
                    options={cityOptions}
                    placeholder="Select City"
                    withSearch={true}
                    maxVisibleItems={6}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Geo Location
                  </label>
                  {isMounted &&
                  (hasGeoLocation ||
                    (watch("geoLatitude") && watch("geoLongitude"))) ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleAttachLocation}
                        className="w-full h-[42px] border-2 border-[#CECECE] bg-[#E6D9F5] rounded-lg flex items-center justify-center gap-2 text-[#3E206D] font-medium hover:bg-[#d9c9ed] transition-colors cursor-pointer"
                      >
                        <LocateFixed size={18} />
                        <span className="text-[12px] md:text-[14px]">
                          Re-attach My Geo Location
                        </span>
                      </button>
                      <div
                        className="flex items-start gap-2 text-[#D32F2F] cursor-pointer"
                        onClick={handleViewLocation}
                      >
                        <LocateFixed
                          size={16}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-[11px] md:text-[13px] underline hover:text-[#b02525]">
                          View Here
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAttachLocation}
                      className="w-full h-[42px] border-2 border-[#CECECE] bg-[#E6D9F5] rounded-lg flex items-center justify-center gap-2 text-[#3E206D] font-medium hover:bg-[#d9c9ed] transition-colors cursor-pointer"
                    >
                      <LocateFixed size={18} />
                      <span className="text-[12px] md:text-[14px]">
                        Attach My Geo Location
                      </span>
                    </button>
                  )}
                </div>
                <div className="w-full lg:w-1/2" />
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#BDBDBD] my-8" />
        <h2 className="font-medium text-[14px] md:text-[18px] mb-1">Contact</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">
          Manage your account phone numbers for invoices.
        </p>

        <div className="flex flex-col lg:flex-row gap-y-1 lg:gap-x-2">
          {[1, 2].map((num) => (
            <div key={num} className="flex flex-col w-full md:w-[48.5%]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Phone Number {num}
              </label>
              <div className="flex gap-4">
                <div className="relative max-w-[30%] md:max-w-[20%]">
                  <CustomDropdown
                    register={register}
                    setValue={setValue}
                    name={`phonecode${num}` as "phonecode1" | "phonecode2"}
                    value={num === 1 ? phonecode1Value : phonecode2Value}
                    errors={errors}
                    options={phoneCodeOptions}
                    placeholder="Select Code"
                  />
                </div>

                <div className="w-[70%] lg:w-[65%]">
                  <input
                    type="text"
                    {...register(`phone${num}` as "phone1" | "phone2", {
                      required:
                        num === 1 ? "Phone Number 1 is required" : false,
                      pattern: {
                        value: /^7[0-9]{8}$/,
                        message:
                          "Please enter a valid Phone Number (format: +947XXXXXXXX)",
                      },
                      validate:
                        num === 2
                          ? {
                              notDuplicate: (value) =>
                                !value ||
                                !watch("phone1") ||
                                watch("phonecode1") !== watch("phonecode2") ||
                                value !== watch("phone1") ||
                                "Phone numbers cannot be the same",
                            }
                          : undefined,
                    })}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="7XXXXXXXX"
                    inputMode="numeric"
                    maxLength={9}
                    onKeyDown={handlePhoneKeyDown}
                    onChange={(e) =>
                      handlePhoneChange(e, `phone${num}` as "phone1" | "phone2")
                    }
                  />
                  <p className="text-red-500 text-xs">
                    {errors[`phone${num}` as "phone1" | "phone2"]?.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] cursor-pointer text-[16px] md:text-[20px] font-medium rounded-lg ${
              isLoading || !canSave
                ? "opacity-50 cursor-not-allowed text-[#9ca3af] bg-[#f9fafb]"
                : "text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]"
            }`}
            onClick={handleCancel}
            disabled={isLoading || !canSave}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] cursor-pointer mb-4 text-[16px] md:text-[20px] font-medium rounded-lg text-white ${
              isLoading || !canSave
                ? "opacity-50 cursor-not-allowed bg-[#9ca3af]"
                : "bg-[#3E206D] hover:bg-[#341a5a]"
            }`}
            disabled={isLoading || !canSave}
          >
            Save
          </button>
        </div>

        <GeoLocationModal
          isOpen={isGeoModalOpen}
          onClose={() => {
            setIsGeoModalOpen(false);
            setIsViewingLocation(false);
          }}
          onLocationSelect={handleLocationSelect}
          initialCenter={mapCenter}
          savedLocation={
            isViewingLocation && watch("geoLatitude") && watch("geoLongitude")
              ? [Number(watch("geoLatitude")), Number(watch("geoLongitude"))]
              : null
          }
          viewOnly={isViewingLocation}
        />
      </form>
    </div>
  );
};

export default BillingDetailsForm;
