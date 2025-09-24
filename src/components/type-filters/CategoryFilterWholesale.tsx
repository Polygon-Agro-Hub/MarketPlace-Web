import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCategoryResults } from '@/store/slices/searchSlice';
import CategoryTile from './CategoryTile';
import Vegetables from '../../../public/images/Vegetables.png';
import Fruits from '../../../public/images/Fruits.png';
import Grains from '../../../public/images/Grains.png';
import Spices from '../../../public/images/Spices.png';
import ItemCard from '../../components/item-card/ItemCard';
import { getProductsByCategoryWholesale } from '@/services/product-service';
import { getCategoryCountsWholesale } from '@/services/product-service';
import { StaticImageData } from 'next/image';

interface Product {
    id: number;
    displayName: string;
    normalPrice: number;
    discountedPrice: number;
    discount: number;
    promo: boolean;
    unitType: string;
    startValue: number;
    changeby: number;
    displayType: string;
    tags: string;
    varietyNameEnglish: string;
    varietyNameSinhala: string;
    varietyNameTamil: string;
    image: string;
    cropNameEnglish: string;
    cropNameSinhala: string;
    cropNameTamil: string;
    category: string;
}

interface Category {
    id: string;
    name: string;
    imageUrl: string | StaticImageData;
    itemCount: number;
}

export default function CategoryFilterWholesale() {
    // Get search term from Redux
    const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
    const isSearchActive = useSelector((state: RootState) => state.search.isSearchActive);
    const dispatch = useDispatch();

    const [selectedCategory, setSelectedCategory] = useState('Vegetables');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [countsLoading, setCountsLoading] = useState(true);

    const defaultCategories = [
        {
            id: 'Vegetables',
            name: 'Vegetables',
            imageUrl: Vegetables,
            itemCount: 0
        },
        {
            id: 'Fruits',
            name: 'Fruits',
            imageUrl: Fruits,
            itemCount: 0
        },
        {
            id: 'Cereals',
            name: 'Cereals',
            imageUrl: Grains,
            itemCount: 0
        },
        {
            id: 'Spices',
            name: 'Spices',
            imageUrl: Spices,
            itemCount: 0
        }
    ];

    useEffect(() => {
        const fetchCategoryCounts = async () => {
            try {
                setCountsLoading(true);
                const response = await getCategoryCountsWholesale();

                if (response.status && response.counts) {
                    const updatedCategories = defaultCategories.map(cat => {
                        const apiCategory = response.counts.find(
                            (apiCat: any) => apiCat.category.toLowerCase() === cat.name.toLowerCase()
                        );

                        return {
                            ...cat,
                            itemCount: apiCategory ? apiCategory.itemCount : 0
                        };
                    });

                    setCategories(updatedCategories);
                }
            } catch (err) {
                console.error('Error fetching wholesale category counts:', err);
                setCategories(defaultCategories);
            } finally {
                setCountsLoading(false);
            }
        };

        fetchCategoryCounts();
    }, []);

    // Updated useEffect that properly listens to Redux search term changes
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log('Fetching wholesale products with:', { selectedCategory, searchTerm });

                const response = await getProductsByCategoryWholesale(selectedCategory, searchTerm || undefined);
                setProducts(response.products);

                // Update category results state based on products length
                dispatch(setCategoryResults(response.products.length > 0));
            } catch (err) {
                console.error('Error fetching wholesale products:', err);
                setError('Failed to load wholesale products. Please try again.');
                setProducts([]);

                // Update category results state for error
                dispatch(setCategoryResults(false));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, searchTerm, dispatch]);

    function handleCategorySelect(id: string): void {
        setSelectedCategory(id);
    }

    return (
        <div className='mx-auto w-full'>
            <div className='flex flex-col'>
                <div className="flex items-center justify-center gap-2 w-full my-4 md:my-8 px-2 md:px-20">
                    <div className="flex-1 border-t-2 border-[#D7D7D7]"></div>
                    <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-xs md:text-sm px-3 md:px-6 py-1 whitespace-nowrap">
                        Wholesale Types
                    </span>
                    <div className="flex-1 border-t-2 border-[#D7D7D7]"></div>
                </div>

                {/* Show search indicator if search is active */}
                {isSearchActive && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            Searching wholesale for "{searchTerm}" in {selectedCategory}
                        </p>
                    </div>
                )}

                {!isSearchActive && (
                    <>
                        {countsLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3E206D]"></div>
                            </div>
                        ) : (
                            <div className='grid grid-cols-4'>
                                {categories.map((category) => (
                                    <div key={category.id} className="aspect-[4/5] md:aspect-square">
                                        <CategoryTile
                                            id={category.id}
                                            name={category.name}
                                            imageUrl={category.imageUrl}
                                            itemCount={category.itemCount}
                                            isSelected={selectedCategory === category.id}
                                            onSelect={handleCategorySelect}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="container mx-auto px-2 py-6">
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3E206D]"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-10">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.id} className="w-full flex justify-center">
                                    <ItemCard
                                        id={product.id}
                                        name={product.displayName}
                                        originalPrice={product.normalPrice}
                                        currentPrice={product.discountedPrice}
                                        image={product.image}
                                        discount={product.discount}
                                        startValue={product.startValue}
                                        changeby={product.changeby}
                                        unitType={product.unitType}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500">
                                    {isSearchActive
                                        ? `No wholesale products found for "${searchTerm}" in ${selectedCategory}.`
                                        : 'No wholesale products found in this category.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}