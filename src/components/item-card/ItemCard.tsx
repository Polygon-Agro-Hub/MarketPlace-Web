import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';

type ItemCardProps = {
    name: string;
    originalPrice: number | null;
    currentPrice: number;
    image: string | StaticImageData;
    discount?: number | null;
    onAddToCart?: (quantity: number, unit: 'kg' | 'g') => void;
};

const ItemCard = ({
    name,
    currentPrice,
    image,
    discount = null,
    onAddToCart = () => { }
}: ItemCardProps) => {
    // State variables
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    const [quantity, setQuantity] = useState(50);
    const [unit, setUnit] = useState<'kg' | 'g'>('g');

    // Check if the image is a string URL or a StaticImageData
    const isImageUrl = typeof image === 'string';

    // Handle quantity adjustment
    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Handle add to cart button click
    const handleAddToCartClick = () => {
        if (!showQuantitySelector) {
            setShowQuantitySelector(true);
        } else {
            onAddToCart(quantity, unit);
            // You might want to hide the selector after adding to cart
            // Uncomment this line if you want that behavior:
            // setShowQuantitySelector(false);
        }
    };

    // Handle unit selection
    const handleUnitChange = (selectedUnit: 'kg' | 'g') => {
        setUnit(selectedUnit);
    };

    return (
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-2 w-full flex flex-col items-center transition-all duration-300 hover:shadow-md">
            {/* Discount badge */}
            {discount && discount > 0 && (
                <div className="absolute top-0 left-0">
                    <div
                        className="w-10 h-10 rounded-tl-lg sm:w-14 sm:h-14 md:w-15 md:h-15 bg-purple-900 flex flex-col items-center justify-center text-white"
                        style={{
                            clipPath: 'polygon(0 0, 0 100%, 100% 0)'
                        }}
                    >
                        <div className="transform -translate-y-1/3 -translate-x-1/3 text-[8px] sm:text-[9px] md:text-[10px] absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="font-bold">{discount}%</span>
                            <br />
                            <span className="text-[6px] sm:text-[7px] md:text-xs">Off</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Product image */}
            <div className="w-full h-16 md:h-24 lg:h-32 mb-1 md:mb-2 flex items-center justify-center">
                {isImageUrl ? (
                    // Handle string URL images (from API)
                    <div className="relative w-full h-full">
                        <img
                            src={image as string}
                            alt={name}
                            className="object-contain w-full h-full flex justify-center items-center"
                        />
                    </div>
                ) : (
                    // Handle local StaticImageData images (imported)
                    <Image
                        src={image}
                        alt={name}
                        width={80}
                        height={80}
                        className="object-contain max-h-full"
                    />
                )}
            </div>

            {/* Product name */}
            <h3 className="text-xs md:text-sm lg:text-base font-medium text-gray-800 text-center mb-0.5">{name}</h3>

            {/* Price section */}
            <div className="flex flex-col items-center space-y-0.5 mb-1 md:mb-2">
                <span className="text-purple-900 text-xs md:text-sm font-semibold">Rs.{currentPrice}</span>
            </div>

            {/* Quantity selector (shown after clicking Add to Cart) */}
            {showQuantitySelector && (
                <div className="w-full space-y-2 mb-2">
                    {/* Unit selector (kg/g) */}
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

                    {/* Quantity adjuster */}
                    <div className="flex items-center justify-center">
                        <div className="flex w-full max-w-28 rounded-lg bg-white border-1 border-[#3E206D]">
                            <button
                                onClick={decrementQuantity}
                                className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-l-md hover:bg-purple-800"
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

            {/* Add to cart button */}
            <button
                onClick={handleAddToCartClick}
                className={`w-full py-1 px-1.5 rounded flex items-center justify-center gap-1 text-xs md:text-sm transition-colors ${showQuantitySelector
                    ? "bg-purple-900 text-white hover:bg-purple-800"
                    : "bg-gray-100 text-gray-400 hover:bg-[#3E206D] hover:text-white"
                    }`}
            >
                {!showQuantitySelector && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                )}
                {showQuantitySelector ? "Add" : "Add to Cart"}
            </button>
        </div>
    );
};

export default ItemCard;