'use client'

import Image, { StaticImageData } from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productAddToCart, checkProductInCart } from '@/services/product-service';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateCartInfo } from '@/store/slices/authSlice';
import { getCartInfo } from '@/services/auth-service';

type ItemCardProps = {
    id: number;
    name: string;
    originalPrice: number | null;
    currentPrice: number;
    image: string | StaticImageData;
    discount?: number | null;
    unitType?: string;
    startValue?: string | number;
    changeby?: string | number;
};

const ItemCard = ({
    id,
    name,
    originalPrice,
    currentPrice,
    image,
    discount = null,
    unitType = 'g',
    startValue = "1",
    changeby = "1",
}: ItemCardProps) => {
    const router = useRouter();
    const { token, user } = useAppSelector((state) => state.auth);
    const buyerType = useAppSelector((state) => state.auth.user?.buyerType);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const getInitialQuantity = () => {
        const parsedStartValue = typeof startValue === 'string' ? parseFloat(startValue) : startValue;

        if (unitType?.toLowerCase() === 'kg') {
            return parsedStartValue * 1000; // Convert kg to grams for internal storage
        }
        return parsedStartValue;
    };

    const [quantity, setQuantity] = useState(getInitialQuantity());
    const [unit, setUnit] = useState<'kg' | 'g'>(unitType?.toLowerCase() === 'kg' ? 'kg' : 'g');

    // Update quantity and unit when props change
    useEffect(() => {
        const initialQuantity = getInitialQuantity();
        setQuantity(initialQuantity);
        setUnit(unitType?.toLowerCase() === 'kg' ? 'kg' : 'g');
    }, [unitType, startValue, changeby]);

    const [addedToCart, setAddedToCart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const dispatch = useDispatch();

    const isImageUrl = typeof image === 'string';

    // Check if product is already in cart when component mounts or when user/token changes
    useEffect(() => {
        const checkIfInCart = async () => {
            if (token && user) {
                try {
                    const response = await checkProductInCart(id, token);
                    setIsInCart(response.inCart);
                } catch (error) {
                    console.error('Error checking if product is in cart:', error);
                }
            } else {
                setIsInCart(false);
            }
        };

        checkIfInCart();
    }, [id, token, user]);

    // Helper function to format price with commas
    const formatPrice = (price: number): string => {
        const fixedPrice = Number(price).toFixed(2);
        const [integerPart, decimalPart] = fixedPrice.split('.');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${formattedInteger}.${decimalPart}`;
    };

    // Get minimum quantity based on unit and startValue
    const getMinQuantity = () => {
        const parsedStartValue = typeof startValue === 'string' ? parseFloat(startValue) : startValue;

        if (unitType?.toLowerCase() === 'kg') {
            return parsedStartValue * 1000; // Convert to grams
        }
        return parsedStartValue;
    };

    // Get increment value based on unit and changeby
    const getIncrementValue = () => {
        const parsedChangeby = typeof changeby === 'string' ? parseFloat(changeby) : changeby;

        if (unitType?.toLowerCase() === 'kg') {
            return parsedChangeby * 1000; // Convert to grams
        }
        return parsedChangeby;
    };

    // Display quantity based on selected unit
    const getDisplayQuantity = () => {
        if (unit === 'kg') {
            return (quantity / 1000).toFixed(3).replace(/\.?0+$/, ''); // Remove trailing zeros
        }
        return quantity.toString();
    };

    const incrementQuantity = () => {
        setQuantity((prev: number) => prev + getIncrementValue());
    };

    const decrementQuantity = () => {
        const minQty = getMinQuantity();
        const newQuantity = quantity - getIncrementValue();
        if (newQuantity >= minQty) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCartClick = async () => {
        if (!token || !user) {
            setShowLoginPopup(true);
            return;
        }

        // If product is already in cart, show tooltip and return
        if (isInCart) {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
            return;
        }

        // For wholesale users, skip quantity selector
        if (buyerType === 'Wholesale') {
            try {
                setIsLoading(true);
                setError(null);

                // Ensure quantityType is properly formatted for API
                const normalizedQuantityType = unitType?.toLowerCase() === 'kg' ? 'kg' : 'g';

                const productData = {
                    mpItemId: id,
                    quantityType: unitType as 'kg' | 'g',
                    quantity: typeof startValue === 'string' ? parseFloat(startValue) : startValue
                };

                console.log('Adding to cart with data:', productData);

                await productAddToCart(productData, token);

                try {
                    const cartInfo = await getCartInfo(token);
                    console.log("Updated cart info:", cartInfo);
                    dispatch(updateCartInfo(cartInfo));
                } catch (cartError) {
                    console.error('Error fetching cart info:', cartError);
                }

                setAddedToCart(true);
                setIsInCart(true); // Update local state
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    setAddedToCart(false);
                }, 2000);
            }
            return;
        }

        // For retail users, show quantity selector first
        if (!showQuantitySelector) {
            setShowQuantitySelector(true);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Convert quantity to the original unit type for API
            let apiQuantity = quantity;
            let apiUnit = unit;

            // If original unitType is kg, convert back to kg for API
            if (unitType?.toLowerCase() === 'kg') {
                apiQuantity = quantity / 1000;
                apiUnit = 'kg';
            }

            const productData = {
                mpItemId: id,
                quantityType: apiUnit as 'kg' | 'g', // Type assertion for API compatibility
                quantity: apiQuantity
            };

            await productAddToCart(productData, token);

            try {
                const cartInfo = await getCartInfo(token);
                console.log("Updated cart info:", cartInfo);
                dispatch(updateCartInfo(cartInfo));
            } catch (cartError) {
                console.error('Error fetching cart info:', cartError);
            }

            setShowQuantitySelector(false);
            setAddedToCart(true);
            setIsInCart(true); // Update local state
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setAddedToCart(false);
                setQuantity(getInitialQuantity());
                setUnit(unitType?.toLowerCase() === 'kg' ? 'kg' : 'g');
            }, 2000);
        }
    };

    const handleUnitChange = (selectedUnit: 'kg' | 'g') => {
        setUnit(selectedUnit);
    };

    const handleLoginClick = () => {
        setShowLoginPopup(false);
        router.push('/signin');
    };

    const handleRegisterClick = () => {
        setShowLoginPopup(false);
        router.push('/signup');
    };

    const LoginPopup = () => {
        if (!showLoginPopup) return null;

        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-black/50 flex items-center justify-center z-[9999] mb-[5%]">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                    {/* Close button */}
                    <button
                        onClick={() => setShowLoginPopup(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-[#000000] mb-4">
                            Welcome, Guest! 👋
                        </h2>
                        <p className="text-[#8492A3] text-base leading-relaxed">
                            We're excited to have you here!<br />
                            To unlock the best experience,<br />
                            please log in or create a new account.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleRegisterClick}
                            className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#EDE1FF] text-[#3E206D] text-sm sm:text-base font-semibold hover:bg-[#DCC7FF] transition-colors cursor-pointer"
                        >
                            Register
                        </button>
                        <button
                            onClick={handleLoginClick}
                            className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#3E206D] text-white font-semibold hover:bg-[#2D1A4F] text-sm sm:text-base transition-colors cursor-pointer"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const Tooltip = () => {
        if (!showTooltip && !isHovering) return null;
        if (!isInCart) return null;

        return (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 whitespace-nowrap">
                Item is already added to cart
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
        );
    };

    return (
        <div className={`relative bg-white rounded-xl md:rounded-3xl shadow-sm border border-gray-200 w-full flex flex-col items-center transition-all duration-300 hover:shadow-md cursor-default ${showQuantitySelector
            ? 'h-[260px] sm:h-[300px] md:h-[320px]'
            : 'h-[200px] sm:h-[260px] md:h-[280px]'
            }`}>
            {/* Error message */}
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-1 text-center z-30">
                    {error}
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-40">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            {/* Discount badge */}
            {discount && discount > 0 && (
                <div className="absolute top-0 left-0 z-20">
                    <div
                        className="w-15 h-15 rounded-tl-xl md:rounded-tl-3xl sm:w-14 sm:h-14 md:w-20 md:h-20 bg-purple-900 flex flex-col items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}
                    >
                        <div className="transform -translate-y-1/3 -translate-x-1/3 text-[8px] sm:text-[9px] md:text-[10px] absolute top-4 left-4 md:top-5 md:left-5">
                            <span className="text-xs">{discount}%</span>
                            <br />
                            <span className="text-[7px] md:text-xs">Off</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content container with flexible height management */}
            <div className={`w-full h-full flex flex-col items-center justify-between p-2`}>
                {/* Product image - adjusted height based on quantity selector */}
                <div className={`w-full flex items-center justify-center ${discount ? 'mt-4' : 'mt-0'} ${showQuantitySelector ? 'h-20' : 'flex-grow max-h-36'}`}>
                    {!addedToCart && (
                        <div className="w-full h-full flex items-center justify-center">
                            <Image
                                src={image}
                                alt={name}
                                width={120}
                                height={120}
                                className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28"
                            />
                        </div>
                    )}
                </div>

                {/* Product name */}
                <div className="w-full text-center mb-1 flex-shrink-0">
                    <h3 className="text-xs md:text-sm lg:text-base font-medium text-gray-800 line-clamp-2">{name}</h3>
                </div>

                {/* Price section */}
                <div className="flex flex-col items-center space-y-0.5 mb-2 flex-shrink-0">
                    {originalPrice && originalPrice > currentPrice ? (
                        <>
                            <span className="text-gray-500 text-xs line-through">Rs.{formatPrice(originalPrice)}</span>
                            <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{formatPrice(currentPrice)}</span>
                        </>
                    ) : (
                        <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{formatPrice(currentPrice)}</span>
                    )}
                </div>

                {/* Quantity selector - positioned to not interfere with button */}
                {token && user && showQuantitySelector && buyerType !== 'Wholesale' && !isInCart && (
                    <div className="w-full space-y-2 mb-2 flex flex-col items-center justify-center flex-shrink-0">
                        <div className="flex justify-center">
                            <div className="flex rounded overflow-hidden gap-2 cursor-pointer">
                                <button
                                    onClick={() => handleUnitChange('kg')}
                                    className={`w-8 text-xs py-1 border rounded-md cursor-pointer ${unit === 'kg'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                >
                                    kg
                                </button>
                                <button
                                    onClick={() => handleUnitChange('g')}
                                    className={`w-8 text-xs py-1 border cursor-pointer rounded-md ${unit === 'g'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                >
                                    g
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center w-full">
                            <div className="flex w-full max-w-28 rounded-lg bg-white border-1 border-[#3E206D]">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= getMinQuantity()}
                                    className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-l-md hover:bg-purple-800 disabled:opacity-50 cursor-pointer"
                                >
                                    −
                                </button>
                                <div className="flex-grow text-center py-1 text-sm">
                                    {getDisplayQuantity()}
                                </div>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-r-md hover:bg-purple-800 cursor-pointer"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom button section - always at the bottom */}
                <div className="flex justify-center w-full lg:mb-4">
                    <Tooltip />
                    {addedToCart ? (
                        <button className="w-52 py-2 px-1.5 rounded rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm bg-[#EDE1FF] text-purple-900 border border-[#3E206D] transition-colors cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Added to Cart
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCartClick}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            disabled={isLoading || isInCart}
                            className={`w-52 py-2 px-1.5 rounded rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm transition-colors ${isInCart
                                ? "bg-[#EDE1FF] text-gray-500 cursor-not-allowed"
                                : token && user && showQuantitySelector && buyerType !== 'Wholesale'
                                    ? "bg-purple-900 text-white hover:bg-purple-800 cursor-pointer"
                                    : "bg-white border shadow text-gray-400 hover:bg-[#3E206D] hover:text-white cursor-pointer"
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {!showQuantitySelector && !isInCart && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            )}
                            {isInCart
                                ? "Already in Cart"
                                : token && user && showQuantitySelector && buyerType !== 'Wholesale'
                                    ? "Add to Cart"
                                    : buyerType === 'Wholesale'
                                        ? "Add to Cart"
                                        : (isHovering ? "I want this !" : "Add to Cart")
                            }
                        </button>
                    )}
                </div>
            </div>
            <LoginPopup />
        </div>
    );
};

export default ItemCard;

function useAppSelector<TSelected>(selector: (state: any) => TSelected): TSelected {
    return useSelector(selector);
}