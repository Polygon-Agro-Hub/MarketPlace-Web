

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler, UseFormRegister, FieldErrors, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { FaAngleDown } from 'react-icons/fa';
import { fetchBillingDetails, saveBillingDetails, BillingDetails, BillingAddress } from '@/services/auth-service';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';
import Loader from '@/components/loader-spinner/Loader';

// Define form data type
type BillingFormData = {
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
};

// Custom Dropdown Component
interface CustomDropdownProps {
  register: UseFormRegister<BillingFormData>;
  setValue: UseFormSetValue<BillingFormData>;
  name: keyof BillingFormData;
  value: string | undefined;
  errors?: FieldErrors<BillingFormData>;
  options: { value: string; label: string }[];
  placeholder: string;
}

const CustomDropdown = ({ register, setValue, name, value, errors, options, placeholder }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setValue(name, optionValue, { shouldValidate: true });
    console.log(`Set ${name} to:`, optionValue);
    setIsOpen(false);
  };

  console.log(`${name} value:`, value);
  console.log(`${name} options:`, options);

  return (
    <div className="relative cursor-pointer" ref={dropdownRef}>
      <input type="hidden" {...register(name)} />
      <div
        className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px] pr-8 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value && options.find((opt) => opt.value === value)?.label || placeholder}</span>
        <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-[#CECECE] rounded-lg mt-1">
          <li
            className="p-2 text-[12px] md:text-[14px] cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </li>
          {options.map((option) => (
            <li
              key={option.value}
              className="p-2 text-[12px] md:text-[14px] cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
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

const CancelSuccessPopup = ({ isVisible, onClose, title, duration }: CancelSuccessPopupProps) => {
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

  // Options for dropdowns
  const billingTitleOptions = [
    { value: 'Rev.', label: 'Rev.' },
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Mrs.', label: 'Mrs.' },
  ];

  const buildingTypeOptions = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
  ];

  const cityOptions = [
    ...cities.map((city) => ({ value: city.toLowerCase(), label: city })), // Normalize to lowercase
  ];

  const phoneCodeOptions = [
    { value: '+94', label: '+94' },
    { value: '+91', label: '+91' },
    { value: '+1', label: '+1' },
    { value: '+44', label: '+44' },
  ];

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
      billingTitle: '',
      billingName: '',
      title: 'Mr.',
      firstName: '',
      lastName: '',
      houseNo: '',
      buildingNo: '',
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

  // Watch form values for dropdowns
  const buildingType = watch('buildingType');
  const billingTitleValue = watch('billingTitle');
  const houseCityValue = watch('houseCity');
  const apartmentCityValue = watch('apartmentCity');
  const phonecode1Value = watch('phonecode1');
  const phonecode2Value = watch('phonecode2');

  // Log buildingType for debugging
  useEffect(() => {
    console.log('buildingType changed:', buildingType);
  }, [buildingType]);

  // Clear fields based on buildingType
  useEffect(() => {
    if (buildingType !== 'apartment') {
      setValue('apartmentName', '');
      setValue('flatNumber', '');
      setValue('apartmentFloor', '');
      setValue('apartmentHouseNo', '');
      setValue('apartmentStreet', '');
      setValue('apartmentCity', '');
    }
    if (buildingType !== 'house') {
      setValue('houseNo', '');
      setValue('houseStreet', '');
      setValue('houseCity', '');
    }
    if (!buildingType) {
      setValue('houseNo', '');
      setValue('buildingNo', '');
    }
  }, [buildingType, setValue]);

  // Fetch billing details and store initial data
  useEffect(() => {
    const loadBillingDetails = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const data = await fetchBillingDetails({ token });
        console.log('API Response:', data);
        const formData: BillingFormData = {
          billingTitle: data.billingTitle || '',
          billingName: data.billingName || '',
          title: data.title || 'Mr.',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          buildingType: data.buildingType ? data.buildingType.toLowerCase() : '',
          houseNo: data.buildingType?.toLowerCase() === 'house' ? data.address?.houseNo || '' : '',
          buildingNo: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.buildingNo || '' : '',
          apartmentName: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.buildingName || '' : '',
          flatNumber: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.unitNo || '' : '',
          apartmentFloor: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.floorNo || '' : '',
          apartmentHouseNo: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.houseNo || '' : '',
          houseStreet: data.buildingType?.toLowerCase() === 'house' ? data.address?.streetName || '' : '',
          houseCity: data.buildingType?.toLowerCase() === 'house' ? data.address?.city?.toLowerCase() || '' : '',
          apartmentStreet: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.streetName || '' : '',
          apartmentCity: data.buildingType?.toLowerCase() === 'apartment' ? data.address?.city?.toLowerCase() || '' : '',
          phonecode1: data.phoneCode || '+94',
          phone1: data.phoneNumber || '',
          phonecode2: data.phoneCode2 || '+94',
          phone2: data.phoneNumber2 || '',
        };
        setInitialFormData(formData);
        reset(formData);
        console.log('Form state after reset:', getValues());
        setValue('buildingType', formData.buildingType); // Ensure buildingType is set
      } catch (error: any) {
        console.error('Fetch error:', error);
        setErrorMessage(error.message || 'Failed to fetch billing details');
        setShowErrorPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadBillingDetails();
  }, [token, reset, setValue, getValues]);

  const onSubmit: SubmitHandler<BillingFormData> = async (data) => {
    setIsLoading(true);

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
      phoneCode2: data.phonecode2 || '+94',
      phoneNumber2: data.phone2 || '',
      houseNo: data.buildingType === 'house' ? data.houseNo || undefined : data.buildingType === 'apartment' ? data.apartmentHouseNo || undefined : undefined,
      buildingNo: data.buildingType === 'apartment' ? data.buildingNo || undefined : undefined,
      buildingName: data.buildingType === 'apartment' ? data.apartmentName || undefined : undefined,
      unitNo: data.buildingType === 'apartment' ? data.flatNumber || undefined : undefined,
      floorNo: data.buildingType === 'apartment' ? data.apartmentFloor || undefined : undefined,
      streetName: data.buildingType === 'house' ? data.houseStreet || undefined : data.buildingType === 'apartment' ? data.apartmentStreet || undefined : undefined,
      city: data.buildingType === 'house' ? data.houseCity || undefined : data.buildingType === 'apartment' ? data.apartmentCity || undefined : undefined,
    };

    const billingDetails: BillingDetails = {
      billingTitle: data.billingTitle,
      billingName: data.billingName || '',
      title: data.title || data.billingTitle,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneCode: data.phonecode1 || '+94',
      phoneNumber: data.phone1 || '',
      phoneCode2: data.phonecode2 || '+94',
      phoneNumber2: data.phone2 || '',
      buildingType: data.buildingType || '',
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
      setIsLoading(false);
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
    setIsLoading(true);
    if (initialFormData) {
      reset(initialFormData);
      setValue('buildingType', initialFormData.buildingType); // Ensure buildingType is reset
    }
    setTimeout(() => {
      setIsLoading(false);
      setShowCancelSuccessPopup(true);
      setTimeout(() => {
        setShowCancelSuccessPopup(false);
      }, 3000);
    }, 500);
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
      <CancelSuccessPopup
        isVisible={showCancelSuccessPopup}
        onClose={() => setShowCancelSuccessPopup(false)}
        title="Form reset successfully!"
        duration={3000}
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
        <h2 className="font-medium text-[14px] md:text-[18px] mb-4">Currently Saved Address</h2>

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

            {buildingType === 'house' && (
              <div className="w-full lg:w-1/2">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                  House No
                </label>
                <input
                  {...register('houseNo')}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                />
                <p className="text-red-500 text-xs">{errors.houseNo?.message}</p>
              </div>
            )}

            {buildingType === 'apartment' && (
              <div className="w-full lg:w-1/2">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                  Building No
                </label>
                <input
                  {...register('buildingNo')}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                />
                <p className="text-red-500 text-xs">{errors.buildingNo?.message}</p>
              </div>
            )}
          </div>

          {buildingType === 'house' && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
              <div className="w-full lg:w-1/2">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                  Street Name
                </label>
                <input
                  {...register('houseStreet')}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                />
                <p className="text-red-500 text-xs">{errors.houseStreet?.message}</p>
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
                />
              </div>
            </div>
          )}

          {buildingType === 'apartment' && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Apartment or Building Name
                  </label>
                  <input
                    {...register('apartmentName')}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  />
                  <p className="text-red-500 text-xs">{errors.apartmentName?.message}</p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Flat/Unit Number
                  </label>
                  <input
                    {...register('flatNumber')}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  />
                  <p className="text-red-500 text-xs">{errors.flatNumber?.message}</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Floor Number
                  </label>
                  <input
                    {...register('apartmentFloor')}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  />
                  <p className="text-red-500 text-xs">{errors.apartmentFloor?.message}</p>
                </div>

                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    House Number
                  </label>
                  <input
                    {...register('apartmentHouseNo')}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  />
                  <p className="text-red-500 text-xs">{errors.apartmentHouseNo?.message}</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6">
                <div className="w-full lg:w-1/2">
                  <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">
                    Street Name
                  </label>
                  <input
                    {...register('apartmentStreet')}
                    className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-[12px] md:text-[14px]"
                  />
                  <p className="text-red-500 text-xs">{errors.apartmentStreet?.message}</p>
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
                  />
                </div>
              </div>
            </>
          )}
        </div>

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
                  <CustomDropdown
                    register={register}
                    setValue={setValue}
                    name={`phonecode${num}` as 'phonecode1' | 'phonecode2'}
                    value={num === 1 ? phonecode1Value : phonecode2Value}
                    errors={errors}
                    options={phoneCodeOptions}
                    placeholder="Select Code"
                  />
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
                      validate: num === 2
                        ? {
                            notDuplicate: (value) =>
                              !value ||
                              !watch('phone1') ||
                              watch('phonecode1') !== watch('phonecode2') ||
                              value !== watch('phone1') ||
                              'Phone numbers cannot be the same',
                          }
                        : undefined,
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
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] cursor-pointer mb-4 text-[16px] md:text-[20px] font-medium rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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