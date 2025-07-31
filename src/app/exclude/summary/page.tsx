'use client';

import { RootState } from '@/store';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {Trash } from 'lucide-react';
import {
  excludeItems,
  getExcludedItems,
  deleteExcludedItems,
  updateUserStatus
} from '@/services/product-service';
import { useRouter } from 'next/navigation';

interface Item {
  displayName: string;
  image: string;
}

export default function ExcludedItems() {
  const router = useRouter();
  const authToken = useSelector((state: RootState) => state.auth.token) || null;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);

  useEffect(() => {
    const fetchExcludedItems = async () => {
      if (!authToken) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      const data = await getExcludedItems(authToken);
      if (data.status && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setError(data.message || 'Failed to fetch excluded items');
      }
      setLoading(false);
    };

    fetchExcludedItems();
  }, [authToken]);

  const handleToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
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
    if (!authToken) {
      setSubmitStatus('Authentication token is missing');
      setShowDeleteModal(false);
      return;
    }

    const itemsToDelete = isBulkDelete ? selectedItems : itemToDelete ? [itemToDelete] : [];
    if (itemsToDelete.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    const response = await deleteExcludedItems(itemsToDelete, authToken);
    if (response.status) {
      const remaining = items.filter((item) => !itemsToDelete.includes(item.displayName));
      setItems(remaining);
      setSelectedItems((prev) => prev.filter((name) => !itemsToDelete.includes(name)));
      setSubmitStatus(
        isBulkDelete
          ? 'Selected items removed from exclude list!'
          : `Item "${itemToDelete}" removed from exclude list!`
      );
    } else {
      setSubmitStatus(response.message || 'Failed to remove items from exclude list.');
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsBulkDelete(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsBulkDelete(false);
  };

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.displayName));
    }
  };

  const allSelected =
    selectedItems.length === filteredItems.length && filteredItems.length > 0;

const handleContinue = async () => {
  console.log('handleContinue called. Selected items:', selectedItems, 'Token:', authToken);

  if (!authToken) {
    setSubmitStatus('Authentication token is missing');
    console.log('No auth token, stopping');
    return;
  }

  setSubmitStatus(null);
  setLoading(true);

  try {
    if (selectedItems.length > 0) {
      const excludeResponse = await excludeItems(selectedItems, authToken);
      if (!excludeResponse.status) {
        setSubmitStatus(excludeResponse.message || 'Failed to exclude items.');
        setLoading(false);
        return;
      }
    }

    const statusResponse = await updateUserStatus(authToken);
    if (!statusResponse.status) {
      setSubmitStatus(statusResponse.message || 'Failed to update user status.');
      setLoading(false);
      return;
    }

    setSelectedItems([]);
    console.log('Navigating to /home');
    router.push('/');
  } catch (error) {
    console.error('Error in handleContinue:', error);
    setSubmitStatus('An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen p-6 bg-white">
      <h2 className="text-[20px] md:text-[30px] font-bold mb-2 text-center text-[#001535]">
        Items you have chosen to exclude
      </h2>
      <p className="text-[14px] md:text-[22px] text-[#4C5160] mb-4 whitespace-normal text-center px-4">
        We’ll make sure these items are not included in any
        <br className="block md:hidden" />
        package unless you update your preferences.
      </p>

      <div className="w-full max-w-[700px]">
       

        {selectedItems.length > 0 && (
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={handleDeleteSelectedClick}
              className="flex items-center gap-1 text-red-600 cursor-pointer  hover:underline  font-semibold"
              aria-label="Delete selected items"
            >
            <Trash fill="red" className="w-4 h-4 cursor-pointer" />

              Delete Selected Items
            </button>
          </div>
        )}

        {loading && <p className="text-center text-[#4C5160]">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="overflow-hidden border border-[#CFCFCF] rounded-[15px] p-3">
            <table className="w-full">
              <thead>
                <tr className="text-[#8492A3] font-semibold">
                  <th className="p-2 text-left w-[10%]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="accent-[#4C5160] cursor-pointer"
                      aria-label="Select all items"
                    />
                  </th>
                  <th className="p-2 text-left w-[20%]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#8492A3]">ITEM</span>
                      <span className="text-[#8492A3] text-[12px] md:text-[14px]">
                        ({filteredItems.length.toString().padStart(2, '0')})
                      </span>
                    </div>
                  </th>
                  <th className="p-2 text-left w-[50%]">ITEM NAME</th>
                  <th className="p-2 text-left w-[20%]">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.displayName}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.displayName)}
                        onChange={() => handleToggle(item.displayName)}
                        className="mr-2 cursor-pointer accent-[#4C5160]"
                        aria-label={`Select ${item.displayName} to exclude`}
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
                    <td className="p-2">
                      <span className="text-[16px] md:text-[20px] font-medium">
                        {item.displayName}
                      </span>
                    </td>
                    <td className="p-2">
                      <Trash fill="red"
                        onClick={() => handleDeleteClick(item.displayName)}
                        className="text-red-600 cursor-pointer  ml-4 p-1  text-[25px]"
                        aria-label={`Delete ${item.displayName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="/icons/no complaints.png"
              alt="No complaints"
              className="w-64 h-64 mb-4 object-contain"
            />
            <p className="text-center italic text-[#717171] text-[14px] md:text-[16px]">
              --You have not added any items to the exclude list--
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl text-center wAXIS OF EVIL -full max-w-md">
            <Trash fill="red" className="mx-auto text-red-600 w-12 h-12 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-black">
              {isBulkDelete
                ? 'Are you sure you want to remove these items from your exclude list?'
                : `Are you sure you want to remove "${itemToDelete}" from your exclude list?`}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              This action will allow {isBulkDelete ? 'these items' : 'this item'} to be included in
              future packages unless re-added to the exclude list.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleCancelDelete}
                className="w-full sm:w-32 px-4 py-2 cursor-pointer rounded-md border bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:w-32 px-4 py-2 rounded-md cursor-pointer bg-red-600 text-white hover:bg-red-700"
                aria-label="Confirm deletion"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <button
          onClick={handleContinue}
          className="w-full bg-[#3E206D] cursor-pointer text-white p-2 rounded mt-13 font-semibold text-sm md:text-base"
          aria-label="Continue with selected exclusions"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}