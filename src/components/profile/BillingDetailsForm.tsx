"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FaAngleDown } from "react-icons/fa";
import {
  fetchBillingDetails,
  saveBillingDetails,
  deleteBillingAddress,
  fetchCities,
  UserAddressEntry,
  CityOption,
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
  Info,
} from "lucide-react";

type BillingFormData = {
  saveAs: string;
  billingTitle: string;
  billingName: string;
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

const EMPTY_FORM: BillingFormData = {
  saveAs: "",
  billingTitle: "",
  billingName: "",
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
};

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
            key={searchTerm}
            className={`overflow-y-auto ${withSearch ? "max-h-[240px]" : ""}`}
            style={{ maxHeight: `${maxVisibleItems * 40}px` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
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
              <li className="p-2 text-[12px] md:text-[14px] text-gray-500 text-center flex items-center justify-center gap-2">
                <Info size={14} />
                City not found.
              </li>
            )}
          </ul>
        </div>
      )}
      <p className="text-red-500 text-xs">{errors?.[name]?.message}</p>
    </div>
  );
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [initialFormData, setInitialFormData] =
    useState<BillingFormData | null>(null);
  const [addressBook, setAddressBook] = useState<UserAddressEntry[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [openAddressMenuId, setOpenAddressMenuId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [hasFormChanged, setHasFormChanged] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    6.9271, 79.8612,
  ]);
  const [isViewingLocation, setIsViewingLocation] = useState(false);
  const [hasGeoLocation, setHasGeoLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const addressBookMenuRef = useRef<HTMLDivElement>(null);
  const [addressPendingDelete, setAddressPendingDelete] =
    useState<UserAddressEntry | null>(null);
  const selectedAddressIdRef = useRef<number | null>(null);

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

  useEffect(() => {
    selectedAddressIdRef.current = selectedAddressId;
  }, [selectedAddressId]);

  const getAddressSummary = (entry: UserAddressEntry) => {
    const address = entry.address;
    const parts = [
      address.houseNo,
      address.buildingNo,
      address.buildingName,
      address.unitNo,
      address.streetName,
      address.city,
    ]
      .filter(Boolean)
      .map(String);

    return parts.length > 0 ? parts.join(", ") : "No address details available";
  };

  // ── Helper: match city case-insensitively against fetched list ──────────
  const findMatchingCity = (
    cityValue: string,
    citiesList: CityOption[],
  ): string => {
    if (!cityValue) return "";
    const match = citiesList.find(
      (c) => c.city.toLowerCase() === cityValue.toLowerCase(),
    );
    return match ? match.city : cityValue;
  };

  const mapEntryToFormData = (
    entry: UserAddressEntry,
    fetchedCities: CityOption[],
  ): BillingFormData => {
    const type = entry.buildingType?.toLowerCase();
    return {
      saveAs: entry.address?.saveAs || "",
      billingTitle: entry.billingTitle || "",
      billingName: entry.billingName || "",
      buildingType: type || "",
      houseNo: type === "house" ? entry.address?.houseNo || "" : "",
      buildingNo: type === "apartment" ? entry.address?.buildingNo || "" : "",
      apartmentName:
        type === "apartment" ? entry.address?.buildingName || "" : "",
      flatNumber: type === "apartment" ? entry.address?.unitNo || "" : "",
      apartmentFloor:
        type === "apartment" ? String(entry.address?.floorNo ?? "") : "",
      apartmentHouseNo:
        type === "apartment" ? entry.address?.houseNo || "" : "",
      houseStreet: type === "house" ? entry.address?.streetName || "" : "",
      houseCity:
        type === "house"
          ? findMatchingCity(entry.address?.city || "", fetchedCities)
          : "",
      apartmentStreet:
        type === "apartment" ? entry.address?.streetName || "" : "",
      apartmentCity:
        type === "apartment"
          ? findMatchingCity(entry.address?.city || "", fetchedCities)
          : "",
      phonecode1: entry.phoneCode || "+94",
      phone1: entry.phoneNumber || "",
      phonecode2: entry.phoneCode2 || "+94",
      phone2: entry.phoneNumber2 || "",
      geoLatitude: entry.geoLatitude ?? null,
      geoLongitude: entry.geoLongitude ?? null,
    };
  };

  const startCreateAddress = () => {
    setSelectedAddressId(null);
    setOpenAddressMenuId(null);
    setInitialFormData(null);
    setHasFormChanged(false);
    setIsEditingAddress(true);
    setHasGeoLocation(false);
    reset(EMPTY_FORM);
  };

  const startEditAddress = (entry: UserAddressEntry) => {
    const formData = mapEntryToFormData(entry, cities);

    setSelectedAddressId(entry.id);
    setOpenAddressMenuId(null);
    setInitialFormData(formData);
    setHasFormChanged(false);
    setIsEditingAddress(true);
    reset(formData);
    setValue("buildingType", formData.buildingType);
    setValue("geoLatitude", formData.geoLatitude, { shouldValidate: false });
    setValue("geoLongitude", formData.geoLongitude, { shouldValidate: false });
    setHasGeoLocation(Boolean(formData.geoLatitude && formData.geoLongitude));
  };

  const closeAddressForm = () => {
    setIsEditingAddress(false);
    setOpenAddressMenuId(null);
    if (selectedAddressId) {
      const selectedEntry = addressBook.find(
        (entry) => entry.id === selectedAddressId,
      );
      if (selectedEntry) {
        const formData = mapEntryToFormData(selectedEntry, cities);
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

  const compareFormData = (
    current: BillingFormData,
    initial: BillingFormData | null,
  ): boolean => {
    if (!initial) return false;

    const stringFieldsToCompare: (keyof BillingFormData)[] = [
      "saveAs",
      "billingTitle",
      "billingName",
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

  const cityOptions = cities.map((c) => ({ value: c.city, label: c.city }));

  const isCityDeliverable = (cityName: string): boolean => {
    if (!cityName) return true;
    const match = cities.find(
      (c) => c.city.toLowerCase() === cityName.toLowerCase(),
    );
    return match ? match.isAvailable : true;
  };

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
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const buildingType = watch("buildingType");
  const billingTitleValue = watch("billingTitle");
  const houseCityValue = watch("houseCity");
  const apartmentCityValue = watch("apartmentCity");
  const phonecode1Value = watch("phonecode1");
  const phonecode2Value = watch("phonecode2");
  const isCityValidForSave =
    buildingType === "house"
      ? isCityDeliverable(houseCityValue)
      : buildingType === "apartment"
        ? isCityDeliverable(apartmentCityValue)
        : true;

  const canSave = isEditingAddress
    ? (selectedAddressId ? hasFormChanged : isValid) && isCityValidForSave
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

  // ── Load cities + address book ────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const fetchedCities = await fetchCities(token as string);
        setCities(fetchedCities);

        const data = await fetchBillingDetails({ token });

        if (!data || !data.addresses || data.addresses.length === 0) {
          setAddressBook([]);
          setSelectedAddressId(null);
          setInitialFormData(null);
          setHasFormChanged(false);
          setIsEditingAddress(false);
          return;
        }

        setAddressBook(data.addresses);
      } catch (error: any) {
        console.error("Error loading data:", error);
        setErrorMessage(error.message || "Failed to load billing details");
        setShowErrorPopup(true);
        setCities([
          { id: 1, city: "Colombo", isAvailable: true },
          { id: 2, city: "Kandy", isAvailable: true },
          { id: 3, city: "Galle", isAvailable: true },
          { id: 4, city: "Jaffna", isAvailable: true },
          { id: 5, city: "Negombo", isAvailable: true },
          { id: 6, city: "Anuradhapura", isAvailable: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadAll();
    }
  }, [token]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (initialFormData) {
        const currentFormData = value as BillingFormData;
        setHasFormChanged(compareFormData(currentFormData, initialFormData));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, initialFormData]);

  useEffect(() => {
    register("buildingType", { required: "Building Type is required" });
    register("saveAs", {
      required: "Save Address As is required",
      validate: (value) => {
        const trimmedValue = (value || "").trim().toLowerCase();
        if (!trimmedValue) return true;

        const isDuplicate = addressBook.some(
          (entry) =>
            entry.id !== selectedAddressIdRef.current &&
            (entry.address.saveAs || "").trim().toLowerCase() === trimmedValue,
        );

        return isDuplicate
          ? "This name is already used. Please choose another."
          : true;
      },
    });

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
  }, [register, buildingType, addressBook]);

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
      setHasFormChanged(
        compareFormData(currentData as BillingFormData, initialFormData),
      );
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
      if (!isCityDeliverable(data.houseCity)) {
        setErrorMessage(`Delivery is not available in ${data.houseCity} yet.`);
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

      if (!isCityDeliverable(data.apartmentCity)) {
        setErrorMessage(
          `Delivery is not available in ${data.apartmentCity} yet.`,
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

    const addressPayload = {
      saveAs: data.saveAs || undefined,
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
    };

    try {
      const result = await saveBillingDetails({
        token,
        data: {
          addressId: selectedAddressId,
          billingTitle: data.billingTitle,
          billingName: data.billingName,
          phoneCode: data.phonecode1,
          phoneNumber: data.phone1,
          phoneCode2: data.phonecode2,
          phoneNumber2: data.phone2,
          buildingType: data.buildingType,
          geoLatitude: data.geoLatitude,
          geoLongitude: data.geoLongitude,
          address: addressPayload,
        },
      });

      const savedEntry: UserAddressEntry = {
        id: result.addressId,
        buildingType: result.buildingType,
        billingTitle: data.billingTitle,
        billingName: data.billingName,
        phoneCode: data.phonecode1,
        phoneNumber: data.phone1,
        phoneCode2: data.phonecode2,
        phoneNumber2: data.phone2,
        geoLatitude: data.geoLatitude ?? undefined,
        geoLongitude: data.geoLongitude ?? undefined,
        address: { ...addressPayload, id: result.addressId },
      };

      setAddressBook((prev) => {
        const index = prev.findIndex((entry) => entry.id === result.addressId);
        if (index >= 0) {
          const next = [...prev];
          next[index] = savedEntry;
          return next;
        }
        return [...prev, savedEntry];
      });

      setSelectedAddressId(result.addressId);
      setInitialFormData(data);
      setHasFormChanged(false);
      setIsEditingAddress(false);
      setOpenAddressMenuId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
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
    setTimeout(() => setShowCancelSuccessPopup(false), 2000);
  };

  // Called from the 3-dot menu "Delete" button — just opens the confirmation modal
  const requestDeleteAddress = (entry: UserAddressEntry) => {
    setOpenAddressMenuId(null);
    setAddressPendingDelete(entry);
  };

  // Called when user confirms in the modal
  const confirmDeleteAddress = async () => {
    if (!token || !addressPendingDelete) return;
    const entry = addressPendingDelete;

    setAddressPendingDelete(null);
    setIsLoading(true);
    try {
      await deleteBillingAddress({
        token,
        addressId: entry.id,
        buildingType: entry.buildingType,
      });

      setAddressBook((prev) => prev.filter((item) => item.id !== entry.id));

      if (selectedAddressId === entry.id) {
        setSelectedAddressId(null);
        setInitialFormData(null);
        setIsEditingAddress(false);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete address");
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
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
            {addressBook.length < 16 && (
              <button
                type="button"
                onClick={startCreateAddress}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E206D] px-4 py-3 text-white text-[13px] md:text-[16px] font-medium shadow-[0_6px_16px_rgba(62,32,109,0.24)] hover:bg-[#341a5a] transition-colors"
              >
                <Plus size={18} />
                Add New Address
              </button>
            )}
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
            </div>
          ) : (
            <div
              ref={addressBookMenuRef}
              className="rounded-[18px] border border-[#DCCEF6] bg-[#FAF7FF] p-4 md:p-5"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {addressBook.map((entry) => {
                  const isMenuOpen = openAddressMenuId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="relative rounded-[12px] border border-[#D7D7D7] bg-white px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[16px] font-medium text-[#111827]">
                            {entry.address.saveAs || "Address"}
                          </h3>
                          <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                            {getAddressSummary(entry)}
                          </p>
                        </div>

                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenAddressMenuId(isMenuOpen ? null : entry.id)
                            }
                            className="rounded-full p-1 text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                            aria-label={`Open actions for ${entry.address.saveAs || "address"}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 z-20 w-32 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => startEditAddress(entry)}
                                className="flex cursor-pointer w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F9FAFB]"
                              >
                                <PencilLine size={15} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDeleteAddress(entry)}
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
          {selectedAddressId ? "Edit Address" : "Add New Address"}
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
            onBlur={() => trigger("saveAs")}
          />
          <p className="text-red-500 text-xs mt-1">{errors.saveAs?.message}</p>
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
              <p className="text-red-500 text-xs mt-1">
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

                  {houseCityValue && !isCityDeliverable(houseCityValue) && (
                    <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-[#FFDCB5] bg-[#FEF6ED] px-3 py-2">
                      <div>
                        <Info
                          size={16}
                          className="mt-1.5 flex-shrink-0 text-[#EC6821]"
                        />
                      </div>
                      <p className="text-[12px] md:text-[12px] font-medium text-[#EC6821] leading-snug">
                        Delivery not available in {houseCityValue} yet, but we’re working on it and
                        <br />
                        coming to your area soon!
                      </p>
                    </div>
                  )}
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
                    name="houseCity"
                    value={houseCityValue}
                    errors={errors}
                    options={cityOptions}
                    placeholder="Select City"
                    withSearch={true}
                    maxVisibleItems={6}
                  />

                  {houseCityValue && !isCityDeliverable(houseCityValue) && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#FFD9A8] bg-[#FFF4E5] px-3 py-2.5">
                      <Info
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-[#E8792C]"
                      />
                      <p className="text-[16px] text-medium md:text-[13px] text-[#E8792C]">
                        Delivery not available in {houseCityValue} yet, but
                        we're working on it and coming to your area soon!
                      </p>
                    </div>
                  )}
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

      {addressPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-[16px] md:text-[18px] font-medium text-[#111827] mb-6">
              Are you sure you want to delete?
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setAddressPendingDelete(null)}
                className="px-6 py-2.5 rounded-xl bg-[#F3F4F7] text-[#757E87] font-medium hover:bg-[#e1e2e5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                className="px-6 py-2.5 rounded-xl bg-[#E11D48] text-white font-medium hover:bg-[#be123c] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDetailsForm;
