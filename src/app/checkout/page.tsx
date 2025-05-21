'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import CustomDropdown from '../../components/home/CustomDropdown';
import { updateForm, getForm } from '../../services/retail-service';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const initialFormData = {
    fullName: '',
    title: '',
    phone1: '',
    phone2: '',
    buildingNumber: '',
    buildingName: '',
    buildingType: '',
    flatNumber: '',
    floorNumber: '',
    houseNo: '',
    street: '',
    city: '',
    phoneCode1: '',
    phoneCode2: '',
    scheduleType: '',

}

const Page: React.FC = () => {
    const NavArray = [
        { name: 'Cart', path: '/cart', status: false },
        { name: 'Checkout', path: '/checkout', status: true },
        { name: 'Payment', path: '/payment', status: false },
    ];

    const [deliveryMethod, setDeliveryMethod] = useState('home');
    const [title, setTitle] = useState<string>('');
    const [fullName, setFullName] = useState('');
    const [phone1, setPhone1] = useState('');
    const [phone2, setPhone2] = useState('');
    const [buildingType, setBuildingType] = useState('Apartment');
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [timeSlot, setTimeSlot] = useState('');
    const [phoneCode2, setPhoneCode2] = useState('94');
    const [phoneCode1, setPhoneCode1] = useState('94');
    const [buildingNo, setBuildingNumber] = useState('');
    const [buildingName, setBuildingName] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [floorNumber, setFloorNumber] = useState('');
    const [houseNo, setHouseNumber] = useState('');
    const [street, setStreetName] = useState('');
    const [cityName, setCityName] = useState('');
    const [scheduleType, setScheduleType] = useState<string>('One Time');
    const [centerId, setCenterId] = useState<number>();
    const [number, setNumber] = useState('');

    const token = useSelector((state: RootState) => state.auth.token) as string | null;
    const [usePreviousAddress, setUsePreviousAddress] = useState(false);


    interface InitialData {
        fullName: string;
        title: string;
        phone1: string;
        phone2: string;
        buildingNumber: string;
        buildingName: string;
        buildingType: string;
        flatNumber: string;
        floorNumber: string;
        houseNo: string;
        street: string;
        city: string;
        phoneCode1: string;
        phoneCode2: string;
        scheduleType: string;

    }


    const [errors, setErrors] = useState({
        title: '',
        fullName: '',
        phone1: '',
        phone2: '',
        buildingType: '',
        buildingNumber: '',
        buildingName: '',
        flatNumber: '',
        floorNumber: '',
        houseNumber: '',
        streetName: '',
        cityName: '',
        deliveryDate: '',
        timeSlot: '',
        // phoneCode2: '',
        // phoneCode1: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchData = async () => {
        try {
            const data = await getForm(token);
            console.log('data fetched');
            console.log('data', data.results);

            const dataNew = data.results;
            return dataNew;
        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to load form data.');
            return null;
        } finally {
            setFetching(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const handleAddressOptionChange = async (value: string) => {
        if (value === 'previous') {
            setUsePreviousAddress(true);
            const dataNew = await fetchData();
            console.log('data new', dataNew);
            if (dataNew) {

                setBuildingNumber(dataNew.buildingNo || '');
                setBuildingType(dataNew.buildingType || 'Apartment');
                setCityName(dataNew.city || '');
                setHouseNumber(dataNew.houseNo || '');
                setPhone1(dataNew.phone1 || '');
                setPhone2(dataNew.phone2 || '');
                setPhoneCode1(dataNew.phoneCode1 || '94');
                setPhoneCode2(dataNew.phoneCode2 || '94');
                setStreetName(dataNew.street || '');
                setTitle(dataNew.title || '');
                setBuildingName(dataNew.buildingName || '');
                setFlatNumber(dataNew.flatNo || '');
                setFloorNumber(dataNew.floorNo || '');
                setScheduleType('One Time');
                setFullName(dataNew.fullName || '');
            }
        } else {
            setUsePreviousAddress(false);
            setFullName('');
            setTitle('');
            setPhone1('');
            setPhone2('');
            setPhoneCode1('94');
            setPhoneCode2('94');
            setBuildingType('Apartment');
            setDeliveryDate('');
            setTimeSlot('');
            setBuildingNumber('');
            setBuildingName('');
            setFlatNumber('');
            setFloorNumber('');
            setHouseNumber('');
            setStreetName('');
            setCityName('');
            setScheduleType('One Time');
        }
    };


    // === Live Validation Handlers ===
    const handleFullNameChange = (value: string) => {
        setFullName(value);

        const trimmed = value.trim();

        if (!trimmed) {
            setErrors(prev => ({ ...prev, fullName: 'Full Name is required.' }));
        } else if (!/^[A-Za-z\s]+$/.test(trimmed)) {
            setErrors(prev => ({ ...prev, fullName: 'Full Name must only contain letters and spaces.' }));
        } else {
            setErrors(prev => ({ ...prev, fullName: '' }));
        }
    };


    const handleTitleChange = (value: string) => {
        setTitle(value);
        console.log(title);
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, title: 'Title is required.' }));
        } else {
            setErrors(prev => ({ ...prev, title: '' }));
        }
    };

    const handlePhone1Change = (value: string) => {
        setPhone1(value);
    
        if (!value) {
            setErrors(prev => ({ ...prev, phone1: 'Phone number 1 is required.' }));
        } else if (!/^\d{9}$/.test(value)) {
            setErrors(prev => ({ ...prev, phone1: 'Please enter a valid phone number' }));
        } else {
            setErrors(prev => ({ ...prev, phone1: '' }));
        }
    };
    

    const handlePhone2Change = (value: string) => {
        setPhone2(value);
        if (!/^\d{9}$/.test(value)) {
            setErrors(prev => ({ ...prev, phone1: 'Please enter a valid phone number' }));
        } else {
            setErrors(prev => ({ ...prev, phone2: '' }));
        }
    };

    const handleTimeSlotChange = (value: string) => {
        setTimeSlot(value);
        console.log(timeSlot);
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, timeSlot: 'Time slot is required.' }));
        } else {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const handleBuildingTypeChange = (value: string) => {
        setBuildingType(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, buildingType: 'Building Type is required.' }));
        } else {
            setErrors(prev => ({ ...prev, buildingType: '' }));
        }
    };

    const handleBuildingNumberChange = (value: string) => {
        setBuildingNumber(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, buildingNumber: 'Building Number is required.' }));
        } else {
            setErrors(prev => ({ ...prev, buildingNumber: '' }));
        }
    };

    const handleBuildingNameChange = (value: string) => {
        setBuildingName(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, buildingName: 'Building Name is required.' }));
        } else {
            setErrors(prev => ({ ...prev, buildingName: '' }));
        }
    };

    const handleFlatNumberChange = (value: string) => {
        setFlatNumber(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, flatNumber: 'Flat Number is required.' }));
        } else {
            setErrors(prev => ({ ...prev, flatNumber: '' }));
        }
    };

    const handleFloorNumberChange = (value: string) => {
        setFloorNumber(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, floorNumber: 'Floor Number is required.' }));
        } else {
            setErrors(prev => ({ ...prev, floorNumber: '' }));
        }
    };

    const handleHouseNumberChange = (value: string) => {
        setHouseNumber(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, houseNumber: 'House Number is required.' }));
        } else {
            setErrors(prev => ({ ...prev, houseNumber: '' }));
        }
    };

    const handleStreetNameChange = (value: string) => {
        setStreetName(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, streetName: 'Street Name is required.' }));
        } else {
            setErrors(prev => ({ ...prev, streetName: '' }));
        }
    };

    const handleCityNameChange = (value: string) => {
        setCityName(value);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, cityName: 'City Name is required.' }));
        } else {
            setErrors(prev => ({ ...prev, cityName: '' }));
        }
    };

    const handleDeliveryDateChange = (value: string) => {
        setDeliveryDate(value);

        if (!value) {
            setErrors(prev => ({ ...prev, deliveryDate: 'Delivery Date is required.' }));
        } else {
            setErrors(prev => ({ ...prev, deliveryDate: '' }));
        }
    };



    const validate = () => {
        const newErrors = {
            fullName: '', title: '', phone1: '', phone2: '', timeSlot: '',
            buildingType: '', buildingName: '', buildingNumber: '',
            streetName: '', cityName: '', houseNumber: '',
            floorNumber: '', flatNumber: '', deliveryDate: ''
        };
        let valid = true;

        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required.';
            valid = false;
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Full Name must be at least 2 characters.';
            valid = false;
        }

        if (!title.trim()) {
            newErrors.title = 'Title is required.';
            valid = false;
        }

        if (!phone1) {
            newErrors.phone1 = 'Phone number 01 is required.';
            valid = false;
        }

        // if (!phone2) {
        //     newErrors.phone2 = 'Phone number 02 is required.';
        //     valid = false;
        // }

        if (!timeSlot) {
            newErrors.timeSlot = 'Time Slot is required.';
            valid = false;
        }

        if (!deliveryDate) {
            newErrors.deliveryDate = 'Delivery Date is required.';
            valid = false;
        }

        // Validate address only if deliveryMethod is "home"
        if (deliveryMethod === 'home') {
            if (!buildingType) {
                newErrors.buildingType = 'Building type is required.';
                valid = false;
            }

            if (!buildingName) {
                newErrors.buildingName = 'Building name is required.';
                valid = false;
            }

            if (!buildingNo) {
                newErrors.buildingNumber = 'Building number is required.';
                valid = false;
            }

            if (!street) {
                newErrors.streetName = 'Street name is required.';
                valid = false;
            }

            if (!cityName) {
                newErrors.cityName = 'City name is required.';
                valid = false;
            }

            if (!houseNo) {
                newErrors.houseNumber = 'House number is required.';
                valid = false;
            }

            if (!floorNumber) {
                newErrors.floorNumber = 'Floor number is required.';
                valid = false;
            }

            if (!flatNumber) {
                newErrors.flatNumber = 'Flat number is required.';
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!validate()) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Form',
                text: 'Please correctly fill all the required fields.',
            });
            return;
        }

        const formData: any = {
            fullName, title, phone1, phone2, timeSlot, deliveryDate, phoneCode1, phoneCode2, deliveryMethod, scheduleType
        };

        // Include address fields only if deliveryMethod is "home"
        if (deliveryMethod === 'home') {
            formData.buildingType = buildingType;
            formData.buildingName = buildingName;
            formData.buildingNumber = buildingNo;
            formData.streetName = street;
            formData.cityName = cityName;
            formData.houseNumber = houseNo;
            formData.floorNumber = floorNumber;
            formData.flatNumber = flatNumber;
        }

        console.log('Updated form data:', formData);

        try {
            setIsLoading(true);
            await updateForm(formData, token);
            setSuccessMsg('Form updated successfully!');
            await Swal.fire({
                title: 'Form uploaded Successful!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    popup: '!border-t-4 !border-t-[#3E206D]', // Purple top border
                },
                iconColor: '#3E206D', // Purple icon
                confirmButtonColor: '#3E206D', // Purple confirm button
            });
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to update form.');
            await Swal.fire({
                title: 'Form upload failed',
                // text: err.message || 'Invalid email or password. Please try again.',
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#3E206D',
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5 '>
                <TopNavigation NavArray={NavArray} />

                <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start mt-6 '>
                    {/* Left Section - Delivery Information */}
                    <div className='w-full min-h-[1100px] lg:w-2/3  bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-md border border-gray-300'>
                        <h1 className='text-xl font-bold mb-6'>Delivery Method</h1>

                        <div className='flex flex-col md:flex-row flex-wrap gap-4 mb-8'>
                            {/* Dropdown - Full width on all screens */}
                            <div className="w-full md:w-[32%]">

                                <CustomDropdown
                                    options={[
                                        { value: 'home', label: 'Home Delivery' },
                                        { value: 'pickup', label: 'Pickup' },
                                    ]}
                                    selectedValue={deliveryMethod}
                                    onSelect={setDeliveryMethod}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row ">

                                <div className="flex gap-8 flex-nowrap">

                                    <label className="flex items-center flex-nowrap">
                                        <input
                                            type="radio"
                                            name="addressMode"
                                            value="previous"
                                            checked={usePreviousAddress}
                                            onChange={() => handleAddressOptionChange('previous')}
                                            className="mr-2"
                                        />
                                        Your Last Order Address
                                    </label>

                                    <label className="flex items-center flex-nowrap">
                                        <input
                                            type="radio"
                                            name="addressMode"
                                            value="new"
                                            checked={!usePreviousAddress}
                                            onChange={() => handleAddressOptionChange('new')}
                                            className="mr-2"
                                        />
                                        Enter New Address
                                    </label>

                                </div>
                            </div>


                        </div>

                        <div className='border-t border-gray-300 my-6'></div>

                        {deliveryMethod === 'pickup' && (
                            <div className="w-full">
                                <h2 className='text-xl font-bold mb-6 mt-8 text-[#252525]'>
                                    Find your nearest center
                                </h2>

                                <h1>Agroword center</h1>
                            </div>
                        )}

                        <h2 className='text-xl font-bold mb-6 mt-8 text-[#252525]'>
                            {deliveryMethod === 'pickup' ? 'Pickup Person Information' : 'Delivery Information'}
                        </h2>

                        <div className='flex flex-row md:gap-4 gap-2 mb-6'>
                            {/* Title dropdown */}
                            <div className="w-2/9 md:w-1/9">
                                <label htmlFor="title" className='block font-semibold mb-1 text-[#2E2E2E]'>Title *</label>
                                <div className="w-full">
                                    <CustomDropdown
                                        options={[
                                            { value: 'Mr', label: 'Mr' },
                                            { value: 'Ms', label: 'Ms' },
                                            { value: 'Dr', label: 'Dr' },
                                        ]}
                                        selectedValue={title}
                                        onSelect={handleTitleChange}
                                        placeholder="Title"
                                    />
                                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                                </div>
                            </div>

                            {/* Full name input */}
                            <div className="w-7/9 md:w-8/9">
                                <label htmlFor="fullName" className='block font-semibold mb-1 text-[#2E2E2E]'>Full name *</label>
                                <input
                                    type="text"
                                    className='w-full border h-[39px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-3 text-base'
                                    placeholder='Enter your full name'
                                    value={fullName}
                                    onChange={(e) => handleFullNameChange(e.target.value)}
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
                                                { value: '+1', label: '+1' }
                                            ]}
                                            selectedValue={phoneCode1}
                                            onSelect={setPhoneCode1}
                                            placeholder="+94"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            className='w-full border h-[39px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2  text-[#808FA2]'
                                            value={phone1}
                                            onChange={(e) => handlePhone1Change(e.target.value)}
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
                                                { value: '+94', label: '+94' },
                                                { value: '+91', label: '+91' },
                                                { value: '+1', label: '+1' }
                                            ]}
                                            selectedValue={phoneCode2}
                                            onSelect={setPhoneCode2}
                                            placeholder="+94"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            className='w-full border h-[39px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 text-[#808FA2]'
                                            value={phone2}
                                            onChange={(e) => handlePhone2Change(e.target.value)}
                                            placeholder='7xxxxxxxx'
                                        />
                                        {errors.phone2 && (
                                            <p className="text-red-600 text-sm mt-1">{errors.phone2}</p>
                                        )}
                                    </div>
                                </div>
                            </div>


                        </div>
                        {deliveryMethod === 'home' && (
                            <div className="flex flex-wrap -mx-2">
                                {/* Building Type */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  text-[#2E2E2E] font-semibold mb-1">Building type *</label>

                                    <CustomDropdown
                                        options={[
                                            { value: 'Apartment', label: 'Apartment' },
                                            { value: 'House', label: 'House' },
                                            { value: 'Other', label: 'Other' }
                                        ]}
                                        selectedValue={buildingType}
                                        onSelect={setBuildingType}
                                        placeholder="Building type"
                                    />

                                </div>

                                {/* Apartment or Building No */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold text-[#2E2E2E] mb-1">Apartment or Building No *</label>
                                    <input
                                        value={buildingNo}
                                        onChange={(e) => handleBuildingNumberChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter House / Building No"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.buildingNumber && <p className="text-red-600 text-sm mt-1">{errors.buildingNumber}</p>}
                                </div>

                                {/* <div className="w-full md:w-1/2 px-2 mb-4">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        value={phone2}
                                        onChange={(e) => handlePhone2Change(e.target.value)}
                                        placeholder='7xxxxxxxx'
                                    />
                                    {errors.phone2 && (
                                        <p className="text-red-600 text-sm mt-1">{errors.phone2}</p>
                                    )}
                                </div> */}

                                {/* Apartment or Building Name */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold text-[#2E2E2E] mb-1">Apartment or Building Name *</label>
                                    <input
                                        value={buildingName}
                                        onChange={(e) => handleBuildingNameChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter building name"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.buildingName && <p className="text-red-600 text-sm mt-1">{errors.buildingName}</p>}
                                </div>

                                {/* Flat / Unit Number */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold text-[#2E2E2E] mb-1">Flat / Unit Number *</label>
                                    <input
                                        value={flatNumber}
                                        onChange={(e) => handleFlatNumberChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter flat number"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.flatNumber && <p className="text-red-600 text-sm mt-1">{errors.flatNumber}</p>}
                                </div>

                                {/* Floor Number */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold  text-[#2E2E2E] mb-1">Floor Number *</label>
                                    <input
                                        value={floorNumber}
                                        onChange={(e) => handleFloorNumberChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter floor number"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.floorNumber && <p className="text-red-600 text-sm mt-1">{errors.floorNumber}</p>}
                                </div>

                                {/* House Number */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold text-[#2E2E2E] mb-1">House Number *</label>
                                    <input
                                        value={houseNo}
                                        onChange={(e) => handleHouseNumberChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter house number"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.houseNumber && <p className="text-red-600 text-sm mt-1">{errors.houseNumber}</p>}
                                </div>

                                {/* Street Name */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block  font-semibold text-[#2E2E2E] mb-1">Street Name *</label>
                                    <input
                                        value={street}
                                        onChange={(e) => handleStreetNameChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter Street Name"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.streetName && <p className="text-red-600 text-sm mt-1">{errors.streetName}</p>}
                                </div>

                                {/* City */}
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block font-semibold text-[#2E2E2E] mb-1">City *</label>
                                    <input
                                        value={cityName}
                                        onChange={(e) => handleCityNameChange(e.target.value)}
                                        type="text"
                                        placeholder="Enter City name"
                                        className="w-full px-4 py-2 border h-[39px] border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {errors.cityName && <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>}
                                </div>
                            </div>
                        )
                        }


                        <div className='border-t border-gray-300 my-6'></div>

                        <h3 className='font-bold text-lg mb-4 text-[#252525]'>
                            {deliveryMethod === 'pickup' ? 'Schedule Pickup' : 'Schedule Delivery'}
                        </h3>

                        <div className='flex md:flex-row flex-col gap-4 mb-6'>
                            <div className="md:w-1/2 w-full">
                                <label className='block text-[#2E2E2E] font-semibold mb-4'>Date *</label>
                                <input
                                    type="date"
                                    className='w-full border h-[39px]  border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg px-4 py-2 text-[#3D3D3D]'
                                    value={deliveryDate}
                                    onChange={(e) => handleDeliveryDateChange(e.target.value)}
                                />
                                {errors.deliveryDate && <p className="text-red-600 text-sm mt-1">{errors.deliveryDate}</p>}
                            </div>
                            <div className="md:w-1/2 w-full">
                                <label className='block font-semibold mb-4'>Time Slot *</label>
                                <CustomDropdown
                                    options={[
                                        { value: '8-12', label: 'Within 8 - 12 PM' },
                                        { value: '12-4', label: 'Within 12 - 4 PM' },
                                        { value: '4-8', label: 'Within 4 - 8 PM' },
                                    ]}
                                    selectedValue={timeSlot}
                                    onSelect={handleTimeSlotChange}
                                    placeholder="Select Time Slot"
                                />
                                {errors.timeSlot && <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>}
                            </div>

                        </div>
                    </div>



                    {/* <div className='w-full lg:w-1/3 mt-6 lg:mt-0'>
                        <button type="submit" className='w-full bg-purple-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-900 transition-colors'>
                            Continue to Payment
                        </button>
                    </div> */}
                    {/* Right Section - Order Summary */}
                    <div className='w-full lg:w-1/3 mt-6 lg:mt-0'>
                        <div className='border border-gray-300 rounded-lg shadow-md p-4 sm:p-5 md:p-6'>
                            <h2 className='font-semibold text-lg mb-4'>Your Order</h2>

                            <div className='flex justify-between items-center mb-4'>
                                <p className="text-gray-600">18 items</p>
                                <p className='font-semibold'>Rs.3685.00</p>
                            </div>

                            <div className='border-t border-gray-300 my-4' />

                            <p className='font-semibold text-sm mb-2'>Coupon Code</p>
                            <div className='flex flex-row gap-3 w-full mt-2'>
                                <input
                                    type="text"
                                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm w-3/4'
                                    placeholder='Add coupon code'
                                />
                                <button className='bg-purple-800 text-white font-semibold rounded-lg px-3 py-2 text-sm w-1/4'>
                                    Apply
                                </button>
                            </div>

                            <div className='border-t border-gray-300 my-4' />

                            <div className='flex justify-between text-sm mb-2'>
                                <p className='text-gray-600'>Total</p>
                                <p className='font-semibold'>Rs.3670.00</p>
                            </div>

                            <div className='flex justify-between text-sm mb-2'>
                                <p className='text-gray-600'>Discount</p>
                                <p className='text-gray-600'>Rs.170.00</p>
                            </div>

                            <div className='flex justify-between text-sm mb-2'>
                                <p className='text-gray-600'>Delivery Charges</p>
                                <p className='text-gray-600'>Rs.185.00</p>
                            </div>

                            <div className='border-t border-gray-300 my-4' />

                            <div className='flex justify-between mb-4'>
                                <p className='font-semibold'>Grand Total</p>
                                <p className='font-semibold'>Rs.3685.00</p>
                            </div>

                            <button type="submit" className='w-full bg-purple-800 text-white font-semibold rounded-lg px-4 py-3 hover:bg-purple-900 transition-colors'>
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Page;