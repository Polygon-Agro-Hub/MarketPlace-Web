"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import TopNavigation from "@/components/top-navigation/TopNavigation";
import CustomDropdown from "../../components/home/CustomDropdown";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { setFormData, resetFormData } from "../../store/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import SuccessPopup from "@/components/toast-messages/success-message-with-button";
import ErrorPopup from "@/components/toast-messages/error-message";
import { getRecentOrderAddress, getSavedAddresses, SavedAddress } from "@/services/retail-service";
import { selectCartForOrder } from "../../store/slices/cartItemsSlice";
import { getPickupCenters, PickupCenter } from "@/services/cart-service";
import dynamic from "next/dynamic";
import Image from "next/image";
import summary from "../../../public/summary.png";
import { getCities, City } from "@/services/cart-service";
import { getAllCities, CityResult } from "@/services/auth-service";
import GeoLocationModal from "@/components/delivery-map/GeoLocationModal";
import { updateCartInfo } from "@/store/slices/authSlice";
import packageBasketImg from "../../../public/pp1.png";
import reviewCalendarImg from "../../../public/pp2.png";
import packageVeggiesImg from "../../../public/pp3.png";
import cardPaymentImg from "../../../public/pp4.png";
import { ChevronDown, XCircle, LocateFixed, AlertTriangle, X, Info } from "lucide-react";

const OpenStreetMap = dynamic(
  () => import("@/components/open-map/OpenStreetMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    ),
  },
);

interface FormData {
  centerId: number | null;
  deliveryMethod: any;
  title: string;
  fullName: string;
  phone1: string;
  phone2: string;
  buildingType: string;
  deliveryDate: string;
  timeSlot: string;
  phoneCode1: string;
  phoneCode2: string;
  buildingNo: string;
  buildingName: string;
  flatNumber: string;
  floorNumber: string;
  houseNo: string;
  street: string;
  cityName: string;
  scheduleType: string;
  geoLatitude: number | null; // Add this
  geoLongitude: number | null; // Add this
  companycenterId?: any; // Add this to store companycenterId for later use
  saveAs: string;
}

interface FormErrors {
  centerId: string;
  deliveryMethod: string;
  title: string;
  fullName: string;
  phone1: string;
  phone2: string;
  buildingType: string;
  deliveryDate: string;
  timeSlot: string;
  phoneCode1: string;
  phoneCode2: string;
  buildingNo: string;
  buildingName: string;
  flatNumber: string;
  floorNumber: string;
  houseNo: string;
  street: string;
  cityName: string;
  scheduleType: string;
  geoLatitude: string;
  geoLongitude: string;
  companycenterId?: any;
  saveAs: string; // Add this
}

const initialFormState: FormData = {
  centerId: null,
  deliveryMethod: "home",
  title: "",
  fullName: "",
  phone1: "",
  phone2: "",
  buildingType: "Apartment",
  deliveryDate: "",
  timeSlot: "",
  phoneCode1: "+94",
  phoneCode2: "+94",
  buildingNo: "",
  buildingName: "",
  flatNumber: "",
  floorNumber: "",
  houseNo: "",
  street: "",
  cityName: "",
  scheduleType: "One Time",
  geoLatitude: null, // Add this
  geoLongitude: null, // Add this
  companycenterId: null,
  saveAs: "",
};

const initioalError = {
  centerId: "",
  deliveryMethod: "",
  title: "",
  fullName: "",
  phone1: "",
  phone2: "",
  buildingType: "",
  deliveryDate: "",
  timeSlot: "",
  phoneCode1: "",
  phoneCode2: "",
  buildingNo: "",
  buildingName: "",
  flatNumber: "",
  floorNumber: "",
  houseNo: "",
  street: "",
  cityName: "",
  scheduleType: "",
  geoLatitude: "",
  geoLongitude: "",
  saveAs: "",
}

// Field label mapping for dynamic validation messages
const fieldLabels: Record<string, string> = {
  buildingNo: "Apartment or Building No",
  buildingName: "Apartment or Building Name",
  flatNumber: "Flat / Unit Number",
  floorNumber: "Floor Number",
  houseNo: "House Number",
  street: "Street",
  cityName: "Nearest City",
  title: "Title",
  fullName: "Full Name",
  phone1: "Phone Number 1",
  phone2: "Phone Number 2",
  timeSlot: "Time Slot",
  deliveryDate: "Delivery Date",
  buildingType: "Building Type",
  geoLatitude: "Geo Location",
  geoLongitude: "Geo Location",
  centerId: "Pickup Center",
};

