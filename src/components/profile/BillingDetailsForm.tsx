// 'use client';

// import { useSelector } from 'react-redux';
// import { useForm } from 'react-hook-form';
// import { RootState } from '@/store';
// import { useEffect } from 'react';
// import { FaAngleDown } from 'react-icons/fa';

// type BillingFormData = {
//   title: string;
//   firstName: string;
//   buildingNo: string;
//   buildingType: string;
//   streetName: string;
//   city: string;
//   phoneCode1: string;
//   phoneNumber1: string;
//   phoneCode2: string;
//   phoneNumber2: string;
//   addressLine1?: string;
//   addressLine2?: string;
//   state?: string;
//   postalCode?: string;
//   country?: string;
// };

// const BillingDetailsForm = () => {
//   const token = useSelector((state: RootState) => state.auth.token);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<BillingFormData>({
//     defaultValues: {
//       title: '',
//       firstName: '',
//       buildingNo: '',
//       buildingType: '',
//       streetName: '',
//       city: '',
//       phoneCode1: '+94',
//       phoneNumber1: '',
//       phoneCode2: '+94',
//       phoneNumber2: '',
//       addressLine1: '',
//       addressLine2: '',
//       state: '',
//       postalCode: '',
//       country: '',
//     },
//   });

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
//         const data = json.data; // Extract from response wrapper

//         console.log('Billing data:', data);

//         reset({
//           title: data.title || '',
//           firstName: data.firstName || '',
//           buildingNo: data.buildingNo || '',
//           buildingType: data.buildingType || '',
//           streetName: data.streetName || '',
//           city: data.city || '',
//           phoneCode1: data.phoneCode1 || '+94',
//           phoneNumber1: data.phoneNumber1 || '',
//           phoneCode2: data.phoneCode2 || '+94',
//           phoneNumber2: data.phoneNumber2 || '',
//           addressLine1: data.addressLine1 || '',
//           addressLine2: data.addressLine2 || '',
//           state: data.state || '',
//           postalCode: data.postalCode || '',
//           country: data.country || '',
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
//           <div className="w-[30%] md:w-[8%]">
//             <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">Title</label>
//             <div className="relative">
//               <select {...register('title', { required: 'Title is required' })} className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] pr-8 text-xs sm:text-sm">
//                 <option>Mr.</option>
//                 <option>Ms.</option>
//                 <option>Mrs.</option>
//               </select>
//               <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//             </div>
//           </div>
//           <div className="w-[95%]">
//             <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">First Name</label>
//             <input {...register('firstName', { required: 'First name is required' })} className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm" />
//             <p className="text-red-500 text-xs">{errors.firstName?.message}</p>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-[#BDBDBD] my-6" />
//       <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Currently Saved Address</h2>

//       <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">House No or Building No</label>
//           <input {...register('buildingNo')} className="border border-[#CECECE] rounded p-2 w-full text-sm" placeholder="Enter House No or Building No" />
//         </div>

//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">Building Type</label>
//           <div className="relative">
//             <select
//               {...register('buildingType')}
//               className="border border-[#CECECE] rounded p-2 pr-8 w-full text-sm h-[42px] appearance-none"
//               defaultValue=""
//             >
//               <option value="" disabled>Select Building type</option>
//               <option value="Apartment">Apartment</option>
//               <option value="House">House</option>
//               <option value="Condominium">Condominium</option>
//               <option value="Townhouse">Townhouse</option>
//               <option value="Duplex">Duplex</option>
//               <option value="Other">Other</option>
//             </select>
//             <FaAngleDown className="absolute right-3 top-[23px] -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
//         <div className="w-full lg:w-1/2">
//           <label className="block text-sm font-medium text-[#626D76] mb-1">Street Name</label>
//           <input {...register('streetName')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
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
//             <label className="block text-sm font-medium text-[#626D76] mb-1">Phone Number {num}</label>
//             <div className="flex gap-4">
//               <div className="relative w-[25%] md:w-[14%]">
//                 <select {...register(`phoneCode${num}` as const)} className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] pr-8 text-sm">
//                   <option value="+94">+94</option>
//                   <option value="+91">+91</option>
//                   <option value="+1">+1</option>
//                   <option value="+44">+44</option>
//                 </select>
//                 <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
//               </div>
//               <div className="w-[70%] lg:w-[65%]">
//                 <input {...register(`phoneNumber${num}` as const)} className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-sm" placeholder="7XXXXXXXX" />
//                 <p className="text-red-500 text-xs">{errors[`phoneNumber${num}` as keyof BillingFormData]?.message}</p>
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
  firstName: string;
  buildingNo: string;
  buildingType: string;
  streetName: string;
  city: string;
  phoneCode1: string;
  phoneNumber1: string;
  phoneCode2: string;
  phoneNumber2: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

