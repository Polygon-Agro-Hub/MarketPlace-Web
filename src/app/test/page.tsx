'use client';

import React, { useState, useEffect } from 'react';
import CustomDropdown from '../../components/home/CustomDropdown';
import { updateForm, getForm } from '../../services/retail-service';

const CustomForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('home');
    const [buildingType, setBuildingType] = useState('');
    const [usePreviousAddress, setUsePreviousAddress] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        deliveryMethod: '',
        buildingType: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getForm();
                setInitialData(data); // Save fetched data
            } catch (error: any) {
                setErrorMsg(error.message || 'Failed to load form data.');
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, []);

    const handleAddressOptionChange = (value: string) => {
        if (value === 'previous') {
            setUsePreviousAddress(true);
            if (initialData) {
                setName(initialData.name || '');
                setEmail(initialData.email || '');
                setDeliveryMethod(initialData.deliveryMethod || '');
                setBuildingType(initialData.buildingType || '');
            }
        } else {
            setUsePreviousAddress(false);
            setName('');
            setEmail('');
            setDeliveryMethod('');
            setBuildingType('');
        }
    };


    const handleNameChange = (value: string) => {
        setName(value);
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, name: 'Name is required.' }));
        } else if (value.trim().length < 2) {
            setErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters.' }));
        } else {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };


    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email is required.' }));
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
            setErrors(prev => ({ ...prev, email: 'Email is not valid.' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };



    const handleDeliveryChange = (value: string) => {
        setDeliveryMethod(value);
        if (!value) {
            setErrors(prev => ({ ...prev, deliveryMethod: 'Delivery method is required.' }));
        } else {
            setErrors(prev => ({ ...prev, deliveryMethod: '' }));
        }
    };

    const handleBuildingTypeChange = (value: string) => {
        setBuildingType(value);
        if (!value) {
            setErrors(prev => ({ ...prev, buildingType: 'Building type is required.' }));
        } else {
            setErrors(prev => ({ ...prev, buildingType: '' }));
        }
    };

    const validate = () => {
        const newErrors = { name: '', email: '', deliveryMethod: '', buildingType: '' };
        let valid = true;

        if (!name.trim()) {
            newErrors.name = 'Name is required.';
            valid = false;
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
            valid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required.';
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Email is not valid.';
            valid = false;
        }

        if (!deliveryMethod) {
            newErrors.deliveryMethod = 'Delivery method is required.';
            valid = false;
        }

        if (!buildingType) {
            newErrors.buildingType = 'Building type is required.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!validate()) return;

        const formData = { name, email, deliveryMethod, buildingType };

        try {
            setLoading(true);
            await updateForm(formData);
            setSuccessMsg('Form updated successfully!');
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to update form.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="text-center mt-10">Loading form data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md w-full max-w-md mx-auto">

            <div className="mb-4">
                <label className="block font-medium mb-1">Select Address Mode:</label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="addressMode"
                            value="new"
                            checked={!usePreviousAddress}
                            onChange={() => handleAddressOptionChange('new')}
                            className="mr-2"
                        />
                        Use New Address
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="addressMode"
                            value="previous"
                            checked={usePreviousAddress}
                            onChange={() => handleAddressOptionChange('previous')}
                            className="mr-2"
                        />
                        Use Previous Address
                    </label>
                </div>
            </div>
            {/* Name */}
            <div>
                <label htmlFor="name" className="block font-medium mb-1">Name:</label>
                <input
                    type="text"
                    id="name"
                    className="w-full border p-2 rounded"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block font-medium mb-1">Email:</label>
                <input
                    type="email"
                    id="email"
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Delivery Method */}
            <div>
                <label className="block font-medium mb-1">Delivery Method:</label>
                <CustomDropdown
                    options={[
                        { value: 'home', label: 'Home Delivery' },
                        { value: 'pickup', label: 'Pickup' },
                    ]}
                    selectedValue={deliveryMethod}
                    onSelect={handleDeliveryChange}
                />
                {errors.deliveryMethod && <p className="text-red-600 text-sm mt-1">{errors.deliveryMethod}</p>}
            </div>

            {/* Building Type */}
            <div>
                <label className="block font-medium mb-1">Building Type:</label>
                <CustomDropdown
                    options={[
                        { value: 'apartment', label: 'Apartment' },
                        { value: 'house', label: 'House' },
                        { value: 'office', label: 'Office' },
                    ]}
                    selectedValue={buildingType}
                    onSelect={handleBuildingTypeChange}
                    placeholder="Select building type"
                />
                {errors.buildingType && <p className="text-red-600 text-sm mt-1">{errors.buildingType}</p>}
            </div>

            {/* Feedback */}
            {successMsg && <p className="text-green-600 text-sm mt-1">{successMsg}</p>}
            {errorMsg && <p className="text-red-600 text-sm mt-1">{errorMsg}</p>}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Updating...' : 'Update'}
            </button>
        </form>
    );
};

export default CustomForm;
