import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { packageAddToCart } from '@/services/product-service';
import { getCartInfo } from '@/services/auth-service';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateCartInfo } from '@/store/slices/authSlice';

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
  onAddToCartStart?: () => void;
  onAddToCartSuccess?: (message: string) => void;
  onAddToCartError?: (message: string) => void;
  isLoadingDetails: boolean;
  errorDetails?: string | null;
  onShowConfirmModal: (packageData: any) => void;
  onShowLoginPopup: () => void;
}

/**
 * Shows text centered on a single line.
 * If the text is wider than its container (i.e. it would wrap to 2 lines),
 * it scrolls slowly as a marquee so the user can read the full name.
 */
const MarqueeText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!containerRef.current || !measureRef.current) return;
      setIsOverflowing(measureRef.current.offsetWidth > containerRef.current.clientWidth + 1);
    };

    check();

    const observer = new ResizeObserver(check);
    if (containerRef.current) observer.observe(containerRef.current);
    if (measureRef.current) observer.observe(measureRef.current);

    return () => observer.disconnect();
  }, [text]);

  // Slower for longer names (minimum 8s per loop)
  const duration = Math.max(8, text.length * 0.25);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden whitespace-nowrap ${className}`}
      title={text}
    >
      {/* Hidden element used only to measure the real single-line text width */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 inline-block whitespace-nowrap pointer-events-none"
      >
        {text}
      </span>

      {isOverflowing ? (
        <div
          className="pkg-marquee-track"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="pr-8">{text}</span>
          <span className="pr-8" aria-hidden="true">{text}</span>
        </div>
      ) : (
        <span className="block text-left">{text}</span>
      )}

      <style>{`
        @keyframes pkg-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .pkg-marquee-track {
          display: inline-flex;
          width: max-content;
          animation-name: pkg-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .pkg-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .pkg-marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
};

const PackageCard: React.FC<PackageProps> = ({
  packageItem,
  isSelected,
  packageDetails,
  onPackageClick,
  onClosePopup,
  onAddToCartStart,
  onAddToCartSuccess,
  onAddToCartError,
  isLoadingDetails,
  errorDetails,
  onShowConfirmModal,
  onShowLoginPopup
}) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  // FIX: typed as object | null, not string | null — avoids silent truthy/falsy bugs
  const user = useSelector((state: RootState) => state.auth.user) as object | null;

  const handlePackageAddToCart = async () => {
    if (!packageDetails || packageDetails.length === 0) {
      onAddToCartError?.('Package details are empty');
      return;
    }

    if (!token || !user) {
      onShowLoginPopup();
      return;
    }

    onAddToCartStart?.();
    try {
      const res = await packageAddToCart(packageItem.id, token);

      if (res.status === true) {
        try {
          const cartInfo = await getCartInfo(token);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error('Error fetching cart info:', cartError);
        }

        onAddToCartSuccess?.(res.message || 'Package added to cart successfully!');
        onClosePopup();
      } else {
        onAddToCartError?.(res.message || 'Failed to add package to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      onAddToCartError?.('Failed to add package to cart. Please try again.');
    }
  };

  const handleAddToCartClick = () => {
    if (!token || !user) {
      onShowLoginPopup();
      return;
    }

    onShowConfirmModal({
      packageItem,
      packageDetails,
      handlePackageAddToCart
    });
  };

  const handlePackageActionClick = () => {
    if (!token || !user) {
      onShowLoginPopup();
      return;
    }

    onPackageClick(packageItem.id);
  };

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart}`;
  };

  return (
    <div className="w-full h-full">
      {!isSelected ? (
        <div
          className="flex h-full min-h-[350px] flex-col overflow-hidden rounded-2xl border border-[#dedeea] bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer"
          onClick={() => onPackageClick(packageItem.id)}
        >
          <div className="aspect-[16/9] w-full shrink-0 overflow-hidden">
            <Image
              src={packageItem.image}
              alt={packageItem.displayName}
              width={400}
              height={250}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>

          <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5">
            <MarqueeText
              text={packageItem.displayName}
              className="mb-2 text-left text-base font-bold leading-tight text-[#171d27] sm:text-lg"
            />
            <p className="mb-3 text-xs leading-relaxed text-[#46536a] sm:text-sm">
              A simple starting point for everyday cooking. Four vegetables for your next meal.
            </p>
            <div className="mt-auto">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#171d27] sm:text-base">
                  Rs. {formatPrice(packageItem.subTotal)}
                  <span className="ml-1 text-xs font-normal text-[#46536a]">/ basket</span>
                </p>
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-[#ff5635] hover:underline sm:text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPackageClick(packageItem.id);
                  }}
                >
                  What&apos;s inside?
                </button>
              </div>
              <button
                type="button"
                className="w-full rounded-full bg-[#171d27] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#303946] sm:text-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePackageActionClick();
                }}
              >
                Add {packageItem.displayName} +
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${packageItem.displayName} package details`}
          className="relative mx-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[22px] bg-white text-[#171d27] shadow-2xl"
          data-package-popup={packageItem.id}
        >
          <div className="flex items-center justify-between border-b border-[#ececf0] px-5 py-4 sm:px-6">
            <h2 className="pr-4 text-lg font-bold tracking-tight sm:text-xl">
              {packageItem.displayName}
            </h2>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#596579] text-white transition-colors hover:bg-[#414c5e]"
              onClick={onClosePopup}
              aria-label="Close package details"
            >
              <X size={19} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <div className="mb-4 aspect-[2.1/1] w-full overflow-hidden rounded-xl">
              <Image
                src={packageItem.image}
                alt={packageItem.displayName}
                width={800}
                height={380}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center' }}
              />
            </div>

            <h3 className="mb-1 text-base font-semibold text-[#ff5635] sm:text-lg">
              {packageItem.displayName}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-[#46536a]">
              A simple starting point for everyday cooking. Four vegetables for your next meal.
            </p>

            <div className="mb-4 grid grid-cols-2 gap-x-6">
              {isLoadingDetails ? (
                <div className="col-span-2 py-4 text-center text-sm text-[#46536a]">Loading products...</div>
              ) : errorDetails ? (
                <div className="col-span-2 py-4 text-center text-sm text-red-600">{errorDetails}</div>
              ) : (
                packageDetails?.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center justify-between gap-2 border-b border-[#e7e7e7] py-2 text-xs sm:text-sm"
                  >
                    <span className="min-w-0 truncate">{item.displayName}</span>
                    <span className="shrink-0 text-base font-medium text-[#ff5635]">
                      {item.quantity}
                      {item.quantityType && <span className="ml-1">{item.quantityType}</span>}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-[#ff603d] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#f24e2c] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              onClick={handleAddToCartClick}
              disabled={isLoadingDetails || !packageDetails?.length}
            >
              {isLoadingDetails
                ? 'Loading...'
                : `Add to basket  ·  Rs. ${formatPrice(packageItem.subTotal)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCard;