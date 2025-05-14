import React from 'react';
import CategoryTileBG from '../../../public/images/CategoryTileBG.png'

interface CategoryTileProps {
    id: string;
    name: string;
    imageUrl: string;
    itemCount: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const CategoryTile: React.FC<CategoryTileProps> = ({ id, name, imageUrl, itemCount, isSelected, onSelect }) => {
    return (
        <>
            <div
                className={`
        relative flex flex-col items-center w-4xl h-[45vh] justify-center p-4 cursor-pointer transition-all duration-300 border-1 border-gray-200
        ${isSelected ?
                        'transform scale-101 shadow-md z-10' :
                        'hover:bg-opacity-10'
                    }
      `}
                style={{
                    position: 'relative',
                }}
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
                        style={{
                            opacity: 0.5,
                        }}
                    ></div>
                )}

                <div className="w-24 h-24 mb-2 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                <h3 className="font-medium text-2xl text-center">{name}</h3>
                <p className="text-xs text-gray-500 text-center">{itemCount} items</p>

                {isSelected && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default CategoryTile;