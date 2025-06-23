'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUserCircle, FaAngleDown } from 'react-icons/fa';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import SuccessPopup from '@/components/toast-messages/success-message';
import ErrorPopup from '@/components/toast-messages/error-message';
import Loader from '@/components/loader-spinner/Loader'; // Import Loader component
import { fetchProfile, updateProfile, updatePassword } from '@/services/auth-service';

// Yup schema (unchanged)
const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  firstName: yup
    .string()
    .matches(/^[A-Za-z]+$/, 'First name must contain only letters')
    .required('First name is required'),
  lastName: yup
    .string()
    .matches(/^[A-Za-z]+$/, 'Last name must contain only letters')
    .required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  countryCode: yup.string().required('Country code is required'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{9}$/, 'Phone number must be exactly 9 digits')
    .required('Phone number is required'),
  currentPassword: yup.string().when('newPassword', {
    is: (val: string | undefined) => val && val.length > 0,
    then: (schema) => schema.required('Current password is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  newPassword: yup
    .string()
    .min(6, 'New password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')
    .notRequired(),
  confirmPassword: yup.string().when('newPassword', {
    is: (val: string | undefined) => val && val.length > 0,
    then: (schema) =>
      schema
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type FormData = yup.InferType<typeof schema>;

// Cancel Success Popup component
const CancelSuccessPopup = ({ isVisible, onClose, title, duration }: { isVisible: boolean; onClose: () => void; title: string; duration?: number }) => {
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
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false); // New state for cancel feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: 'Mr.',
      countryCode: '+94',
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      setIsLoading(true); // Show loader while fetching
      try {
        const data = await fetchProfile({ token });
        reset({
          title: data.title || 'Mr.',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          countryCode: data.phoneCode || '+94',
          phoneNumber: data.phoneNumber || '',
          currentPassword: undefined,
          newPassword: undefined,
          confirmPassword: undefined,
        });
        setPreviewURL(data.image || data.profileImageURL || null);
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch profile');
        setShowErrorPopup(true);
        setShowSuccessPopup(false);
      } finally {
        setIsLoading(false); // Hide loader
      }
    };

    loadProfile();
  }, [token, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
  setIsLoading(true); // Show loader immediately
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

    // Update profile
    await updateProfile({
      token,
      data: {
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneCode: data.countryCode,
        phoneNumber: data.phoneNumber,
      },
      profilePic,
    });

    let successMessages: string[] = ['Profile updated successfully!'];

    // Update password if provided
    if (data.newPassword && data.currentPassword && data.confirmPassword) {
      try {
        const passwordResponse = await updatePassword({
          token,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });
        successMessages.push(passwordResponse.message || 'Password updated successfully!');
      } catch (passwordErr: any) {
        throw new Error(passwordErr.message || 'Failed to update password.');
      }
    }

    // Re-fetch updated profile
    const updatedData = await fetchProfile({ token });
    reset({
      title: updatedData.title || 'Mr.',
      firstName: updatedData.firstName || '',
      lastName: updatedData.lastName || '',
      email: updatedData.email || '',
      countryCode: updatedData.phoneCode || '+94',
      phoneNumber: updatedData.phoneNumber || '',
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    });

    if (updatedData.profileImageURL || updatedData.image) {
      setPreviewURL(updatedData.profileImageURL || updatedData.image || null);
    }

    setSuccessMessage(successMessages.join(' '));
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 5000);
  } catch (error: any) {
    // Handle specific duplicate errors
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
    setIsLoading(false); // Hide loader
  }
};

  const handleCancel = () => {
    setIsLoading(true); // Show loader immediately
    reset(); // Reset form to default values
    setProfilePic(null); // Clear profile picture
    setPreviewURL(null); // Clear preview
    setTimeout(() => {
      setIsLoading(false); // Hide loader
      setShowCancelSuccessPopup(true); // Show cancel feedback
      setTimeout(() => setShowCancelSuccessPopup(false), 3000);
    }, 500); // Simulate async reset
  };

  return (
    <>
      <div className="relative z-50">
        <Loader isVisible={isLoading} /> {/* Add Loader */}
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title="Success!"
          description={successMessage}
          duration={3000}
        />
        <CancelSuccessPopup
          isVisible={showCancelSuccessPopup}
          onClose={() => setShowCancelSuccessPopup(false)}
          title="Form reset successfully!"
          duration={3000}
        />
        <ErrorPopup
          isVisible={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Error!"
          description={errorMessage}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
        <h2 className="font-medium text-[14px] text-base md:text-[18px] mb-2 mt-2">Account</h2>
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
                <div className="relative">
                  <select
                    {...register('title')}
                    className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
                    defaultValue="Mr."
                  >
                    <option value="Rev.">Rev.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                  </select>
                  <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                </div>
                <p className="text-red-500 text-xs">{errors.title?.message}</p>
              </div>
              <div className="w-[75%]">
                <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">First Name</label>
                <input
                  {...register('firstName')}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                />
                <p className="text-red-500 text-xs">{errors.firstName?.message}</p>
              </div>
            </div>
          </div>
          <div className="md:w-[48%] mt-4 md:mt-0">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Last Name</label>
            <input
              {...register('lastName')}
              className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
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
          <div className="md:w-[63%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
            />
            <p className="text-red-500 text-xs">{errors.email?.message}</p>
          </div>
          <div className="md:w-[55%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Phone Number</label>
            <div className="flex gap-4">
              <div className="relative w-[30%] md:w-[15%]">
                <select
                  {...register('countryCode')}
                  className="appearance-none border border-[#CECECE] cursor-pointer rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
                >
                  <option value="+94">+94</option>
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
              <div className="w-[80%]">
                <input
                  {...register('phoneNumber')}
                  className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
                />
                <p className="text-red-500 text-xs">{errors.phoneNumber?.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
        <h2 className="font-medium text-base text-[14px] md:text-[18px] mt-0 mb-1">Password</h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-6">
          Modify your password at any time.
        </p>
        <div className="md:w-[43%]">
          <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Current Password</label>
          <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
            <FiLock className="text-gray-500 mr-2" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              className="w-full focus:outline-none text-xs sm:text-sm"
            />
            <div onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="cursor-pointer ml-2">
              {showCurrentPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
            </div>
          </div>
          <p className="text-red-500 text-xs">{errors.currentPassword?.message}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="md:w-[43%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">New Password</label>
            <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
              <FiLock className="text-gray-500 mr-2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className="w-full focus:outline-none text-xs sm:text-sm"
              />
              <div onClick={() => setShowNewPassword(!showNewPassword)} className="cursor-pointer ml-2">
                {showNewPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
              </div>
            </div>
            <p className="text-red-500 text-xs">{errors.newPassword?.message}</p>
          </div>

          <div className="md:w-[45%]">
            <label className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1">Confirm New Password</label>
            <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
              <FiLock className="text-gray-500 mr-2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full focus:outline-none text-xs sm:text-sm"
              />
              <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer ml-2">
                {showConfirmPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
              </div>
            </div>
            <p className="text-red-500 text-xs">{errors.confirmPassword?.message}</p>
          </div>
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
    </>
  );
};

export default PersonalDetailsForm;