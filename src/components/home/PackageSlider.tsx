import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  ChevronLeft,
  ChevronRight,
  Scale,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import PackageCard from "./PackageCard";
import { getPackageDetails } from "@/services/product-service";
import { useViewport } from "./hooks/useViewport";
import SuccessPopup from "../../components/toast-messages/success-message";
import ErrorPopup from "../../components/toast-messages/error-message";

interface Package {
  id: number;
  displayName: string;
  image: string;
  subTotal: number;
}

interface packagesProps {
  productData: Package[];
  onShowConfirmModal: (packageData: any) => void;
  onShowLoginPopup: () => void;
}

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-[-12px] lg:right-[-24px] top-1/2 z-10 hidden -translate-y-1/2 transform rounded-full bg-gray-200 p-2 shadow-lg hover:bg-gray-100 focus:outline-none cursor-pointer sm:block lg:p-3"
      aria-label="Next"
    >
      <ChevronRight className="h-6 w-6 text-gray-500" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-[-12px] lg:left-[-24px] top-1/2 z-10 hidden -translate-y-1/2 transform rounded-full bg-gray-200 p-2 shadow-lg hover:bg-gray-100 focus:outline-none cursor-pointer sm:block lg:p-3"
      aria-label="Previous"
    >
      <ChevronLeft className="h-6 w-6 text-gray-500" />
    </button>
  );
};

