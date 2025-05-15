import React from 'react';
import { useViewport } from './hooks/useViewport';
import Image from 'next/image';

interface PackageItem {
  id: number;
  displayName: string;
  quantity: string;
  quantityType: string;
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
  const { isMobile } = useViewport();

  return (
    <div className="w-full h-full ">
      {!isSelected ? (
        // Original Package Card
        <div
          className="flex flex-col items-center justify-between w-4/5 h-1/4 border border-[#D7D7D7] rounded-lg shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300 md:min-h-[320px] md:max-h-full max-h-[240px] min-w-[140px] cursor-pointer"
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
        // Popup Design (with data attribute for identification)
        <div
          className="w-full h-full bg-[#3E206D] rounded-2xl shadow-lg relative min-h-[480px] max-w-[280px] border border-gray-200 text-white flex flex-col"
          data-package-popup={packageItem.id}
        >
          {/* Popup Content */}
          <div className="p-4 h-full flex flex-col flex-grow mt-1 ">
            {/* Header with Price */}
            <div className="flex flex-row w-full justify-between mb-4 ">
              <div className="flex items-start justify-start mr-4 ">
                <div className="rounded-3xl bg-[#654D8A] px-2 pb-2 pt-1.5"> {/* Added container with rounded border */}
                  <Image
                    src="/Vegetables_Box.png"
                    alt="Vegetables box icon"
                    width={22}
                    height={22}
                    className="object-contain rounded-[4px]" // Slightly rounded corners for the image itself
                  />
                </div>
              </div>

              <div className="flex items-end justify-end mr-4">
                <h3 className="text-white font-bold text-xl text-center">
                  Rs.{packageItem.subTotal}{' '}
                  <span className="text-sm font-normal">/ pack</span>
                </h3>
              </div>
            </div>

            {/* Product List */}
            <div className="px-8 pt-2 overflow-y-auto max-h-[380px] 
    scrollbar-thin scrollbar-thumb-white scrollbar-track-purple-800 mb-4">
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
                      <span className="flex-1 text-start truncate pr-2">{item.displayName}</span>
                      <span className="text-white text-start whitespace-nowrap">
                        {item.quantity}
                        {item.quantityType && <span className="ml-1">{item.quantityType}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Spacer to push the button down */}
            {/* <div className="flex-grow"></div> */}

            {/* Add to Cart Button */}
            <div className="flex px-8 mt-4">
              <button
                className="w-full bg-white text-[#000000] py-2 rounded-xl font-normal hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to cart functionality here
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default PackageCard;