'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUserCircle } from 'react-icons/fa';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { parseParameter } from 'next/dist/shared/lib/router/utils/route-regex';
import { FaAngleDown } from 'react-icons/fa';


const schema = yup.object().shape({
  title: yup.string().required(),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  countryCode: yup.string().required(),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{7,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  currentPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: schema => schema.required('Current password is required'),
    otherwise: schema => schema.optional(),
  }),
  newPassword: yup.string().min(6, 'New password must be at least 6 characters').notRequired(),
  confirmPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: schema =>
      schema
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
    otherwise: schema => schema.optional(),
  }),
});

type FormData = yup.InferType<typeof schema>;

const PersonalDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: 'Mr.',
      countryCode: '+94',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3200/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const { data } = await response.json();

        reset({
          title: data.title || 'Mr.',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          countryCode: data.phoneCode || '+94',
          phoneNumber: data.phoneNumber || '',

        });

        setPreviewURL(data.image);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };


  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert('You are not authenticated. Please login first.');
      return;
    }

    try {
      // 1. Update profile
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phoneCode", data.countryCode);
      formData.append("phoneNumber", data.phoneNumber);

      if (profilePic) {
        formData.append("profilePicture", profilePic);
      }

      const profileRes = await fetch("http://localhost:3200/api/auth/edit-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.message || "Failed to update profile");
      }

      // 2. Update password (optional)
      if (data.newPassword) {
        const passwordRes = await fetch("http://localhost:3200/api/auth/update-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmNewPassword: data.confirmPassword,
          }),
        });

        if (!passwordRes.ok) {
          const err = await passwordRes.json();
          throw new Error(err.message || "Failed to update password");
        }
      }

      // 3. ✅ Re-fetch updated profile
      const updatedProfile = await fetch("http://localhost:3200/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!updatedProfile.ok) {
        throw new Error("Failed to fetch updated profile");
      }

      const { data: updatedData } = await updatedProfile.json();

      reset({
        title: updatedData.title || 'Mr.',
        firstName: updatedData.firstName || '',
        lastName: updatedData.lastName || '',
        email: updatedData.email || '',
        countryCode: updatedData.phoneCode || '+94',
        phoneNumber: updatedData.phoneNumber || '',
      });

      if (updatedData.profileImageURL) {
        setPreviewURL(updatedData.profileImageURL);
      }

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong");
    }
  };



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-2 mt-2">Account</h2>
      <p className="text-xs md:text-sm lg:text-sm text-[#626D76] mb-2 whitespace-nowrap">
        Real-time information and activities of your property.
      </p>
      <div className="w-full border-t border-[#BDBDBD] mb-6 mt-1"></div>

      {/* Profile Image Section */}

      {/* <div className="w-[134px] h-[131px] text-[#626D76] rounded-full overflow-hidden">
          {previewURL ? (
            <img src={previewURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <FaUserCircle className="w-full h-full  object-cover" />
          )}
        </div> */}





      <div className="w-full flex flex-col md:flex-row md:justify-between items-center md:items-start gap-3 md:gap-6 mt-5 sm:px-2">
        {/* Left: Profile Image/Icon */}
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

        {/* Middle: Label and Format Note */}
        <div className="flex flex-col justify-center text-center md:text-left md:items-start flex-1 mt-2 md:mt-0">
          <label className="font-medium text-base sm:text-lg md:text-xl mb-1">
            Profile Picture
          </label>
          <p className="text-xs md:text-sm text-gray-500">PNG, JPEG under 15MB</p>
        </div>

        {/* Right: Upload Button */}
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
      <h2 className="font-medium text-base sm:text-lg md:text-xl mt-2 mb-4">Full Name</h2>
      <div className="flex flex-col md:flex-row md:gap-4 mb-6">
        <div className="md:w-[55%]">
          <div className="flex gap-4 md:gap-8">

            <div className="relative w-[30%] md:w-[15%]">
              <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Title</label>

              <div className="relative">
                <select
                  {...register('title', { required: 'Title is required' })}
                  className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
                  defaultValue="Mr."
                >
                  <option>Mr.</option>
                  <option>Ms.</option>
                  <option>Mrs.</option>
                </select>

                {/* Custom dropdown icon */}
                <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              </div>
            </div>
            <div className="w-[75%]">
              <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">First Name</label>
              <input {...register('firstName', { required: 'First name is required' })} className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm" />
              <p className="text-red-500 text-xs">{errors.firstName?.message}</p>
            </div>
          </div>
        </div>
        <div className="md:w-[48%] mt-4 md:mt-0">
          <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Last Name</label>
          <input {...register('lastName')} className="border border-[#CECECE] rounded-lg p-2 w-full text-xs sm:text-sm" />
          <p className="text-red-500 text-xs">{errors.lastName?.message}</p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
      <h2 className="font-medium text-base sm:text-lg md:text-xl mt-0 mb-1">Contact</h2>
      <p className="text-xs md:text-sm text-[#626D76] mb-6">Manage your account email address for the invoices.</p>
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="md:w-[63%]">
          <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Email</label>
          <input type="email" {...register('email')} className="border border-[#CECECE] rounded-lg p-2 w-full text-xs sm:text-sm" />
          <p className="text-red-500 text-xs">{errors.email?.message}</p>
        </div>
        <div className="md:w-[55%]">
          <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Phone Number</label>
          <div className="flex gap-4">
            <div className="relative w-[30%] md:w-[15%]">
              <select
                {...register('countryCode')}
                className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
              >
                <option value="+94">+94</option>
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>

              {/* Custom dropdown icon */}
              <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>
            <div className="w-[80%]">
              <input {...register('phoneNumber')} className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm" />
              <p className="text-red-500 text-xs">{errors.phoneNumber?.message}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Password Section */}
      <div className="w-full border-t border-[#BDBDBD] mb-6 mt-6"></div>
      <h2 className="font-medium text-base sm:text-lg md:text-xl mt-0 mb-1">Password</h2>
      <p className="text-xs md:text-sm text-[#626D76] mb-6">Modify your password at any time.</p>

      <div className="md:w-[43%]">
        <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Current Password</label>
        <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
          <FiLock className="text-gray-500 mr-2" />
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            {...register('currentPassword')}
            className="w-full focus:outline-none"
          />
          <div onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="cursor-pointer ml-2">
            {showCurrentPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
          </div>
        </div>
        <p className="text-red-500 text-xs">{errors.currentPassword?.message}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <div className="md:w-[43%]">
          <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">New Password</label>
          <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
            <FiLock className="text-gray-500 mr-2" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              {...register('newPassword')}
              className="w-full focus:outline-none"
            />
            <div onClick={() => setShowNewPassword(!showNewPassword)} className="cursor-pointer ml-2">
              {showNewPassword ? <FiEye className="text-gray-500" /> : <FiEyeOff className="text-gray-500" />}
            </div>
          </div>
          <p className="text-red-500 text-xs">{errors.newPassword?.message}</p>
        </div>

        <div className="md:w-[45%]">
          <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Confirm New Password</label>
          <div className="relative flex items-center border border-[#CECECE] rounded-lg p-2">
            <FiLock className="text-gray-500 mr-2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="w-full focus:outline-none"
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
          className="w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]">
          Cancel
        </button>
        <button
          type="submit"
          className="w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] mb-4 text-sm  rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a]">
          Save
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
