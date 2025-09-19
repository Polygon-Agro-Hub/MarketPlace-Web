import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PackageCard from './PackageCard';
import { getPackageDetails } from '@/services/product-service';
import { useViewport } from './hooks/useViewport';
import SuccessPopup from '../../components/toast-messages/success-message';
import ErrorPopup from '../../components/toast-messages/error-message';

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
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none cursor-pointer"
            aria-label="Next"
        >
            <ChevronRight className="h-6 w-6 text-[#FF4421]" />
        </button>
    );
};

const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
        <button
            onClick={onClick}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none cursor-pointer"
            aria-label="Previous"
        >
            <ChevronLeft className="h-6 w-6 text-[#FF4421]" />
        </button>
    );
};

const PackageSlider: React.FC<packagesProps> = ({ productData, onShowConfirmModal, onShowLoginPopup }) => {
    const { isMobile } = useViewport();
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [packageDetails, setPackageDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [showLoading, setShowLoading] = useState(false);

    // Update the handlePackageAddToCartSuccess function
    const handlePackageAddToCartSuccess = (message: string) => {
        setShowLoading(true);
        
        // Show loading for 1.5 seconds before showing success
        setTimeout(() => {
            setShowLoading(false);
            setSuccessMessage(message);
            setShowSuccess(true);
            handleClosePopup();
        }, 1500);
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
            console.log('pkg details', res)
            setPackageDetails(res.packageItems);
        } catch (error: any) {
            setErrorDetails(error.message || 'Failed to load package details');
            setErrorMessage(error.message || 'Failed to load package details');
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
        setErrorMessage(message);
        setShowError(true);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobile && selectedPackageId && modalRef.current) {
                const modalContent = modalRef.current.querySelector('[data-package-popup]');
                if (modalRef.current.contains(event.target as Node) &&
                    (!modalContent || !modalContent.contains(event.target as Node))) {
                    handleClosePopup();
                }
            }
            else if (!isMobile && selectedPackageId && containerRef.current) {
                const popupElements = containerRef.current.querySelectorAll(`[data-package-popup="${selectedPackageId}"]`);
                let clickedOnPopup = false;
                popupElements.forEach(element => {
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
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: Math.min(2, itemCount),
                        slidesToScroll: 1,
                        dots: false, // Disabled for tablet
                        infinite: itemCount > 2,
                        arrows: itemCount > 2,
                    }
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
                    }
                }
            ]
        };
    };
    
    // If we have very few items, render them without slider
    if (productData.length <= 1) {
        return (
            <div className="flex flex-col items-center w-full my-5" ref={containerRef}>
                <div className="flex items-center justify-center gap-2 w-full my-4 md:my-8 px-2 md:px-20">
                    <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                    <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-xs md:text-sm px-3 md:px-6 py-1">
                        Packages
                    </span>
                    <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                </div>

                <div className="w-full flex justify-center px-4">
                    {productData.map((packageItem) => (
                        <div key={packageItem.id} className="w-full max-w-sm">
                            <PackageCard
                                packageItem={packageItem}
                                isSelected={selectedPackageId === packageItem.id && !isMobile}
                                packageDetails={selectedPackageId === packageItem.id ? packageDetails : undefined}
                                onPackageClick={handlePackageClick}
                                onClosePopup={handleClosePopup}
                                onAddToCartSuccess={handlePackageAddToCartSuccess}
                                onAddToCartError={handlePackageAddToCartError}
                                isLoadingDetails={isLoadingDetails && selectedPackageId === packageItem.id}
                                errorDetails={selectedPackageId === packageItem.id ? errorDetails : undefined}
                                onShowConfirmModal={onShowConfirmModal}
                                onShowLoginPopup={onShowLoginPopup}
                                isSingleCardMobile={isMobile && productData.length === 1}
                            />
                        </div>
                    ))}
                </div>

                {isMobile && selectedPackageId && (
                    <div
                        className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center"
                        ref={modalRef}
                    >
                        <div className="bg-transparent w-full max-w-md overflow-hidden items-center justify-center flex px-12">
                            <PackageCard
                                packageItem={productData.find(p => p.id === selectedPackageId)!}
                                isSelected={true}
                                packageDetails={packageDetails}
                                onPackageClick={handlePackageClick}
                                onClosePopup={handleClosePopup}
                                onAddToCartSuccess={handlePackageAddToCartSuccess}
                                onAddToCartError={handlePackageAddToCartError}
                                isLoadingDetails={isLoadingDetails}
                                errorDetails={errorDetails}
                                onShowConfirmModal={onShowConfirmModal}
                                onShowLoginPopup={onShowLoginPopup}
                            />
                        </div>
                    </div>
                )}

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
        <div className="flex flex-col items-center w-full my-5 package-slider-container" ref={containerRef}>
            {/* Custom CSS for slider styling */}
            <style jsx global>{`
                .package-slider-container .slick-dots {
                    display: none !important; /* Hide dots completely */
                }
                
                .package-slider-container .slick-slider {
                    position: relative !important;
                }

                /* Fix for few items - ensure proper alignment */
                .package-slider-container .slick-track {
                    display: flex !important;
                    align-items: center !important;
                }
                
                .package-slider-container .slick-slide {
                    height: auto !important;
                    display: flex !important;
                    align-items: center !important;
                }
            `}</style>

            <div className="flex items-center justify-center gap-2 w-full my-4 md:my-8 px-2 md:px-20">
                <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-xs md:text-sm px-3 md:px-6 py-1">
                    Packages
                </span>
                <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
            </div>

            <div className="w-full relative sm:px-3 md:px-10">
                <Slider {...getSliderSettings()}>
                    {productData.map((packageItem) => (
                        <div key={packageItem.id} className="md:pr-14 md:pl-32 sm:px-8 pl-6 px-4 py-3">
                            <PackageCard
                                packageItem={packageItem}
                                isSelected={selectedPackageId === packageItem.id && !isMobile}
                                packageDetails={selectedPackageId === packageItem.id ? packageDetails : undefined}
                                onPackageClick={handlePackageClick}
                                onClosePopup={handleClosePopup}
                                onAddToCartSuccess={handlePackageAddToCartSuccess}
                                onAddToCartError={handlePackageAddToCartError}
                                isLoadingDetails={isLoadingDetails && selectedPackageId === packageItem.id}
                                errorDetails={selectedPackageId === packageItem.id ? errorDetails : undefined}
                                onShowConfirmModal={onShowConfirmModal}
                                onShowLoginPopup={onShowLoginPopup}
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {isMobile && selectedPackageId && (
                <div
                    className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center"
                    ref={modalRef}
                >
                    <div className="bg-transparent w-full max-w-md overflow-hidden items-center justify-center flex px-12">
                        <PackageCard
                            packageItem={productData.find(p => p.id === selectedPackageId)!}
                            isSelected={true}
                            packageDetails={packageDetails}
                            onPackageClick={handlePackageClick}
                            onClosePopup={handleClosePopup}
                            onAddToCartSuccess={handlePackageAddToCartSuccess}
                            onAddToCartError={handlePackageAddToCartError}
                            isLoadingDetails={isLoadingDetails}
                            errorDetails={errorDetails}
                            onShowConfirmModal={onShowConfirmModal}
                            onShowLoginPopup={onShowLoginPopup}
                        />
                    </div>
                </div>
            )}

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