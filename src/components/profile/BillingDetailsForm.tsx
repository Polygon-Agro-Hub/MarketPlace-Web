'use client';

import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { fetchBillingDetails, saveBillingDetails, BillingDetails, BillingAddress } from '@/services/auth-service';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';
import Loader from '@/components/loader-spinner/Loader'; // Import the new Loader component


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
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  // State for popup notifications and loader
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [billingNameError, setBillingNameError] = useState('');
  const [initialFormData, setInitialFormData] = useState<BillingFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Static list of cities for dropdown
  const cities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura'];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
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
      apartmentFloor: '',
      apartmentHouseNo: '',
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
  const phone1 = watch('phone1');
  const phonecode1 = watch('phonecode1');
  const phone2 = watch('phone2');
  const phonecode2 = watch('phonecode2');

  // Clear fields based on buildingType
  useEffect(() => {
    if (buildingType.toLowerCase() !== 'apartment') {
      setValue('apartmentName', '');
      setValue('flatNumber', '');
      setValue('apartmentFloor', '');
      setValue('apartmentHouseNo', '');
      setValue('apartmentStreet', '');
      setValue('apartmentCity', '');
    }
    if (buildingType.toLowerCase() !== 'house') {
      setValue('houseStreet', '');
      setValue('houseCity', '');
    }
    if (!buildingType) {
      setValue('houseNo', '');
    }
  }, [buildingType, setValue]);

  // Fetch billing details and store initial data
  useEffect(() => {
    const loadBillingDetails = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const data = await fetchBillingDetails({ token });
        const formData: BillingFormData = {
          billingTitle: data.billingTitle || 'Mr.',
          billingName: data.billingName || '',
          title: data.title || 'Mr.',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          buildingType: data.buildingType ? data.buildingType.toLowerCase() : '',
          houseNo: data.address?.houseNo || data.address?.buildingNo || '',
          apartmentName: data.address?.buildingName || '',
          flatNumber: data.address?.unitNo || '',
          apartmentFloor: data.address?.floorNo || '',
          apartmentHouseNo: data.address?.houseNo || '',
          houseStreet: data.buildingType?.toLowerCase() === 'house' ? data.address?.streetName || '' : '',
          houseCity: data.buildingType?.toLowerCase() === 'house' ? data.address?.city || '' : '',
          apartmentStreet: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.streetName || '' : '',
          apartmentCity: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.city || '' : '',
          phonecode1: data.phoneCode || '+94',
          phone1: data.phoneNumber || '',
          phonecode2: '+94',
          phone2: '',
        };
        setInitialFormData(formData);
        reset(formData);
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch billing details');
        setShowErrorPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadBillingDetails();
  }, [token, reset]);

  const onSubmit = async (data: BillingFormData) => {
    setIsLoading(true); // Show loader immediately

    // Trigger validation for all fields
    await trigger();

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    if (!token) {
      setErrorMessage('You are not authenticated. Please login first.');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (!data.billingTitle || !['Rev.', 'Mr.', 'Ms.', 'Mrs.'].includes(data.billingTitle)) {
      setErrorMessage('Please select a valid billing title (Rev., Mr., Ms., or Mrs.).');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    const address: BillingAddress = {
      title: data.title || data.billingTitle,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneCode: data.phonecode1 || '+94',
      phoneNumber: data.phone1 || '',
      houseNo: data.buildingType.toLowerCase() === 'house' ? data.houseNo || undefined : data.buildingType.toLowerCase() === 'apartment' ? data.apartmentHouseNo || undefined : undefined,
      buildingNo: data.buildingType.toLowerCase() === 'apartment' ? data.houseNo || undefined : undefined,
      buildingName: data.buildingType.toLowerCase() === 'apartment' ? data.apartmentName || undefined : undefined,
      unitNo: data.buildingType.toLowerCase() === 'apartment' ? data.flatNumber || undefined : undefined,
      floorNo: data.buildingType.toLowerCase() === 'apartment' ? data.apartmentFloor || undefined : undefined,
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
      buildingType: data.buildingType?.toLowerCase() || '',
      address,
    };

    try {
      await saveBillingDetails({ token, data: billingDetails });
      setInitialFormData(data);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save billing details');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleBillingNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isNumber = /[0-9]/.test(e.key);
    const isInvalidChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(e.key);
    if (isNumber) {
      setBillingNameError('Numbers are not allowed in Billing Name');
      setTimeout(() => setBillingNameError(''), 2000);
      e.preventDefault();
    } else if (isInvalidChar && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidKeys = ['e', 'E', '+', '-', '.', ','];
    if (invalidKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleCancel = () => {
    setIsLoading(true); // Show loader immediately
    if (initialFormData) {
      reset(initialFormData);
    }
    setTimeout(() => {
      setIsLoading(false); // Hide loader
      setShowCancelSuccessPopup(true); // Show cancel feedback
      setTimeout(() => {
        setShowCancelSuccessPopup(false);
      }, 3000);
    }, 500); // Simulate async reset
  };

  return (
    <div className="relative z-50">
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

      <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
        <h2 className="font-medium text-[14px] md:text-[18px] mb-2 mt-2">Account Details</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-2">
          Real-time information and updates for your billing details.
        </p>
        <div className="border-t border-[#626D76] mb-6 mt-1" />

        <h2 className="font-medium text-[14px] md:text-[18px] mb-4">Billing Information</h2>

        <div className="md:w-[90%]">
          <div className="flex gap-4 md:gap-8">
            <div className="w-[10%] min-w-[70px]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Billing Title
              </label>
              <div className="relative">
                <select
                  {...register('billingTitle', { required: 'Billing Title is required' })}
                  className="appearance-none cursor-pointer block w-full border rounded-lg border-[#CECECE] py-2 px-4 pr-8 text-[12px] md:text-[14px] h-[42px]"
                  defaultValue="Mr."
                >
                  <option value="Rev.">Rev.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
              <p className="text-red-500 text-xs">{errors.billingTitle?.message}</p>
            </div>

            <div className="w-[90%]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Billing Name
              </label>
              <input
                {...register('billingName', {
                  required: 'Billing Name is required',
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: 'Billing Name must contain only letters and spaces',
                  },
                })}
                className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                onKeyDown={handleBillingNameKeyDown}
              />
              {billingNameError && <p className="text-red-500 text-xs">{billingNameError}</p>}
              <p className="text-red-500 text-xs">{errors.billingName?.message}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#BDBDBD] my-6" />
        <h2 className="font-medium text-[14px] md:text-[18px] mb-1">Currently Saved Address</h2>

       <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
  <div className="w-full lg:w-1/2">
    <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
      Building Type
    </label>
    <div className="relative">
      <select
        {...register('buildingType')}
        className="border border-[#CECECE] rounded px-4 pr-10 w-full text-[12px] md:text-[14px] h-[42px] cursor-pointer appearance-none truncate"
        style={{ maxWidth: '100%' }}
      >
        <option value="">Select Building Type</option>
        <option value="house">House</option>
        <option value="apartment">Apartment</option>
      </select>
      <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
    </div>
    <p className="text-red-500 text-xs">{errors.buildingType?.message}</p>
  </div>

  {/* Second field is always rendered but invisible if no buildingType */}
  <div className={`w-full lg:w-1/2 ${!buildingType ? 'invisible' : 'visible'}`}>
    <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
      {buildingType?.toLowerCase() === 'house' ? 'House No' : 'Building No'}
    </label>
    <input
      {...register('houseNo')}
      className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
    />
    <p className="text-red-500 text-xs">{errors.houseNo?.message}</p>
  </div>
</div>


        {buildingType.toLowerCase() === 'apartment' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Apartment or Building Name
              </label>
              <input
                {...register('apartmentName')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.apartmentName?.message}</p>
            </div>

            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Flat/Unit Number
              </label>
              <input
                {...register('flatNumber')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.flatNumber?.message}</p>
            </div>
          </div>
        )}

        {buildingType.toLowerCase() === 'apartment' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Floor Number
              </label>
              <input
                {...register('apartmentFloor')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.apartmentFloor?.message}</p>
            </div>

            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                House Number
              </label>
              <input
                {...register('apartmentHouseNo')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.apartmentHouseNo?.message}</p>
            </div>
          </div>
        )}

        {buildingType.toLowerCase() === 'house' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Street Name
              </label>
              <input
                {...register('houseStreet')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.houseStreet?.message}</p>
            </div>

            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Nearest City
              </label>
              <div className="relative">
                <select
                  {...register('houseCity')}
                  className="appearance-none cursor-pointer block w-full border rounded-lg border-[#CECECE] py-2 px-4 pr-8 text-[12px] md:text-[14px] h-[42px]"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
              <p className="text-red-500 text-xs">{errors.houseCity?.message}</p>
            </div>
          </div>
        )}

        {buildingType.toLowerCase() === 'apartment' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Street Name
              </label>
              <input
                {...register('apartmentStreet')}
                className="border border-[#CECECE] rounded p-2 w-full text-[12px] md:text-[14px]"
              />
              <p className="text-red-500 text-xs">{errors.apartmentStreet?.message}</p>
            </div>

            <div className="w-full lg:w-1/2">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Nearest City
              </label>
              <div className="relative">
                <select
                  {...register('apartmentCity')}
                  className="appearance-none cursor-pointer block w-full border rounded-lg border-[#CECECE] py-2 px-4 pr-8 text-[12px] md:text-[14px] h-[42px]"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
              <p className="text-red-500 text-xs">{errors.apartmentCity?.message}</p>
            </div>
          </div>
        )}

        <div className="border-t border-[#BDBDBD] my-8" />
        <h2 className="font-medium text-[14px] md:text-[18px] mb-1">Contact</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">Manage your account phone numbers for invoices.</p>

        <div className="flex flex-col lg:flex-row gap-y-1 lg:gap-x-2">
          {[1, 2].map((num) => (
            <div key={num} className="flex flex-col w-full md:w-[48.5%]">
              <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                Phone Number {num}
              </label>
              <div className="flex gap-4">
                <div className="relative w-[25%] md:w-[14%] min-w-[70px]">
                  <select
                    {...register(`phonecode${num}` as 'phonecode1' | 'phonecode2', {
                      required: num === 1 ? 'Phone code is required' : false,
                    })}
                    className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] pr-8 text-[12px] md:text-[14px]"
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
                        value: /^[0-9]{9}$/,
                        message: 'Enter a valid number (9 digits)',
                      },
                      validate: num === 2 ? {
                        notDuplicate: (value) =>
                          !value || !phone1 || phonecode1 !== phonecode2 || value !== phone1 || 'Phone numbers cannot be the same',
                      } : undefined,
                    })}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                    placeholder="7XXXXXXXX"
                    inputMode="numeric"
                    maxLength={9}
                    onKeyDown={handlePhoneKeyDown}
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
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] cursor-pointer text-[16px] md:text-[20px] font-medium rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px]  cursor-pointer mb-4 text-[16px] md:text-[20px] font-medium rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingDetailsForm;