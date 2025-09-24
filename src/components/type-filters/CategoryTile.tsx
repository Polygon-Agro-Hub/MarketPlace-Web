// CategoryTile.tsx
import React from 'react';
import Image from 'next/image';
import CategoryTileBG from '../../../public/images/CategoryTileBG.png'
import Store from '../../../public/icons/Store.png'
import { StaticImageData } from 'next/image';

interface CategoryTileProps {
    id: string;
    name: string;
    imageUrl: string | StaticImageData;
    itemCount: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const CategoryTile: React.FC<CategoryTileProps> = ({
    id,
    name,
    imageUrl,
    itemCount,
    isSelected,
    onSelect
}) => {
    return (
        <div
            className={`
        relative flex flex-col items-center justify-between p-2 cursor-pointer 
        transition-all duration-300 border border-gray-200 h-38 md:h-40 lg:h-90
        ${isSelected ? 'transform scale-[1.02] shadow-md z-10' : 'hover:bg-opacity-10'}
      `}
            onClick={() => onSelect(id)}
        >
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: `url(${CategoryTileBG.src})`,
                    backgroundSize: 'cover',
                    opacity: 0.3,
                }}
            />

            {isSelected && (
                <div
                    className="absolute inset-0 bg-teal-100 bg-opacity-40 -z-5"
                    style={{ opacity: 0.5 }}
                />
            )}

            <div className="w-14 h-14 md:w-20 md:h-20 lg:w-full lg:h-60 mt-1 flex items-center justify-center">
                <Image
                    src={imageUrl}
                    alt={name}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            <div className="flex flex-col items-center mt-auto mb-7">
                <h3 className="font-medium text-sm md:text-lg lg:text-xl text-center">{name}</h3>
                <p className="text-lg text-gray-500 text-center">{itemCount} items</p>
            </div>

            {isSelected && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="absolute -inset-1 sm:-inset-1.5 md:-inset-1 rounded-full border-2 border-dashed border-purple-800 opacity-100"></div>
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-800 flex items-center justify-center">
                        <Image
                            src={Store}
                            alt="Store"
                            className="w-3 h-3 md:w-4 md:h-4"
                            style={{ color: 'white' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryTile;