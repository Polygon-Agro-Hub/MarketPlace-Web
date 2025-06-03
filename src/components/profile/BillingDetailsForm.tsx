


// 'use client';

// import { useSelector } from 'react-redux';
// import { useForm } from 'react-hook-form';
// import { RootState } from '@/store';
// import { useEffect } from 'react';
// import { FaAngleDown } from 'react-icons/fa';

// type BillingFormData = {
//   title: string;
//   fullName: string;
//   houseNo: string;
//   buildingType: string;
//   apartmentName: string; // New field for Apartment or Building Name
//   flatNumber: string;    // New field for Flat/Unit Number
//   street: string;
//   city: string;
//   phonecode1: string;
//   phone1: string;
//   phonecode2: string;
//   phone2: string;
// };

// const BillingDetailsForm = () => {
//   const token = useSelector((state: RootState) => state.auth.token);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<BillingFormData>({
//     defaultValues: {
//       title: '',
//       fullName: '',
//       houseNo: '',
//       buildingType: '',
//       apartmentName: '',  // Default for new field
//       flatNumber: '',     // Default for new field
//       street: '',
//       city: '',
//       phonecode1: '+94',
//       phone1: '',
//       phonecode2: '+94',
//       phone2: '',
//     },
//   });

//   const buildingType = watch('buildingType'); // Watch the buildingType field to conditionally render fields

//   useEffect(() => {
//     const fetchBillingDetails = async () => {
//       if (!token) return;

//       try {
//         const res = await fetch('http://localhost:3200/api/auth/billing-details', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) throw new Error('Failed to fetch billing details');

//         const json = await res.json();
//         const data = json.data;

//         reset({
//           title: data.title || '',
//           fullName: data.fullName || '',
//           houseNo: data.houseNo || '',
//           buildingType: data.buildingType || '',
//           apartmentName: data.apartmentName || '', // Reset new field
//           flatNumber: data.flatNumber || '',       // Reset new field
//           street: data.street || '',
//           city: data.city || '',
//           phonecode1: data.phonecode1 || '+94',
//           phone1: data.phone1 || '',
//           phonecode2: data.phonecode2 || '+94',
//           phone2: data.phone2 || '',
//         });
//       } catch (error) {
//         console.error('Error fetching billing details:', error);
//       }
//     };

//     fetchBillingDetails();
//   }, [token, reset]);

//   const onSubmit = async (data: BillingFormData) => {
//     if (!token) {
//       alert('You are not authenticated. Please login first.');
//       return;
//     }

//     try {
//       const res = await fetch('http://localhost:3200/api/auth/billing-details', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || 'Failed to save billing details');
//       }

//       alert('Billing details saved successfully!');
//     } catch (error: any) {
//       console.error('Error saving billing details:', error);
//       alert(error.message || 'Failed to save billing details.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
//       <h2 className="font-medium text-base sm:text-lg md:text-xl mb-2 mt-2">Account</h2>
//       <p className="text-xs md:text-sm lg:text-sm text-[#626D76] mb-2">
//         Real-time information and activities of your property.
//       </p>
//       <div className="border-t border-[#BDBDBD] mb-6 mt-1" />

//       <h2 className="font-medium text-base sm:text-lg md:text-xl mb-4">Billing Name</h2>

//       <div className="md:w-[90%]">
//         <div className="flex gap-4 md:gap-8">
//           {/* Title - 10% */}
//           <div className="w-[10%] min-w-[70px]">
//             <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
//               Title
//             </label>
//             <div className="relative">
//               <select
//                 {...register('title', { required: 'Title is required' })}
//                 className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
//                 defaultValue="Mr."
//               >
//                 <option value="Mr.">Mr.</option>
//                 <option value="Ms.">Ms.</option>
//                 <option value="Mrs.">Mrs.</option>
//               </select>
//               <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//             </div>
//             <p className="text-red-500 text-xs">{errors.title?.message}</p>
//           </div>

//           {/* Full Name - 90% */}
//           <div className="w-[90%]">
//             <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
//               Full Name
//             </label>
//             <input
//               {...register('fullName', { required: 'Full name is required' })}
//               className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
//             />
//             <p className="text-red-500 text-xs">{errors.fullName?.message}</p>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-[#BDBDBD] my-6" />
//       <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Currently Saved Address</h2>

//       <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
//         {/* Building Type - Now on the left */}
//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">Building Type</label>
//           <div className="relative">
//             <select
//               {...register('buildingType')}
//               className="border border-[#CECECE] rounded p-2 pr-8 w-full text-sm h-[42px] appearance-none"
//               defaultValue=""
//             >
//               {/* <option value="" disabled>House</option> */}
//               <option value="House">House</option>
//               <option value="Apartment">Apartment</option>
              
//               <option value="Condominium">Condominium</option>
//               <option value="Townhouse">Townhouse</option>
//               <option value="Duplex">Duplex</option>
//               <option value="Other">Other</option>
//             </select>
//             <FaAngleDown className="absolute right-3 top-[23px] -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//           </div>
//         </div>

//         {/* House No or Building No - Now on the right */}
//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">House No or Building No</label>
//           <input {...register('houseNo')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
//         </div>
//       </div>

//       {/* Conditionally render Apartment-specific fields */}
//       {buildingType === 'Apartment' && (
//         <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 md:w-[89%]">
//           <div className="w-full lg:w-1/2">
//             <label className="block text-sm font-medium text-[#626D76] mb-1">Apartment or Building Name</label>
//             <input
//               {...register('apartmentName')}
//               className="border border-[#CECECE] rounded p-2 w-full text-sm"
//             />
//           </div>

//           <div className="w-full lg:w-1/2">
//             <label className="block text-sm font-medium text-[#626D76] mb-1">Flat/Unit Number</label>
//             <input
//               {...register('flatNumber')}
//               className="border border-[#CECECE] rounded p-2 w-full text-sm"
//             />
//           </div>
//         </div>
//       )}

//       <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">Street Name</label>
//           <input {...register('street')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
//         </div>

//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">City</label>
//           <input {...register('city')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
//         </div>
//       </div>

//       <div className="border-t border-[#BDBDBD] my-8" />
//       <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Contact</h2>
//       <p className="text-xs md:text-sm text-[#626D76] mb-6">Manage your account email address for the invoices.</p>

//       <div className="flex flex-col lg:flex-row gap-y-1 lg:gap-x-2">
//         {[1, 2].map((num) => (
//           <div key={num} className="flex flex-col w-full md:w-[48.5%]">
//             <label className="block text-sm font-medium text-[#626D76] mb-1">
//               Phone Number {num}
//             </label>
//             <div className="flex gap-4">
//               <div className="relative w-[25%] md:w-[14%] min-w-[70px]">
//                 <select
//                   {...register(`phonecode${num}` as const)}
//                   className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] pr-8 text-sm"
//                 >
//                   <option value="+94">+94</option>
//                   <option value="+91">+91</option>
//                   <option value="+1">+1</option>
//                   <option value="+44">+44</option>
//                 </select>
//                 <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//               </div>

//               <div className="w-[70%] lg:w-[65%]">
//                 <input
//                   type="text"
//                   {...register(`phone${num}` as const, {
//                     required: num === 1 ? 'Phone number 1 is required' : false,
//                     pattern: {
//                       value: /^[0-9]{7,10}$/,
//                       message: 'Enter a valid number (7-10 digits)',
//                     },
//                   })}
//                   className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-sm"
//                   placeholder="7XXXXXXXX"
//                   inputMode="numeric"
//                   onKeyDown={(e) => {
//                     const invalidKeys = ['e', 'E', '+', '-', '.', ','];
//                     if (invalidKeys.includes(e.key)) e.preventDefault();
//                   }}
//                 />
//                 <p className="text-red-500 text-xs">
//                   {errors[`phone${num}` as keyof BillingFormData]?.message}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex justify-end gap-4 mt-10">
//         <button type="button" className="w-[90px] h-[36px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]">Cancel</button>
//         <button type="submit" className="w-[90px] h-[36px] text-sm rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] mb-4">Save</button>
//       </div>
//     </form>
//   );
// };

// export default BillingDetailsForm;
'use client';

import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';

