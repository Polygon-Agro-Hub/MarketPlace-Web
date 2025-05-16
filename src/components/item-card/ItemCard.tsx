import Image, { StaticImageData } from 'next/image';
import React from 'react';

type ItemCardProps = {
    name: string;
    originalPrice: number | null;
    currentPrice: number;
    image: string | StaticImageData;
    discount?: number | null;
    onAddToCart?: () => void;
};

const ItemCard = ({
    name,
    currentPrice,
    image,
    discount = null,
    onAddToCart = () => { }
}: ItemCardProps) => {
    // Check if the image is a string URL or a StaticImageData
    const isImageUrl = typeof image === 'string';

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

            {/* Add to cart button */}
            <button
                onClick={onAddToCart}
                className="w-full py-1 px-1.5 bg-gray-100 text-gray-400 rounded flex items-center justify-center gap-1 text-xs md:text-sm hover:bg-[#3E206D] hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
            </button>
        </div>
    );
};

export default ItemCard;