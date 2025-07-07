'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Trash } from 'lucide-react';
import {
  getExcludedItems,
  deleteExcludedItems
} from '@/services/product-service';
import Loader from '@/components/loader-spinner/Loader'; // Import the Loader component

interface Item {
  displayName: string;
  image: string;
}

const ViewMyList = () => {
  const authToken = useSelector((state: RootState) => state.auth.token);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      setLoading(true); // Set loading to true before fetching
      try {
        const data = await getExcludedItems(authToken);
        if (data.status && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setError(data.message || 'Failed to fetch items');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch items');
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchItems();
  }, [authToken]);

  const handleToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((i) => i.displayName));
    }
  };

  const handleDeleteClick = (displayName: string) => {
    setItemToDelete(displayName);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const handleDeleteSelectedClick = () => {
    if (selectedItems.length > 0) {
      setIsBulkDelete(true);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!authToken) return;
    setLoading(true); // Show loader during deletion
    const itemsToDelete = isBulkDelete ? selectedItems : itemToDelete ? [itemToDelete] : [];

    try {
      const response = await deleteExcludedItems(itemsToDelete, authToken);
      // Assuming response indicates success
      setItems((prev) => prev.filter((item) => !itemsToDelete.includes(item.displayName)));
      setSelectedItems((prev) => prev.filter((item) => !itemsToDelete.includes(item)));
      setSubmitStatus('Items deleted successfully!');
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete items');
      setTimeout(() => setError(null), 3000);
    } finally {
      setItemToDelete(null);
      setIsBulkDelete(false);
      setShowDeleteModal(false);
      setLoading(false); // Hide loader after deletion
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsBulkDelete(false);
  };

  return (
    <div className="relative z-10 px-4 sm:px-6 md:px-8 min-h-screen mb-10 bg-white blur-effect">
      <Loader isVisible={loading} /> {/* Add Loader component */}
      <h2 className="font-medium text-sm sm:text-base md:text-[18px] mb-2 mt-2">
        Exclude Item List
      </h2>
      <p className="text-xs sm:text-sm md:text-[16px] text-[#626D76] mb-3">
        These items will be removed during packaging, as per your preference.
      </p>
      <div className="border-t border-[#BDBDBD] mb-4 sm:mb-6 mt-2" />

      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
          <p className="text-[#000000] font-semibold text-sm sm:text-base">
            All ({items.length.toString().padStart(2, '0')})
          </p>
          {selectedItems.length > 0 && (
            <button
              className="flex items-center gap-2 text-red-600 hover:underline font-semibold text-sm sm:text-base"
              onClick={handleDeleteSelectedClick}
            >
              <Trash fill="red" className="w-4 h-4" />
              Delete Selected Items
            </button>
          )}
        </div>
      )}

      {error && <p className="text-center text-red-500 text-sm">{error}</p>}


      {!loading && !error && items.length > 0 && (
        <>
          {/* Desktop Table (Unchanged) */}
          <div className="hidden sm:block overflow-x-auto border border-[#CFCFCF] rounded-[15px] p-3 w-full max-w-full sm:max-w-[700px] mx-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="text-[#8492A3] font-semibold text-xs sm:text-sm">
                  <th className="p-2 text-left w-[10%]">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length}
                      onChange={handleSelectAll}
                      className="accent-[#4C5160] cursor-pointer"
                    />
                  </th>
                  <th className="p-2 text-left w-[20%]">IMAGE</th>
                  <th className="p-2 text-left w-[50%]">ITEM NAME</th>
                  <th className="p-2 text-left w-[20%]">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.displayName} className="text-xs sm:text-sm">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.displayName)}
                        onChange={() => handleToggle(item.displayName)}
                        className="cursor-pointer accent-[#4C5160]"
                      />
                    </td>
                    <td className="p-2">
                      <img
                        src={item.image}
                        alt={item.displayName}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/images/fallback.png';
                        }}
                      />
                    </td>
                    <td className="p-2 font-medium">{item.displayName}</td>
                    <td className="p-2">
                      <Trash
                        fill="red"
                        onClick={() => handleDeleteClick(item.displayName)}
                        className="text-red-600 cursor-pointer ml-4 p-1 text-[25px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Table */}
          <div className="sm:hidden border border-[#CFCFCF] rounded-[15px] p-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#8492A3] font-semibold text-[10px]">
                  <th className="p-1 text-left w-[10%]">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length}
                      onChange={handleSelectAll}
                      className="accent-[#4C5160] cursor-pointer w3 h-3"
                    />
                  </th>
                  <th className="p-1 text-left w-[20%]">IMG</th>
                  <th className="p-1 text-left w-[50%]">NAME</th>
                  <th className="p-1 text-left w-[20%]">ACT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.displayName} className="text-[10px]">
                    <td className="p-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.displayName)}
                        onChange={() => handleToggle(item.displayName)}
                        className="cursor-pointer accent-[#4C5160] w-3 h-3"
                      />
                    </td>
                    <td className="p-1">
                      <img
                        src={item.image}
                        alt={item.displayName}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/images/fallback.png';
                        }}
                      />
                    </td>
                    <td className="p-1 font-medium truncate">{item.displayName}</td>
                    <td className="p-1">
                      <Trash
                        fill="red"
                        onClick={() => handleDeleteClick(item.displayName)}
                        className="text-red-600 cursor-pointer w-4 h-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 sm:py-10">
          <img
            src="/icons/no complaints.png"
            alt="No excluded items"
            className="w-32 sm:w-48 h-32 sm:h-48 mb-3 sm:mb-4 object-contain"
          />
          <p className="text-center italic text-[#717171] text-xs sm:text-sm">
            --You have not added any items to the exclude list--
          </p>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-4 sm:p-8 shadow-xl text-center w-full max-w-[280px] sm:max-w-md">
            <Trash fill="red" className="mx-auto text-red-600 w-8 sm:w-12 h-8 sm:h-12 mb-3 sm:mb-4" />
            <h2 className="text-xs sm:text-xl font-semibold text-black">
              {isBulkDelete
                ? 'Remove these items from your exclude list?'
                : `Remove "${itemToDelete}" from your exclude list?`}
            </h2>
            <p className="text-gray-500 text-[10px] sm:text-sm mt-1 sm:mt-2">
              This action will allow {isBulkDelete ? 'these items' : 'this item'} to be included in
              future packages unless re-added.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={handleCancelDelete}
                className="w-full sm:w-32 px-3 sm:px-4 py-1 sm:py-2 cursor-pointer rounded-md border bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50 text-[10px] sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:w-32 px-3 sm:px-4 py-1 sm:py-2 rounded-md cursor-pointer bg-red-600 text-white hover:bg-red-700 text-[10px] sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMyList;