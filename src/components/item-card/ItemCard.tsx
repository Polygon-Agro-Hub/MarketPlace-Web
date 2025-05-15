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

    return (
        <div
            className="relative bg-white border border-[#BDBDBD] rounded-lg shadow-md p-4 w-64 flex flex-col items-center transition-all duration-300 hover:shadow-lg"
        >
            {/* Discount badge - triangular corner */}
            {discount && (
                <div className="absolute top-0 left-0">
                    <div
                        className="w-16 h-16 bg-purple-900 flex flex-col items-center rounded-tl-lg justify-center text-white"
                        style={{
                            clipPath: 'polygon(0 0, 0% 100%, 100% 0)'
                        }}
                    >
                        <div className="transform -translate-y-2.5 -translate-x-3 text-[10px]">
                            <span className="text-sm font-bold">{discount}%</span>
                            <span className="text-xs block">Off</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Product image */}
            <div className="w-40 h-40 mb-4 flex items-center justify-center">
                <Image
                    src={image}
                    alt={name}
                    width={160}
                    height={160}
                    className="max-w-full max-h-full object-contain"
                    style={{ objectFit: 'contain' }}
                />
            </div>

            {/* Product name */}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>

            {/* Price section */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-purple-900 text-xl font-bold">Rs.{currentPrice.toFixed(2)}</span>
            </div>

            {/* Add to cart button */}
            <button
                onClick={onAddToCart}
                className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
            </button>
        </div>
    );
};

export default ItemCard;