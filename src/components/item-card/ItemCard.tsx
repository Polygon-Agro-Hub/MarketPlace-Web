'use client'

import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next//navigation';
import { productAddToCart } from '@/services/product-service';
import { useSelector } from 'react-redux';

type ItemCardProps = {
    id: number;
    name: string;
    originalPrice: number | null;
    currentPrice: number;
    image: string | StaticImageData;
    discount?: number | null;
};

const ItemCard = ({
    id,
    name,
    originalPrice,
    currentPrice,
    image,
    discount = null,
}: ItemCardProps) => {
    const router = useRouter();
    const { token, user } = useAppSelector((state) => state.auth);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    const [quantity, setQuantity] = useState(50);
    const [unit, setUnit] = useState<'kg' | 'g'>('g');
    const [addedToCart, setAddedToCart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isImageUrl = typeof image === 'string';

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

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

            const productData = {
                mpItemId: id,
                quantityType: unit,
                quantity: quantity
            };

            await productAddToCart(productData, token);

            setShowQuantitySelector(false);
            setAddedToCart(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setAddedToCart(false);
                setQuantity(50);
                setUnit('g');
            }, 2000);
        }
    };

    const handleUnitChange = (selectedUnit: 'kg' | 'g') => {
        setUnit(selectedUnit);
    };

    return (
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-2 w-full h-[240px] flex flex-col items-center transition-all duration-300 hover:shadow-md">
            {/* Error message */}
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-1 text-center">
                    {error}
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10">
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
                            <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{currentPrice}</span>
                        </>
                    ) : (
                        <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{currentPrice}</span>
                    )}
                </div>

                {/* Quantity selector */}
                {showQuantitySelector && (
                    <div className="w-full space-y-2 mb-2 flex flex-col items-center justify-center">
                        <div className="flex justify-center">
                            <div className="flex rounded overflow-hidden gap-2">
                                <button
                                    onClick={() => handleUnitChange('kg')}
                                    className={`w-8 text-xs py-1 border rounded-md ${unit === 'kg'
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                >
                                    kg
                                </button>
                                <button
                                    onClick={() => handleUnitChange('g')}
                                    className={`w-8 text-xs py-1 border rounded-md ${unit === 'g'
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
                                    disabled={quantity <= 1}
                                    className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-l-md hover:bg-purple-800 disabled:opacity-50"
                                >
                                    −
                                </button>
                                <div className="flex-grow text-center py-1 text-sm">
                                    {quantity}
                                </div>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-r-md hover:bg-purple-800"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom button section */}
                <div className="w-full mt-auto">
                    {/* Add to cart button */}
                    {addedToCart ? (
                        <button className="w-full py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm md:text-base bg-purple-100 text-purple-900 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Added to Cart
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCartClick}
                            disabled={isLoading}
                            className={`w-full py-1 px-1.5 rounded flex items-center justify-center gap-1 text-xs md:text-sm transition-colors ${showQuantitySelector
                                ? "bg-purple-900 text-white hover:bg-purple-800"
                                : "bg-gray-100 text-gray-400 hover:bg-[#3E206D] hover:text-white"
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {!showQuantitySelector && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            )}
                            {showQuantitySelector ? "Add to Cart" : "Add to Cart"}
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
