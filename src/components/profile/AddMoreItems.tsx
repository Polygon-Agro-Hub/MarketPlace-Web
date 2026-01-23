'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Trash } from 'lucide-react';
import {
  getExcludedItems,
  deleteExcludedItems,
  excludeItems,
  getMarketplaceSuggestionsProfile
} from '@/services/product-service';
import Loader from '@/components/loader-spinner/Loader';
import { FiSearch } from 'react-icons/fi';
import SuccessPopup from '@/components/toast-messages/success-message';

interface Item {
  displayName: string;
  image: string;
}

const AddMoreItems = () => {
  const authToken = useSelector((state: RootState) => state.auth.token);
  const [excludedItems, setExcludedItems] = useState<Item[]>([]);
  const [marketplaceSuggestions, setMarketplaceSuggestions] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const excludedData = await getExcludedItems(authToken);
        console.log('Excluded Items:', excludedData);

        if (excludedData.status && Array.isArray(excludedData.items)) {
          setExcludedItems(excludedData.items);
        } else {
          setError(excludedData.message || 'Failed to fetch excluded items');
        }

        const suggestionsRes = await getMarketplaceSuggestionsProfile(authToken);
        console.log('Marketplace Suggestions:', suggestionsRes);

        if (suggestionsRes.status && Array.isArray(suggestionsRes.items)) {
          setMarketplaceSuggestions(suggestionsRes.items);
        } else {
          setMarketplaceSuggestions([]);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [authToken]);

  const excludedNames = excludedItems.map(item => item.displayName);
  const allItems = [
    ...excludedItems,
    ...marketplaceSuggestions.filter(
      (suggested) => !excludedNames.includes(suggested.displayName)
    )
  ];

  const filteredItems = allItems.filter((item) =>
    item.displayName?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleToggle = (itemName: string) => {
    // Only allow toggling if the item is not already excluded
    if (!excludedNames.includes(itemName)) {
      setSelectedItems((prev) =>
        prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
      );
    }
  };

  const handleContinue = async () => {
    console.log('handleContinue called. Selected items:', selectedItems);

    if (!authToken) {
      setSubmitStatus('Authentication token is missing');
      return;
    }

    setSubmitStatus(null);

    if (selectedItems.length > 0) {
      const response = await excludeItems(selectedItems, authToken);
      if (!response.status) {
        setSubmitStatus(response.message || 'Failed to exclude items.');
        return;
      }
      // Update excludedItems after successful exclusion
      const newExcludedItems = marketplaceSuggestions.filter((item) =>
        selectedItems.includes(item.displayName)
      );
      setExcludedItems((prev) => [...prev, ...newExcludedItems]);
    }

    setSelectedItems([]);
    setSubmitStatus('Items successfully excluded.');
    setShowSuccessPopup(true);
    setTimeout(() => {
      setSubmitStatus(null);
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handleConfirmDelete = async () => {
    if (!authToken) return;
    setLoading(true);
    const itemsToDelete = isBulkDelete ? selectedItems : itemToDelete ? [itemToDelete] : [];

    try {
      const response = await deleteExcludedItems(itemsToDelete, authToken);
      setExcludedItems((prev) => prev.filter((item) => !itemsToDelete.includes(item.displayName)));
      setSelectedItems((prev) => prev.filter((item) => !itemsToDelete.includes(item)));
      setSubmitStatus('Items deleted successfully!');
      setShowSuccessPopup(true);
      setTimeout(() => {
        setSubmitStatus(null);
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete items');
      setTimeout(() => setError(null), 3000);
    } finally {
      setItemToDelete(null);
      setIsBulkDelete(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-4 sm:px-6 md:px-8 min-h-screen bg-white blur-effect py-6">
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success!"
        description="Items have been successfully saved."
      />
      <Loader isVisible={loading} />
      <h2 className="font-medium text-sm sm:text-base md:text-[18px] mb-2">
        Add More Items
      </h2>
      <p className="text-xs sm:text-sm md:text-[16px] text-[#626D76] mb-3">
        Please mention all the items you’d like to exclude from your packages.
      </p>
      <div className="border-t border-[#BDBDBD] mb-4 sm:mb-6 mt-2" />
      <div className="flex items-center justify-center bg-white">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search for Product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-4 pr-10 rounded bg-[#EFE4FF] text-[#3E206D] placeholder-[#3E206D] placeholder-italic text-center italic text-[12px] md:text-[16px] outline-none"
              aria-label="Search products"
            />
            <FiSearch
              className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-[#3E206D]"
              aria-label="Search icon"
            />
          </div>
          {loading && <p className="text-center text-[#4C5160] text-sm md:text-base">Loading...</p>}
          {error && <p className="text-center text-red-500 text-sm md:text-base">{error}</p>}

          {!loading && !error && filteredItems.length === 0 && (
            <p className="text-center text-[#4C5160] text-sm md:text-base">No items found</p>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              {filteredItems.map((item) => {
                const isExcluded = excludedNames.includes(item.displayName);
                return (
                  <div
                    key={item.displayName}
                    className="flex items-center justify-between px-1 md:px-2"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggle(item.displayName)}
                        className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 mr-2 md:mr-3 flex items-center justify-center ${selectedItems.includes(item.displayName)
                          ? 'bg-red-500 border-red-500 cursor-pointer'
                          : isExcluded
                            ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
                            : 'border-[#A3A3A3] cursor-pointer'
                          }`}
                        disabled={isExcluded}
                        aria-label={`Toggle exclude ${item.displayName}`}
                      >
                        {selectedItems.includes(item.displayName) && (
                          <span className="text-white text-[10px] md:text-xs font-bold">×</span>
                        )}
                      </button>
                      <span
                        className={`text-sm md:text-[16px] font-medium ${isExcluded ? 'text-gray-400' : 'text-black'
                          }`}
                      >
                        {item.displayName}
                      </span>
                    </div>
                    <img
                      src={item.image}
                      alt={item.displayName}
                      className="w-8 h-8 md:w-14 md:h-14 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/images/fallback.png';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {filteredItems.length !== 0 && (
            <button
              onClick={handleContinue}
              className="w-full bg-[#3E206D] cursor-pointer text-white p-2 rounded mt-6 font-semibold text-sm md:text-base"
              aria-label="Continue with selected exclusions"
            >
              Save
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddMoreItems;