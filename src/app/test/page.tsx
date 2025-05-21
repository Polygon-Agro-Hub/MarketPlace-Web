'use client';

import React, { useState, useEffect } from 'react';
import CustomDropdown from '../../components/home/CustomDropdown';
import { updateForm, getForm } from '../../services/retail-service';

interface FormData {
    name: string;
    email: string;
    deliveryMethod: string;
    buildingType: string;
}

interface FormErrors {
    name: string;
    email: string;
    deliveryMethod: string;
    buildingType: string;
}

const CustomForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        deliveryMethod: 'home',
        buildingType: '',
    });

    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        email: '',
        deliveryMethod: '',
        buildingType: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Unified field change handler
    const handleFieldChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    // Field-specific validation
    const validateField = (field: keyof FormData, value: string) => {
        let error = '';
        
        switch (field) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required.';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters.';
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required.';
                } else if (!/^\S+@\S+\.\S+$/.test(value)) {
                    error = 'Email is not valid.';
                }
                break;
                
            case 'deliveryMethod':
            case 'buildingType':
                if (!value) {
                    error = `${field === 'deliveryMethod' ? 'Delivery method' : 'Building type'} is required.`;
                }
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Form-wide validation
    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        // Validate all fields
        (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
            validateField(field, formData[field]);
            if (errors[field]) isValid = false;
        });

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!validateForm()) return;

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md w-full max-w-md mx-auto">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block font-medium mb-1">Name:</label>
                <input
                    type="text"
                    id="name"
                    className="w-full border p-2 rounded"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
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
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
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
                    selectedValue={formData.deliveryMethod}
                    onSelect={(value) => handleFieldChange('deliveryMethod', value)}
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
                    selectedValue={formData.buildingType}
                    onSelect={(value) => handleFieldChange('buildingType', value)}
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