type BillingFormData = {
  title: string;
  fullName: string;
  houseNo: string;
  buildingType: string;
  apartmentName?: string;
  flatNumber?: string;
  street: string;
  city: string;
  phonecode1: string;
  phone1: string;
  phonecode2?: string;
  phone2?: string;
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BillingFormData>({
    defaultValues: {
      title: '',
      fullName: '',
      houseNo: '',
      buildingType: '',
      apartmentName: '',
      flatNumber: '',
      street: '',
      city: '',
      phonecode1: '+94',
      phone1: '',
      phonecode2: '+94',
      phone2: '',
    },
  });

  const buildingType = watch('buildingType'); // Keep UI case-sensitive for display

  useEffect(() => {
    const fetchBillingDetails = async () => {
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3200/api/auth/billing-details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch billing details');

        const json = await res.json();
        const data = json.data;

        reset({
          title: data.title || '',
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(), // Combine firstName and lastName
          buildingType: data.buildingType || '',
          houseNo: data.address?.houseNo || data.address?.buildingNo || '',
          apartmentName: data.address?.buildingName || '', // Map buildingName to apartmentName
          flatNumber: data.address?.unitNo || '',         // Map unitNo to flatNumber
          street: data.address?.streetName || '',
          city: data.address?.city || '',
          phonecode1: data.phoneCode || '+94',
          phone1: data.phoneNumber || '',
          phonecode2: '+94', // Default, as API doesn't provide second phone
          phone2: '',
        });
      } catch (error) {
        console.error('Error fetching billing details:', error);
      }
    };

    fetchBillingDetails();
  }, [token, reset]);

  const onSubmit = async (data: BillingFormData) => {
    if (!token) {
      alert('You are not authenticated. Please login first.');
      return;
    }

    // Split fullName into firstName and lastName
    const [firstName, ...lastNameParts] = data.fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Prepare payload to match backend schema
    const payload = {
      title: data.title,
      firstName,
      lastName,
      phoneCode: data.phonecode1,
      phoneNumber: data.phone1,
      buildingType: data.buildingType.toLowerCase(), // Normalize to lowercase
      address: {
        ...(data.buildingType.toLowerCase() === 'house'
          ? {
              houseNo: data.houseNo,
              streetName: data.street,
              city: data.city,
            }
          : {
              buildingNo: data.houseNo, // Map houseNo to buildingNo for apartments
              buildingName: data.apartmentName, // Map apartmentName to buildingName
              unitNo: data.flatNumber,         // Map flatNumber to unitNo
              floorNo: null,                   // Not captured in UI, set to null
              houseNo: data.houseNo,           // Include if required by schema
              streetName: data.street,
              city: data.city,
            }),
      },
    };

    try {
      const res = await fetch('http://localhost:3200/api/auth/billing-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save billing details');
      }

      alert('Billing details saved successfully!');
    } catch (error: any) {
      console.error('Error saving billing details:', error);
      alert(error.message || 'Failed to save billing details.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-2 md:px-10 bg-white">
      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-2 mt-2">Account</h2>
      <p className="text-xs md:text-sm lg:text-sm text-[#626D76] mb-2">
        Real-time information and activities of your property.
      </p>
      <div className="border-t border-[#BDBDBD] mb-6 mt-1" />

      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-4">Billing Name</h2>

      <div className="md:w-[90%]">
        <div className="flex gap-4 md:gap-8">
          {/* Title */}
          <div className="w-[10%] min-w-[70px]">
            <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
              Title
            </label>
            <div className="relative">
              <select
                {...register('title', { required: 'Title is required' })}
                className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm pr-8"
                defaultValue="Mr."
              >
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
              </select>
              <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>
            <p className="text-red-500 text-xs">{errors.title?.message}</p>
          </div>

          {/* Full Name */}
          <div className="w-[90%]">
            <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
              Full Name
            </label>
            <input
              {...register('fullName', { required: 'Full name is required' })}
              className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
            />
            <p className="text-red-500 text-xs">{errors.fullName?.message}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#BDBDBD] my-6" />
      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Currently Saved Address</h2>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
        {/* Building Type */}
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">Building Type</label>
          <div className="relative">
            <select
              {...register('buildingType', { required: 'Building type is required' })}
              className="border border-[#CECECE] rounded p-2 pr-8 w-full text-sm h-[42px] appearance-none"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condominium">Condominium</option>
              <option value="townhouse">Townhouse</option>
              <option value="duplex">Duplex</option>
              <option value="other">Other</option>
            </select>
            <FaAngleDown className="absolute right-3 top-[23px] -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          </div>
          <p className="text-red-500 text-xs">{errors.buildingType?.message}</p>
        </div>

        {/* House No or Building No */}
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">
            {buildingType.toLowerCase() === 'house' ? 'House No' : 'Building No'}
          </label>
          <input
            {...register('houseNo', { required: 'House or Building No is required' })}
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
              {...register('apartmentName', { required: 'Apartment name is required for apartments' })}
              className="border border-[#CECECE] rounded p-2 w-full text-sm"
            />
            <p className="text-red-500 text-xs">{errors.apartmentName?.message}</p>
          </div>

          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-[#626D76] mb-1">Flat/Unit Number</label>
            <input
              {...register('flatNumber', { required: 'Flat number is required for apartments' })}
              className="border border-[#CECECE] rounded p-2 w-full text-sm"
            />
            <p className="text-red-500 text-xs">{errors.flatNumber?.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">Street Name</label>
          <input
            {...register('street', { required: 'Street name is required' })}
            className="border border-[#CECECE] rounded p-2 w-full text-sm"
          />
          <p className="text-red-500 text-xs">{errors.street?.message}</p>
        </div>

        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">City</label>
          <input
            {...register('city', { required: 'City is required' })}
            className="border border-[#CECECE] rounded p-2 w-full text-sm"
          />
          <p className="text-red-500 text-xs">{errors.city?.message}</p>
        </div>
      </div>

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
                  {...register(`phonecode${num}` as const, {
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
                  {...register(`phone${num}` as const, {
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
                  {errors[`phone${num}` as keyof BillingFormData]?.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <button type="button" className="w-[90px] h-[36px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]">
          Cancel
        </button>
        <button type="submit" className="w-[90px] h-[36px] text-sm rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] mb-4">
          Save
        </button>
      </div>
    </form>
  );
};

export default BillingDetailsForm;