const Page: React.FC = () => {
  const NavArray = [
    { name: "Cart", path: "/cart", status: true },
    { name: "Checkout", path: "/checkout", status: true },
    { name: "Payment", path: "/payment", status: false },
  ];
  const dispatch = useDispatch<AppDispatch>();
  // const storedFormData = useSelector((state: RootState) => state.checkout);

  const [formData, setFormDataLocal] = useState<FormData>(initialFormState);

  const [errors, setErrors] = useState<FormErrors>(initioalError);

  // Add this new state for duplicate phone error
  const [duplicatePhoneError, setDuplicatePhoneError] = useState("");

  const token = useSelector((state: RootState) => state.auth.token) as | string | null;
  const [usePreviousAddress, setUsePreviousAddress] = useState(false);
  const cartData = useSelector(selectCartForOrder);

  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false); // New state for address loading
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const cartPrices = useSelector((state: RootState) => state.cart) || null;
  const { cartId } = useSelector((state: RootState) => state.cartItems);
  const router = useRouter();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
  const [selectedPickupCenter, setSelectedPickupCenter] = useState<PickupCenter | null>(null);
  const [pickupCenters, setPickupCenters] = useState<PickupCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    6.9271, 79.8612,
  ]); // Default to Colombo
  const [mapZoom, setMapZoom] = useState(12);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0); // Default charge
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [companycenterId, setCompanycenterId] = useState<number | null>(null);
  const [viewingSavedLocation, setViewingSavedLocation] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const memoizedPickupCenters = useMemo(() => pickupCenters, [pickupCenters]);
  const authCart = useSelector((state: RootState) => state.auth.cart);
  const [addressMode, setAddressMode] = useState<"recent" | "previous" | "new">("recent");
  const [hasRecentAddress, setHasRecentAddress] = useState(false);
  const [hasPreviousAddress, setHasPreviousAddress] = useState(false);
  const [addressOptionsResolving, setAddressOptionsResolving] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressKey, setSelectedAddressKey] = useState<string | null>(null);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [recentAddressInfo, setRecentAddressInfo] = useState<{ saveAs: string; isSavedAddress: boolean } | null>(null);
  const [cityAvailabilityMap, setCityAvailabilityMap] = useState<Map<string, boolean>>(new Map());
  const [cityNotAvailable, setCityNotAvailable] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [packageHandlingOption, setPackageHandlingOption] = useState<"review" | "finalize">("review");
  const cartPackages = useSelector((state: RootState) => state.cartItems.packages);
  console.log("cartPackages in checkout page:", cartPackages);
  const hasPackages = cartPackages.length > 0;

  const isReadOnly =
    formData.deliveryMethod === "home" &&
    (addressMode === "recent" || (addressMode === "previous" && !!selectedAddressKey));

  const hideDeliveryInfoSection =
    formData.deliveryMethod === "home" &&
    addressMode === "previous" &&
    !!selectedAddressKey;

  const firstCardRef = useRef<HTMLButtonElement>(null);
  const [twoRowHeight, setTwoRowHeight] = useState<number | null>(null);

  const [allCityResults, setAllCityResults] = useState<CityResult[]>([]);

  useEffect(() => {
    const fetchCityAvailability = async () => {
      try {
        const results: CityResult[] = await getAllCities();
        setAllCityResults(results);

        const map = new Map<string, boolean>();
        results.forEach((c) => map.set(c.city.trim().toLowerCase(), c.isAvailable));
        setCityAvailabilityMap(map);
      } catch (error) {
        console.error("Failed to fetch city availability:", error);
      }
    };
    fetchCityAvailability();
  }, []);

  useLayoutEffect(() => {
    if (firstCardRef.current) {
      const cardHeight = firstCardRef.current.offsetHeight;
      const gap = 12; // matches gap-3 (0.75rem = 12px)
      setTwoRowHeight(cardHeight * 2 + gap);
    }
  }, [savedAddresses, addressMode]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Get search params from window.location
    const urlParams = new URLSearchParams(window.location.search);
    const deliveryMethodFromQuery = urlParams.get("deliveryMethod");

    if (
      deliveryMethodFromQuery &&
      (deliveryMethodFromQuery === "home" ||
        deliveryMethodFromQuery === "pickup")
    ) {
      setFormDataLocal((prev) => ({
        ...prev,
        deliveryMethod: deliveryMethodFromQuery,
      }));
    }

    setSearchParamsLoaded(true);
  }, []);

  useEffect(() => {
    // Reset delivery charge when delivery method changes
    if (formData.deliveryMethod === "pickup") {
      setDeliveryCharge(0);
    } else if (formData.deliveryMethod === "home" && !selectedCity) {
      setDeliveryCharge(0); // Default home delivery charge
    }
  }, [formData.deliveryMethod, selectedCity]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    const baseTotal = cartData?.grandTotal || 0;
    const discount = cartData?.discountAmount || 0;
    const finalTotal = formData.deliveryMethod === "home"
      ? baseTotal - discount + deliveryCharge
      : baseTotal - discount;

    dispatch(updateCartInfo({
      price: parseFloat(finalTotal.toFixed(2)),
      count: authCart.count,
      creditBalance: authCart.creditBalance,
    }));
  }, [deliveryCharge, formData.deliveryMethod]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const fetchPickupCenters = async () => {
      if (formData.deliveryMethod === "pickup") {
        setLoadingCenters(true);
        try {
          const response = await getPickupCenters();
          if (response.success) {
            setPickupCenters(response.data);
          }
        } catch (error: any) {
          console.error("Failed to fetch pickup centers:", error);
          setErrorMsg(error.message || "Failed to load pickup centers.");
          setShowErrorPopup(true);
        } finally {
          setLoadingCenters(false);
        }
      }
    };

    fetchPickupCenters();
  }, [formData.deliveryMethod, token]);

  useEffect(() => {
    // Check if both phone numbers are filled and identical
    if (
      formData.phone1 &&
      formData.phone2 &&
      formData.phone1.trim() === formData.phone2.trim() &&
      formData.phoneCode1 === formData.phoneCode2
    ) {
      setDuplicatePhoneError(
        "Phone Number 1 and Phone Number 2 cannot be the same",
      );
    } else {
      setDuplicatePhoneError("");
    }
  }, [
    formData.phone1,
    formData.phone2,
    formData.phoneCode1,
    formData.phoneCode2,
  ]);

  useEffect(() => {
    setCitySearchTerm(selectedCity?.city || "");
  }, [selectedCity]);

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await getCities();
        if (response.success) {
          setCities(response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch cities:", error);
        setErrorMsg(error.message || "Failed to load cities.");
        setShowErrorPopup(true);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCityAvailability = async () => {
      try {
        const results: CityResult[] = await getAllCities();
        const map = new Map<string, boolean>();
        results.forEach((c) => map.set(c.city.trim().toLowerCase(), c.isAvailable));
        setCityAvailabilityMap(map);
      } catch (error) {
        console.error("Failed to fetch city availability:", error);
      }
    };

    fetchCityAvailability();
  }, []);

  const isCityAvailable = (cityName: string): boolean => {
    if (!cityName) return true;
    if (cityAvailabilityMap.size === 0) return true; // don't block while loading or on fetch failure
    return cityAvailabilityMap.get(cityName.trim().toLowerCase()) ?? true;
  };

  useEffect(() => {
    if (formData.deliveryMethod === "home" && searchParamsLoaded) {
      initializeAddressOptions();
    }
  }, [formData.deliveryMethod, searchParamsLoaded, cities]);

  const filteredCityOptions = useMemo(() => {
    if (!citySearchTerm.trim()) return allCityResults;
    const term = citySearchTerm.trim().toLowerCase();
    return allCityResults.filter((c) => c.city.toLowerCase().includes(term));
  }, [citySearchTerm, allCityResults]);

  const handleCitySearchChange = (value: string) => {
    setCitySearchTerm(value);
    setIsCityDropdownOpen(true);

    if (!value.trim()) {
      setSelectedCity(null);
      setFormDataLocal((prev) => ({ ...prev, cityName: "" }));
      setDeliveryCharge(0);
      setCityNotAvailable(false);
    }
  };

  const handleCityArrowClick = () => {
    if (isReadOnly) return;
    setIsCityDropdownOpen((prev) => !prev);
  };

  const handleCityClear = () => {
    setCitySearchTerm("");
    setSelectedCity(null);
    setFormDataLocal((prev) => ({ ...prev, cityName: "" }));
    setDeliveryCharge(0);
    setCityNotAvailable(false);
    setErrors((prev) => ({ ...prev, cityName: "" }));
    setIsCityDropdownOpen(true);
  };

  const handleCityOptionSelect = (city: CityResult) => {
    handleCitySelect(city.city);
    setCitySearchTerm(city.city);
    setIsCityDropdownOpen(false);
  };

  const initializeAddressOptions = async () => {
    setAddressOptionsResolving(true);
    setIsLoadingAddress(true);
    setLoadingSavedAddresses(true);
    setErrors(initioalError);

    try {
      // Fire both requests in parallel — each one's existence is independent info,
      // not a fallback signal for the other.
      const [recentResult, savedResult] = await Promise.allSettled([
        getRecentOrderAddress(token),
        getSavedAddresses(token),
      ]);

      // --- Saved addresses: always populate this, regardless of recent's outcome ---
      let savedList: SavedAddress[] = [];
      if (savedResult.status === "fulfilled" && savedResult.value?.status && savedResult.value?.hasAddress) {
        savedList = savedResult.value.result;
        setHasPreviousAddress(true);
        setSavedAddresses(savedList);
      } else {
        setHasPreviousAddress(false);
        setSavedAddresses([]);
      }

      // --- Recent address: decide default mode + prefill ---
      const recentOk =
        recentResult.status === "fulfilled" &&
        recentResult.value?.status &&
        recentResult.value?.hasAddress;

      if (recentOk) {
        setHasRecentAddress(true);
        setAddressMode("recent");
        prefillFromRecent(recentResult.value.result);
      } else {
        setHasRecentAddress(false);

        if (savedList.length > 0) {
          setAddressMode("previous");
          selectSavedAddress(savedList[0]);
        } else {
          setAddressMode("new");
          setSelectedCity(null);
          setFormDataLocal((prev) => ({
            ...initialFormState,
            deliveryMethod: prev.deliveryMethod,
          }));
          setDeliveryCharge(0);
        }
      }
    } catch (error: any) {
      console.error("Failed to initialize address options:", error);
      setHasRecentAddress(false);
      setHasPreviousAddress(false);
      setAddressMode("new");
    } finally {
      setIsLoadingAddress(false);
      setLoadingSavedAddresses(false);
      setAddressOptionsResolving(false);
    }
  };

  const prefillFromRecent = (data: any) => {
    const cityData = cities.find(
      (city) => city.city.toLowerCase() === (data.city || "").toLowerCase(),
    );
    if (cityData) {
      setSelectedCity(cityData);
      const charge = parseFloat(cityData.charge);
      setDeliveryCharge(charge);
      setCompanycenterId(cityData.companycenterId);
    }
    setCityNotAvailable(!isCityAvailable(data.city || ""));

    setRecentAddressInfo({
      saveAs: data.saveAs || "",
      isSavedAddress: !!data.isSavedAddress,
    });

    setFormDataLocal((prev) => ({
      ...prev,
      buildingType: data.buildingType || "Apartment",
      title: data.title ? data.title.replace(/\./g, "") : "",
      fullName: data.fullName || "",
      phone1: data.phone1 || "",
      phone2: data.phone2 || "",
      phoneCode1: data.phonecode1 || "+94",
      phoneCode2: data.phonecode2 || "+94",
      scheduleType: "One Time",
      houseNo: data.houseNo || "",
      street: data.streetName || "",
      cityName: data.city || "",
      buildingNo: data.buildingNo || "",
      buildingName: data.buildingName || "",
      flatNumber: data.unitNo || "",
      floorNumber: data.floorNo || "",
      geoLatitude: data.latitude ? parseFloat(data.latitude) : null,
      geoLongitude: data.longitude ? parseFloat(data.longitude) : null,
      // Only send saveAs downstream when this recent address is actually a saved one
      saveAs: data.isSavedAddress ? (data.saveAs || "") : "",
    }));
  };


  // 5. Create city dropdown options
  const cityOptions = cities.map((city) => ({
    value: city.id.toString(),
    label: city.city,
    comCenId: city.companycenterId,
  }));

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormDataLocal((prev) => ({
      ...prev,
      geoLatitude: lat,
      geoLongitude: lng,
    }));

    // Clear any geo location errors
    setErrors((prev) => ({
      ...prev,
      geoLatitude: "",
      geoLongitude: "",
    }));
  };

  const handleAddressOptionChange = async (value: "recent" | "previous" | "new") => {
    if (value === "recent") {
      setAddressMode("recent");
      setIsLoadingAddress(true);
      setErrors(initioalError);

      try {
        const response = await getRecentOrderAddress(token);
        if (response && response.status && response.hasAddress) {
          prefillFromRecent(response.result);
        }
      } catch (error: any) {
        console.error("Failed to fetch recent order address:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    } else if (value === "previous") {
      setAddressMode("previous");
      setRecentAddressInfo(null);
      if (savedAddresses.length > 0 && !selectedAddressKey) {
        selectSavedAddress(savedAddresses[0]);
      }
    } else {
      setAddressMode("new");
      setRecentAddressInfo(null);
      setSelectedAddressKey(null);
      setSelectedCity(null);
      setCityNotAvailable(false); // <-- add
      setFormDataLocal((prev) => ({
        ...initialFormState,
        deliveryMethod: prev.deliveryMethod,
      }));
      setDeliveryCharge(0);
    }
  };

  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressKey(addr.addressKey);

    const cityData = cities.find(
      (city) => city.city.toLowerCase() === (addr.city || "").toLowerCase(),
    );
    if (cityData) {
      setSelectedCity(cityData);
      const charge = parseFloat(cityData.charge);
      setDeliveryCharge(charge);
      setCompanycenterId(cityData.companycenterId);
    }

    if (cityData) {
      setSelectedCity(cityData);
      const charge = parseFloat(cityData.charge);
      setDeliveryCharge(charge);
      setCompanycenterId(cityData.companycenterId);
    }
    setCityNotAvailable(!isCityAvailable(addr.city || ""));


    setFormDataLocal((prev) => ({
      ...prev,
      buildingType: addr.buildingType || "Apartment",
      title: addr.title ? addr.title.replace(/\./g, "") : "",
      fullName: addr.fullName || "",
      phone1: addr.phone1 || "",
      phone2: addr.phone2 || "",
      phoneCode1: addr.phonecode1 || "+94",
      phoneCode2: addr.phonecode2 || "+94",
      scheduleType: "One Time",
      houseNo: addr.houseNo || "",
      street: addr.streetName || "",
      cityName: addr.city || "",
      buildingNo: addr.buildingNo || "",
      buildingName: addr.buildingName || "",
      flatNumber: addr.unitNo || "",
      floorNumber: addr.floorNo || "",
      geoLatitude: addr.latitude ? parseFloat(addr.latitude as any) : null,
      geoLongitude: addr.longitude ? parseFloat(addr.longitude as any) : null,
      saveAs: addr.saveAs || "", // Add this
    }));

    setErrors((prev) => ({
      ...prev,
      title: "",
      fullName: "",
      phone1: "",
      houseNo: "",
      street: "",
      cityName: "",
      buildingName: "",
      buildingNo: "",
      flatNumber: "",
      floorNumber: "",
      geoLatitude: "",
      geoLongitude: "",
    }));
  };

  useEffect(() => {
    if (searchParamsLoaded && !fetching && !formData.title.trim()) {
      setErrors((prev) => ({
        ...prev,
        title: "Title is required.",
      }));
    }
  }, [searchParamsLoaded, fetching, formData.title]);

  const calculateFinalTotal = (): number => {
    const baseTotal = cartData?.grandTotal || 0;
    const discount = cartData?.discountAmount || 0;

    // Only add delivery charge for home delivery
    if (formData.deliveryMethod === "home") {
      return baseTotal - discount + deliveryCharge;
    } else {
      // For pickup, no delivery charge
      return baseTotal - discount;
    }
  };

  const handleCenterSelect = (centerId: string, centerName: string) => {
    const selectedCenter = pickupCenters.find(
      (center) => center.value === centerId,
    );

    if (selectedCenter) {
      const centerIdAsNumber = parseInt(centerId, 10);
      setSelectedPickupCenter(selectedCenter);
      setFormDataLocal((prev) => ({ ...prev, centerId: centerIdAsNumber }));
      setErrors((prev) => ({ ...prev, centerId: "" }));
      setMapCenter([selectedCenter.latitude, selectedCenter.longitude]);
      setMapZoom(15);
    }
  };

  const pickupCenterOptions = pickupCenters.map((center) => ({
    value: center.value,
    label: center.label,
  }));

  const getMinDate = (): string => {
    const today = new Date();

    // Create a new date object and add 3 days
    const minDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 3,
    );

    // Ensure we get the correct local date without timezone issues
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, "0");
    const day = String(minDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const readOnlyFields: (keyof FormData)[] = [
    "title",
    "fullName",
    "phone1",
    "phone2",
    "phoneCode1",
    "phoneCode2",
    "buildingType",
    "buildingNo",
    "buildingName",
    "flatNumber",
    "floorNumber",
    "houseNo",
    "street",
    "cityName",
    "geoLatitude",
    "geoLongitude",
  ];

  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    if (isReadOnly && readOnlyFields.includes(field)) return;
    // Update the form state
    setFormDataLocal((prev) => ({ ...prev, [field]: value }));

    // Validate the field with the updated form data
    const updatedFormData = { ...formData, [field]: value };
    const error = validateField(field, value, updatedFormData);
    setErrors((prev) => ({ ...prev, [field]: error }));

    // Special case: if deliveryMethod changes, revalidate all fields and reset relevant state
    if (field === "deliveryMethod") {
      // Clear errors for all fields first
      setErrors({
        centerId: "",
        deliveryMethod: "",
        title: "",
        fullName: "",
        phone1: "",
        phone2: "",
        buildingType: "",
        deliveryDate: "",
        timeSlot: "",
        phoneCode1: "",
        phoneCode2: "",
        buildingNo: "",
        buildingName: "",
        flatNumber: "",
        floorNumber: "",
        houseNo: "",
        street: "",
        cityName: "",
        scheduleType: "",
        geoLatitude: "",
        geoLongitude: "",
        saveAs: "",
      });

      if (value === "home") {
        setUsePreviousAddress(true);
        setSelectedPickupCenter(null);
        handleAddressOptionChange("recent");
      } else if (value === "pickup") {
        setUsePreviousAddress(false);
        setSelectedCity(null); // Clear city selection
        setCityNotAvailable(false);
        setDeliveryCharge(0); // Reset delivery charge
        const basicInfo = {
          title: formData.title,
          fullName: formData.fullName,
          phone1: formData.phone1,
          phone2: formData.phone2,
          phoneCode1: formData.phoneCode1,
          phoneCode2: formData.phoneCode2,
          deliveryDate: formData.deliveryDate,
          timeSlot: formData.timeSlot,
        };

        setFormDataLocal((prev) => ({
          ...initialFormState,
          deliveryMethod: value as string,
          ...basicInfo,
        }));
      }
    }
  };

  const isFormValid = (): boolean => {
    const isHomeDelivery = formData.deliveryMethod === "home";
    const isPickup = formData.deliveryMethod === "pickup";
    const isApartment = formData.buildingType === "Apartment";

    // Check for duplicate phone numbers
    if (duplicatePhoneError) {
      return false;
    }

    // Check required fields based on delivery method
    const requiredFields = [
      "title",
      "fullName",
      "phone1",
      "deliveryDate",
      "timeSlot",
    ];

    // Add delivery method specific required fields
    if (isPickup) {
      requiredFields.push("centerId");
    }

    if (isHomeDelivery) {
      requiredFields.push("buildingType", "houseNo", "street", "cityName");
      // ADD THESE LINES:
      requiredFields.push("geoLatitude", "geoLongitude");

      // Add apartment specific required fields
      if (isApartment) {
        requiredFields.push(
          "buildingName",
          "buildingNo",
          "flatNumber",
          "floorNumber",
        );
      }
    }

    // Check if all required fields are filled and valid
    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];

      // Check if field is empty
      if (
        field === "centerId" ||
        field === "geoLatitude" ||
        field === "geoLongitude"
      ) {
        if (value === null || value === undefined) return false;
      } else {
        if (!value || (typeof value === "string" && !value.trim()))
          return false;
      }

      // Check if field has validation errors
      const error = validateField(field as keyof FormData, value, formData);
      if (error) return false;
    }

    if (isHomeDelivery && !selectedCity) {
      return false;
    }

    // New: block submit if the chosen city isn't deliverable yet
    if (isHomeDelivery && cityNotAvailable) {
      return false;
    }

    return true;
  };

  const [isFormValidState, setIsFormValidState] = useState(false);

  useEffect(() => {
    setIsFormValidState(isFormValid());
  }, [formData, errors]);

  const handleCitySelect = (cityName: string) => {
    // Find the city in the full availability list (auth-service) — source of truth for availability
    const cityResult = allCityResults.find(
      (city) => city.city.trim().toLowerCase() === cityName.trim().toLowerCase(),
    );

    if (!cityResult) return; // shouldn't happen if called from the dropdown list itself

    // Try to find matching pricing/center data from the cart-service list (only present for available cities)
    const matchedCity = cities.find(
      (city) => city.city.trim().toLowerCase() === cityName.trim().toLowerCase(),
    );

    if (matchedCity) {
      // City has pricing/center data — fully available for delivery
      setSelectedCity(matchedCity);
      setFormDataLocal((prev) => ({
        ...prev,
        cityName: matchedCity.city,
      }));

      const charge = parseFloat(matchedCity.charge);
      setDeliveryCharge(isNaN(charge) ? 0 : charge);
      setCompanycenterId(matchedCity.companycenterId);
    } else {
      // City exists but has no pricing/center info — not deliverable yet
      setSelectedCity(null);
      setFormDataLocal((prev) => ({
        ...prev,
        cityName: cityResult.city,
      }));
      setDeliveryCharge(0);
      setCompanycenterId(null);
    }

    setCityNotAvailable(!isCityAvailable(cityResult.city));
    setErrors((prev) => ({ ...prev, cityName: "" }));
  };

  const validateField = (
    field: keyof FormData,
    value: string | number | null,
    formData: FormData,
  ): string => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    const isHomeDelivery = formData.deliveryMethod === "home";
    const isPickup = formData.deliveryMethod === "pickup";
    const isApartment = formData.buildingType === "Apartment";

    switch (field) {
      case "centerId":
        if (isPickup) {
          if (value === null || value === undefined) {
            return "Please select a pickup center.";
          }
          if (typeof value === "number" && value > 0) {
            return "";
          }
          return "Please select a pickup center.";
        }
        return "";

      case "fullName":
        if (!trimmed) return `${fieldLabels.fullName} is required.`;
        if (!/^[A-Za-z\s]+$/.test(trimmed))
          return "Full Name must only contain letters and spaces.";
        return "";

      case "title":
        return !trimmed ? `${fieldLabels.title} is required.` : "";

      case "phone1":
        if (!value) return `${fieldLabels.phone1} is required.`;
        if (!/^\d{9}$/.test(value.toString()))
          return "Please enter a valid mobile number (format: 7XXXXXXXX)";
        return "";

      case "phone2":
        return value && !/^\d{9}$/.test(value.toString())
          ? "Please enter a valid mobile number (format: 7XXXXXXXX)"
          : "";

      case "timeSlot":
        return !trimmed ? `${fieldLabels.timeSlot} is required.` : "";

      case "deliveryDate":
        if (!value) return `${fieldLabels.deliveryDate} is required.`;

        const selectedDate = new Date(value.toString());
        const today = new Date();
        const minDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 3,
        );

        selectedDate.setHours(0, 0, 0, 0);
        minDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate < minDate) {
          return "Please select a date at least 3 days from today.";
        }

        return "";

      // Address fields - only required for home delivery
      case "buildingType":
        return isHomeDelivery && !trimmed ? `${fieldLabels.buildingType} is required.` : "";

      case "buildingName":
      case "buildingNo":
      case "floorNumber":
      case "flatNumber":
        return isHomeDelivery && isApartment && !trimmed
          ? `${fieldLabels[field]} is required.`
          : "";

      case "street":
      case "houseNo":
        return isHomeDelivery && !trimmed
          ? `${fieldLabels[field]} is required.`
          : "";

      case "cityName":
        if (isHomeDelivery) {
          if (!trimmed) return `${fieldLabels.cityName} is required.`;
          if (!selectedCity) return "Please select a valid city.";
        }
        return "";

      case "geoLatitude":
      case "geoLongitude":
        // UPDATED: Make geo location required for home delivery
        if (isHomeDelivery) {
          if (value === null || value === undefined) {
            return `${fieldLabels.geoLatitude} is required. Please attach your location.`;
          }
        }
        return "";

      default:
        return "";
    }
  };

  const capitalizeFirstLetter = (value: string): string => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {} as FormErrors;
    let valid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const value = formData[field];
      const error = validateField(field, value, formData);
      newErrors[field] = error;
      if (error) valid = false;
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Invalid Form",
        text: "Please correctly fill all the required fields.",
      });
      return;
    }

    if (hasPackages) {
      setShowPackagePopup(true);
      return;
    }

    await proceedToPayment();
  };

  const proceedToPayment = async () => {
    try {
      setIsLoading(true);

      let dataToSubmit: FormData = {
        ...initialFormState,
        deliveryMethod: formData.deliveryMethod,
        title: formData.title,
        fullName: formData.fullName,
        phone1: formData.phone1,
        phone2: formData.phone2,
        phoneCode1: formData.phoneCode1,
        phoneCode2: formData.phoneCode2,
        deliveryDate: formData.deliveryDate,
        timeSlot: formData.timeSlot,
        scheduleType: formData.scheduleType,
        geoLatitude: formData.geoLatitude,
        geoLongitude: formData.geoLongitude,
        companycenterId: companycenterId,
        saveAs: formData.deliveryMethod === "home" ? (formData.saveAs || "") : "", // Add this
      };

      if (formData.deliveryMethod === "home") {
        if (formData.buildingType === "Apartment") {
          dataToSubmit = {
            ...dataToSubmit,
            buildingType: formData.buildingType,
            buildingNo: formData.buildingNo,
            buildingName: formData.buildingName,
            flatNumber: formData.flatNumber,
            floorNumber: formData.floorNumber,
            houseNo: formData.houseNo,
            street: formData.street,
            cityName: formData.cityName,
          };
        } else if (formData.buildingType === "House") {
          dataToSubmit = {
            ...dataToSubmit,
            buildingType: formData.buildingType,
            houseNo: formData.houseNo,
            street: formData.street,
            cityName: formData.cityName,
          };
        }
      } else if (formData.deliveryMethod === "pickup") {
        dataToSubmit = {
          ...dataToSubmit,
          centerId: formData.centerId,
        };
      }

      dispatch(resetFormData());
      dispatch(setFormData({
        ...dataToSubmit,
        isFinalizeImdt: hasPackages && packageHandlingOption === "finalize" ? 1 : 0,
      } as any));
      localStorage.setItem("deliveryCharge", deliveryCharge.toString());

      await new Promise((resolve) => setTimeout(resolve, 2500));
      router.push("/payment");
    } catch (err: any) {
      setErrorMsg(err.message || "Check out failed!");
      await Swal.fire({
        title: "Check out failed",
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#3E206D",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackagePopupContinue = async () => {
    setShowPackagePopup(false);
    await proceedToPayment();
  };

  const formatPrice = (price: number): string => {
    // Convert to fixed decimal first, then add commas
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split(".");

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${formattedInteger}.${decimalPart}`;
  };

  const countries: any[] = [
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

  const countryOptions = countries.map((country) => ({
    value: country.dialCode,
    label: country.dialCode,
    flag: getFlagUrl(country.code),
    countryName: country.name,
  }));

  return (
    <div>
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Check out successfull!"
        description="Let's move to next step."
        path="/payment"
      />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Oops!"
        description="Something happen, Please try again!"
      />
      <form onSubmit={handleSubmit}>
        <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5 ">
          {showPackagePopup && (
            <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setShowPackagePopup(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} className="text-gray-600 sm:hidden" />
                  <X size={18} className="text-gray-600 hidden sm:block" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-2.5 sm:gap-4 mb-3 sm:mb-5 pr-8">
                  <div className="flex-shrink-0 w-11 h-11 sm:w-16 sm:h-16 relative">
                    <Image src={packageBasketImg} alt="Package items" fill className="object-contain" />
                  </div>
                  <h2 className="text-[15px] sm:text-xl font-bold text-[#252525] leading-snug pt-1 sm:pt-2">
                    How would you like us to handle your order&apos;s package items?
                  </h2>
                </div>

                {/* Option 1: Review and confirm */}
                <button
                  type="button"
                  onClick={() => setPackageHandlingOption("review")}
                  style={{
                    background: packageHandlingOption === "review"
                      ? "linear-gradient(180deg, #F7F2FF 0%, #F6F0FF 100%)"
                      : "#FFFFFF",
                    border: `1px solid ${packageHandlingOption === "review" ? "#B186EF" : "#E5E7EE"}`,
                    boxShadow: "0px 4px 10px 5px #F8F2FF",
                  }}
                  className="w-full text-left rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${packageHandlingOption === "review" ? "border-[#3E206D]" : "border-gray-300"
                        }`}
                    >
                      {packageHandlingOption === "review" && (
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#3E206D]" />
                      )}
                    </span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                      <Image src={reviewCalendarImg} alt="Review and confirm" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-[15px] sm:text-[18px] mb-1"
                        style={{ color: packageHandlingOption === "review" ? "#47108E" : "#2A272E" }}
                      >
                        Review and confirm before delivery
                      </p>
                      <p className="text-[12.5px] sm:text-[14px] text-gray-600 leading-snug">
                        Two days before your delivery or pickup, you&apos;ll receive an in-app notification
                        with the exact produce and quantities. Confirm your order between 8:00 AM and 6:00 PM
                        to finalize it for dispatch or pickup.
                      </p>
                    </div>
                  </div>

                  {/* Orange warning box */}
                  <div className="relative mt-3">
                    <div className="flex items-start gap-2 sm:gap-3 bg-[#FFF9F5] border border-orange-200 rounded-lg p-2.5 sm:p-3 pr-12 sm:pr-20">
                      <AlertTriangle size={16} className="text-[#EE7719] flex-shrink-0 mt-0.5 sm:hidden" />
                      <AlertTriangle size={18} className="text-[#EE7719] flex-shrink-0 mt-0.5 hidden sm:block" />
                      <p className="text-[12px] sm:text-[14px] text-[#EE7719] leading-snug flex-1">
                        This facility is available on a first-come, first-served basis and is limited to a
                        certain number of customers. If we do not receive your confirmation on time and all
                        slots for your preferred delivery date are filled, we will be unable to process your
                        order. You may check again later for any available slots.
                      </p>
                    </div>
                    {/* Veggie image — now visible on mobile too, scaled down */}
                    <div className="block absolute -top-3 -right-2 w-10 h-10 sm:-top-4 sm:-right-3 sm:w-20 sm:h-20">
                      <Image src={packageVeggiesImg} alt="" fill className="object-contain drop-shadow-md" />
                    </div>
                  </div>
                </button>

                {/* Option 2: Finalize immediately */}
                <button
                  type="button"
                  onClick={() => setPackageHandlingOption("finalize")}
                  style={{
                    background: packageHandlingOption === "finalize"
                      ? "linear-gradient(180deg, #F7F2FF 0%, #F6F0FF 100%)"
                      : "#FFFFFF",
                    border: `1px solid ${packageHandlingOption === "finalize" ? "#B186EF" : "#E5E7EE"}`,
                    boxShadow: "0px 4px 10px 5px #F8F2FF",
                  }}
                  className="w-full text-left rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${packageHandlingOption === "finalize" ? "border-[#3E206D]" : "border-gray-300"
                        }`}
                    >
                      {packageHandlingOption === "finalize" && (
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#3E206D]" />
                      )}
                    </span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                      <Image src={cardPaymentImg} alt="Finalize immediately" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <p
                          className="font-bold text-[15px] sm:text-[18px]"
                          style={{ color: packageHandlingOption === "finalize" ? "#47108E" : "#2A272E" }}
                        >
                          Finalize Immediately
                        </p>
                        <span className="text-[10px] sm:text-[11px] font-medium text-blue-700 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                          Card Payment Required
                        </span>
                      </div>
                      <p className="text-[12.5px] sm:text-[14px] text-gray-600 leading-snug">
                        Want to secure your delivery slot now? Confirm your order right away and we&apos;ll
                        prepare it using the standard package items assigned for your delivery date. Please
                        note that once confirmed, this order cannot be changed or canceled.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handlePackagePopupContinue}
                  disabled={isLoading}
                  className="w-full font-semibold text-[14px] sm:text-base rounded-xl py-3 sm:py-3.5 bg-[#3E206D] text-white hover:bg-[#2f1854] transition cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </div>
          )}
          <TopNavigation NavArray={NavArray} />

          <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start mt-6 ">
            {/* Left Section - Delivery Information */}
            <div className="w-full min-h-[1100px] lg:w-2/3 bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-md border border-gray-300">
              <h1 className="text-xl font-bold mb-6">Delivery Method</h1>

              <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8">
                {/* Dropdown - Full width on all screens */}
                <div className="w-full md:w-[32%]  cursor-pointer">
                  <CustomDropdown
                    options={[
                      { value: "home", label: "Home Delivery" },
                      { value: "pickup", label: "Pickup" },
                    ]}
                    selectedValue={formData.deliveryMethod}
                    onSelect={(value) =>
                      handleFieldChange("deliveryMethod", value)
                    }
                  />
                </div>

                {formData.deliveryMethod === "home" && addressOptionsResolving && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    Checking saved addresses...
                  </div>
                )}

                {formData.deliveryMethod === "home" && !addressOptionsResolving && (
                  <div className="flex flex-col md:flex-row w-full md:w-auto md:items-center ">
                    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 md:items-center">
                      {hasRecentAddress && (
                        <label className="flex items-center whitespace-nowrap text-sm md:text-base cursor-pointer">
                          <input
                            type="radio"
                            name="addressMode"
                            value="recent"
                            checked={addressMode === "recent"}
                            onChange={() => handleAddressOptionChange("recent")}
                            className="mr-2 accent-[#3E206D] cursor-pointer"
                          />
                          Recent Address
                        </label>
                      )}

                      {hasPreviousAddress && (
                        <label className="flex items-center whitespace-nowrap text-sm md:text-base cursor-pointer">
                          <input
                            type="radio"
                            name="addressMode"
                            value="previous"
                            checked={addressMode === "previous"}
                            onChange={() => handleAddressOptionChange("previous")}
                            className="mr-2 accent-[#3E206D] cursor-pointer"
                          />
                          Saved Address
                        </label>
                      )}

                      <label className="flex items-center whitespace-nowrap text-sm md:text-base cursor-pointer">
                        <input
                          type="radio"
                          name="addressMode"
                          value="new"
                          checked={addressMode === "new"}
                          onChange={() => handleAddressOptionChange("new")}
                          className="mr-2 accent-[#3E206D] cursor-pointer"
                        />
                        New Address
                      </label>
                    </div>
                  </div>
                )}

                {formData.deliveryMethod === "home" && !addressOptionsResolving && addressMode === "previous" && (
                  <div className="mb-6 w-full">
                    <h3 className="font-bold text-base mb-3 mt-2 text-[#252525]">Saved Addresses</h3>

                    {loadingSavedAddresses ? (
                      <div className="flex justify-center items-center py-8 bg-[#FAF5FD] rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DBD0F4]"></div>
                      </div>
                    ) : (
                      <div className="bg-[#FAF5FD] border border-[#DBD0F4] rounded-xl p-3 w-full overflow-hidden">
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 w-full"
                          style={
                            savedAddresses.length > 2 && twoRowHeight
                              ? { maxHeight: `${twoRowHeight}px` }
                              : undefined
                          }
                        >
                          {savedAddresses.map((addr, index) => {
                            const isSelected = selectedAddressKey === addr.addressKey;

                            const summary =
                              addr.buildingType === "Apartment"
                                ? [
                                  addr.buildingNo,
                                  addr.buildingName,
                                  addr.unitNo,
                                  addr.floorNo,
                                  addr.houseNo,
                                  addr.streetName,
                                  addr.city,
                                ]
                                  .filter((part) => part && part.toString().trim())
                                  .join(", ")
                                : [addr.houseNo, addr.streetName, addr.city]
                                  .filter((part) => part && part.toString().trim())
                                  .join(", ");

                            return (
                              <button
                                type="button"
                                key={addr.addressKey}
                                ref={index === 0 ? firstCardRef : undefined}
                                onClick={() => selectSavedAddress(addr)}
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  border: isSelected ? "2px solid #3E206D" : "1px solid #DBDADD",
                                  boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.10)",
                                }}
                                className="min-w-0 w-full text-left p-4 rounded-lg transition-colors box-border cursor-pointer"
                              >
                                <div className="flex items-center gap-2 mb-1.5 min-w-0">
                                  <span
                                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-[#3E206D]" : "border-gray-300"
                                      }`}
                                  >
                                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#3E206D]" />}
                                  </span>
                                  <p className="font-semibold text-[#252525] truncate">{addr.saveAs || addr.buildingType}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-snug pl-6 break-words">{summary}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {formData.deliveryMethod === "pickup" && (
                <div className="w-full mb-6">
                  <h2 className="text-xl font-bold mb-6 mt-8 text-[#252525]">
                    Find your nearest centre
                  </h2>

                  {/* Center Selection Dropdown - ABOVE the map */}
                  {/* Center Selection Dropdown - ABOVE the map */}
                  <div className="mb-4 relative z-50">
                    <label className="block font-semibold mb-2 text-[#2E2E2E]">
                      Select Pickup Centre
                    </label>
                    {loadingCenters ? (
                      <div className="w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          Loading centers...
                        </span>
                      </div>
                    ) : (
                      <CustomDropdown
                        options={pickupCenterOptions}
                        selectedValue={
                          selectedPickupCenter?.id?.toString() || ""
                        }
                        onSelect={(value) => {
                          const selectedCenter = pickupCenters.find(
                            (center) => center.value === value,
                          );
                          if (selectedCenter) {
                            handleCenterSelect(value, selectedCenter.label);
                          }
                        }}
                        placeholder="Select from here"
                        searchable={true}
                        searchPlaceholder="Type to search centers..."
                      />
                    )}
                    {errors.centerId && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.centerId}
                      </p>
                    )}
                  </div>

                  {selectedPickupCenter && (
                    <div
                      className="mb-6 rounded-[10px] py-6 px-4 text-center bg-white box-border"
                      style={{
                        border: "1px dashed #3E206D",
                        boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
                      }}
                    >
                      <h3 className="font-bold text-lg  mb-2">
                        {selectedPickupCenter.name}
                      </h3>
                      <p className="text-gray-400 font-semibold text-sm mb-1">Address :</p>
                      <p className="text-base">
                        {[
                          { label: "City", value: selectedPickupCenter.city },
                          { label: "District", value: selectedPickupCenter.district },
                          { label: "Province", value: selectedPickupCenter.province },
                        ]
                          .filter((item) => item.value)
                          .map((item, index, arr) => (
                            <React.Fragment key={item.label}>
                              <span className="text-[#8492A3]">{item.label} : </span>
                              <span className="text-[#272727]">{item.value}</span>
                              {index < arr.length - 1 && (
                                <span className="text-[#414347]">, </span>
                              )}
                            </React.Fragment>
                          ))}
                      </p>
                    </div>
                  )}
                  {/* Map Component - BELOW the dropdown */}
                  <div className="mb-6 relative z-10">
                    <OpenStreetMap
                      center={mapCenter}
                      zoom={mapZoom}
                      height="300px"
                      onCenterSelect={handleCenterSelect}
                      pickupCenters={memoizedPickupCenters} // Use memoized version
                      selectedCenterId={selectedPickupCenter?.id?.toString()}
                    />
                  </div>
                </div>
              )}

              {!hideDeliveryInfoSection && (
                <>

                  <h2 className="text-xl font-bold mb-6 mt-8 text-[#252525]">
                    {formData.deliveryMethod === "pickup"
                      ? "Pickup Person Information"
                      : "Delivery Information"}
                  </h2>

                  {formData.deliveryMethod === "home" &&
                    addressMode === "recent" &&
                    recentAddressInfo?.isSavedAddress && (
                      <div className="mb-6">
                        <label className="block font-semibold mb-1 text-[#2E2E2E]">
                          Saved As
                        </label>
                        <div className="w-full border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg px-4 py-3 text-base text-[#2E2E2E]">
                          {recentAddressInfo.saveAs}
                        </div>
                      </div>
                    )}

                  <div className="flex flex-row md:gap-4 gap-2 mb-6">
                    {/* Title dropdown */}
                    <div className="w-1/4 md:w-1/9 cursor-pointer">
                      <label
                        htmlFor="title"
                        className="block font-semibold mb-1 text-[#2E2E2E]"
                      >
                        Title *
                      </label>
                      <div className="w-full">
                        <div
                          className={`rounded-lg ${errors.title ? "border-2 border-red-500" : ""}`}
                        >
                          <CustomDropdown
                            options={[
                              { value: "Mr", label: "Mr" },
                              { value: "Ms", label: "Ms" },
                              { value: "Mrs", label: "Mrs" },
                              { value: "Rev", label: "Rev" },
                            ]}
                            selectedValue={formData.title}
                            onSelect={(value) => handleFieldChange("title", value)}
                            placeholder="Title"
                            disabled={isReadOnly}
                          />
                        </div>
                        {errors.title && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Full name input */}
                    <div className="w-3/4 md:w-8/9">
                      <label
                        htmlFor="fullName"
                        className="block font-semibold mb-1 text-[#2E2E2E]"
                      >
                        Full name *
                      </label>
                      {/* <input
                    type="text"
                    className="w-full border-2 border-[#F2F4F7] bg-[#F9FAFB] h-[39px] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-3 text-base capitalize"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => {
                      const capitalizedValue = capitalizeFirstLetter(
                        e.target.value,
                      );
                      handleFieldChange("fullName", capitalizedValue);
                    }}
                  /> */}
                      <input
                        type="text"
                        className={`w-full border-2 border-[#F2F4F7] bg-[#F9FAFB] h-[39px] focus:outline-none rounded-lg px-4 py-3 text-base capitalize ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                          }`}
                        value={formData.fullName}
                        onChange={(e) => {
                          // Remove leading spaces, numbers, and special characters
                          const value = e.target.value
                            .replace(/^\s+/, '')           // Remove leading spaces
                            .replace(/[0-9]/g, '')         // Remove all numbers
                            .replace(/[^a-zA-Z\s]/g, '');  // Remove special characters, keep only letters and spaces

                          const capitalizedValue = capitalizeFirstLetter(value);
                          handleFieldChange("fullName", capitalizedValue);
                        }}
                        onKeyDown={(e) => {
                          // Prevent space at beginning, numbers, and special characters
                          const isNumber = /[0-9]/.test(e.key);
                          const isSpecialChar = /[^a-zA-Z\s]/.test(e.key) && e.key.length === 1;
                          if ((e.key === ' ' && e.currentTarget.selectionStart === 0) || isNumber || isSpecialChar) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          // Handle paste events
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          const cleanedText = pastedText
                            .replace(/^\s+/, '')           // Remove leading spaces
                            .replace(/[0-9]/g, '')         // Remove all numbers
                            .replace(/[^a-zA-Z\s]/g, '')   // Remove special characters
                            .replace(/\s+/g, ' ');         // Replace multiple spaces with single space

                          const capitalizedValue = capitalizeFirstLetter(cleanedText);
                          handleFieldChange("fullName", capitalizedValue);
                        }}
                        readOnly={isReadOnly}

                      />
                      {errors.fullName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-row flex-col md:gap-4 gap-4 mb-6">
                    <div className="md:w-1/2 w-full">
                      <label className="block font-semibold mb-1 text-[#2E2E2E]">
                        Phone Number 1 *
                      </label>
                      <div className="flex gap-2">
                        <div className="w-28">
                          <PhoneCustomDropdown
                            options={countryOptions}
                            selectedValue={formData.phoneCode1}
                            onSelect={(value: any) => handleFieldChange("phoneCode1", value)}
                            placeholder="+94"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="w-full">
                          <input
                            type="text"
                            inputMode="numeric"
                            className={`w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] focus:outline-none rounded-lg px-4 py-2 ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                              }`}
                            value={formData.phone1}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              handleFieldChange("phone1", value);
                            }}
                            placeholder="7XXXXXXXX"
                            maxLength={9}
                            readOnly={isReadOnly}
                          />
                          {errors.phone1 && (
                            <p className="text-red-600 text-sm mt-1">{errors.phone1}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-1/2 w-full">
                      <label className="block font-semibold mb-1 text-[#2E2E2E]">
                        Phone Number 2
                      </label>
                      <div className="flex gap-2">
                        <div className="w-28">
                          <PhoneCustomDropdown
                            options={countryOptions}
                            selectedValue={formData.phoneCode2}
                            onSelect={(value: any) => handleFieldChange("phoneCode2", value)}
                            placeholder="+94"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="w-full">
                          <input
                            type="text"
                            inputMode="numeric"
                            className={`w-full h-[39px] border-2 ${duplicatePhoneError ? "border-red-500" : "border-[#F2F4F7]"} bg-[#F9FAFB] focus:outline-none rounded-lg px-4 py-2 ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                              }`}
                            value={formData.phone2}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              handleFieldChange("phone2", value);
                            }}
                            placeholder="7XXXXXXXX"
                            maxLength={9}
                            readOnly={isReadOnly}
                          />
                          {errors.phone2 && (
                            <p className="text-red-600 text-sm mt-1">{errors.phone2}</p>
                          )}
                          {duplicatePhoneError && !errors.phone2 && (
                            <p className="text-red-600 text-sm mt-1">{duplicatePhoneError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.deliveryMethod === "home" && (
                    <>
                      {/* Loading indicator for address fetching */}
                      {isLoadingAddress && (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                          <span className="ml-3 text-gray-600 text-lg">Loading address...</span>
                        </div>
                      )}

                      {!isLoadingAddress && (
                        <div className="flex flex-wrap -mx-2">
                          {/* Building Type */}
                          <div className="w-full md:w-1/2 px-2 mb-4">
                            <label className="block text-[#2E2E2E] font-semibold mb-1">
                              Building type *
                            </label>
                            <CustomDropdown
                              options={[
                                { value: "Apartment", label: "Apartment" },
                                { value: "House", label: "House" },
                              ]}
                              selectedValue={formData.buildingType}
                              onSelect={(value) =>
                                handleFieldChange("buildingType", value)
                              }
                              placeholder="Building type"
                              disabled={isReadOnly}
                            />
                            {errors.buildingType && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.buildingType}
                              </p>
                            )}
                          </div>

                          {/* Apartment or Building No */}
                          {formData.buildingType === "Apartment" && (
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block font-semibold text-[#2E2E2E] mb-1">
                                Apartment or Building No *
                              </label>
                              <input
                                value={formData.buildingNo}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/^\s+/, ''); // Remove leading spaces
                                  handleFieldChange("buildingNo", value);
                                }}
                                onKeyDown={(e) => {
                                  // Prevent space at beginning
                                  if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                    e.preventDefault();
                                  }
                                }}
                                type="text"
                                placeholder="Enter House / Building No"
                                disabled={isReadOnly}
                                className={`w-full px-4 py-2 h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                  }`}
                              />
                              {errors.buildingNo && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.buildingNo}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Apartment or Building Name */}
                          {formData.buildingType === "Apartment" && (
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block font-semibold text-[#2E2E2E] mb-1">
                                Apartment or Building Name *
                              </label>
                              <input
                                value={formData.buildingName}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/^\s+/, '');
                                  handleFieldChange("buildingName", value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                    e.preventDefault();
                                  }
                                }}
                                type="text"
                                placeholder="Enter building name"
                                className={`w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                  }`}
                                readOnly={isReadOnly}
                              />
                              {errors.buildingName && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.buildingName}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Flat / Unit Number */}
                          {formData.buildingType === "Apartment" && (
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block font-semibold text-[#2E2E2E] mb-1">
                                Flat / Unit Number *
                              </label>
                              <input
                                value={formData.flatNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/^\s+/, ''); // Remove leading spaces
                                  handleFieldChange("flatNumber", value);
                                }}
                                onKeyDown={(e) => {
                                  // Prevent space at beginning
                                  if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                    e.preventDefault();
                                  }
                                }}
                                type="text"
                                placeholder="Enter flat number"
                                readOnly={isReadOnly}
                                className={`w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                  }`}
                              />
                              {errors.flatNumber && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.flatNumber}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Floor Number */}
                          {formData.buildingType === "Apartment" && (
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <label className="block font-semibold text-[#2E2E2E] mb-1">
                                Floor Number *
                              </label>
                              <input
                                value={formData.floorNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/^\s+/, ''); // Remove leading spaces
                                  handleFieldChange("floorNumber", value);
                                }}
                                onKeyDown={(e) => {
                                  // Prevent space at beginning
                                  if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                    e.preventDefault();
                                  }
                                }}
                                type="text"
                                placeholder="Enter floor number"
                                readOnly={isReadOnly}
                                className={`w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                  }`}
                              />
                              {errors.floorNumber && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.floorNumber}
                                </p>
                              )}
                            </div>
                          )}

                          {/* House Number */}
                          <div className="w-full md:w-1/2 px-2 mb-4">
                            <label className="block font-semibold text-[#2E2E2E] mb-1">
                              House Number *
                            </label>
                            <input
                              value={formData.houseNo}
                              onChange={(e) => {
                                const value = e.target.value.replace(/^\s+/, ''); // Remove leading spaces
                                handleFieldChange("houseNo", value);
                              }}
                              onKeyDown={(e) => {
                                // Prevent space at beginning
                                if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                  e.preventDefault();
                                }
                              }}
                              type="text"
                              placeholder="Enter house number"
                              readOnly={isReadOnly}
                              className={`w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                }`}
                            />
                            {errors.houseNo && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.houseNo}
                              </p>
                            )}
                          </div>

                          {/* Street Name */}
                          <div className="w-full md:w-1/2 px-2 mb-4">
                            <label className="block font-semibold text-[#2E2E2E] mb-1">
                              Street Name *
                            </label>
                            <input
                              value={formData.street}
                              onChange={(e) => {
                                const value = e.target.value.replace(/^\s+/, ''); // Remove leading spaces
                                const capitalizedValue = capitalizeFirstLetter(value);
                                handleFieldChange("street", capitalizedValue);
                              }}
                              onKeyDown={(e) => {
                                // Prevent space at beginning
                                if (e.key === ' ' && e.currentTarget.selectionStart === 0) {
                                  e.preventDefault();
                                }
                              }}
                              type="text"
                              placeholder="Enter Street Name"
                              readOnly={isReadOnly}
                              className={`w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none capitalize ${isReadOnly ? "cursor-default" : "focus:ring-2 focus:ring-purple-600"
                                }`}
                            />
                            {errors.street && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.street}
                              </p>
                            )}
                          </div>

                          {/* City */}
                          {/* City */}
                          <div className="w-full md:w-1/2 px-2 mb-4" ref={cityDropdownRef}>
                            <label className="block font-semibold text-[#2E2E2E] mb-1">
                              Nearest City *
                            </label>

                            {loadingCities ? (
                              <div className="w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                                <span className="text-sm text-gray-500">Loading cities...</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <div
                                  className={`flex items-center gap-2 h-[39px] px-4 border-2 rounded-lg bg-[#F9FAFB] ${errors.cityName ? "border-red-500" : "border-[#F2F4F7]"
                                    }`}
                                >
                                  <input
                                    type="text"
                                    value={citySearchTerm}
                                    onChange={(e) => handleCitySearchChange(e.target.value)}
                                    onFocus={() => {
                                      if (!isReadOnly) setIsCityDropdownOpen(true);
                                    }}
                                    placeholder="Search nearest city"
                                    disabled={isReadOnly}
                                    className={`flex-1 bg-transparent text-base outline-none border-none placeholder-gray-400 ${isReadOnly ? "cursor-default text-gray-500" : ""
                                      }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => (citySearchTerm ? handleCityClear() : handleCityArrowClick())}
                                    disabled={isReadOnly}
                                    className="flex-shrink-0 text-gray-400 hover:text-[#3E206D] transition-colors cursor-pointer disabled:cursor-not-allowed"
                                    aria-label={citySearchTerm ? "Clear" : "Show all cities"}
                                  >
                                    {citySearchTerm ? (
                                      <XCircle size={16} />
                                    ) : (
                                      <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180" : ""}`}
                                      />
                                    )}
                                  </button>
                                </div>

                                {isCityDropdownOpen && !isReadOnly && (
                                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    {filteredCityOptions.length === 0 ? (
                                      <div className="py-3 px-4 text-sm font-[300] text-[#4C5160] bg-[#F2F2F6] rounded-lg">
                                        City Not Found
                                      </div>
                                    ) : (
                                      <ul className="max-h-52 overflow-y-auto py-1">
                                        {filteredCityOptions.map((city) => {
                                          const available = isCityAvailable(city.city);
                                          return (
                                            <li key={city.id}>
                                              <button
                                                type="button"
                                                onClick={() => handleCityOptionSelect(city)}
                                                className="w-full cursor-pointer text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors"
                                              >
                                                <span className="font-medium text-gray-800">{city.city}</span>
                                                {available ? (
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
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {errors.cityName && (
                              <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>
                            )}

                            {!errors.cityName && cityNotAvailable && formData.cityName && (
                              <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#FFD9A8] bg-[#FFF4E5] px-3 py-2.5">
                                <Info size={16} className="mt-0.5 flex-shrink-0 text-[#E8792C]" />
                                <p className="text-[12px] md:text-[13px] text-[#E8792C] leading-snug">
                                  Delivery not available in {formData.cityName} yet, but we're working on it and coming to your area soon!
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-1/2 px-2 mb-4">
                            <label className="block font-semibold text-[#2E2E2E] mb-1">
                              Geo Location *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (isReadOnly) return;
                                setViewingSavedLocation(false);
                                setIsGeoModalOpen(true);
                              }}
                              disabled={isReadOnly}
                              className={`w-full h-[39px] border-2 border-[#F2F4F7] rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${isReadOnly
                                ? "bg-[#E6D9F5] text-[#3E206D] opacity-70 cursor-not-allowed"
                                : "bg-[#E6D9F5] text-[#3E206D] hover:bg-[#d9c9ed] cursor-pointer"
                                }`}
                            >
                              <LocateFixed size={20} />
                              {formData.geoLatitude && formData.geoLongitude
                                ? "Reattach My Geo Location"
                                : "Attach My Geo Location"}
                            </button>

                            {(errors.geoLatitude || errors.geoLongitude) && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.geoLatitude || errors.geoLongitude}
                              </p>
                            )}

                            {/* Show current attached location */}
                            {formData.geoLatitude && formData.geoLongitude && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-green-600">
                                  Location attached
                                  {/* : {formData.geoLatitude.toFixed(6)},{" "} */}
                                  {/* {formData.geoLongitude.toFixed(6)} */}
                                </p>

                                {/* View Here link - only show if this is from saved address */}
                                {formData.geoLatitude && formData.geoLongitude && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setViewingSavedLocation(true);
                                      setIsGeoModalOpen(true);
                                      setIsViewOnly(true);
                                    }}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors text-sm font-medium group cursor-pointer"
                                  >
                                    <LocateFixed
                                      size={16}
                                      className="group-hover:scale-110 transition-transform"
                                    />
                                    <span className="underline">View here</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Geo Location Modal */}
                          <GeoLocationModal
                            isOpen={isGeoModalOpen}
                            onClose={() => {
                              setIsGeoModalOpen(false);
                              setViewingSavedLocation(false);
                              setIsViewOnly(false);
                            }}
                            onLocationSelect={handleLocationSelect}
                            initialCenter={
                              viewingSavedLocation &&
                                formData.geoLatitude &&
                                formData.geoLongitude
                                ? [formData.geoLatitude, formData.geoLongitude]
                                : mapCenter
                            }
                            savedLocation={
                              viewingSavedLocation &&
                                formData.geoLatitude &&
                                formData.geoLongitude
                                ? [formData.geoLatitude, formData.geoLongitude]
                                : null
                            }
                            viewOnly={isViewOnly}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="border-t border-gray-300 my-6"></div>

              <h3 className="font-bold text-lg mb-4 text-[#252525]">
                {formData.deliveryMethod === "pickup"
                  ? "Schedule Pickup"
                  : "Schedule Delivery"}
              </h3>

              <div className="flex md:flex-row flex-col gap-4 mb-6">
                <div className="md:w-1/2 w-full">
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                        .date-input::-webkit-calendar-picker-indicator {
                          cursor: pointer;
                        }
                        .date-input::-webkit-inner-spin-button {
                          cursor: pointer;
                        }
      
                        /* Firefox-specific styles */
                        .date-input::-moz-calendar-picker-indicator {
                          cursor: pointer;
                        }
      
                        /* Hide native placeholder in webkit browsers when showing custom one */
                        .date-input::-webkit-datetime-edit-text,
                        .date-input::-webkit-datetime-edit-month-field,
                        .date-input::-webkit-datetime-edit-day-field,
                        .date-input::-webkit-datetime-edit-year-field {
                          color: transparent;
                        }
                        .date-input.has-value::-webkit-datetime-edit-text,
                        .date-input.has-value::-webkit-datetime-edit-month-field,
                        .date-input.has-value::-webkit-datetime-edit-day-field,
                        .date-input.has-value::-webkit-datetime-edit-year-field {
                          color: #3D3D3D;
                        }
      
                        /* Hide custom placeholder in Firefox */
                        @-moz-document url-prefix() {
                          .custom-date-placeholder {
                            display: none !important;
                          }
                        }
                      `,
                    }}
                  />
                  <label className="block text-[#2E2E2E] font-semibold mb-4">
                    Date *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="date"
                      className={`
      date-input 
      w-full 
      border 
      h-[39px] 
      border-gray-300 
      cursor-pointer 
      focus:outline-none 
      focus:ring-2 
      focus:ring-purple-600 
      rounded-lg 
      px-4 
      py-2 
      bg-white 
      pr-10
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-calendar-picker-indicator]:absolute
      [&::-webkit-calendar-picker-indicator]:right-0
      [&::-webkit-calendar-picker-indicator]:w-full
      [&::-webkit-calendar-picker-indicator]:h-full
      [&::-webkit-calendar-picker-indicator]:cursor-pointer
      [&::-webkit-calendar-picker-indicator]:z-[2]
      [&::-webkit-calendar-picker-indicator]:bg-transparent
      ${formData.deliveryDate ? "has-value" : ""}
    `}
                      style={{
                        colorScheme: "light",
                      }}
                      value={formData.deliveryDate}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        // Additional client-side validation
                        if (selectedValue) {
                          const selectedDate = new Date(selectedValue);
                          const today = new Date();
                          const minDate = new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            today.getDate() + 3,
                          );

                          selectedDate.setHours(0, 0, 0, 0);
                          minDate.setHours(0, 0, 0, 0);

                          if (selectedDate >= minDate) {
                            handleFieldChange("deliveryDate", selectedValue);
                          } else {
                            // Don't update the field value, just trigger validation error
                            handleFieldChange("deliveryDate", selectedValue);
                          }
                        } else {
                          handleFieldChange("deliveryDate", selectedValue);
                        }
                      }}
                      onClick={(e) => {
                        // Ensure the date picker opens on click (Chrome, Edge, Safari)
                        const target = e.target as HTMLInputElement;
                        if (
                          target.showPicker &&
                          typeof target.showPicker === "function"
                        ) {
                          try {
                            target.showPicker();
                          } catch (error) {
                            console.error(error);
                          }
                        }
                      }}
                      min={getMinDate()}
                    />

                    {/* Custom Calendar Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
                        if (input && input.showPicker && typeof input.showPicker === "function") {
                          try {
                            input.showPicker();
                          } catch (error) {
                            console.error(error);
                          }
                        }
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity z-10"
                      aria-label="Select date"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-500"
                      >
                        <path
                          d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12H16V16H12V12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Custom placeholder */}
                    {!formData.deliveryDate && (
                      <div className="custom-date-placeholder absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                        mm/dd/yyyy
                      </div>
                    )}
                  </div>


                  {errors.deliveryDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.deliveryDate}
                    </p>
                  )}
                </div>
                <div className="md:w-1/2 w-full">
                  <label className="block font-semibold mb-4">
                    Time Slot *
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "08:00 AM - 12:00 PM", label: "08:00 AM - 12:00 PM" },
                      { value: "12:00 PM - 04:00 PM", label: "12:00 PM - 04:00 PM" },
                      { value: "04:00 PM - 09:00 PM", label: "04:00 PM - 09:00 PM" },
                    ]}
                    selectedValue={formData.timeSlot}
                    onSelect={(value) => handleFieldChange("timeSlot", value)}
                    placeholder="Select Time Slot"
                  />
                  {errors.timeSlot && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.timeSlot}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Right Section - Order Summary */}
            <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
              <div className="border border-gray-300 rounded-lg shadow-md p-4 sm:p-5 md:p-6">
                <h2 className="font-semibold text-lg mb-4">Your Order </h2>

                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 border border-[gray] rounded-lg flex items-center justify-center">
                      <Image
                        src={summary}
                        alt="Shopping bag"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-gray-600">
                      {cartData?.totalItems || 0}{" "}
                      {(cartData?.totalItems || 0) === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rs. {formatPrice(cartData?.grandTotal || 0)}
                  </p>
                </div>

                <div className="border-t border-gray-300 my-4" />

                <div className="flex justify-between text-sm mb-2">
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold">
                    Rs. {formatPrice(cartData?.grandTotal || 0)}
                  </p>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <p className="text-gray-600">Discount</p>
                  <p className="text-[#BE2A45]">
                    - Rs. {formatPrice(cartData?.discountAmount || 0)}
                  </p>
                </div>

                {formData.deliveryMethod === "home" && (
                  <div className="flex justify-between text-sm mb-2">
                    <p className="text-gray-600">Delivery Charges</p>
                    <p className="text-gray-600">
                      Rs. {formatPrice(deliveryCharge)}
                    </p>
                  </div>
                )}

                {formData.deliveryMethod === "pickup" && (
                  <div className="flex justify-between text-sm mb-2"></div>
                )}

                <div className="border-t border-gray-300 my-4" />

                <div className="flex justify-between mb-4 text-[20px] text-[#414347]">
                  <p className="font-semibold">Grand Total</p>
                  <p className="font-semibold">
                    Rs. {formatPrice(calculateFinalTotal())}
                  </p>
                </div>
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={!isFormValidState || isLoading}
                    className={`w-full font-semibold rounded-xl py-3.5 transition cursor-pointer ${!isFormValidState || isLoading
                      ? "bg-[#EBEEF2] text-[#B1BAC3] cursor-not-allowed"
                      : "bg-[#3E206D] text-white hover:bg-[#2f1854] cursor-pointer"
                      }`}
                  >
                    {isLoading ? "Processing..." : "Continue to Payment"}
                  </button>

                  {/* Tooltip */}
                  {!isFormValidState && !isLoading && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Please complete all required fields
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const PhoneCustomDropdown: React.FC<any> = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(
    (option: any) => option.value === selectedValue,
  );

  return (
    <div className="relative">
      {/* Display Button */}
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
            {selectedOption ? selectedOption.label : placeholder}
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

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option: any) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-3 hover:bg-gray-100 flex items-center gap-2 transition-colors cursor-pointer ${selectedValue === option.value
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

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default Page;