const BillingDetailsForm = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BillingFormData>({
    defaultValues: {
      title: '',
      firstName: '',
      buildingNo: '',
      buildingType: '',
      streetName: '',
      city: '',
      phoneCode1: '+94',
      phoneNumber1: '',
      phoneCode2: '+94',
      phoneNumber2: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

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
          firstName: data.firstName || '',
          buildingNo: data.buildingNo || '',
          buildingType: data.buildingType || '',
          streetName: data.streetName || '',
          city: data.city || '',
          phoneCode1: data.phoneCode1 || '+94',
          phoneNumber1: data.phoneNumber1 || '',
          phoneCode2: data.phoneCode2 || '+94',
          phoneNumber2: data.phoneNumber2 || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
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

    try {
      const res = await fetch('http://localhost:3200/api/auth/billing-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
    {/* Title - 10% */}
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

    {/* First Name - 90% */}
    <div className="w-[90%]">
      <label className="block text-xs sm:text-sm font-medium text-[#626D76] mb-1">
        First Name
      </label>
      <input
        {...register('firstName', { required: 'First name is required' })}
        className="border border-[#CECECE] rounded-lg p-2 w-full h-[42px] text-xs sm:text-sm"
      />
      <p className="text-red-500 text-xs">{errors.firstName?.message}</p>
    </div>
  </div>
</div>

      <div className="border-t border-[#BDBDBD] my-6" />
      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Currently Saved Address</h2>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">House No or Building No</label>
          <input {...register('buildingNo')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
        </div>

        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">Building Type</label>
          <div className="relative">
            <select
              {...register('buildingType')}
              className="border border-[#CECECE] rounded p-2 pr-8 w-full text-sm h-[42px] appearance-none"
              defaultValue=""
            >
              <option value="" disabled>Select Building type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condominium">Condominium</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Other">Other</option>
            </select>
            <FaAngleDown className="absolute right-3 top-[23px] -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[100px] mb-6 mt-4 md:w-[89%]">
        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">Street Name</label>
          <input {...register('streetName')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
        </div>

        <div className="w-full lg:w-1/2">
          <label className="block text-sm font-medium text-[#626D76] mb-1">City</label>
          <input {...register('city')} className="border border-[#CECECE] rounded p-2 w-full text-sm" />
        </div>
      </div>

      <div className="border-t border-[#BDBDBD] my-8" />
      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-1">Contact</h2>
      <p className="text-xs md:text-sm text-[#626D76] mb-6">Manage your account email address for the invoices.</p>


<div className="flex flex-col lg:flex-row gap-y-1 lg:gap-x-2">
  {[1, 2].map((num) => (
    <div key={num} className="flex flex-col w-full md:w-[48.5%]">
      <label className="block text-sm font-medium text-[#626D76] mb-1">
        Phone Number {num}
      </label>
      <div className="flex gap-4">
        {/* Country Code Selector - 25% on small, 14% on md+ */}
        <div className="relative w-[25%] md:w-[14%] min-w-[70px]">
          <select
            {...register(`phoneCode${num}` as const)}
            className="appearance-none border border-[#CECECE] rounded-lg p-2 w-full h-[42px] pr-8 text-sm"
          >
            <option value="+94">+94</option>
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
          </select>
          <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
        </div>

        {/* Phone Number Field - 70% on small, 65% on lg */}
        <div className="w-[70%] lg:w-[65%]">
          <input
            type="text"
            {...register(`phoneNumber${num}` as const, {
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
            {errors[`phoneNumber${num}` as keyof BillingFormData]?.message}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>


      <div className="flex justify-end gap-4 mt-10">
        <button type="button" className="w-[90px] h-[36px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]">Cancel</button>
        <button type="submit" className="w-[90px] h-[36px] text-sm rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] mb-4">Save</button>
      </div>
    </form>
  );
};

export default BillingDetailsForm;
