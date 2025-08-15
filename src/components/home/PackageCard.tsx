import React, { useState } from 'react';
import { useViewport } from './hooks/useViewport';
import Image from 'next/image';
import { packageAddToCart } from '@/services/product-service';
import { getCartInfo } from '@/services/auth-service'; // Add this import
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import { RootState } from '@/store';
import { updateCartInfo } from '@/store/slices/authSlice'; // Add this import
import { useRouter } from 'next/navigation';

interface PackageItem {
  id: number;
  displayName: string;
  quantity: string;
  quantityType: string;
  packageId: number;
  mpItemId: number;
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
  onAddToCartSuccess?: (message: string) => void;
  onAddToCartError?: (message: string) => void;
  isLoadingDetails: boolean;
  errorDetails?: string | null;
  onShowConfirmModal: (packageData: any) => void;
  onShowLoginPopup: () => void;
}

const PackageCard: React.FC<PackageProps> = ({
  packageItem,
  isSelected,
  packageDetails,
  onPackageClick,
  onClosePopup,
  onAddToCartSuccess,
  onAddToCartError,
  isLoadingDetails,
  errorDetails,
  onShowConfirmModal,
  onShowLoginPopup
}) => {
  const { isMobile } = useViewport();
  const dispatch = useDispatch(); // Add this
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const user = useSelector((state: RootState) => state.auth.user) as string | null;
  const router = useRouter();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handlePackageAddToCart = async () => {
    if (!packageDetails || packageDetails.length === 0) {
      if (onAddToCartError) {
        onAddToCartError('Package details are empty');
      }
      return;
    }

    if (!token || !user) {
      if (onAddToCartError) {
        if (onShowLoginPopup) {
          onShowLoginPopup();
        }
      }
      return;
    }


    try {
      const res = await packageAddToCart(packageItem.id, token);
      console.log("res", res);

      if (res.status === true) {
        // Fetch updated cart info after successful add to cart
        try {
          const cartInfo = await getCartInfo(token);
          console.log("Updated cart info:", cartInfo);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error('Error fetching cart info:', cartError);
          // Don't fail the whole operation if cart info fetch fails
        }

        if (onAddToCartSuccess) {
          onAddToCartSuccess(res.message || 'Package added to cart successfully!');
        }
        onClosePopup();
      } else {
        console.log(res.message);
        if (onAddToCartError) {
          onAddToCartError(res.message || 'Failed to add package to cart');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (onAddToCartError) {
        onAddToCartError('Failed to add package to cart. Please try again.');
      }
    }
  };

  const handleAddToCartClick = () => {
    onShowConfirmModal({
      packageItem,
      packageDetails,
      handlePackageAddToCart
    });
  };

  const formatPrice = (price: number): string => {
    // Convert to fixed decimal first, then add commas
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimalPart}`;
  };



  return (
    <div className="w-full h-full">
      {!isSelected ? (
        <div
          className="flex flex-col items-center justify-between w-full h-[220px] md:h-[320px] lg:h-[360px] border border-[#D7D7D7] rounded-lg shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
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
              Rs.{formatPrice(packageItem.subTotal)}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-[380px] md:h-[400px] lg:h-[450px] bg-[#3E206D] rounded-2xl shadow-lg relative md:max-w-[360px] lg:max-w-[400px] min-w-[280px] border border-gray-200 text-white flex flex-col"
          data-package-popup={packageItem.id}
        >


          <div className="p-4 h-full flex flex-col flex-grow mt-1">
            <div className="flex flex-row w-full justify-between mb-4">
              <div className="flex items-start justify-start mr-4">
                <div className="rounded-3xl bg-[#654D8A] px-2 pb-2 pt-1.5">
                  <Image
                    src="/Vegetables_Box.png"
                    alt="Vegetables box icon"
                    width={22}
                    height={22}
                    className="object-contain rounded-[4px]"
                  />
                </div>
              </div>

              <div className="flex items-end justify-end mr-4">
                <h3 className="text-white font-bold text-xl text-center">
                  Rs.{formatPrice(packageItem.subTotal)}{' '}
                  <span className="text-sm font-normal">/ pack</span>
                </h3>
              </div>
            </div>

          <div className="px-8 pt-2 overflow-y-auto h-[200px] md:h-[200px] lg:h-[250px] scrollbar mb-4">
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
                      <span className="flex-1 text-start truncate pr-2 mb-7">{item.displayName}</span>
                      <span className="text-white text-start whitespace-nowrap mb-7">
                        {item.quantity}
                        {item.quantityType && <span className="ml-1">{item.quantityType}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex px-8 mt-4">
              <button
                className="w-full bg-white text-[#000000] py-2 rounded-xl font-normal hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={handleAddToCartClick}
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