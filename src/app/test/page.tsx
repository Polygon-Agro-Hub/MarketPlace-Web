'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setFormData } from '../../store/slices/formSlice';
import CustomDropdown from '../../components/home/CustomDropdown';

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

const TestPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const storedFormData = useSelector((state: RootState) => state.form);

  const [formData, setFormDataLocal] = useState<FormData>({
    name: '',
    email: '',
    deliveryMethod: '',
    buildingType: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    deliveryMethod: '',
    buildingType: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Load Redux data into local form state on mount
  useEffect(() => {
    setFormDataLocal(storedFormData);
  }, [storedFormData]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormDataLocal((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateField = (field: keyof FormData, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Name is required.';
        else if (value.length < 2) error = 'Name must be at least 2 characters.';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Email is not valid.';
        break;
      case 'deliveryMethod':
      case 'buildingType':
        if (!value) error = `${field === 'deliveryMethod' ? 'Delivery method' : 'Building type'} is required.`;
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: FormErrors = { ...errors };

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      validateField(field, formData[field]);
      if (formData[field].trim() === '') isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      // ✅ Store to Redux
      dispatch(setFormData(formData));

      setSuccessMsg('Form submitted and stored in Redux!');
    } catch (err) {
      setErrorMsg('Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md w-full max-w-md mx-auto">
      {/* Name */}
      <div>
        <label className="block mb-1 font-medium">Name:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 font-medium">Email:</label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>

      {/* Delivery Method */}
      <div>
        <label className="block mb-1 font-medium">Delivery Method:</label>
        <CustomDropdown
          options={[
            { value: 'home', label: 'Home Delivery' },
            { value: 'pickup', label: 'Pickup' },
          ]}
          selectedValue={formData.deliveryMethod}
          onSelect={(value) => handleFieldChange('deliveryMethod', value)}
        />
        {errors.deliveryMethod && <p className="text-red-600 text-sm">{errors.deliveryMethod}</p>}
      </div>

      {/* Building Type */}
      <div>
        <label className="block mb-1 font-medium">Building Type:</label>
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
        {errors.buildingType && <p className="text-red-600 text-sm">{errors.buildingType}</p>}
      </div>

      {/* Messages */}
      {successMsg && <p className="text-green-600">{successMsg}</p>}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default TestPage;
