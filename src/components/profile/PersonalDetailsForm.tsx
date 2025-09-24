'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler, UseFormRegister, FieldErrors } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUserCircle, FaAngleDown } from 'react-icons/fa';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';
import Loader from '@/components/loader-spinner/Loader';
import { fetchProfile, updateProfile, updatePassword } from '@/services/auth-service';
import { updateUser } from '@/store/slices/authSlice';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  firstName: yup
    .string()
    .transform((value) => value?.trim())
    .required('First Name is required'),
  lastName: yup
    .string()
    .transform((value) => value?.trim())
    .required('Last Name is required'),
  email: yup
    .string()
    .transform((value) => value?.trim())
    .email('Please enter a valid Email Address')
    .required('Email Address is required'),
  countryCode: yup.string().required('Country Code is required'),
  countryCode2: yup.string().when('$buyerType', {
    is: 'Wholesale',
    then: (schema) => schema.required('Country Code is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phoneNumber: yup
    .string()
    .transform((value) => value?.trim())
    .matches(/^7[0-9]{8}$/, 'Please enter a valid Phone Number (format: +947XXXXXXXX)')
    .required('Phone Number is required'),
  phoneNumber2: yup.string().when('$buyerType', {
    is: 'Wholesale',
    then: (schema) => schema
      .transform((value) => value?.trim())
      .matches(/^7[0-9]{8}$/, 'Please enter a valid Phone Number (format: +947XXXXXXXX)')
      .required('Phone Number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: yup.string().when('$buyerType', {
    is: 'Wholesale',
    then: (schema) => schema
      .transform((value) => value?.trim())
      .required('Company Name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyPhoneCode: yup.string().when('$buyerType', {
    is: 'Wholesale',
    then: (schema) => schema.required('Company Phone Code is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyPhone: yup.string().when('$buyerType', {
    is: 'Wholesale',
    then: (schema) => schema
      .transform((value) => value?.trim())
      .matches(/^7[0-9]{8}$/, 'Please enter a valid Company Phone Number (format: +947XXXXXXXX)')
      .required('Company Phone Number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  currentPassword: yup.string()
    .transform((value) => value?.trim())
    .when('newPassword', {
      is: (val: string | undefined) => val && val.length > 0,
      then: (schema) => schema.required('Current Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  newPassword: yup
    .string()
    .transform((value) => value?.trim())
    .test('password-requirements', 'Password must contain a minimum of 6 characters with 1 Uppercase, Numbers & Special Characters', function (value) {
      if (!value) return true; // Allow empty (not required)

      const hasMinLength = value.length >= 6;
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*]/.test(value);

      return hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
    })
    .notRequired(),
  confirmPassword: yup.string()
    .transform((value) => value?.trim())
    .when('newPassword', {
      is: (val: string | undefined) => val && val.length > 0,
      then: (schema) =>
        schema
          .required('Please confirm your New Password')
          .oneOf([yup.ref('newPassword')], 'Passwords must match'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

type FormData = yup.InferType<typeof schema>;

// Custom Dropdown Component
interface CustomDropdownProps {
  register: UseFormRegister<FormData>;
  name: keyof FormData;
  value: string;
  errors?: FieldErrors<FormData>;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}

const CustomDropdown = ({ register, name, value, errors, options, placeholder, onChange }: CustomDropdownProps) => {
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
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-pointer" ref={dropdownRef}>
      <input type="hidden" {...register(name)} value={value} />
      <div
        className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value ? options.find((opt) => opt.value === value)?.label || placeholder : placeholder}</span>
        <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-[#CECECE] rounded-lg mt-1">
          {/* <li
            className="p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelect('')}
          >
          </li> */}
          {options.map((option) => (
            <li
              key={option.value}
              className="p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100"
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

const PersonalDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [originalProfilePic, setOriginalProfilePic] = useState<string | null>(null);
  const [buyerType, setBuyerType] = useState<string>('');
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema, { context: { buyerType } }) as any,
    defaultValues: {
      title: '',
      countryCode: '',
      countryCode2: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      phoneNumber2: '',
      companyName: '',
      companyPhoneCode: '',
      companyPhone: '',
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    },
  });

  const titleValue = watch('title');
  const countryCodeValue = watch('countryCode');
  const countryCode2Value = watch('countryCode2');
  const companyPhoneCodeValue = watch('companyPhoneCode');
  const formValues = watch();

  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchProfile({ token });
        setBuyerType(data.buyerType || '');

        const formData = {
          title: data.title || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          countryCode: data.phoneCode || '',
          phoneNumber: data.phoneNumber || '',
          countryCode2: data.phoneCode2 || '',
          phoneNumber2: data.phoneNumber2 || '',
          companyName: data.companyName || '',
          companyPhoneCode: data.companyPhoneCode || '',
          companyPhone: data.companyPhone || '',
          currentPassword: undefined,
          newPassword: undefined,
          confirmPassword: undefined,
        };

        setOriginalData(formData);
        setOriginalProfilePic(data.image || data.profileImageURL || null);
        reset(formData);
        setPreviewURL(data.image || data.profileImageURL || null);
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch profile');
        setShowErrorPopup(true);
        setShowSuccessPopup(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token, reset]);

  const handlePasswordInput = (value: string): string => {
    // Remove leading and trailing spaces, but keep internal spaces if any
    return value.trim();
  };


  const handleNameInput = (value: string): string => {
    const cleaned = value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ').trimStart();


    if (cleaned.length > 0) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
    return cleaned;
  };

  const handlePhoneInput = (value: string): string => {

    const cleaned = value.replace(/[^0-9]/g, '');

    if (cleaned.length > 0 && !cleaned.startsWith('7')) {
      return '7' + cleaned.slice(0, 8);
    }

    return cleaned.slice(0, 9);
  };

  const handleGeneralInput = (value: string): string => {

    return value.trimStart();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 15 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setErrorMessage(
          `The image you uploaded has a size of ${(file.size / (1024 * 1024)).toFixed(2)}MB, which is larger than 15MB. Please re-upload an image under the allowed criteria.`
        );
        setShowErrorPopup(true);
        setShowSuccessPopup(false);
        e.target.value = '';
        return;
      }

      setProfilePic(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    const formValues = getValues();

    setIsLoading(true);
    if (!token) {
      setErrorMessage('You are not authenticated. Please login first.');
      setShowErrorPopup(true);
      setShowSuccessPopup(false);
      setIsLoading(false);
      return;
    }

    try {
      setShowSuccessPopup(false);
      setShowErrorPopup(false);
      setErrorMessage('');
      setSuccessMessage('');

      // Clean profile data - only send what's needed
      const profileData: any = {
        title: formValues.title,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phoneCode: formValues.countryCode,
        phoneNumber: formValues.phoneNumber,
      };

      // Only add wholesale fields if buyerType is Wholesale and values exist
      if (buyerType === 'Wholesale') {
        if (formValues.countryCode2) {
          profileData.phoneCode2 = formValues.countryCode2;
        }
        if (formValues.phoneNumber2) {
          profileData.phoneNumber2 = formValues.phoneNumber2;
        }
        if (formValues.companyName) {
          profileData.companyName = formValues.companyName;
        }
        // Add company phone fields
        if (formValues.companyPhoneCode) {
          profileData.companyPhoneCode = formValues.companyPhoneCode;
        }
        if (formValues.companyPhone) {
          profileData.companyPhone = formValues.companyPhone;
        }
      }

      await updateProfile({
        token,
        data: profileData,
        profilePic,
      });

      let successMessages: string[] = ['Profile updated successfully!'];

      // Handle password update if provided
      if (formValues.newPassword && formValues.currentPassword && formValues.confirmPassword) {
        try {
          const passwordResponse = await updatePassword({
            token,
            currentPassword: formValues.currentPassword,
            newPassword: formValues.newPassword,
            confirmPassword: formValues.confirmPassword,
          });
          successMessages.push(passwordResponse.message || 'Password updated successfully!');
        } catch (passwordErr: any) {
          throw new Error(passwordErr.message || 'Failed to update password.');
        }
      }

      // Fetch updated profile data
      const updatedData = await fetchProfile({ token });
      setBuyerType(updatedData.buyerType || '');

      // Update Redux state with new user data (especially the image)
      dispatch(updateUser({
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        image: updatedData.profileImageURL || updatedData.image || null
      }));

      const newFormData = {
        title: updatedData.title || '',
        firstName: updatedData.firstName || '',
        lastName: updatedData.lastName || '',
        email: updatedData.email || '',
        countryCode: updatedData.phoneCode || '',
        phoneNumber: updatedData.phoneNumber || '',
        countryCode2: updatedData.phoneCode2 || '',
        phoneNumber2: updatedData.phoneNumber2 || '',
        companyName: updatedData.companyName || '',
        companyPhoneCode: updatedData.companyPhoneCode || '',
        companyPhone: updatedData.companyPhone || '',
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      };

      reset(newFormData);
      setOriginalData(newFormData);
      setOriginalProfilePic(updatedData.profileImageURL || updatedData.image || null);

      if (updatedData.profileImageURL || updatedData.image) {
        setPreviewURL(updatedData.profileImageURL || updatedData.image || null);
      }

      setProfilePic(null);
      setSuccessMessage(successMessages.join(' '));
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 5000);
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        setErrorMessage('This email is already in use. Please use a different email.');
      } else if (error.message === 'Phone number already exists') {
        setErrorMessage('This phone number is already in use. Please use a different phone number.');
      } else {
        setErrorMessage(error.message || 'Something went wrong');
      }
      setShowErrorPopup(true);
      setShowSuccessPopup(false);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    setIsLoading(true);

    if (originalData) {
      reset(originalData);
      setPreviewURL(originalProfilePic);
      setProfilePic(null);
    } else {
      reset({
        title: '',
        countryCode: '',
        countryCode2: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        phoneNumber2: '',
        companyName: '',
        companyPhoneCode: '', // Add this
        companyPhone: '',     // Add this
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      });
      setProfilePic(null);
      setPreviewURL(null);
    }

    setTimeout(() => {
      setIsLoading(false);
      setShowCancelSuccessPopup(true);
      setTimeout(() => setShowCancelSuccessPopup(false), 3000);
    }, 500);
  };

  const phoneCodeOptions = [
    { value: '+94', label: '+94' },
    { value: '+91', label: '+91' },
    { value: '+1', label: '+1' },
    { value: '+44', label: '+44' },
  ];

  const titleOptions = [
    { value: 'Rev', label: 'Rev' },
    { value: 'Mr', label: 'Mr' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Mrs', label: 'Mrs' },
  ];

  return (
    <>
      <div className="relative z-50">
        <Loader isVisible={isLoading} />
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title="Success!"
          description={successMessage}
          duration={3000}
        />
        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />
      </div>

      <form className="px-2 md:px-10 bg-white">
        <h2 className="font-medium text-[14px] text-base md:text-[18px] mb-2 p-2">Account</h2>
        <p className="text-xs md:text-sm lg:text-[16px] text-[#626D76] mb-2 whitespace-nowrap">
          Real-time information and activities of your property.
        </p>
        <div className="w-full border-t border-[#BDBDBD] mb-6 mt-1"></div>

        {/* Profile Image Section */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-center md:items-start gap-3 md:gap-6 mt-5 sm:px-2">
          <div className="w-32 h-32 text-[#626D76]">
            {previewURL ? (
              <img
                src={previewURL}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-[#A0A0A0]" />
            )}
          </div>
          <div className="flex flex-col justify-center text-center md:text-left md:items-start flex-1 mt-2 md:mt-0">
            <label className="font-medium text-[14px] md:text-[18px] mb-1">
              Profile Picture
            </label>
            <p className="text-[12px] md:text-[16px] text-gray-500">PNG, JPEG under 15MB</p>
          </div>
          <label
            className="px-4 py-1 rounded-lg cursor-pointer text-sm hover:bg-gray-100 mt-2 md:mt-0"
            style={{ border: '1px solid #393939', color: '#393939' }}
          >
            Upload new picture
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Full Name Section */}
        <h2 className="font-medium text-base text-[14px] md:text-[18px] mt-2 mb-4">Full Name</h2>
        <div className="flex flex-col md:flex-row md:gap-4 mb-6">
          <div className="md:w-[55%]">
            <div className="flex gap-4 md:gap-8">
              <div className="relative w-[30%] md:w-[15%]">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Title</label>
                <CustomDropdown
                  register={register}
                  name="title"
                  value={titleValue}
                  errors={errors}
                  options={titleOptions}
                  placeholder="Select Title"
                  onChange={(value) => setValue('title', value, { shouldValidate: true })}
                />
              </div>
              <div className="w-[75%]">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">First Name</label>
                <input
                  {...register('firstName')}
                  onChange={(e) => {
                    const formattedValue = handleNameInput(e.target.value);
                    e.target.value = formattedValue;
                    setValue('firstName', formattedValue, { shouldValidate: true });
                  }}
                  onBlur={(e) => {
                    const trimmedValue = e.target.value.trim();
                    setValue('firstName', trimmedValue, { shouldValidate: true });
                  }}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                  placeholder="Enter first name"
                />
                <p className="text-red-500 text-xs">{errors.firstName?.message}</p>
              </div>
            </div>
          </div>
          <div className="md:w-[48%] mt-4 md:mt-0">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Last Name</label>
            <input
              {...register('lastName')}
              onChange={(e) => {
                const formattedValue = handleNameInput(e.target.value);
                e.target.value = formattedValue;
                setValue('lastName', formattedValue, { shouldValidate: true });
              }}
              onBlur={(e) => {
                const trimmedValue = e.target.value.trim();
                setValue('lastName', trimmedValue, { shouldValidate: true });
              }}
              className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
              placeholder="Enter last name"
            />
            <p className="text-red-500 text-xs">{errors.lastName?.message}</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
        <h2 className="font-medium text-base text-[14px] md:text-[18px] mt-0 mb-1">Contact</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">
          Manage your account email address for the invoices.
        </p>
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div className="md:w-[60%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              onChange={(e) => {
                const trimmedValue = handleGeneralInput(e.target.value);
                e.target.value = trimmedValue;
                setValue('email', trimmedValue, { shouldValidate: true });
              }}
              className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
              placeholder="Enter email address"
            />
            <p className="text-red-500 text-xs">{errors.email?.message}</p>
          </div>
          <div className="md:w-[56%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Phone Number</label>
            <div className="flex gap-4">
              <div className="relative w-[30%] md:w-[15%]">
                <CustomDropdown
                  register={register}
                  name="countryCode"
                  value={countryCodeValue}
                  errors={errors}
                  options={phoneCodeOptions}
                  placeholder="Select Code"
                  onChange={(value) => setValue('countryCode', value, { shouldValidate: true })}
                />
              </div>
              <div className="w-[82%]">
                <input
                  {...register('phoneNumber')}
                  onChange={(e) => {
                    const formattedValue = handlePhoneInput(e.target.value);
                    e.target.value = formattedValue;
                    setValue('phoneNumber', formattedValue, { shouldValidate: true });
                  }}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                  placeholder="7XXXXXXXX"
                  maxLength={9}
                />
                <p className="text-red-500 text-xs">{errors.phoneNumber?.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Details Section - Conditional Rendering */}
        {buyerType === 'Wholesale' && (
          <>
            <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
            <h2 className="font-medium text-base text-[14px] md:text-[18px] mt-0 mb-1">Company Details</h2>
            <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">
              Manage your company account email address for the invoices.
            </p>

            {/* Company Name */}
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="md:w-[60%]">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Name</label>
                <input
                  type="text"
                  {...register('companyName')}
                  onChange={(e) => {
                    const trimmedValue = handleGeneralInput(e.target.value);
                    e.target.value = trimmedValue;
                    setValue('companyName', trimmedValue, { shouldValidate: true });
                  }}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                  placeholder="Enter company name"
                />
                <p className="text-red-500 text-xs">{errors.companyName?.message}</p>
              </div>

              {/* Company Phone */}
              <div className="md:w-[56%]">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Company Phone Number</label>
                <div className="flex gap-4">
                  <div className="relative w-[30%] md:w-[15%]">
                    <CustomDropdown
                      register={register}
                      name="companyPhoneCode"
                      value={companyPhoneCodeValue as any}
                      errors={errors}
                      options={phoneCodeOptions}
                      placeholder="Select Code"
                      onChange={(value) => setValue('companyPhoneCode', value, { shouldValidate: true })}
                    />
                  </div>
                  <div className="w-[82%]">
                    <input
                      {...register('companyPhone')}
                      onChange={(e) => {
                        const formattedValue = handlePhoneInput(e.target.value);
                        e.target.value = formattedValue;
                        setValue('companyPhone', formattedValue, { shouldValidate: true });
                      }}
                      className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                      placeholder="7XXXXXXXX"
                      maxLength={9}
                    />
                    <p className="text-red-500 text-xs">{errors.companyPhone?.message}</p>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}

        {/* Password Section */}
        <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
        <h2 className="font-medium text-base text-[14px] md:text-[18px] mt-0 mb-1">Password</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">
          Modify your password at any time.
        </p>
        <div className="md:w-[50%]">
          <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Current Password</label>
          <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
            <FiLock className="text-gray-500 mr-2" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              onChange={(e) => {
                const trimmedValue = handlePasswordInput(e.target.value);
                e.target.value = trimmedValue;
                setValue('currentPassword', trimmedValue, { shouldValidate: true });
              }}
              onBlur={(e) => {
                const trimmedValue = e.target.value.trim();
                setValue('currentPassword', trimmedValue, { shouldValidate: true });
              }}
              className="w-full focus:outline-none text-xs sm:text-sm"
              placeholder="Enter current password"
            />
            <div onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="cursor-pointer ml-2">
              {showCurrentPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
            </div>
          </div>
          <p className="text-red-500 text-xs">{errors.currentPassword?.message}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="md:w-[50%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">New Password</label>
            <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
              <FiLock className="text-gray-500 mr-2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                onChange={(e) => {
                  const trimmedValue = handlePasswordInput(e.target.value);
                  e.target.value = trimmedValue;
                  setValue('newPassword', trimmedValue, { shouldValidate: true });
                }}
                onBlur={(e) => {
                  const trimmedValue = e.target.value.trim();
                  setValue('newPassword', trimmedValue, { shouldValidate: true });
                }}
                className="w-full focus:outline-none text-xs sm:text-sm"
                placeholder="Enter new password"
              />
              <div onClick={() => setShowNewPassword(!showNewPassword)} className="cursor-pointer ml-2">
                {showNewPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
              </div>
            </div>
            {/* Password validation message */}
            <p className="text-[#626D76] text-[10px] md:text-xs mt-1">
              Your password must contain a minimum of 6 characters with 1 Uppercase, Numbers & Special Characters
            </p>
            <p className="text-red-500 text-xs">{errors.newPassword?.message}</p>
          </div>

          <div className="md:w-[47%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Confirm New Password</label>
            <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
              <FiLock className="text-gray-500 mr-2" />
              <input
                onPaste={(e) => {
                  e.preventDefault();
                  return false;
                }}
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                onChange={(e) => {
                  const trimmedValue = handlePasswordInput(e.target.value);
                  e.target.value = trimmedValue;
                  setValue('confirmPassword', trimmedValue, { shouldValidate: true });
                }}
                onBlur={(e) => {
                  const trimmedValue = e.target.value.trim();
                  setValue('confirmPassword', trimmedValue, { shouldValidate: true });
                }}
                className="w-full focus:outline-none text-xs sm:text-sm"
                placeholder="Confirm new password"
              />
              <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer ml-2">
                {showConfirmPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
              </div>
            </div>
            <p className="text-red-500 text-xs">{errors.confirmPassword?.message}</p>
          </div>
        </div>

        <div className="flex justify-end  mt-10 p-4 ">
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-6 py-2.5 text-[12px] md:text-[16px] font-medium rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5] cursor-pointer leading-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 text-[12px] md:text-[16px] font-medium rounded-lg text-white leading-none ${isLoading || hasErrors
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#3E206D] hover:bg-[#341a5a] cursor-pointer'
                }`}
              onClick={handleProfileUpdate}
              disabled={isLoading || hasErrors}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default PersonalDetailsForm;