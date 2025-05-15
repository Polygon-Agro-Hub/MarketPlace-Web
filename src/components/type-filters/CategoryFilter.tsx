// CategoryFilter.tsx
import React, { useState } from 'react';
import CategoryTile from './CategoryTile';
import Vegetables from '../../../public/images/Vegetables.png';
import Fruits from '../../../public/images/Fruits.png';
import Grains from '../../../public/images/Grains.png';
import Mushrooms from '../../../public/images/Mushrooms.png';

export default function CategoryFilter() {
    const [selectedCategory, setSelectedCategory] = useState('fruits');

    const categories = [
        {
            id: 'vegetables',
            name: 'Vegetables',
            imageUrl: Vegetables,
            itemCount: 205
        },
        {
            id: 'fruits',
            name: 'Fruits',
            imageUrl: Fruits,
            itemCount: 100
        },
        {
            id: 'grains',
            name: 'Grains',
            imageUrl: Grains,
            itemCount: 10
        },
        {
            id: 'mushrooms',
            name: 'Mushrooms',
            imageUrl: Mushrooms,
            itemCount: 10
        }
    ];

    return (
        <div className='mx-auto w-full'>
            <div className='flex flex-col'>
                <div className="flex items-center justify-center gap-2 w-full my-4 md:my-8 px-2 md:px-20">
                    <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                    <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-xs md:text-sm px-3 md:px-6 py-1">
                        Types
                    </span>
                    <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                </div>

                <div className='grid grid-cols-4'>
                    {categories.map((category) => (
                        <div key={category.id} className="aspect-[4/5] md:aspect-square">
                            <CategoryTile
                                id={category.id}
                                name={category.name}
                                imageUrl={category.imageUrl}
                                itemCount={category.itemCount}
                                isSelected={selectedCategory === category.id}
                                onSelect={setSelectedCategory}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}