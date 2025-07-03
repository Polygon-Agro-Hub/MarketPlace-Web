'use client';

import { RootState } from '@/store';
import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { getMarketplaceSuggestions, excludeItems } from '@/services/product-service';
import { useRouter } from 'next/navigation';

interface Item {
  displayName: string;
  image: string;
}

export default function ExcludeItems() {
  const router = useRouter();
  const authToken = useSelector((state: RootState) => state.auth.token) || null;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!authToken) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      const data = await getMarketplaceSuggestions(authToken);
      if (data.status && Array.isArray(data.items)) {
        const validatedItems = data.items.filter(
          (item: any): item is Item =>
            typeof item.displayName === 'string' && typeof item.image === 'string'
        );
        setItems(validatedItems);
      } else {
        setError(data.message || 'Failed to fetch items');
      }
      setLoading(false);
    };

    fetchItems();
  }, [authToken]);

  
  const handleToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleContinue = async () => {
    console.log('handleContinue called. Selected items:', selectedItems);

    if (!authToken) {
      setSubmitStatus('Authentication token is missing');
      console.log('No auth token, stopping');
      return;
    }

    setSubmitStatus(null);

    // Proceed even if no items are selected
    if (selectedItems.length > 0) {
      const response = await excludeItems(selectedItems, authToken);
      if (!response.status) {
        setSubmitStatus(response.message || 'Failed to exclude items.');
        return;
      }
    }

    // Clear selected items and navigate to summary
    setSelectedItems([]);
    console.log('Navigating to /exclude/summary');
    router.push('/exclude/summary');
  };

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen p-6 bg-white">
      {/* Heading */}
      <h2 className="text-[20px] md:text-[30px] font-bold mb-2 text-center text-[#001535]">
        Exclude Items (Optional)
      </h2>
      <p className="text-[14px] md:text-[22px] text-[#4C5160] mb-4 whitespace-normal text-center px-4">
        Select products you'd like to skip.
        <br className="block md:hidden" />
        We’ll customize your package accordingly.
      </p>

      <div className="w-full max-w-md">
        {/* Search Box */}
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


        {/* Loading and Error States */}
        {loading && <p className="text-center text-[#4C5160]">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {submitStatus && (
          <p
            className={`text-center mb-4 ${
              submitStatus.toLowerCase().includes('success') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {submitStatus}
          </p>
        )}

        {/* Item List */}
        {!loading && !error && filteredItems.length === 0 && (
          <p className="text-center text-[#4C5160]">No items found</p>
        )}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.displayName} className="flex items-center justify-between px-2">
                <div className="flex items-center">
                  <button
                    onClick={() => handleToggle(item.displayName)}
                    className={`w-5 h-5 rounded-full cursor-pointer border-2 mr-3 flex items-center justify-center ${
                      selectedItems.includes(item.displayName)
                        ? 'bg-red-500 border-red-500'
                        : 'border-[#A3A3A3]'
                    }`}
                    aria-label={`Toggle exclude ${item.displayName}`}
                  >
                    {selectedItems.includes(item.displayName) && (
                      <span className="text-white text-xs font-bold">×</span>
                    )}
                  </button>
                  <span className="text-[16px] md:text-[20px] font-medium">{item.displayName}</span>
                </div>
                <img
                  src={item.image}
                  alt={item.displayName}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/fallback.png';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#3E206D] cursor-pointer text-white p-2 rounded mt-6 font-semibold text-sm md:text-base"
          aria-label="Continue with selected exclusions"
        >
          Continue
        </button>
      </div>
    </div>
  );
}