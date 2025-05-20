'use client';

import React, { useState, useEffect } from 'react';
import CustomDropdown from '../../components/home/CustomDropdown';

interface FormData {
    name: string;
    email: string;
    deliveryMethod: string;
}

// Simulated fetched data from a DB
const fetchedData: FormData = {
    name: 'John Doe',
    email: 'john@example.com',
    deliveryMethod: 'pickup',
};

const CustomForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [buildingType, setBuildingType] = useState('');
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        deliveryMethod: '',
        buildingType: '', // ✅ new error field
      });

    // Simulate data fetch and pre-fill the form on component mount
    useEffect(() => {
        setName(fetchedData.name);
        setEmail(fetchedData.email);
        setDeliveryMethod(fetchedData.deliveryMethod);
    }, []);

    // === Live Validation Handlers ===
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
        console.log(buildingType)
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const formData = { name, email, deliveryMethod, buildingType };
        console.log('Updated form data:', formData);
        // Here you would typically send a PATCH/PUT request
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md w-full max-w-md mx-auto">
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
                    placeholder="Select building type" // optional, in your CustomDropdown
                />
                {errors.buildingType && <p className="text-red-600 text-sm mt-1">{errors.buildingType}</p>}
            </div>


            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Update
            </button>
        </form>
    );
};

export default CustomForm;
