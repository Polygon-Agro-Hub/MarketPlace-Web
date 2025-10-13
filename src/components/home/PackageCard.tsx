import React, { useState } from 'react';
import { useViewport } from './hooks/useViewport';
import Image from 'next/image';
import { packageAddToCart } from '@/services/product-service';
import { getCartInfo } from '@/services/auth-service';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateCartInfo } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import vegebox from '../../../public/Vegetables_Box.png';

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
  isSingleCardMobile?: boolean;
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
  onShowLoginPopup,
  isSingleCardMobile = false
}) => {
  const { isMobile } = useViewport();
  const dispatch = useDispatch();
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
        try {
          const cartInfo = await getCartInfo(token);
          console.log("Updated cart info:", cartInfo);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error('Error fetching cart info:', cartError);
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
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart}`;
  };

  // Dynamic height classes based on isSingleCardMobile prop
  const getCardHeight = () => {
    if (isSingleCardMobile) {
      return 'h-[400px] md:h-[320px] lg:h-[360px]';
    }
    return 'h-[200px] md:h-[320px] lg:h-[360px]';
  };

  const getSelectedCardHeight = () => {
    if (isSingleCardMobile) {
      return 'h-[500px] md:h-[400px] lg:h-[450px]';
    }
    return 'h-[380px] md:h-[400px] lg:h-[450px]';
  };

  const getScrollAreaHeight = () => {
    if (isSingleCardMobile) {
      return 'h-[280px] md:h-[200px] lg:h-[250px]';
    }
    return 'h-[200px] md:h-[200px] lg:h-[250px]';
  };

  // Image container dimensions
  const getImageContainerHeight = () => {
    if (isSingleCardMobile) {
      return 'h-[100px] md:h-[160px] lg:h-[180px]';
    }
    return 'h-[100px] md:h-[160px] lg:h-[240px]';
  };

  return (
    <div className="w-full h-full">
      {!isSelected ? (
        <div
          className={`flex flex-col items-center justify-between w-full ${getCardHeight()} border border-[#D7D7D7] rounded-3xl shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
          onClick={() => onPackageClick(packageItem.id)}
        >
          {/* Image container */}
          <div className={`w-full ${getImageContainerHeight()} flex-shrink-0 overflow-hidden rounded-lg`}>
            <Image
              src={packageItem.image}
              alt={packageItem.displayName}
              width={400}
              height={250}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center w-full flex-grow px-2 min-h-[80px] mt-2">
            <p className="font-bold text-sm lg:text-xl text-center line-clamp-2 leading-tight mb-2">
              {packageItem.displayName}
            </p>
            <p className="text-[#3E206D] text-xs sm:text-lg font-bold ">
              Rs.{formatPrice(packageItem.subTotal)}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-full ${getSelectedCardHeight()} bg-[#3E206D] rounded-3xl shadow-lg relative border border-gray-200 text-white flex flex-col mx-auto`}
          data-package-popup={packageItem.id}
        >
          <div className="p-4 h-full flex flex-col flex-grow mt-1">
            <div className="flex flex-row w-full justify-between mb-4">
              <div className="flex items-start justify-start mr-4">
                <div className="rounded-3xl bg-[#654D8A] px-2 pb-2 pt-1.5">
                  <Image
                    src={vegebox}
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

            <div className={`px-8 pt-2 overflow-y-auto ${getScrollAreaHeight()} scrollbar mb-4`}>
              {isLoadingDetails ? (
                <div className="">Loading products...</div>
              ) : errorDetails ? (
                <div className="text-red-200 text-center py-8">{errorDetails}</div>
              ) : (
                <ul className="space-y-2 px-1">
                  {packageDetails?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center border-b border-white/30 py-1 text-sm"
                    >
                      <span className="flex-1 text-start truncate pr-2 mb-2">{item.displayName}</span>
                      <span className="text-white text-start whitespace-nowrap mb-2">
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
                className="w-full bg-white text-[#000000] py-2 rounded-xl font-normal hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCartClick}
                disabled={isLoadingDetails}
              >
                {isLoadingDetails ? 'Loading...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCard;