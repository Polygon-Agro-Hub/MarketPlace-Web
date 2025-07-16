'use client'

import Image, { StaticImageData } from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next//navigation';
import { productAddToCart } from '@/services/product-service';
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
    unitType?: string; // Add this
    startValue?: number; // Add this
    changeby?: number; // Add this
};

const ItemCard = ({
    id,
    name,
    originalPrice,
    currentPrice,
    image,
    discount = null,
    unitType = 'Kg', // Default value
    startValue = 1, // Default value
    changeby = 1, // Default value
}: ItemCardProps) => {
    const router = useRouter();
    const { token, user } = useAppSelector((state) => state.auth);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    
    // Initialize quantity based on startValue and unit conversion
    const getInitialQuantity = () => {
        if (unitType?.toLowerCase() === 'kg') {
            return startValue * 1000; // Convert kg to g for internal handling
        }
        return startValue;
    };
    
    const [quantity, setQuantity] = useState(getInitialQuantity());
    const [unit, setUnit] = useState<'kg' | 'g'>(unitType?.toLowerCase() === 'kg' ? 'kg' : 'g');
    
    // Update quantity and unit when props change
    useEffect(() => {
        const initialQuantity = getInitialQuantity();
        setQuantity(initialQuantity);
        setUnit(unitType?.toLowerCase() === 'kg' ? 'kg' : 'g');
    }, [unitType, startValue, changeby]);
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

    // Helper function to format price with commas
    const formatPrice = (price: number): string => {
        const fixedPrice = Number(price).toFixed(2);
        const [integerPart, decimalPart] = fixedPrice.split('.');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${formattedInteger}.${decimalPart}`;
    };

    // Get minimum quantity based on unit and startValue
    const getMinQuantity = () => {
        if (unitType?.toLowerCase() === 'kg') {
            return startValue * 1000; // Convert to grams
        }
        return startValue;
    };

    // Get increment value based on unit and changeby
    const getIncrementValue = () => {
        if (unitType?.toLowerCase() === 'kg') {
            return changeby * 1000; // Convert to grams
        }
        return changeby;
    };

    // Display quantity based on selected unit
    const getDisplayQuantity = () => {
        if (unit === 'kg') {
            return (quantity / 1000).toFixed(3).replace(/\.?0+$/, ''); // Remove trailing zeros
        }
        return quantity.toString();
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + getIncrementValue());
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
            router.push('/signin');
            return;
        }

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
                quantityType: apiUnit,
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
        // No need to convert quantity as we store everything in grams internally
    };

    return (
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-2 w-full h-[240px] flex flex-col items-center transition-all duration-300 hover:shadow-md cursor-default">
            {/* Error message */}
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-1 text-center">
                    {error}
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            {/* Discount badge */}
            {discount && discount > 0 && (
                <div className="absolute top-0 left-0">
                    <div
                        className="w-10 h-10 rounded-tl-lg sm:w-14 sm:h-14 md:w-15 md:h-15 bg-purple-900 flex flex-col items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}
                    >
                        <div className="transform -translate-y-1/3 -translate-x-1/3 text-[8px] sm:text-[9px] md:text-[10px] absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="font-bold">{discount}%</span>
                            <br />
                            <span className="text-[6px] sm:text-[7px] md:text-xs">Off</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content container with fixed height */}
            <div className="w-full h-full flex flex-col items-center justify-between">
                {/* Product image */}
                <div className="w-full flex-grow flex items-center justify-center">
                    {!showQuantitySelector && !addedToCart && (
                        <div className="w-full h-full max-h-32 mb-1 md:mb-2 flex items-center justify-center">
                            {isImageUrl ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={image as string}
                                        alt={name}
                                        className="object-contain w-full h-full flex justify-center items-center"
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={image}
                                    alt={name}
                                    width={80}
                                    height={80}
                                    className="object-contain max-h-full"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Product name */}
                <h3 className="text-xs md:text-sm lg:text-base font-medium text-gray-800 text-center mb-0.5">{name}</h3>

                {/* Price section */}
                <div className="flex flex-col items-center space-y-0.5 mb-1 md:mb-2">
                    {originalPrice && originalPrice > currentPrice ? (
                        <>
                            <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{formatPrice(currentPrice)}</span>
                            <span className="text-gray-500 text-xs line-through">Rs.{formatPrice(originalPrice)}</span>
                        </>
                    ) : (
                        <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{formatPrice(currentPrice)}</span>
                    )}
                </div>

                {/* Quantity selector */}
                {token && user && showQuantitySelector && (
                    <div className="w-full space-y-2 mb-2 flex flex-col items-center justify-center">
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

                {/* Bottom button section */}
                <div className="w-full mt-auto">
                    {addedToCart ? (
                        <button className="w-full py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm md:text-base bg-purple-100 text-purple-900 transition-colors cursor-pointer">
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
                            disabled={isLoading}
                            className={`w-full py-1 px-1.5 rounded flex items-center justify-center gap-1 text-xs md:text-sm transition-colors cursor-pointer ${token && user && showQuantitySelector
                                ? "bg-purple-900 text-white hover:bg-purple-800"
                                : "bg-gray-100 text-gray-400 hover:bg-[#3E206D] hover:text-white"
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {!showQuantitySelector && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            )}
                            {token && user && showQuantitySelector 
                                ? "Add to Cart" 
                                : (isHovering ? "I want this !" : "Add to Cart")
                            }
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ItemCard;
function useAppSelector<TSelected>(selector: (state: any) => TSelected): TSelected {
    return useSelector(selector);
}