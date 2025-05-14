import React from 'react';

interface PackageItem {
  id: number;
  displayName: string;
  quantity: string;
  packageId: number;
}

interface PackageProps {
  packageItem: {
    id: number;
    displayName: string;
    image: string;
    subTotal: number;
  };
  isSelected: boolean;
  packageDetails?: PackageItem[];
  onPackageClick: (packageId: number) => void;
  onClosePopup: () => void;
  isLoadingDetails: boolean;
  errorDetails?: string | null;
}

const PackageCard: React.FC<PackageProps> = ({
  packageItem,
  isSelected,
  packageDetails,
  onPackageClick,
  onClosePopup,
  isLoadingDetails,
  errorDetails
}) => {
  return (
    <div className="w-full h-full">
      {!isSelected ? (
        // Original Package Card (unchanged)
        <div
          className="flex flex-col items-center justify-between w-full h-full border border-[#D7D7D7] rounded-lg shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300 min-h-[320px] cursor-pointer"
          onClick={() => onPackageClick(packageItem.id)}
        >
          <div className="w-full flex-shrink-0">
            <img
              src={packageItem.image}
              alt={packageItem.displayName}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col items-center justify-center w-full flex-grow px-2">
            <p className="font-bold text-base text-center line-clamp-2">
              {packageItem.displayName}
            </p>
            <p className="text-[#3E206D] font-medium text-sm sm:text-base mt-2">
              Rs.{packageItem.subTotal}
            </p>
          </div>
        </div>
      ) : (
        // New Popup Design (matches your reference image)
        <div className="w-full h-full bg-[#4B0082] rounded-2xl shadow-lg relative min-h-[320px] border border-gray-200 text-white flex flex-col">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClosePopup();
            }}
            className="absolute top-3 right-3 text-white hover:text-gray-300"
          >
            ✕
          </button>
  
          {/* Popup Content */}
          <div className="p-4 h-full flex flex-col">
            {/* Header with Price */}
            <div className="flex flex-row w-full justify-between">
              <div className="flex mb-4 items-start justify-start mr-4">
                <h3 className="text-white font-bold text-xl text-center">
                  i
                </h3>
              </div>
              
              <div className="flex mb-4 items-end justify-end mr-4">
                <h3 className="text-white font-bold text-xl text-center">
                  Rs.{packageItem.subTotal} <span className="text-sm font-normal">/ pack</span>
                </h3>
              </div>
            </div>
  
            {/* Product List */}
            <div className="flex-grow overflow-y-auto mb-4 max-h-[180px] scrollbar-thin scrollbar-thumb-white scrollbar-track-[#4B0082]">
              {isLoadingDetails ? (
                <div className="text-center py-8 text-white">Loading products...</div>
              ) : errorDetails ? (
                <div className="text-red-200 text-center py-8">{errorDetails}</div>
              ) : (
                <ul className="space-y-2 px-1">
                  {packageDetails?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center border-b border-white/30 py-1 text-sm"
                    >
                      <span>{item.displayName}</span>
                      <span className="text-white">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
  
            {/* Spacer to push button to bottom */}
            <div className="mt-auto"></div>
            
            {/* Add to Cart Button */}
            <button
              className="w-full bg-white text-[#4B0082] py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors mt-2"
              onClick={(e) => {
                e.stopPropagation();
                // Add to cart functionality here
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCard;