
'use client';

import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { fetchBillingDetails, saveBillingDetails, BillingDetails, BillingAddress } from '@/services/auth-service';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';

type BillingFormData = {
  billingTitle: string;
  billingName: string;
  title: string;
  firstName: string;
  lastName: string;
  houseNo: string;
  buildingType: string;
  apartmentName?: string;
  flatNumber?: string;
  houseStreet: string;
  houseCity: string;
  apartmentStreet: string;
  apartmentCity: string;
  phonecode1: string;
  phone1: string;
  phonecode2?: string;
  phone2?: string;
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  // State for popup notifications
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BillingFormData>({
    defaultValues: {
      billingTitle: 'Mr.',
      billingName: '',
      title: 'Mr.',
      firstName: '',
      lastName: '',
      houseNo: '',
      buildingType: '',
      apartmentName: '',
      flatNumber: '',
      houseStreet: '',
      houseCity: '',
      apartmentStreet: '',
      apartmentCity: '',
      phonecode1: '+94',
      phone1: '',
      phonecode2: '+94',
      phone2: '',
    },
    mode: 'onChange',
  });

  const buildingType = watch('buildingType');

  // Clear apartment or house fields based on buildingType
  useEffect(() => {
    if (buildingType.toLowerCase() !== 'apartment') {
      setValue('apartmentName', '');
      setValue('flatNumber', '');
      setValue('apartmentStreet', '');
      setValue('apartmentCity', '');
    } else {
      setValue('houseStreet', '');
      setValue('houseCity', '');
    }
  }, [buildingType, setValue]);

  // Fetch billing details
  useEffect(() => {
    const loadBillingDetails = async () => {
      if (!token) return;

      try {
        const data = await fetchBillingDetails({ token });
        reset({
          billingTitle: data.billingTitle || 'Mr.',
          billingName: data.billingName || '',
          title: data.title || 'Mr.',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          buildingType: data.buildingType ? data.buildingType.toLowerCase() : '',
          houseNo: data.address?.houseNo || data.address?.buildingNo || '',
          apartmentName: data.address?.buildingName || '',
          flatNumber: data.address?.unitNo || '',
          houseStreet: data.buildingType?.toLowerCase() === 'house' ? data.address?.streetName || '' : '',
          houseCity: data.buildingType?.toLowerCase() === 'house' ? data.address?.city || '' : '',
          apartmentStreet: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.streetName || '' : '',
          apartmentCity: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.city || '' : '',
          phonecode1: data.phoneCode || '+94',
          phone1: data.phoneNumber || '',
          phonecode2: '+94',
          phone2: '',
        });
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch billing details');
        setShowErrorPopup(true);
      }
    };

    loadBillingDetails();
  }, [token, reset]);

  const onSubmit = async (data: BillingFormData) => {
    if (!token) {
      setErrorMessage('You are not authenticated. Please login first.');
      setShowErrorPopup(true);
      return;
    }

    // Validate billingTitle
    if (!data.billingTitle || !['Mr.', 'Ms.', 'Mrs.'].includes(data.billingTitle)) {
      setErrorMessage('Please select a valid billing title (Mr., Ms., or Mrs.).');
      setShowErrorPopup(true);
      return;
    }

    const address: BillingAddress = {
      title: data.title || data.billingTitle,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneCode: data.phonecode1 || '+94',
      phoneNumber: data.phone1 || '',
      houseNo: data.buildingType.toLowerCase() === 'house' ? data.houseNo || undefined : undefined,
      buildingNo: data.buildingType.toLowerCase() === 'apartment' ? data.houseNo || undefined : undefined,
      buildingName: data.buildingType.toLowerCase() === 'apartment' ? data.apartmentName || undefined : undefined,
      unitNo: data.buildingType.toLowerCase() === 'apartment' ? data.flatNumber || undefined : undefined,
      floorNo: null,
      streetName:
        data.buildingType.toLowerCase() === 'house'
          ? data.houseStreet || undefined
          : data.buildingType.toLowerCase() === 'apartment'
          ? data.apartmentStreet || undefined
          : undefined,
      city:
        data.buildingType.toLowerCase() === 'house'
          ? data.houseCity || undefined
          : data.buildingType.toLowerCase() === 'apartment'
          ? data.apartmentCity || undefined
          : undefined,
    };

    const billingDetails: BillingDetails = {
      billingTitle: data.billingTitle,
      billingName: data.billingName || '',
      title: data.title || data.billingTitle,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneCode: data.phonecode1 || '+94',
      phoneNumber: data.phone1 || '',
      buildingType: data.buildingType.toLowerCase() || '',
      address,
    };

    try {
      await saveBillingDetails({ token, data: billingDetails });
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save billing details');
      setShowErrorPopup(true);
    }
  };

  return (
    <div className="relative z-50">
      {/* Popup Notifications */}
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

      <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
        <h2 className="font-medium text-base sm:text-lg md:text-xl mb-2 mt-2">Account Details</h2>
        <p className="text-xs md:text-sm lg:text-sm text-[#626D76] mb-2">
          Real-time information and updates for your billing details.
        </p>
        <div className="border-t border-[#626D76] mb-6 mt-1" />

        <h2 className="font-medium text-base sm:text-lg md:text-xl mb-4">Billing Information</h2>

        <div className="md:w-[90%]">
          <div className="flex gap-4 md:gap-8">
            {/* Billing Title */}
            <div className="w-[10%] min-w-[70px]">
              <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
                Billing Title
              </label>
              <div className="relative">
                <select
                  {...register('billingTitle', { required: 'Billing Title is required' })}
                  className="appearance-none block w-full border rounded-lg border-[#CECECE] py-2 px-4 pr-8 text-xs sm:text-sm h-[42px]"
                  defaultValue="Mr."
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
              <p className="text-red-500 text-xs">{errors.billingTitle?.message}</p>
            </div>

            {/* Billing Name */}
            <div className="w-[90%]">
              <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
                Billing Name
              </label>
              <input
                {...register('billingName', { required: 'Billing Name is required' })}
                className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
              />
              <p className="text-red-500 text-xs">{errors.billingName?.message}</p>
            </div>
          </div>
        </div>

        <div className=" border-t border-[#BDBDBD] my-6" />
        <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Currently Saved Address</h2>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
          {/* Building Type */}
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-[#626D76] mb-1">Building Type</label>
            <div className="relative">
              <select
                {...register('buildingType', { required: 'Building type is required' })}
                className="border border-[#CECECE] rounded p-2 pr-4 px-8 w-full text-sm h-[42px] appearance-none"
              >
                <option value=" disabled=">
                  Select Building Type
                </option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
              </select>
              <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>
            <p className="text-red-500 text-xs">{errors.buildingType?.message}</p>
          </div>

          {/* House No or Building No */}
            <div className="w-full lg:w-1/2">
              <label className="block text-sm sm font-medium text-[#626D76] mb-1">
                {buildingType.toLowerCase() === 'house' ? 'House No' : 'Building No'}
              </label>
              <input
                {...register('houseNo')} // Removed required validation
                className="border border-[#CECECE] rounded p-2 w-full text-sm"
              />
              <p className="text-red-500 text-xs">{errors.houseNo?.message}</p>
            </div>
          </div>

          {/* Apartment-specific fields */}
          {buildingType.toLowerCase() === 'apartment' && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">Apartment or Building Name</label>
                <input
                  {...register('apartmentName')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.apartmentName?.message}</p>
              </div>

              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">Flat/Unit Number</label>
                <input
                  {...register('flatNumber')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.flatNumber?.message}</p>
              </div>
            </div>
          )}

          {/* Address fields based on buildingType */}
          {buildingType.toLowerCase() === 'house' && (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">House Street Name</label>
                <input
                  {...register('houseStreet')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.houseStreet?.message}</p>
              </div>

              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">House City</label>
                <input
                  {...register('houseCity')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.houseCity?.message}</p>
              </div>
            </div>
          )}

          {buildingType.toLowerCase() === 'apartment' && (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">Apartment Street Name</label>
                <input
                  {...register('apartmentStreet')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.apartmentStreet?.message}</p>
              </div>

              <div className="w-full lg:w-1/2">
                <label className="block text-sm font-medium text-[#626D76] mb-1">Apartment City</label>
                <input
                  {...register('apartmentCity')} // Removed required validation
                  className="border border-[#CECECE] rounded p-2 w-full text-sm"
                />
                <p className="text-red-500 text-xs">{errors.apartmentCity?.message}</p>
              </div>
            </div>
          )}

          <div className="border-t border-[#BDBDBD] my-8" />
          <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Contact</h2>
          <p className="text-xs md:text-sm text-[#626D76] mb-6">Manage your account phone numbers for invoices.</p>

          <div className="flex flex-col lg:flex-row gap-y-1 lg:gap-x-2">
            {[1, 2].map((num) => (
              <div key={num} className="flex flex-col w-full md:w-[48.5%]">
                <label className="block text-sm font-medium text-[#626D76] mb-1">
                  Phone Number {num}
                </label>
                <div className="flex gap-4">
                  <div className="relative w-[25%] md:w-[14%] min-w-[70px]">
                    <select
                      {...register(`phonecode${num}` as 'phonecode1' | 'phonecode2', {
                        required: num === 1 ? 'Phone code is required' : false,
                      })}
                      className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] pr-8 text-sm"
                    >
                      <option value="+94">+94</option>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                  </div>

                  <div className="w-[70%] lg:w-[65%]">
                    <input
                      type="text"
                      {...register(`phone${num}` as 'phone1' | 'phone2', {
                        required: num === 1 ? 'Phone number is required' : false,
                        pattern: {
                          value: /^[0-9]{7,10}$/,
                          message: 'Enter a valid number (7-10 digits)',
                        },
                      })}
                      className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-sm"
                      placeholder="7XXXXXXXX"
                      inputMode="numeric"
                      onKeyDown={(e) => {
                        const invalidKeys = ['e', 'E', '+', '-', '.', ','];
                        if (invalidKeys.includes(e.key)) e.preventDefault();
                      }}
                    />
                    <p className="text-red-500 text-xs">
                      {errors[`phone${num}` as 'phone1' | 'phone2']?.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              className="w-[90px] h-[36px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]"
              onClick={() => reset()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-[90px] h-[36px] text-sm rounded-lg text-white ${
                isValid ? 'bg-[#3E206D] hover:bg-[#341a5a]' : 'bg-gray-400 cursor-not-allowed'
              } mb-4`}
              disabled={!isValid}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
};

export default BillingDetailsForm;