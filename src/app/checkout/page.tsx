'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import CustomDropdown from '../../components/home/CustomDropdown';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setFormData, resetFormData } from '../../store/slices/checkoutSlice';
import { useRouter } from 'next/navigation';
import SuccessPopup from '@/components/toast-messages/success-message-with-button';
import ErrorPopup from '@/components/toast-messages/error-message';
import { getForm } from '@/services/retail-service';
import { selectCartForOrder } from '../../store/slices/cartItemsSlice';
import { useSearchParams } from 'next/navigation';
import { getPickupCenters, PickupCenter } from '@/services/cart-service'
import dynamic from 'next/dynamic';

const OpenStreetMap = dynamic(() => import('@/components/open-map/OpenStreetMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface FormData {
  centerId: number | null, // Added centerId
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
}

interface FormErrors {
  centerId: string; // Added centerId
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
}

const initialFormState: FormData = {
  centerId: null,
  deliveryMethod: 'home', // This will be overridden by query params if present
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
  });

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

  const handleAddressOptionChange = async (value: string) => {
    if (value === 'previous') {
      console.log('fetching')
      setUsePreviousAddress(true);
      setFetching(true);

      try {
        const response = await getForm(token);


        if (response) {
          // const data = response;
          console.log('fetch data', response);

          setFormDataLocal(prev => ({
            ...prev,
            buildingNo: response.result.buildingNo || '',
            buildingType: response.result.buildingType || 'Apartment',
            cityName: response.result.city || '',
            houseNo: response.result.houseNo || '',
            phone1: response.result.phone1 || '',
            phone2: response.result.phone2 || '',
            phoneCode1: response.result.phonecode1 || '+94',
            phoneCode2: response.result.phonecode2 || '+94',
            street: response.result.streetName || '',
            title: response.result.title || '',
            buildingName: response.result.buildingName || '',
            flatNumber: response.result.unitNo || '',
            floorNumber: response.result.floorNo || '',
            fullName: response.result.fullName || '',
            scheduleType: 'One Time', // default
          }));
        }
      } catch (error: any) {
        console.error('Failed to fetch previous address data:', error);
        setErrorMsg(error.message || 'Failed to fetch form data.');
        setShowErrorPopup(true);
      } finally {
        setFetching(false);
      }
    } else {
      setUsePreviousAddress(false);
      setFormDataLocal(initialFormState);
    }
  };

  const handleCenterSelect = (centerId: string, centerName: string) => {
    const selectedCenter = pickupCenters.find(center => center.value === centerId);

    if (selectedCenter) {
      const centerIdAsNumber = parseInt(centerId, 10); // Convert string to number
      setSelectedPickupCenter({ id: centerIdAsNumber, name: centerName });
      setFormDataLocal(prev => ({ ...prev, centerId: centerIdAsNumber }));

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



  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    // Update the form state
    setFormDataLocal(prev => ({ ...prev, [field]: value }));

    // Validate the field with access to current form data
    const error = validateField(field, value, formData);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Special case: if deliveryMethod changes, revalidate all address fields and centerId
    if (field === 'deliveryMethod') {
      const addressFields = [
        'buildingType', 'buildingName', 'buildingNo',
        'street', 'cityName', 'houseNo',
        'floorNumber', 'flatNumber', 'centerId'
      ];

      addressFields.forEach(addressField => {
        const fieldValue = addressField === 'centerId'
          ? formData[addressField as keyof FormData]
          : formData[addressField as keyof FormData];

        const addressError = validateField(
          addressField as keyof FormData,
          fieldValue,
          { ...formData, deliveryMethod: value as string } // Updated deliveryMethod
        );
        setErrors(prev => ({ ...prev, [addressField]: addressError }));
      });
    }
  };

  const validateField = (field: keyof FormData, value: string | number | null, formData: FormData): string => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    const isHomeDelivery = formData.deliveryMethod === 'home';
    const isPickup = formData.deliveryMethod === 'pickup';
    const isApartment = formData.buildingType === 'Apartment';

    switch (field) {
      case 'centerId':
        return isPickup && (value === null || value === undefined) ? 'Please select a pickup center.' : '';

      case 'fullName':
        if (!trimmed) return 'Full Name is required.';
        if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Full Name must only contain letters and spaces.';
        return '';

      case 'title':
        return !trimmed ? 'Title is required.' : '';

      case 'phone1':
        if (!value) return 'Phone number 1 is required.';
        if (!/^\d{9}$/.test(value.toString())) return 'Please enter a valid phone number';
        return '';

      case 'phone2':
        return value && !/^\d{9}$/.test(value.toString()) ? 'Please enter a valid phone number' : '';

      case 'timeSlot':
        return !trimmed ? 'Time slot is required.' : '';

      case 'deliveryDate':
        return !value ? 'Delivery Date is required.' : '';

      // Address fields - conditionally required
      case 'buildingType':
        return isHomeDelivery && !trimmed ? 'Building type is required.' : '';

      case 'buildingName':
      case 'buildingNo':
      case 'floorNumber':
      case 'flatNumber':
        // Only required for apartment and home delivery
        return isHomeDelivery && isApartment && !trimmed ?
          `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.` :
          '';

      case 'street':
      case 'cityName':
      case 'houseNo':
        // Required for both house and apartment when home delivery
        return isHomeDelivery && !trimmed ?
          `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.` :
          '';

      default:
        return '';
    }
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
          };
        } else if (formData.buildingType === 'House') {
          dataToSubmit = {
            ...dataToSubmit,
            buildingType: formData.buildingType,
            houseNo: formData.houseNo,
            street: formData.street,
            cityName: formData.cityName,
          };
        }
      } else if (formData.deliveryMethod === 'pickup') {
        // Include centerId for pickup delivery
        dataToSubmit = {
          ...dataToSubmit,
          centerId: formData.centerId,
        };
      }

      dispatch(resetFormData());
      dispatch(setFormData(dataToSubmit));
      console.log('submitting', dataToSubmit);

      setSuccessMsg('Check out successfull!');
      setShowSuccessPopup(true);

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
                <div className="w-full md:w-[32%]">
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
                      <label className="flex items-center text-nowrap text-sm md:text-base">
                        <input
                          type="radio"
                          name="addressMode"
                          value="previous"
                          checked={usePreviousAddress}
                          onChange={() => handleAddressOptionChange('previous')}
                          className="mr-2 accent-[#3E206D]"
                        />
                        Your Last Order Address
                      </label>

                      <label className="flex items-center text-nowrap text-sm md:text-base">
                        <input
                          type="radio"
                          name="addressMode"
                          value="new"
                          checked={!usePreviousAddress}
                          onChange={() => handleAddressOptionChange('new')}
                          className="mr-2 accent-[#3E206D]"
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
                      pickupCenters={pickupCenters} // Pass centers to map component
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
                <div className="w-1/4 md:w-1/9">
                  <label htmlFor="title" className='block font-semibold mb-1 text-[#2E2E2E]'>Title *</label>
                  <div className="w-full">
                    <CustomDropdown
                      options={[
                        { value: 'Mr', label: 'Mr' },
                        { value: 'Ms', label: 'Ms' },
                      ]}
                      selectedValue={formData.title}
                      onSelect={(value) => handleFieldChange('title', value)}
                      placeholder="Title"
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                  </div>
                </div>

                {/* Full name input */}
                <div className="w-3/4 md:w-8/9">
                  <label htmlFor="fullName" className='block font-semibold mb-1 text-[#2E2E2E]'>Full name *</label>
                  <input
                    type="text"
                    className='w-full border-2 border-[#F2F4F7] bg-[#F9FAFB] h-[39px] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-3 text-base'
                    placeholder='Enter your full name'
                    value={formData.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
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
                        className='w-full h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 text-[#808FA2]'
                        value={formData.phone1}
                        onChange={(e) => handleFieldChange('phone1', e.target.value)}
                        placeholder='7xxxxxxxx'
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
                          { value: '94', label: '+94' },
                          { value: '91', label: '+91' },
                          { value: '1', label: '+1' }
                        ]}
                        selectedValue={formData.phoneCode2}
                        onSelect={(value) => handleFieldChange('phoneCode2', value)}
                        placeholder="+94"
                      />
                    </div>
                    <div className="w-full">
                      <input
                        type="text"
                        className='w-full  h-[39px] border-2 border-[#F2F4F7] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 text-[#808FA2]'
                        value={formData.phone2}
                        onChange={(e) => handleFieldChange('phone2', e.target.value)}
                        placeholder='7xxxxxxxx'
                      />
                      {errors.phone2 && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone2}</p>
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
                      onChange={(e) => handleFieldChange('street', e.target.value)}
                      type="text"
                      placeholder="Enter Street Name"
                      className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
                  </div>

                  {/* City */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block font-semibold text-[#2E2E2E] mb-1">Nearest City *</label>
                    <input
                      value={formData.cityName}
                      onChange={(e) => handleFieldChange('cityName', e.target.value)}
                      type="text"
                      placeholder="Enter Nearest City"
                      className="w-full px-4 py-2 border-2 h-[39px] border-[#F2F4F7] bg-[#F9FAFB] rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    {errors.cityName && <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>}
                  </div>
                </div>
              )}

              <div className='border-t border-gray-300 my-6'></div>

              <h3 className='font-bold text-lg mb-4 text-[#252525]'>
                {formData.deliveryMethod === 'pickup' ? 'Schedule Pickup' : 'Schedule Delivery'}
              </h3>

              <div className='flex md:flex-row flex-col gap-4 mb-6'>
                <div className="md:w-1/2 w-full">
                  <label className='block text-[#2E2E2E] font-semibold mb-4'>Date *</label>
                  <input
                    type="date"
                    className='w-full border h-[39px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 text-[#3D3D3D]'
                    value={formData.deliveryDate}
                    onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                  />
                  {errors.deliveryDate && <p className="text-red-600 text-sm mt-1">{errors.deliveryDate}</p>}
                </div>
                <div className="md:w-1/2 w-full">
                  <label className='block font-semibold mb-4'>Time Slot *</label>
                  <CustomDropdown
                    options={[
                      { value: 'Within 8-12 PM', label: 'Within 8 - 12 PM' },
                      { value: 'Within 12-4 PM', label: 'Within 12 - 4 PM' },
                      { value: 'Within  4-8 PM', label: 'Within 4 - 8 PM' },
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

                <div className='flex justify-between items-center mb-4'>
                  <p className="text-gray-600">{cartData?.totalItems || 0} items</p>
                  <p className='font-semibold'>Rs.{cartData?.grandTotal || 0}</p>
                </div>

                <div className='border-t border-gray-300 my-4' />

                <div className='flex justify-between text-sm mb-2'>
                  <p className='text-gray-600'>Total</p>
                  <p className='font-semibold'>Rs.{cartData?.grandTotal || 0}</p>
                </div>

                <div className='flex justify-between text-sm mb-2'>
                  <p className='text-gray-600'>Discount</p>
                  <p className='text-gray-600'>Rs.{cartData?.discountAmount || 0}</p>
                </div>

                <div className='flex justify-between text-sm mb-2'>
                  <p className='text-gray-600'>Delivery Charges</p>
                  <p className='text-gray-600'>Rs.185.00</p>
                </div>

                <div className='border-t border-gray-300 my-4' />

                <div className='flex justify-between mb-4 text-[20px] text-[#414347]'>
                  <p className='font-semibold'>Grand Total</p>
                  <p className='font-semibold'>Rs.{(cartData?.finalTotal || 0) + 185}</p>
                </div>

                <button type="submit" className='w-full bg-purple-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-900 transition-colors'>
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;