const PackageSlider: React.FC<packagesProps> = ({
  productData,
  onShowConfirmModal,
  onShowLoginPopup,
}) => {
  const { isMobile } = useViewport();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null,
  );
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showLoading, setShowLoading] = useState(false);

  const handlePackageAddToCartStart = () => {
    setShowLoading(true);
  };

  const handlePackageAddToCartSuccess = (message: string) => {
    setShowLoading(false);
    setSuccessMessage(message);
    setShowSuccess(true);
    handleClosePopup();
  };

  const PurpleLoadingPopup = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        </div>
      </div>
    );
  };

  const handlePackageClick = async (packageId: number) => {
    if (selectedPackageId === packageId) return;

    setSelectedPackageId(packageId);
    setIsLoadingDetails(true);
    setErrorDetails(null);

    try {
      const res = await getPackageDetails(packageId);
      setPackageDetails(res.packageItems);
    } catch (error: any) {
      setErrorDetails(error.message || "Failed to load package details");
      setErrorMessage(error.message || "Failed to load package details");
      setShowError(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedPackageId(null);
    setPackageDetails(null);
    setErrorDetails(null);
  };

  const handlePackageAddToCartError = (message: string) => {
    setShowLoading(false); // NEW — make sure spinner clears on error too
    setErrorMessage(message);
    setShowError(true);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && selectedPackageId && modalRef.current) {
        const modalContent = modalRef.current.querySelector(
          "[data-package-popup]",
        );
        if (
          modalRef.current.contains(event.target as Node) &&
          (!modalContent || !modalContent.contains(event.target as Node))
        ) {
          handleClosePopup();
        }
      } else if (!isMobile && selectedPackageId && containerRef.current) {
        const popupElements = containerRef.current.querySelectorAll(
          `[data-package-popup="${selectedPackageId}"]`,
        );
        let clickedOnPopup = false;
        popupElements.forEach((element) => {
          if (element.contains(event.target as Node)) {
            clickedOnPopup = true;
          }
        });
        if (!clickedOnPopup) {
          handleClosePopup();
        }
      }
    };

    if (selectedPackageId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedPackageId, isMobile]);

  // Dynamic settings based on productData length
  const getSliderSettings = () => {
    const itemCount = productData.length;

    // Base settings - dots disabled for all screen sizes
    const baseSettings = {
      dots: false, // Disabled pagination dots
      infinite: itemCount > 3, // Only infinite if we have more than 3 items
      speed: 500,
      nextArrow: itemCount > 3 ? <NextArrow /> : <></>,
      prevArrow: itemCount > 3 ? <PrevArrow /> : <></>,
    };

    // Determine slides to show based on item count and screen size
    let slidesToShow = Math.min(3, itemCount); // Never show more slides than items
    let slidesToScroll = 1;

    return {
      ...baseSettings,
      slidesToShow,
      slidesToScroll,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(3, itemCount),
            slidesToScroll: 1,
            dots: false, // Disabled for desktop
            infinite: itemCount > 3,
            arrows: itemCount > 3,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(2, itemCount),
            slidesToScroll: 1,
            dots: false, // Disabled for tablet
            infinite: itemCount > 2,
            arrows: itemCount > 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: Math.min(2, itemCount),
            slidesToScroll: 1,
            centerMode: false,
            dots: false, // Disabled for mobile
            infinite: itemCount > 2,
            arrows: itemCount > 2,
          },
        },
      ],
    };
  };

  const sectionIntro = (
    <div className="w-full max-w-7xl">
      <div className="mb-6 grid grid-cols-1 gap-4 border-b border-[#f0f0f0] pb-5 sm:grid-cols-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8faf3] text-[#14a878]">
            <Scale size={17} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171d27] sm:text-base">
              A little or a little more
            </h3>
            <p className="text-xs text-[#737373]">
              Choose the weight that works for you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-center">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#3478f6]">
            <Truck size={17} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171d27] sm:text-base">
              Your day, your delivery
            </h3>
            <p className="text-xs text-[#737373]">
              Choose home delivery or pickup.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e7] text-[#e99a16]">
            <SlidersHorizontal size={17} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171d27] sm:text-base">
              Make it your kind of basket
            </h3>
            <p className="text-xs text-[#737373]">
              Choose produce to suit your taste.
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5635]">
          Less planning, more cooking.
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[#171d27] sm:text-3xl">
          Good things come together.
        </h2>
        <p className="mt-1 text-sm text-[#46536a]">
          Start with a bundle, then add the little extras you love.
        </p>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-[#897a77] px-5 py-5 text-white sm:flex-row sm:items-center sm:px-7 sm:py-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Everyday, made easier
          </p>
          <p className="text-xl font-semibold sm:text-2xl">
            One good basket.{" "}
            <span className="font-serif italic">Plenty of good meals.</span>
          </p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-white/90 sm:text-sm">
          See what&apos;s inside each basket before adding. Pick the mix that
          suits your kitchen, your week and your appetite.
        </p>
      </div>
    </div>
  );

  const selectedPackage = productData.find(
    (packageItem) => packageItem.id === selectedPackageId,
  );
  const packageDetailsPopup = selectedPackage && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6"
      ref={modalRef}
    >
      <div className="w-full max-w-[500px]">
        <PackageCard
          packageItem={selectedPackage}
          isSelected={true}
          packageDetails={packageDetails}
          onPackageClick={handlePackageClick}
          onClosePopup={handleClosePopup}
          onAddToCartStart={handlePackageAddToCartStart}
          onAddToCartSuccess={handlePackageAddToCartSuccess}
          onAddToCartError={handlePackageAddToCartError}
          isLoadingDetails={isLoadingDetails}
          errorDetails={errorDetails}
          onShowConfirmModal={onShowConfirmModal}
          onShowLoginPopup={onShowLoginPopup}
        />
      </div>
    </div>
  );

  // If we have very few items, render them without slider
  if (productData.length <= 1) {
    return (
      <div
        className="my-5 flex w-full flex-col items-center package-slider-container"
        ref={containerRef}
      >
        {sectionIntro}
        <div className="flex w-full justify-center px-4">
          {productData.map((packageItem) => (
            <div
              key={packageItem.id}
              className="mx-auto flex w-full max-w-[340px] items-center justify-center px-2 py-3 sm:px-3"
            >
              <div className="mx-auto w-full">
                <PackageCard
                  packageItem={packageItem}
                  isSelected={false}
                  packageDetails={undefined}
                  onPackageClick={handlePackageClick}
                  onClosePopup={handleClosePopup}
                  onAddToCartStart={handlePackageAddToCartStart}
                  onAddToCartSuccess={handlePackageAddToCartSuccess}
                  onAddToCartError={handlePackageAddToCartError}
                  isLoadingDetails={false}
                  onShowConfirmModal={onShowConfirmModal}
                  onShowLoginPopup={onShowLoginPopup}
                />
              </div>
            </div>
          ))}
        </div>

        {packageDetailsPopup}

        <PurpleLoadingPopup isVisible={showLoading} />
        <SuccessPopup
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
          title={successMessage}
          description=""
          duration={3000}
        />
        <ErrorPopup
          isVisible={showError}
          onClose={() => setShowError(false)}
          title="Error"
          description={errorMessage}
          duration={3000}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center w-full my-5 package-slider-container"
      ref={containerRef}
    >
      {sectionIntro}

      <div className="relative w-full max-w-7xl">
        <div className="-mx-2 sm:-mx-3">
          <Slider {...getSliderSettings()}>
            {productData.map((packageItem) => (
              <div
                key={packageItem.id}
                className="mx-auto flex items-center justify-center px-2 py-3 sm:px-3"
              >
                <div className="mx-auto w-full">
                  <PackageCard
                    packageItem={packageItem}
                    isSelected={false}
                    packageDetails={undefined}
                    onPackageClick={handlePackageClick}
                    onClosePopup={handleClosePopup}
                    onAddToCartStart={handlePackageAddToCartStart}
                    onAddToCartSuccess={handlePackageAddToCartSuccess}
                    onAddToCartError={handlePackageAddToCartError}
                    isLoadingDetails={false}
                    onShowConfirmModal={onShowConfirmModal}
                    onShowLoginPopup={onShowLoginPopup}
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {packageDetailsPopup}

      <PurpleLoadingPopup isVisible={showLoading} />

      <SuccessPopup
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successMessage}
        description=""
        duration={3000}
      />

      <ErrorPopup
        isVisible={showError}
        onClose={() => setShowError(false)}
        title="Error"
        description={errorMessage}
        duration={3000}
      />
    </div>
  );
};

export default PackageSlider;
