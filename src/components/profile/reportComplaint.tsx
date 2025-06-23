

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { RootState } from '@/store';
import ErrorPopup from '@/components/toast-messages/error-message';
import SuccessPopup from '@/components/toast-messages/success-message';
import Loader from '@/components/loader-spinner/Loader';
import { submitComplaint } from '@/services/auth-service';
import { fetchComplaintCategories, Category } from '@/services/auth-service';

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
  // State variables
  const [categoryId, setCategoryId] = useState<string>('');
  const [complaintText, setComplaintText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id?: number; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Redux auth state
  const { token, user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      const fetchedCategories = await fetchComplaintCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length === 0) {
        setErrorMessage('Failed to load complaint categories. Please try again later.');
        setShowErrorPopup(true);
      }
      setIsLoading(false);
    };
    loadCategories();
  }, []);

  // Populate form with existing complaint data
  useEffect(() => {
    if (complaint && categories.length > 0) {
      const selectedCategory = categories.find((cat) => cat.id === complaint.complaintCategoryId);
      if (selectedCategory) {
        setCategoryId(selectedCategory.id.toString());
      } else {
        setCategoryId('');
        setErrorMessage('The selected complaint category is not available.');
        setShowErrorPopup(true);
      }
      setComplaintText(complaint.complaint || '');
      setExistingImages(complaint.images || []);
    }
  }, [complaint, categories]);

  // Handle file input for image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).filter((file) => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        const isDuplicate = images.some((img) => img.name === file.name && img.size === file.size);
        return isValidType && isValidSize && !isDuplicate;
      });

      if (newImages.length < e.target.files.length) {
        setErrorMessage('Some files were invalid (unsupported type, too large, or duplicates). Max size: 5MB.');
        setShowErrorPopup(true);
      }

      const totalImages = existingImages.length + images.length + newImages.length;
      if (totalImages > 6) {
        setErrorMessage('You can upload a maximum of 6 images.');
        setShowErrorPopup(true);
        return;
      }

      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // Drag-and-drop handlers
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
      const files = Array.from(e.dataTransfer.files).filter((file) => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        const isDuplicate = images.some((img) => img.name === file.name && img.size === file.size);
        return isValidType && isValidSize && !isDuplicate;
      });

      if (files.length < e.dataTransfer.files.length) {
        setErrorMessage('Some files were invalid (unsupported type, too large, or duplicates). Max size: 5MB.');
        setShowErrorPopup(true);
      }

      const totalImages = existingImages.length + images.length + files.length;
      if (totalImages > 6) {
        setErrorMessage('You can upload a maximum of 6 images.');
        setShowErrorPopup(true);
        return;
      }

      setImages((prev) => [...prev, ...files]);
    }
  };

  // Clear form
  const clearForm = () => {
    setCategoryId('');
    setComplaintText('');
    setImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setErrorMessage('');
    setShowErrorPopup(false);
    setShowSuccessPopup(false);
    setShowCancelSuccessPopup(true);
    setTimeout(() => setShowCancelSuccessPopup(false), 3000);
  };

  // Submit or update complaint
  const sendForm = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setShowErrorPopup(false);
    setSuccessMessage('');
    setShowSuccessPopup(false);

    if (!userId || !token) {
      setErrorMessage('You are not authenticated. Please log in first.');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a complaint category.');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    if (!complaintText.trim()) {
      setErrorMessage('Please provide a complaint description.');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        userId,
        token,
        complaintCategoryId: parseInt(categoryId),
        complaint: complaintText,
        images,
        imagesToDelete,
        complaintId: complaint?.id,
      };

      const response = await submitComplaint(payload);

      setSuccessMessage(
        `Complaint ${complaint?.id ? 'updated' : 'submitted'} successfully! Your feedback has been recorded. Thank you!`
      );
      setShowSuccessPopup(true);

      setTimeout(() => {
        clearForm();
        setIsLoading(false);
      }, 3000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setErrorMessage(error.message || 'An error occurred while processing the complaint.');
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  // Remove an image
  const removeImage = (index: number, isExisting: boolean, imageId?: number) => {
    if (isExisting && imageId) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagesToDelete((prev) => [...prev, imageId]);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Cancel Success Popup component
  const CancelSuccessPopup = ({
    isVisible,
    onClose,
    title,
    duration,
  }: {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    duration?: number;
  }) => {
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
      <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50" role="alert">
        <p>{title}</p>
      </div>
    );
  };

  return (
    <div className="relative z-40 px-6 md:px-8 bg-white">
      <Loader isVisible={isLoading} />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        description={errorMessage}
      />
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success"
        description={successMessage}
        duration={3000}
      />
     
      <h2 className="font-medium text-base text-[14px] md:text-[18px] mb-2 mt-2">
        {complaint?.id ? 'Update Complaint' : 'Report a Complaint'}
      </h2>
      <p className="text-[12px] md:text-[16px] text-[#626D76] mb-2">
        Have a concern or issue? This section is here to help.
      </p>

      <div className="border-t border-[#BDBDBD] mb-6 mt-1" />

      <div className="md:w-[95%]">
        {/* Complaint Category Dropdown */}
        <div className="mb-6">
          <label
            htmlFor="complaint-category"
            className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1"
          >
            Related Complaint Category
          </label>
          <div className="relative w-full md:w-[47%]">
            <select
              id="complaint-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`text-[12px] md:text-[16px] text-[#787878] w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-0 focus:border-[#3E206D] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              disabled={isLoading}
              aria-describedby="category-help"
            >
              <option value="" disabled>
                --Select Complaint Category--
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryEnglish}
                </option>
              ))}
            </select>
            <p id="category-help" className="text-xs text-[#626D76] mt-1 sr-only">
              Select the category that best describes your complaint.
            </p>
          </div>
        </div>

        {/* Complaint Textarea */}
        <div className="mb-6">
          <label
            htmlFor="complaint-text"
            className="block text-[12px] md:text-[14px] font-medium text-[#626D76] mb-1"
          >
            Please Explain the Complaint
          </label>
          <textarea
            id="complaint-text"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            className={`border border-[#CECECE] rounded-lg p-2 w-full h-52 text-[12px] md:text-[14px] font-medium resize-none focus:ring-0 focus:border-[#3E206D] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="Type here..."
            disabled={isLoading}
            aria-describedby="complaint-help"
          />
          <p id="complaint-help" className="text-xs text-[#626D76] mt-1 sr-only">
            Provide a detailed description of your complaint.
          </p>
        </div>

        {/* Image Upload and Preview */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label
              className={`min-h-[250px] border border-dashed border-[#CECECE] rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? 'bg-gray-100' : ''
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="text-4xl text-[#626D76] mb-4" />
              <span className="text-[12px] md:text-[14px] font-medium text-[#626D76] px-4">
                <p>Click or drag files here to upload </p>(maximum 6 photos)
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="flex-1 min-h-[250px] border border-[#CECECE] rounded-lg px-2 py-4 text-center text-[12px] md:text-[14px] font-medium text-[#848D95]">
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
                        className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#FA0000] rounded-full text-white hover:bg-[#D00000] ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isLoading}
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
                        className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#FA0000] rounded-full text-white hover:bg-[#D00000] ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isLoading}
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
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] text-[16px] md:text-[20px] font-medium rounded-lg text-[#757E87] bg-[#F3F4F7] hover:bg-[#e1e2e5] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={clearForm}
            disabled={isLoading}
          >
            Clear
          </button>
          <button
            type="submit"
            className={`w-[90px] h-[36px] sm:w-[110px] sm:h-[44px] text-[16px] md:text-[20px] font-medium rounded-lg text-white bg-[#3E206D] hover:bg-[#341a5a] mb-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={sendForm}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportComplaintForm;