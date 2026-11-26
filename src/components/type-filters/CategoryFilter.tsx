import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Vegetables from "../../../public/new-Ui-Image/home/Vegetables-Mushrooms.png";
import Fruits from "../../../public/new-Ui-Image/home/Fruits.png";
import Grains from "../../../public/new-Ui-Image/home/Cereals & Pulses.png";
import Spices from "../../../public/new-Ui-Image/home/Spices.png";
import AllProduce from "../../../public/new-Ui-Image/home/AllProduce.png";
import ItemCard from "../../components/item-card/ItemCard";
import { getProductsByCategory } from "@/services/product-service";
import { getCategoryCounts } from "@/services/product-service";
import { StaticImageData } from "next/image";
import { useDispatch } from "react-redux";
import { setCategoryResults } from "@/store/slices/searchSlice";
import socketService from "@/services/socketService"; // NEW
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  inCart: boolean; // NEW
}

interface Category {
  id: string;
  name: string;
  imageUrl: string | StaticImageData;
  itemCount: number;
}

// Remove the searchTerm prop since we'll use Redux
interface CategoryFilterProps { }

const ALL_PRODUCT_CATEGORIES = ["Vegetables", "Fruits", "Cereals", "Spices"];

export default function CategoryFilter({ }: CategoryFilterProps) {
  // Get search term from Redux instead of props
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const isSearchActive = useSelector(
    (state: RootState) => state.search.isSearchActive,
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [displayedCategory, setDisplayedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countsLoading, setCountsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0); // NEW — bumped on real-time catalog updates
  const [showStickyCategoryNav, setShowStickyCategoryNav] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const productSectionRef = useRef<HTMLDivElement>(null);

  const defaultCategories = [
    {
      id: "Vegetables",
      name: "Vegetables & Mushrooms",
      imageUrl: Vegetables,
      itemCount: 0,
    },
    {
      id: "Fruits",
      name: "Fruits",
      imageUrl: Fruits,
      itemCount: 0,
    },
    {
      id: "Cereals",
      name: "Cereals & Pulses",
      imageUrl: Grains,
      itemCount: 0,
    },
    {
      id: "Spices",
      name: "Spices",
      imageUrl: Spices,
      itemCount: 0,
    },
  ];

  useEffect(() => {
    const unsubscribe = socketService.onCatalogUpdate((data) => {
      setRefreshTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const categoryTabs = categoryTabsRef.current;
    if (isSearchActive || !categoryTabs) {
      setShowStickyCategoryNav(false);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyCategoryNav(
        !entry.isIntersecting && entry.boundingClientRect.top < 0,
      );
    });

    observer.observe(categoryTabs);
    return () => observer.disconnect();
  }, [isSearchActive]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setCountsLoading(true);
        const response = await getCategoryCounts();

        if (response.status && response.counts) {
          const updatedCategories = defaultCategories.map((cat) => {
            // Handle category mapping for count display
            let totalCount = 0;

            if (cat.id === "Vegetables") {
              // Sum counts for Vegetables and Mushrooms
              const vegetablesCount =
                response.counts.find(
                  (apiCat: any) =>
                    apiCat.category.toLowerCase() === "vegetables",
                )?.itemCount || 0;
              const mushroomsCount =
                response.counts.find(
                  (apiCat: any) =>
                    apiCat.category.toLowerCase() === "mushrooms",
                )?.itemCount || 0;
              totalCount = vegetablesCount + mushroomsCount;
            } else if (cat.id === "Cereals") {
              // Sum counts for Cereals, Legumes, and Pulses
              const cerealsCount =
                response.counts.find(
                  (apiCat: any) => apiCat.category.toLowerCase() === "cereals",
                )?.itemCount || 0;
              const legumesCount =
                response.counts.find(
                  (apiCat: any) => apiCat.category.toLowerCase() === "legumes",
                )?.itemCount || 0;
              const pulsesCount =
                response.counts.find(
                  (apiCat: any) => apiCat.category.toLowerCase() === "pulses",
                )?.itemCount || 0;
              totalCount = cerealsCount + legumesCount + pulsesCount;
            } else {
              // For Fruits and Spices, use direct mapping
              const apiCategory = response.counts.find(
                (apiCat: any) =>
                  apiCat.category.toLowerCase() === cat.name.toLowerCase(),
              );
              totalCount = apiCategory ? apiCategory.itemCount : 0;
            }

            return {
              ...cat,
              itemCount: totalCount,
            };
          });

          setCategories(updatedCategories);
        }
      } catch (err) {
        console.error("Error fetching category counts:", err);
        setCategories(defaultCategories);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCategoryCounts();
  }, [refreshTick]); // CHANGED — was []; now also re-runs on real-time updates so tile counts stay accurate

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const categoryResponses =
          selectedCategory === "All"
            ? await Promise.all(
                ALL_PRODUCT_CATEGORIES.map((category) =>
                  getProductsByCategory(
                    category,
                    searchTerm || undefined,
                    token || undefined,
                  ),
                ),
              )
            : [
                await getProductsByCategory(
                  selectedCategory,
                  searchTerm || undefined,
                  token || undefined,
                ),
              ];
        const fetchedProducts = categoryResponses.flatMap(
          (response) => response.products ?? [],
        );
        const uniqueProducts = Array.from(
          new Map(
            fetchedProducts.map(
              (product): [number, Product] => [product.id, product],
            ),
          ).values(),
        );
        setProducts(uniqueProducts);

        // Always update category results state, regardless of results
        dispatch(setCategoryResults(uniqueProducts.length > 0));
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);

        // Set to false on error
        dispatch(setCategoryResults(false));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, dispatch, refreshTick, token]); // CHANGED — added refreshTick

  function handleCategorySelect(id: string): void {
    setSelectedCategory(id);
    setDisplayedCategory(id);
    requestAnimationFrame(() => {
      productSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const scrollCategories = (direction: -1 | 1) => {
    categoryStripRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  const categorySubtitles: Record<string, string> = {
    Vegetables: "For the cooking pot",
    Fruits: "Fresh from the farm",
    Cereals: "A little fresh crunch",
    Spices: "Condiments",
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1800px]">
        {!isSearchActive && (
          <section id="shop-by-category" className="mx-auto mb-6 w-full max-w-7xl scroll-mt-[118px] md:scroll-mt-[184px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#171d27] sm:text-2xl">
                  Shop by category
                </h2>
                <p className="mt-1 text-xs text-[#737373] sm:text-sm">
                  Find what you need, or try something new.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="mr-1 hidden text-xs font-semibold text-[#59406f] hover:underline sm:block cursor-pointer"
                  onClick={() =>
                    categoryStripRef.current?.scrollTo({
                      left: categoryStripRef.current.scrollWidth,
                      behavior: "smooth",
                    })
                  }
                >
                  View all categories
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7e7ec] bg-white text-[#737373] hover:bg-[#f8f7fc] cursor-pointer"
                  onClick={() => scrollCategories(-1)}
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7e7ec] bg-white text-[#737373] hover:bg-[#f8f7fc] cursor-pointer"
                  onClick={() => scrollCategories(1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            <div
              ref={categoryStripRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                aria-pressed={displayedCategory === "All"}
                className={`flex min-w-[280px] flex-[0_0_24%] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                  displayedCategory === "All"
                    ? "border-[#ff704e] bg-[#fff8f5]"
                    : "border-transparent bg-[#f8f8fc] hover:border-[#e6e2f5]"
                }`}
              >
                <Image
                  src={AllProduce}
                  alt=""
                  width={54}
                  height={54}
                  className="h-12 w-12 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#171d27]">All produce</h3>
                  <p className="text-xs text-[#596579]">Your everyday shop</p>
                </div>
              </button>

              {countsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[76px] min-w-[280px] flex-[0_0_24%] animate-pulse rounded-2xl bg-[#f7f7fc]"
                  />
                ))
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    aria-pressed={displayedCategory === category.id}
                    className={`flex min-w-[280px] flex-[0_0_24%] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                      displayedCategory === category.id
                        ? "border-[#ff704e] bg-[#fff8f5]"
                        : "border-transparent bg-[#f8f8fc] hover:border-[#e6e2f5]"
                    }`}
                  >
                    <Image
                      src={category.imageUrl}
                      alt=""
                      width={54}
                      height={54}
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#171d27]">
                        {category.name}
                      </h3>
                      <p className="truncate text-xs text-[#596579]">
                        {categorySubtitles[category.id]}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div
              ref={categoryTabsRef}
              className="mt-4 flex gap-3 overflow-x-auto border-b border-[#e8e7e4] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                aria-pressed={displayedCategory === "All"}
                className={`shrink-0 rounded-full border px-5 py-2 text-lg font-semibold sm:px-6 cursor-pointer ${
                  displayedCategory === "All"
                    ? "border-[#ff603d] bg-[#ff603d] text-white"
                    : "border-[#e1ddf5] bg-white text-[#34343b] hover:border-[#ff9a80]"
                }`}
              >
                All Produce
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  aria-pressed={displayedCategory === category.id}
                  className={`shrink-0 rounded-full border px-5 py-2 text-lg font-semibold transition-colors sm:px-6 cursor-pointer ${
                    displayedCategory === category.id
                      ? "border-[#ff603d] bg-[#ff603d] text-white"
                      : "border-[#e1ddf5] bg-white text-[#34343b] hover:border-[#ff9a80]"
                  }`}
                >
                  {category.name === "Cereals & Pulses"
                    ? "Cereal & Pulses"
                    : category.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {isSearchActive && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">Searching for "{searchTerm}"</p>
          </div>
        )}

        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#f8f8fc]">
          <div
            ref={productSectionRef}
            className="mx-auto mt-4 w-full max-w-[1800px] scroll-mt-[180px] px-4 py-6 md:mt-0 lg:px-8"
          >
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3E206D]"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-8 lg:gap-y-14">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ItemCard
                      key={product.id}
                      id={product.id}
                      name={product.displayName}
                      originalPrice={product.normalPrice}
                      currentPrice={product.discountedPrice}
                      image={product.image}
                      discount={product.discount}
                      unitType={product.unitType}
                      startValue={product.startValue}
                      changeby={product.changeby}
                      displayType={product.displayType}
                      initialInCart={product.inCart}   // NEW
                      homeCategoryStyle
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">
                      {isSearchActive
                        ? `No products found for "${searchTerm}" in ${selectedCategory}.`
                        : "No products found in this category."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showStickyCategoryNav && categories.length > 0 && !isSearchActive && (
        <nav
          aria-label="Product categories"
          className="fixed inset-x-0 top-[106px] z-[60] border-b border-[#e8e7e4] bg-white px-3 py-3 md:top-[159px]"
        >
          <div className="mx-auto flex max-w-[1800px] gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategorySelect("All")}
              aria-pressed={displayedCategory === "All"}
              className={`shrink-0 rounded-full border px-5 py-2 text-lg font-semibold sm:px-6 cursor-pointer ${
                displayedCategory === "All"
                  ? "border-[#ff603d] bg-[#ff603d] text-white"
                  : "border-[#e1ddf5] bg-white text-[#34343b] hover:border-[#ff9a80]"
              }`}
            >
              All Produce
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                aria-pressed={displayedCategory === category.id}
                className={`shrink-0 rounded-full border px-5 py-2 text-lg font-semibold transition-colors sm:px-6 cursor-pointer ${
                  displayedCategory === category.id
                    ? "border-[#ff603d] bg-[#ff603d] text-white"
                    : "border-[#e1ddf5] bg-white text-[#34343b] hover:border-[#ff9a80]"
                }`}
              >
                {category.name === "Cereals & Pulses"
                  ? "Cereal & Pulses"
                  : category.name}
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}