'use client';
import React, { useState, useEffect, useMemo } from 'react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import CustomDropdown from '../../components/home/CustomDropdown';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setFormData, resetFormData } from '../../store/slices/checkoutSlice';
import { useRouter } from 'next/navigation';
import SuccessPopup from '@/components/toast-messages/success-message-with-button';
import ErrorPopup from '@/components/toast-messages/error-message';
import { getLastOrderAddress } from '@/services/retail-service';
import { selectCartForOrder } from '../../store/slices/cartItemsSlice';
import { getPickupCenters, PickupCenter } from '@/services/cart-service'
import dynamic from 'next/dynamic';
import Image from 'next/image';
import summary from '../../../public/summary.png'
import { getCities, City } from '@/services/cart-service';
import GeoLocationModal from '@/components/delivery-map/GeoLocationModal';
import { LocateFixed } from 'lucide-react';

const OpenStreetMap = dynamic(() => import('@/components/open-map/OpenStreetMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface FormData {
  centerId: number | null,
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
  geoLatitude: number | null;   // Add this
  geoLongitude: number | null;  // Add this
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
  geoLatitude: string;   // Add this
  geoLongitude: string;  // Add this
}

const initialFormState: FormData = {
  centerId: null,
  deliveryMethod: 'home',
  title: '',
  fullName: '',
  phone1: '',
  phone2: '',
  buildingType: 'Apartment',
  deliveryDate: '',
  timeSlot: '',
  phoneCode1: '+94',
  phoneCode2: '+94',
  buildingNo: '',
  buildingName: '',
  flatNumber: '',
  floorNumber: '',
  houseNo: '',
  street: '',
  cityName: '',
  scheduleType: 'One Time',
  geoLatitude: null,    // Add this
  geoLongitude: null,   // Add this
};


const Page: React.FC = () => {
  const NavArray = [
    { name: 'Cart', path: '/cart', status: true },
    { name: 'Checkout', path: '/checkout', status: true },
    { name: 'Payment', path: '/payment', status: false },
  ];
  const dispatch = useDispatch<AppDispatch>();
  // const storedFormData = useSelector((state: RootState) => state.checkout);


  const [formData, setFormDataLocal] = useState<FormData>(initialFormState);

  const [errors, setErrors] = useState<FormErrors>({
    centerId: '',
    deliveryMethod: '',
    title: '',
    fullName: '',
    phone1: '',
    phone2: '',
    buildingType: '',
    deliveryDate: '',
    timeSlot: '',
    phoneCode1: '',
    phoneCode2: '',
    buildingNo: '',
    buildingName: '',
    flatNumber: '',
    floorNumber: '',
    houseNo: '',
    street: '',
    cityName: '',
    scheduleType: '',
    geoLatitude: '',
    geoLongitude: '',
  });

  // Add this new state for duplicate phone error
  const [duplicatePhoneError, setDuplicatePhoneError] = useState('');

  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const [usePreviousAddress, setUsePreviousAddress] = useState(false);
  const cartData = useSelector(selectCartForOrder);

  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const cartPrices = useSelector((state: RootState) => state.cart) || null;
  const { cartId } = useSelector((state: RootState) => state.cartItems);
  const router = useRouter();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
  const [selectedPickupCenter, setSelectedPickupCenter] = useState<{ id: number, name: string } | null>(null);
  const [pickupCenters, setPickupCenters] = useState<PickupCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]); // Default to Colombo
  const [mapZoom, setMapZoom] = useState(12);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0); // Default charge
  const [hasPreviousAddress, setHasPreviousAddress] = useState(true);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [viewingSavedLocation, setViewingSavedLocation] = useState(false);
  const memoizedPickupCenters = useMemo(() => pickupCenters, [pickupCenters]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get search params from window.location
    const urlParams = new URLSearchParams(window.location.search);
    const deliveryMethodFromQuery = urlParams.get('deliveryMethod');

    if (deliveryMethodFromQuery && (deliveryMethodFromQuery === 'home' || deliveryMethodFromQuery === 'pickup')) {
      setFormDataLocal(prev => ({
        ...prev,
        deliveryMethod: deliveryMethodFromQuery
      }));

      console.log('Delivery method set from query params:', deliveryMethodFromQuery);
    }

    setSearchParamsLoaded(true);
  }, []);

  useEffect(() => {
    // Reset delivery charge when delivery method changes
    if (formData.deliveryMethod === 'pickup') {
      setDeliveryCharge(0);
    } else if (formData.deliveryMethod === 'home' && !selectedCity) {
      setDeliveryCharge(0); // Default home delivery charge
    }
  }, [formData.deliveryMethod, selectedCity]);


  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const fetchPickupCenters = async () => {
      if (formData.deliveryMethod === 'pickup') {
        setLoadingCenters(true);
        try {
          const response = await getPickupCenters();
          if (response.success) {
            setPickupCenters(response.data);
            console.log('Pickup centers loaded:', response.data);
          }
        } catch (error: any) {
          console.error('Failed to fetch pickup centers:', error);
          setErrorMsg(error.message || 'Failed to load pickup centers.');
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
    if (formData.phone1 && formData.phone2 &&
      formData.phone1.trim() === formData.phone2.trim() &&
      formData.phoneCode1 === formData.phoneCode2) {
      setDuplicatePhoneError('Phone Number 1 and Phone Number 2 cannot be the same');
    } else {
      setDuplicatePhoneError('');
    }
  }, [formData.phone1, formData.phone2, formData.phoneCode1, formData.phoneCode2]);

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await getCities();
        if (response.success) {
          setCities(response.data);
          console.log('Cities loaded:', response.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch cities:', error);
        setErrorMsg(error.message || 'Failed to load cities.');
        setShowErrorPopup(true);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);


  useEffect(() => {
    // Set default to saved address if delivery method is home on initial load
    if (formData.deliveryMethod === 'home' && searchParamsLoaded) {
      handleAddressOptionChange('previous');
    }
  }, [formData.deliveryMethod, searchParamsLoaded, cities]);


  // 5. Create city dropdown options
  const cityOptions = cities.map(city => ({
    value: city.id.toString(),
    label: city.city
  }));


  const handleLocationSelect = (lat: number, lng: number) => {
    setFormDataLocal(prev => ({
      ...prev,
      geoLatitude: lat,
      geoLongitude: lng
    }));

    // Clear any geo location errors
    setErrors(prev => ({
      ...prev,
      geoLatitude: '',
      geoLongitude: ''
    }));
  };





  const handleAddressOptionChange = async (value: string) => {
    if (value === 'previous') {
      console.log('fetching last order address');
      setUsePreviousAddress(true);
      setFetching(true);

      try {
        const response = await getLastOrderAddress(token);

        // Check if response has hasAddress field
        if (response && response.hasAddress === false) {
          // No previous address found - hide the saved address option
          setHasPreviousAddress(false);
          setUsePreviousAddress(false);
          // Switch to new address mode
          setFormDataLocal(prev => ({
            ...initialFormState,
            deliveryMethod: prev.deliveryMethod
          }));
          setSelectedCity(null);
          setDeliveryCharge(0);
        } else if (response && response.status) {
          // Previous address found - show the saved address option
          setHasPreviousAddress(true);
          const data = response.result;
          console.log('fetch last order address data', data);

          const cityData = cities.find(city =>
            city.city.toLowerCase() === data.city.toLowerCase()
          );
          if (cityData) {
            setSelectedCity(cityData);
            // Set delivery charge for previous address city
            const charge = parseFloat(cityData.charge);
            setDeliveryCharge(charge);
          }

          // Update form data based on building type
          setFormDataLocal(prev => ({
            ...prev,
            buildingType: data.buildingType || 'Apartment',
            title: data.title || '',
            fullName: data.fullName || '',
            phone1: data.phone1 || '',
            phone2: data.phone2 || '',
            phoneCode1: data.phonecode1 || '+94',
            phoneCode2: data.phonecode2 || '+94',
            scheduleType: 'One Time', // default
            // Common address fields
            houseNo: data.houseNo || '',
            street: data.streetName || '',
            cityName: data.city || '',
            // Apartment-specific fields (will be empty for House type)
            buildingNo: data.buildingNo || '',
            buildingName: data.buildingName || '',
            flatNumber: data.unitNo || '',
            floorNumber: data.floorNo || '',
            // Geo location coordinates
            geoLatitude: data.latitude ? parseFloat(data.latitude) : null,
            geoLongitude: data.longitude ? parseFloat(data.longitude) : null,
          }));
        }
      } catch (error: any) {
        console.error('Failed to fetch last order address:', error);
        // On error, assume no previous address and hide the option
        setHasPreviousAddress(false);
        setUsePreviousAddress(false);
        setFormDataLocal(prev => ({
          ...initialFormState,
          deliveryMethod: prev.deliveryMethod
        }));
        setSelectedCity(null);
        setDeliveryCharge(0);
      } finally {
        setFetching(false);
      }
    } else {
      setUsePreviousAddress(false);
      setSelectedCity(null);
      // Reset only the form fields, keep the delivery method
      setFormDataLocal(prev => ({
        ...initialFormState,
        deliveryMethod: prev.deliveryMethod // Preserve the current delivery method
      }));
      // Reset delivery charge to default
      setDeliveryCharge(0);
    }
  };

  useEffect(() => {

    if (searchParamsLoaded && !fetching && !formData.title.trim()) {
      setErrors(prev => ({
        ...prev,
        title: 'Title is required.'
      }));
    }
  }, [searchParamsLoaded, fetching, formData.title]);

  const calculateFinalTotal = (): number => {
    const baseTotal = cartData?.grandTotal || 0;
    const discount = cartData?.discountAmount || 0;

    // Only add delivery charge for home delivery
    if (formData.deliveryMethod === 'home') {
      return baseTotal - discount + deliveryCharge;
    } else {
      // For pickup, no delivery charge
      return baseTotal - discount;
    }
  };


  const handleCenterSelect = (centerId: string, centerName: string) => {
    const selectedCenter = pickupCenters.find(center => center.value === centerId);

    if (selectedCenter) {
      const centerIdAsNumber = parseInt(centerId, 10);
      setSelectedPickupCenter({ id: centerIdAsNumber, name: centerName });
      setFormDataLocal(prev => ({ ...prev, centerId: centerIdAsNumber }));

      // Clear centerId error when center is selected
      setErrors(prev => ({ ...prev, centerId: '' }));

      // Update map center and zoom to selected pickup center
      setMapCenter([selectedCenter.latitude, selectedCenter.longitude]);
      setMapZoom(15);

      console.log('Selected pickup center:', {
        id: selectedCenter.id,
        name: selectedCenter.name,
        latitude: selectedCenter.latitude,
        longitude: selectedCenter.longitude,
      });
    }
  };


  const pickupCenterOptions = pickupCenters.map(center => ({
    value: center.value,
    label: center.label
  }));

  const getMinDate = (): string => {
    const today = new Date();

    // Create a new date object and add 3 days
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

    // Ensure we get the correct local date without timezone issues
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    // Update the form state
    setFormDataLocal(prev => ({ ...prev, [field]: value }));

    // Validate the field with the updated form data
    const updatedFormData = { ...formData, [field]: value };
    const error = validateField(field, value, updatedFormData);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Special case: if deliveryMethod changes, revalidate all fields and reset relevant state
    if (field === 'deliveryMethod') {
      // Clear errors for all fields first
      setErrors({
        centerId: '',
        deliveryMethod: '',
        title: '',
        fullName: '',
        phone1: '',
        phone2: '',
        buildingType: '',
        deliveryDate: '',
        timeSlot: '',
        phoneCode1: '',
        phoneCode2: '',
        buildingNo: '',
        buildingName: '',
        flatNumber: '',
        floorNumber: '',
        houseNo: '',
        street: '',
        cityName: '',
        scheduleType: '',
        geoLatitude: '',
        geoLongitude: '',
      });

      if (value === 'home') {
        setUsePreviousAddress(true);
        setSelectedPickupCenter(null); // Clear pickup center selection
        // Trigger fetch of previous address
        handleAddressOptionChange('previous');
      } else if (value === 'pickup') {
        setUsePreviousAddress(false);
        setSelectedCity(null); // Clear city selection
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

        setFormDataLocal(prev => ({
          ...initialFormState,
          deliveryMethod: value as string,
          ...basicInfo
        }));
      }
    }
  };

  const isFormValid = (): boolean => {
    const isHomeDelivery = formData.deliveryMethod === 'home';
    const isPickup = formData.deliveryMethod === 'pickup';
    const isApartment = formData.buildingType === 'Apartment';

    // Check for duplicate phone numbers
    if (duplicatePhoneError) {
      return false;
    }

    // Check required fields based on delivery method
    const requiredFields = [
      'title',
      'fullName',
      'phone1',
      'deliveryDate',
      'timeSlot'
    ];

    // Add delivery method specific required fields
    if (isPickup) {
      requiredFields.push('centerId');
    }

    if (isHomeDelivery) {
      requiredFields.push('buildingType', 'houseNo', 'street', 'cityName');
      // ADD THESE LINES:
      requiredFields.push('geoLatitude', 'geoLongitude');

      // Add apartment specific required fields
      if (isApartment) {
        requiredFields.push('buildingName', 'buildingNo', 'flatNumber', 'floorNumber');
      }
    }

    // Check if all required fields are filled and valid
    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];

      // Check if field is empty
      if (field === 'centerId' || field === 'geoLatitude' || field === 'geoLongitude') {
        if (value === null || value === undefined) return false;
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) return false;
      }

      // Check if field has validation errors
      const error = validateField(field as keyof FormData, value, formData);
      if (error) return false;
    }

    // Additional check: For home delivery, ensure selectedCity is not null
    if (isHomeDelivery && !selectedCity) {
      return false;
    }

    return true;
  };


  const [isFormValidState, setIsFormValidState] = useState(false);

  useEffect(() => {
    setIsFormValidState(isFormValid());
  }, [formData, errors]);



  // Updated validateField function - replace the existing one
  const handleCitySelect = (cityId: string, cityName: string) => {
    const selectedCityData = cities.find(city => city.id.toString() === cityId);

    if (selectedCityData) {
      setSelectedCity(selectedCityData);
      setFormDataLocal(prev => ({ ...prev, cityName: selectedCityData.city }));

      // Set delivery charge based on selected city
      const charge = parseFloat(selectedCityData.charge);
      setDeliveryCharge(charge);

      // Clear any existing cityName error
      setErrors(prev => ({ ...prev, cityName: '' }));

      console.log('Selected city:', selectedCityData);
      console.log('Delivery charge:', charge);
    }
  };

  const validateField = (field: keyof FormData, value: string | number | null, formData: FormData): string => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    const isHomeDelivery = formData.deliveryMethod === 'home';
    const isPickup = formData.deliveryMethod === 'pickup';
    const isApartment = formData.buildingType === 'Apartment';

    switch (field) {
      case 'centerId':
        if (isPickup) {
          if (value === null || value === undefined) {
            return 'Please select a pickup center.';
          }
          if (typeof value === 'number' && value > 0) {
            return '';
          }
          return 'Please select a pickup center.';
        }
        return '';

      case 'fullName':
        if (!trimmed) return 'Full Name is required.';
        if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Full Name must only contain letters and spaces.';
        return '';

      case 'title':
        return !trimmed ? 'Title is required.' : '';

      case 'phone1':
        if (!value) return 'Phone number 1 is required.';
        if (!/^\d{9}$/.test(value.toString())) return 'Please enter a valid mobile number (format: 7XXXXXXXX)';
        return '';

      case 'phone2':
        return value && !/^\d{9}$/.test(value.toString()) ? 'Please enter a valid mobile number (format: 7XXXXXXXX)' : '';

      case 'timeSlot':
        return !trimmed ? 'Time slot is required.' : '';

      case 'deliveryDate':
        if (!value) return 'Delivery Date is required.';

        const selectedDate = new Date(value.toString());
        const today = new Date();
        const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

        selectedDate.setHours(0, 0, 0, 0);
        minDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate < minDate) {
          return 'Please select a date at least 3 days from today.';
        }

        return '';

      // Address fields - only required for home delivery
      case 'buildingType':
        return isHomeDelivery && !trimmed ? 'Building type is required.' : '';

      case 'buildingName':
      case 'buildingNo':
      case 'floorNumber':
      case 'flatNumber':
        return isHomeDelivery && isApartment && !trimmed ?
          `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.` :
          '';

      case 'street':
      case 'houseNo':
        return isHomeDelivery && !trimmed ?
          `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.` :
          '';

      case 'cityName':
        if (isHomeDelivery) {
          if (!trimmed) return 'Nearest City is required.';
          if (!selectedCity) return 'Please select a valid city.';
        }
        return '';

      case 'geoLatitude':
      case 'geoLongitude':
        // UPDATED: Make geo location required for home delivery
        if (isHomeDelivery) {
          if (value === null || value === undefined) {
            return 'Geo location is required. Please attach your location.';
          }
        }
        return '';

      default:
        return '';
    }
  };


  const capitalizeFirstLetter = (value: string): string => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {} as FormErrors;
    let valid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
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
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please correctly fill all the required fields.',
      });
      return;
    }

    try {
      setIsLoading(true);

      let dataToSubmit: FormData = {
        ...initialFormState,
        // Always include shared fields
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
        // Include geo location coordinates
        geoLatitude: formData.geoLatitude,
        geoLongitude: formData.geoLongitude,
      };

      if (formData.deliveryMethod === 'home') {
        if (formData.buildingType === 'Apartment') {
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
            // Geo location already included above
          };
        } else if (formData.buildingType === 'House') {
          dataToSubmit = {
            ...dataToSubmit,
            buildingType: formData.buildingType,
            houseNo: formData.houseNo,
            street: formData.street,
            cityName: formData.cityName,
            // Geo location already included above
          };
        }
      } else if (formData.deliveryMethod === 'pickup') {
        dataToSubmit = {
          ...dataToSubmit,
          centerId: formData.centerId,
        };
      }

      dispatch(resetFormData());
      dispatch(setFormData(dataToSubmit));
      console.log('submitting', dataToSubmit);
      localStorage.setItem('deliveryCharge', deliveryCharge.toString());
      console.log('Delivery charge stored:', deliveryCharge);

      await new Promise(resolve => setTimeout(resolve, 2500));
      router.push('/payment')

    } catch (err: any) {
      setErrorMsg(err.message || 'Check out failed!');
      await Swal.fire({
        title: 'Check out failed',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#3E206D',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    // Convert to fixed decimal first, then add commas
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimalPart}`;
  };


  return (
    <div>
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Check out successfull!"
        description="Let's move to next step."
        path='/payment'
      />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Oops!"
        description="Something happen, Please try again!"
      />
      <form onSubmit={handleSubmit}>
        <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5 '>
          <TopNavigation NavArray={NavArray} />

          <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start mt-6 '>
            {/* Left Section - Delivery Information */}
            <div className='w-full min-h-[1100px] lg:w-2/3 bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-md border border-gray-300'>
              <h1 className='text-xl font-bold mb-6'>Delivery Method</h1>

              <div className='flex flex-col md:flex-row flex-wrap gap-4 mb-8'>
                {/* Dropdown - Full width on all screens */}
                <div className="w-full md:w-[32%]  cursor-pointer">
                  <CustomDropdown

                    options={[
                      { value: 'home', label: 'Home Delivery' },
                      { value: 'pickup', label: 'Pickup' },
                    ]}
                    selectedValue={formData.deliveryMethod}
                    onSelect={(value) => handleFieldChange('deliveryMethod', value)}
                  />
                </div>

                {formData.deliveryMethod === 'home' && (
                  <div className="flex flex-col md:flex-row ">
                    <div className="flex md:gap-8 gap-2 flex-nowrap ">
                      {/* Only show "Your Saved Address" option if hasPreviousAddress is true */}
                      {hasPreviousAddress && (
                        <label className="flex items-center text-nowrap text-sm md:text-base cursor-pointer">
                          <input
                            type="radio"
                            name="addressMode"
                            value="previous"
                            checked={usePreviousAddress}
                            onChange={() => handleAddressOptionChange('previous')}
                            className="mr-2 accent-[#3E206D] cursor-pointer"
                          />
                          Your Saved Address
                        </label>
                      )}

                      <label className="flex items-center text-nowrap text-sm md:text-base cursor-pointer">
                        <input
                          type="radio"
                          name="addressMode"
                          value="new"
                          checked={!usePreviousAddress}
                          onChange={() => handleAddressOptionChange('new')}
                          className="mr-2 accent-[#3E206D] cursor-pointer "
                        />
                        Enter New Address
                      </label>
                    </div>
                  </div>
                )}

              </div>
              <div className='border-t border-gray-300 my-6'></div>

              {formData.deliveryMethod === 'pickup' && (
                <div className="w-full mb-6">
                  <h2 className='text-xl font-bold mb-6 mt-8 text-[#252525]'>
                    Find your nearest center
                  </h2>

                  {/* Center Selection Dropdown - ABOVE the map */}
                  {/* Center Selection Dropdown - ABOVE the map */}
                  <div className="mb-4 relative z-50">
                    <label className="block font-semibold mb-2 text-[#2E2E2E]">Select Pickup Center</label>
                    {loadingCenters ? (
                      <div className="w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">Loading centers...</span>
                      </div>
                    ) : (
                      <CustomDropdown
                        options={pickupCenterOptions}
                        selectedValue={selectedPickupCenter?.id?.toString() || ''}
                        onSelect={(value) => {
                          const selectedCenter = pickupCenters.find(center => center.value === value);
                          if (selectedCenter) {
                            handleCenterSelect(value, selectedCenter.label);
                          }
                        }}
                        placeholder="Select from here"
                        searchable={true}
                        searchPlaceholder="Type to search centers..."
                      />
                    )}
                    {errors.centerId && <p className="text-red-600 text-sm mt-1">{errors.centerId}</p>}
                  </div>

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

              <h2 className='text-xl font-bold mb-6 mt-8 text-[#252525]'>
                {formData.deliveryMethod === 'pickup' ? 'Pickup Person Information' : 'Delivery Information'}
              </h2>

              <div className='flex flex-row md:gap-4 gap-2 mb-6'>
                {/* Title dropdown */}
                <div className="w-1/4 md:w-1/9 cursor-pointer">
                  <label htmlFor="title" className='block font-semibold mb-1 text-[#2E2E2E]'>Title *</label>
                  <div className="w-full">
                    <div className={`rounded-lg ${errors.title ? 'border-2 border-red-500' : ''}`}>
                      <CustomDropdown
                        options={[
                          { value: 'Mr', label: 'Mr' },
                          { value: 'Ms', label: 'Ms' },
                          { value: 'Mrs', label: 'Mrs' },
                          { value: 'Rev', label: 'Rev' },
                        ]}
                        selectedValue={formData.title}
                        onSelect={(value) => handleFieldChange('title', value)}
                        placeholder="Title"
                      />
                    </div>
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                  </div>
                </div>

                {/* Full name input */}
                <div className="w-3/4 md:w-8/9">
                  <label htmlFor="fullName" className='block font-semibold mb-1 text-[#2E2E2E]'>Full name *</label>
                  <input
                    type="text"
                    className='w-full border-2 border-[#F2F4F7] bg-[#F9FAFB] h-[39px] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-3 text-base capitalize'
                    placeholder='Enter your full name'
                    value={formData.fullName}
                    onChange={(e) => {
                      const capitalizedValue = capitalizeFirstLetter(e.target.value);
                      handleFieldChange('fullName', capitalizedValue);
                    }}
                  />
                  {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                </div>
              </div>

              <div className='flex md:flex-row flex-col md:gap-4 gap-4 mb-6'>
                <div className="md:w-1/2 w-full">
                  <label className='block font-semibold mb-1 text-[#2E2E2E]'>Phone Number 1 *</label>
                  <div className='flex gap-2'>
                    <div className='w-24'>
                      <CustomDropdown
                        options={[
                          { value: '+94', label: '+94' },
                          { value: '+91', label: '+91' },
                          { value: '1', label: '+1' }
                        ]}
                        selectedValue={formData.phoneCode1}
                        onSelect={(value) => handleFieldChange('phoneCode1', value)}
                        placeholder="+94"
                      />
                    </div>
                    <div className="w-full">
                      <input
                        type="text"
                        className='w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 '
                        value={formData.phone1}
                        onChange={(e) => handleFieldChange('phone1', e.target.value)}
                        placeholder='7XXXXXXXX'
                      />
                      {errors.phone1 && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone1}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 w-full">
                  <label className='block font-semibold mb-1 text-[#2E2E2E]'>Phone Number 2</label>
                  <div className='flex gap-2'>
                    <div className='w-24'>
                      <CustomDropdown
                        options={[
                          { value: '+94', label: '+94' },
                          { value: '+91', label: '+91' },
                          { value: '+1', label: '+1' }
                        ]}
                        selectedValue={formData.phoneCode2}
                        onSelect={(value) => handleFieldChange('phoneCode2', value)}
                        placeholder="+94"
                      />
                    </div>
                    <div className="w-full">
                      <input
                        type="text"
                        className={`w-full h-[39px] border-2 ${duplicatePhoneError ? 'border-red-500' : 'border-[#F2F4F7]'} bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2`}
                        value={formData.phone2}
                        onChange={(e) => handleFieldChange('phone2', e.target.value)}
                        placeholder='7XXXXXXXX'
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

              {formData.deliveryMethod === 'home' && (
                <div className="flex flex-wrap -mx-2">
                  {/* Building Type */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block text-[#2E2E2E] font-semibold mb-1">Building type *</label>
                    <CustomDropdown
                      options={[
                        { value: 'Apartment', label: 'Apartment' },
                        { value: 'House', label: 'House' },

                      ]}
                      selectedValue={formData.buildingType}
                      onSelect={(value) => handleFieldChange('buildingType', value)}
                      placeholder="Building type"
                    />
                    {errors.buildingType && <p className="text-red-600 text-sm mt-1">{errors.buildingType}</p>}
                  </div>

                  {/* Apartment or Building No */}
                  {formData.buildingType === 'Apartment' && (
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block font-semibold text-[#2E2E2E] mb-1">Apartment or Building No *</label>
                      <input
                        value={formData.buildingNo}
                        onChange={(e) => handleFieldChange('buildingNo', e.target.value)}
                        type="text"
                        placeholder="Enter House / Building No"
                        className="w-full px-4 py-2 h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {errors.buildingNo && <p className="text-red-600 text-sm mt-1">{errors.buildingNo}</p>}
                    </div>
                  )}

                  {/* Apartment or Building Name */}
                  {formData.buildingType === 'Apartment' && (
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block font-semibold text-[#2E2E2E] mb-1">Apartment or Building Name *</label>
                      <input
                        value={formData.buildingName}
                        onChange={(e) => handleFieldChange('buildingName', e.target.value)}
                        type="text"
                        placeholder="Enter building name"
                        className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {errors.buildingName && <p className="text-red-600 text-sm mt-1">{errors.buildingName}</p>}
                    </div>
                  )}

                  {/* Flat / Unit Number */}
                  {formData.buildingType === 'Apartment' && (
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block font-semibold text-[#2E2E2E] mb-1">Flat / Unit Number *</label>
                      <input
                        value={formData.flatNumber}
                        onChange={(e) => handleFieldChange('flatNumber', e.target.value)}
                        type="text"
                        placeholder="Enter flat number"
                        className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {errors.flatNumber && <p className="text-red-600 text-sm mt-1">{errors.flatNumber}</p>}
                    </div>
                  )}

                  {/* Floor Number */}
                  {formData.buildingType === 'Apartment' && (
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block font-semibold text-[#2E2E2E] mb-1">Floor Number *</label>
                      <input
                        value={formData.floorNumber}
                        onChange={(e) => handleFieldChange('floorNumber', e.target.value)}
                        type="text"
                        placeholder="Enter floor number"
                        className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {errors.floorNumber && <p className="text-red-600 text-sm mt-1">{errors.floorNumber}</p>}
                    </div>
                  )}

                  {/* House Number */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block font-semibold text-[#2E2E2E] mb-1">House Number *</label>
                    <input
                      value={formData.houseNo}
                      onChange={(e) => handleFieldChange('houseNo', e.target.value)}
                      type="text"
                      placeholder="Enter house number"
                      className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    {errors.houseNo && <p className="text-red-600 text-sm mt-1">{errors.houseNo}</p>}
                  </div>

                  {/* Street Name */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block font-semibold text-[#2E2E2E] mb-1">Street Name *</label>
                    <input
                      value={formData.street}
                      onChange={(e) => {
                        const capitalizedValue = capitalizeFirstLetter(e.target.value);
                        handleFieldChange('street', capitalizedValue);
                      }}
                      type="text"
                      placeholder="Enter Street Name"
                      className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 capitalize"
                    />
                    {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
                  </div>

                  {/* City */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block font-semibold text-[#2E2E2E] mb-1">Nearest City *</label>
                    {loadingCities ? (
                      <div className="w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">Loading cities...</span>
                      </div>
                    ) : (
                      <CustomDropdown
                        options={cityOptions}
                        selectedValue={selectedCity?.id?.toString() || ''}
                        onSelect={(value) => {
                          const selectedCityData = cities.find(city => city.id.toString() === value);
                          if (selectedCityData) {
                            handleCitySelect(value, selectedCityData.city);
                          }
                        }}
                        placeholder="Select nearest city"
                        searchable={true}
                        searchPlaceholder="Type to search cities..."
                      />
                    )}
                    {errors.cityName && <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>}
                  </div>

                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block font-semibold text-[#2E2E2E] mb-1">Geo Location *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingSavedLocation(false);
                        setIsGeoModalOpen(true);
                      }}
                      className="w-full h-[39px] border-2 border-[#F2F4F7] bg-[#E6D9F5] rounded-lg flex items-center justify-center gap-2 text-[#3E206D] font-medium hover:bg-[#d9c9ed] transition-colors cursor-pointer"
                    >
                      <LocateFixed size={20} />
                      {formData.geoLatitude && formData.geoLongitude
                        ? 'Reattach My Geo Location'
                        : 'Attach My Geo Location'
                      }
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
                          Location attached: {formData.geoLatitude.toFixed(6)}, {formData.geoLongitude.toFixed(6)}
                        </p>

                        {/* View Here link - only show if this is from saved address */}
                        {usePreviousAddress && formData.geoLatitude && formData.geoLongitude && (
                          <button
                            type="button"
                            onClick={() => {
                              setViewingSavedLocation(true);
                              setIsGeoModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors text-sm font-medium group cursor-pointer"
                          >
                            <LocateFixed size={16} className="group-hover:scale-110 transition-transform" />
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
                    }}
                    onLocationSelect={handleLocationSelect}
                    initialCenter={
                      viewingSavedLocation && formData.geoLatitude && formData.geoLongitude
                        ? [formData.geoLatitude, formData.geoLongitude]
                        : mapCenter
                    }
                    savedLocation={
                      viewingSavedLocation && formData.geoLatitude && formData.geoLongitude
                        ? [formData.geoLatitude, formData.geoLongitude]
                        : null
                    }
                  />
                </div>


              )}

              <div className='border-t border-gray-300 my-6'></div>

              <h3 className='font-bold text-lg mb-4 text-[#252525]'>
                {formData.deliveryMethod === 'pickup' ? 'Schedule Pickup' : 'Schedule Delivery'}
              </h3>

              <div className='flex md:flex-row flex-col gap-4 mb-6'>
                <div className="md:w-1/2 w-full">
                  <style dangerouslySetInnerHTML={{
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
    `
                  }} />
                  <label className='block text-[#2E2E2E] font-semibold mb-4'>Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      className={`date-input w-full border h-[39px] border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 bg-white ${formData.deliveryDate ? 'has-value' : ''}`}
                      style={{
                        colorScheme: 'light',
                      }}
                      value={formData.deliveryDate}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        // Additional client-side validation
                        if (selectedValue) {
                          const selectedDate = new Date(selectedValue);
                          const today = new Date();
                          const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

                          selectedDate.setHours(0, 0, 0, 0);
                          minDate.setHours(0, 0, 0, 0);

                          if (selectedDate >= minDate) {
                            handleFieldChange('deliveryDate', selectedValue);
                          } else {
                            // Don't update the field value, just trigger validation error
                            handleFieldChange('deliveryDate', selectedValue);
                          }
                        } else {
                          handleFieldChange('deliveryDate', selectedValue);
                        }
                      }}
                      onClick={(e) => {
                        // Ensure the date picker opens on click (Chrome, Edge, Safari)
                        const target = e.target as HTMLInputElement;
                        if (target.showPicker && typeof target.showPicker === 'function') {
                          try {
                            target.showPicker();
                          } catch (error) {
                            // Silently fail if showPicker is not supported
                            console.log('showPicker not supported');
                          }
                        }
                      }}
                      min={getMinDate()}
                    />
                    {/* Show placeholder text when no date is selected - hidden in Firefox */}
                    {!formData.deliveryDate && (
                      <div className="custom-date-placeholder absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                        mm/dd/yyyy
                      </div>
                    )}
                  </div>
                  {errors.deliveryDate && <p className="text-red-600 text-sm mt-1">{errors.deliveryDate}</p>}
                </div>
                <div className="md:w-1/2 w-full">
                  <label className='block font-semibold mb-4'>Time Slot *</label>
                  <CustomDropdown
                    options={[
                      { value: 'Within 8AM - 2PM', label: 'Within 8AM - 2PM' },
                      { value: 'Within 2PM - 8PM', label: 'Within 2PM - 8PM' },
                    ]}
                    selectedValue={formData.timeSlot}
                    onSelect={(value) => handleFieldChange('timeSlot', value)}
                    placeholder="Select Time Slot"
                  />
                  {errors.timeSlot && <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>}
                </div>
              </div>
            </div>
            {/* Right Section - Order Summary */}
            <div className='w-full lg:w-1/3 mt-6 lg:mt-0'>
              <div className='border border-gray-300 rounded-lg shadow-md p-4 sm:p-5 md:p-6'>
                <h2 className='font-semibold text-lg mb-4'>Your Order </h2>

                <div className='flex justify-between items-center mb-3 sm:mb-4'>
                  <div className='flex items-center gap-2 sm:gap-3'>
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
                      {cartData?.totalItems || 0} {(cartData?.totalItems || 0) === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <p className='font-semibold'>Rs.{formatPrice(cartData?.grandTotal || 0)}</p>
                </div>

                <div className='border-t border-gray-300 my-4' />

                <div className='flex justify-between text-sm mb-2'>
                  <p className='text-gray-600'>Total</p>
                  <p className='font-semibold'>Rs.{formatPrice(cartData?.grandTotal || 0)}</p>
                </div>

                <div className='flex justify-between text-sm mb-2'>
                  <p className='text-gray-600'>Discount</p>
                  <p className='text-gray-600'>Rs.{formatPrice(cartData?.discountAmount || 0)}</p>
                </div>

                {formData.deliveryMethod === 'home' && (
                  <div className='flex justify-between text-sm mb-2'>
                    <p className='text-gray-600'>Delivery Charges</p>
                    <p className='text-gray-600'>Rs.{formatPrice(deliveryCharge)}</p>
                  </div>
                )}

                {formData.deliveryMethod === 'pickup' && (
                  <div className='flex justify-between text-sm mb-2'>
                  </div>
                )}

                <div className='border-t border-gray-300 my-4' />

                <div className='flex justify-between mb-4 text-[20px] text-[#414347]'>
                  <p className='font-semibold'>Grand Total</p>
                  <p className='font-semibold'>Rs.{formatPrice(calculateFinalTotal())}</p>
                </div>
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={!isFormValidState || isLoading}
                    className={`w-full font-semibold rounded-lg px-4 py-3 transition-colors ${!isFormValidState || isLoading
                      ? 'bg-[#EBEEF2] text-[#B1BAC3] cursor-not-allowed '
                      : 'bg-purple-800 text-white hover:bg-purple-900 cursor-pointer'
                      }`}
                  >
                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                  </button>

                  {/* Tooltip */}
                  {(!isFormValidState && !isLoading) && (
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

export default Page;