import React, { useState } from 'react'
import CategoryTile from './CategoryTile';
import Vegetables from '../../../public/images/Vegetables.png'
import Fruits from '../../../public/images/Fruits.png'
import Grains from '../../../public/images/Grains.png'
import Mushrooms from '../../../public/images/Mushrooms.png'
export default function CategoryFilter() {
    const [selectedCategory, setSelectedCategory] = useState('vegetables');

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
            itemCount: 110
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
            itemCount: 8
        }
    ];

    return (
        <>
            <div className='mx-auto'>
                <div className='flex flex-col'>
                    <div className="flex items-center justify-center gap-2 w-full max-w-1xl my-8 px-20">
                        <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                        <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-sm px-6 py-1">
                            Types
                        </span>
                        <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
                    </div>
                    <div className='flex justify-center'>
                        {categories.map((category) => (
                            <CategoryTile
                                key={category.id}
                                id={category.id}
                                name={category.name}
                                imageUrl={category.imageUrl}
                                itemCount={category.itemCount}
                                isSelected={selectedCategory === category.id}
                                onSelect={setSelectedCategory}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </>
    )
}
