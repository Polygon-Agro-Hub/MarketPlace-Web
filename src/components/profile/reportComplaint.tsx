'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCloudUploadAlt, FaAngleDown, FaTimes } from 'react-icons/fa';
import { RootState } from '@/store'; // Adjust path based on your project structure
import ErrorPopup from '@/components/toast-messages/error-message'; // Adjust path
import SuccessPopup from '@/components/toast-messages/success-message'; // Adjust path
import { submitComplaint } from '@/services/auth-service'; // Adjust path

// Interface for Complaint data structure
interface Complaint {
  id?: number;
  complaintCategoryId: number;
  complaint: string;
  images: { id?: number; url: string }[];
}

// Props interface for the component
interface ReportComplaintFormProps {
  complaint?: Complaint;
}

const ReportComplaintForm: React.FC<ReportComplaintFormProps> = ({ complaint }) => {
  // State variables for form fields and UI
  const [category, setCategory] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id?: number; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Extract token and userId from Redux store's auth slice
  const { token, user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  // Category mappings for complaint categories
  const categoryMap: { [key: string]: number } = {
    delivery: 1,
    product: 2,
    billing: 3,
  };

  const reverseCategoryMap: { [key: number]: string } = {
    1: 'delivery',
    2: 'product',
    3: 'billing',
  };

  // Populate form with existing complaint data when editing
  useEffect(() => {
    if (complaint) {
      setCategory(reverseCategoryMap[complaint.complaintCategoryId] || '');
      setComplaintText(complaint.complaint || '');
      setExistingImages(complaint.images || []);
    }
  }, [complaint]);

  // Handle file input for image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).filter((file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)
      );

      // Check total images (existing + new) against the limit
      const totalImages = existingImages.length + images.length + newImages.length;
      if (totalImages > 6) {
        setErrorMessage('You can upload a maximum of 6 images.');
        setShowErrorPopup(true);
        return;
      }

      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // Drag-and-drop event handlers
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)
      );

      // Check total images (existing + new) against the limit
      const totalImages = existingImages.length + images.length + files.length;
      if (totalImages > 6) {
        setErrorMessage('You can upload a maximum of 6 images.');
        setShowErrorPopup(true);
        return;
      }

      setImages((prev) => [...prev, ...files]);
    }
  };

  // Clear form fields and reset state
  const clearForm = () => {
    setCategory('');
    setComplaintText('');
    setImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setErrorMessage('');
    setShowErrorPopup(false);
    setSuccessMessage('');
    setShowSuccessPopup(false);
  };

  // Submit or update complaint via service
  const sendForm = async () => {
    setErrorMessage('');
    setShowErrorPopup(false);
    setSuccessMessage('');
    setShowSuccessPopup(false);

    // Debug: Check authentication state
    console.log('Auth state:', { userId, token });

    if (!userId || !token) {
      setErrorMessage('You are not authenticated. Please log in first.');
      setShowErrorPopup(true);
      return;
    }

    if (!category) {
      setErrorMessage('Please select a complaint category.');
      setShowErrorPopup(true);
      return;
    }

    if (!complaintText.trim()) {
      setErrorMessage('Please provide a complaint description.');
      setShowErrorPopup(true);
      return;
    }

    try {
      const payload = {
        userId,
        token,
        complaintCategoryId: categoryMap[category],
        complaint: complaintText,
        images,
        imagesToDelete,
        complaintId: complaint?.id,
      };

      // Debug: Log payload before submission
      console.log('Submitting payload:', payload);

      const response = await submitComplaint(payload);

      // Debug: Log response
      console.log('API response:', response);

      setSuccessMessage(
        `Complaint ${complaint?.id ? 'updated' : 'submitted'} successfully! Your feedback has been recorded. Thank you!`
      );
      setShowSuccessPopup(true);

      // Delay clearForm to allow SuccessPopup to display for 3 seconds
      setTimeout(() => {
        clearForm();
      }, 3000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setErrorMessage(error.message || 'An error occurred while processing the complaint.');
      setShowErrorPopup(true);
    }
  };

  // Remove an image from new or existing images
  const removeImage = (index: number, isExisting: boolean, imageId?: number) => {
    if (isExisting && imageId) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagesToDelete((prev) => [...prev, imageId]);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="relative z-40 px-6 md:px-8 bg-white">
      {/* Popup Notifications */}
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        description={errorMessage}
      />
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => {
          console.log('Closing success popup');
          setShowSuccessPopup(false);
        }}
        title="Success"
        description={successMessage}
        duration={3000}
      />

      <h2 className="font-medium text-base sm:text-lg md:text-xl mb-2 mt-2">
        {complaint?.id ? 'Update Complaint' : 'Report a Complaint'}
      </h2>
      <p className="text-[10.5px] md:text-sm text-[#626D76] mb-2">
        Have a concern or issue? This section is here to help.
      </p>

      <div className="border-t border-[#BDBDBD] mb-6 mt-1" />

      <div className="md:w-[95%]">
        {/* Complaint Category Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#626D76] mb-1">
            Related Complaint Category
          </label>
          <div className="relative w-full md:w-[47%]">
            <select
              className="appearance-none border border-[#CECECE] rounded-lg p-2 pr-10 w-full h-[42px] text-sm focus:ring-0 focus:border-[#CECECE]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled style={{ color: '#787878' }}>
                --Select Complaint Category
              </option>
              <option value="delivery">Delivery Issue</option>
              <option value="product">Product Issue</option>
              <option value="billing">Billing Issue</option>
            </select>
            <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          </div>
        </div>

        {/* Complaint Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#626D76] mb-1">
            Please Explain the Complaint
          </label>
          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            className="border border-[#CECECE] rounded-lg p-2 w-full h-52 text-sm resize-none focus:ring-0 focus:border-[#CECECE]"
            placeholder="Type here..."
          />
        </div>

        {/* Image Upload and Preview */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label
              className={`min-h-[250px] border border-dashed border-[#CECECE] rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging ? 'bg-gray-100' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="text-4xl text-[#626D76] mb-4" />
              <span className="text-sm text-[#626D76] px-4">
                <p>Click or drag files here to upload </p>(maximum 6 photos)
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {/* Image upload counter */}
            {/* <span className="text-sm text-[#626D76] mt-2 block text-center">
              {existingImages.length + images.length}/6 images uploaded
            </span> */}
          </div>

          <div className="flex-1 min-h-[250px] border border-[#CECECE] rounded-lg px-2 py-4 text-center text-sm text-[#848D95]">
            {images.length === 0 && existingImages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-sm text-[#626D76] italic">
                  -- No photos added to preview --
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-1 gap-y-2 w-full justify-items-center">
                {existingImages.map((img, i) => (
                  <div key={`existing-${i}`} className="flex flex-col items-center">
                    <div className="relative w-[6.5rem] h-[6.5rem] md:w-[8.5rem] md:h-[8.5rem]">
                      <img
                        src={img.url}
                        alt={`Existing image ${i}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage(i, true, img.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#FA0000] rounded-full text-white hover:bg-[#D00000]"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <span className="text-xs text-[#626D76] mt-0.5 truncate w-24">
                      Existing image
                    </span>
                  </div>
                ))}
                {images.map((img, i) => (
                  <div key={`new-${i}`} className="flex flex-col items-center">
                    <div className="relative w-[6.5rem] h-[6.5rem] md:w-[8.5rem] md:h-[8.5rem]">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={img.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage(i, false)}
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#FA0000] rounded-full text-white hover:bg-[#D00000]"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <span className="text-xs text-[#626D76] mt-0.5 truncate w-24">
                      {img.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            className="w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] text-sm rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5]"
            onClick={clearForm}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] mb-4 text-sm rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a]"
            onClick={sendForm}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportComplaintForm;