import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setCategoryResults } from "@/store/slices/searchSlice";
import Vegetables from "../../../public/new-Ui-Image/home/Vegetables-Mushrooms.png";
import Fruits from "../../../public/new-Ui-Image/home/Fruits.png";
import Grains from "../../../public/new-Ui-Image/home/Cereals & Pulses.png";
import Spices from "../../../public/new-Ui-Image/home/Spices.png";
import AllProduce from "../../../public/new-Ui-Image/home/AllProduce.png";
import ItemCard from "../../components/item-card/ItemCard";
import {
  getProductsByCategoryWholesale,
  getCategoryCountsWholesale,
} from "@/services/product-service";
import socketService from "@/services/socketService";
import {
  ChevronLeft,
  ChevronRight,
  Scale,
  SlidersHorizontal,
  Truck,
} from "lucide-react";

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
  inCart: boolean;
}

interface Category {
  id: string;
  name: string;
  imageUrl: string | StaticImageData;
  itemCount: number;
}

const ALL_PRODUCT_CATEGORIES = ["Vegetables", "Fruits", "Cereals", "Spices"];

const categorySubtitles: Record<string, string> = {
  Vegetables: "For the cooking pot",
  Fruits: "Fresh from the farm",
  Cereals: "A little fresh crunch",
  Spices: "Condiments",
};

export default function CategoryFilterWholesale() {
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const isSearchActive = useSelector(
    (state: RootState) => state.search.isSearchActive,
  );
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countsLoading, setCountsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [showStickyCategoryNav, setShowStickyCategoryNav] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  const categoryStripRef = useRef<HTMLDivElement>(null);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const productSectionRef = useRef<HTMLDivElement>(null);

  const defaultCategories: Category[] = [
    { id: "Vegetables", name: "Vegetables & Mushrooms", imageUrl: Vegetables, itemCount: 0 },
    { id: "Fruits", name: "Fruits", imageUrl: Fruits, itemCount: 0 },
    { id: "Cereals", name: "Cereals & Pulses", imageUrl: Grains, itemCount: 0 },
    { id: "Spices", name: "Spices", imageUrl: Spices, itemCount: 0 },
  ];

  useEffect(() => {
    const unsubscribe = socketService.onCatalogUpdate(() => {
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
        const response = await getCategoryCountsWholesale();

        if (response.status && response.counts) {
          const categoryMapping: { [key: string]: string } = {
            Vegetables: "Vegetables",
            Fruits: "Fruits",
            Cereals: "Cereals",
            Spices: "Spices",
          };

          const updatedCategories = defaultCategories.map((cat) => {
            const apiCategory = response.counts.find(
              (apiCat: any) => categoryMapping[apiCat.category] === cat.id,
            );
            return { ...cat, itemCount: apiCategory ? apiCategory.itemCount : 0 };
          });

          setCategories(updatedCategories);
        }
      } catch (err) {
        console.error("Error fetching wholesale category counts:", err);
        setCategories(defaultCategories);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCategoryCounts();
  }, [refreshTick]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const responses =
          selectedCategory === "All"
            ? await Promise.all(
                ALL_PRODUCT_CATEGORIES.map((category) =>
                  getProductsByCategoryWholesale(
                    category,
                    searchTerm || undefined,
                    token || undefined,
                  ),
                ),
              )
            : [
                await getProductsByCategoryWholesale(
                  selectedCategory,
                  searchTerm || undefined,
                  token || undefined,
                ),
              ];

        const fetched = responses.flatMap((r) => r.products ?? []);
        const unique = Array.from(
          new Map(fetched.map((p): [number, Product] => [p.id, p])).values(),
        );
        setProducts(unique);
        dispatch(setCategoryResults(unique.length > 0));
      } catch (err) {
        console.error("Error fetching wholesale products:", err);
        setError("Failed to load wholesale products. Please try again.");
        setProducts([]);
        dispatch(setCategoryResults(false));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, dispatch, refreshTick, token]);

  function handleCategorySelect(id: string): void {
    setSelectedCategory(id);
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

  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors sm:px-6 sm:text-base cursor-pointer ${
      active
        ? "border-[#ff603d] bg-[#ff603d] text-white"
        : "border-[#e1ddf5] bg-white text-[#34343b] hover:border-[#ff9a80]"
    }`;

  const tileClass = (active: boolean) =>
    `flex min-w-[240px] flex-[0_0_24%] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors sm:min-w-[280px] cursor-pointer ${
      active
        ? "border-[#ff704e] bg-[#fff8f5]"
        : "border-transparent bg-[#f8f8fc] hover:border-[#e6e2f5]"
    }`;

  return (
    <>
      <div className="mx-auto w-full max-w-[1800px]">
        {!isSearchActive && (
          <section id="shop-by-category" className="mx-auto mb-6 w-full max-w-7xl scroll-mt-[118px] md:scroll-mt-[184px]">
            {/* Feature row (ain karanna ona nam meka delete karanna) */}
            <div className="mb-6 hidden grid-cols-1 gap-4 border-b border-[#f0f0f0] pb-5 sm:grid-cols-3 sm:gap-6 md:grid">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8faf3] text-[#14a878]">
                  <Scale size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171d27] sm:text-base">A little or a little more</h3>
                  <p className="text-xs text-[#737373]">Choose the weight that works for you.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#3478f6]">
                  <Truck size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171d27] sm:text-base">Your day, your delivery</h3>
                  <p className="text-xs text-[#737373]">Choose home delivery or pickup.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e7] text-[#e99a16]">
                  <SlidersHorizontal size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171d27] sm:text-base">Make it your kind of basket</h3>
                  <p className="text-xs text-[#737373]">Choose produce to suit your taste.</p>
                </div>
              </div>
            </div>

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
                aria-pressed={selectedCategory === "All"}
                className={tileClass(selectedCategory === "All")}
              >
                <Image src={AllProduce} alt="" width={54} height={54} className="h-12 w-12 shrink-0 object-contain" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#171d27]">All produce</h3>
                  <p className="text-xs text-[#596579]">Your everyday shop</p>
                </div>
              </button>

              {countsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[76px] min-w-[240px] flex-[0_0_24%] animate-pulse rounded-2xl bg-[#f7f7fc] sm:min-w-[280px]"
                    />
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      aria-pressed={selectedCategory === category.id}
                      className={tileClass(selectedCategory === category.id)}
                    >
                      <Image src={category.imageUrl} alt="" width={54} height={54} className="h-12 w-12 shrink-0 object-contain" />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#171d27]">{category.name}</h3>
                        <p className="truncate text-xs text-[#596579]">{categorySubtitles[category.id]}</p>
                      </div>
                    </button>
                  ))}
            </div>

            <div
              ref={categoryTabsRef}
              className="mt-4 flex gap-3 overflow-x-auto border-b border-[#e8e7e4] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button type="button" onClick={() => handleCategorySelect("All")} aria-pressed={selectedCategory === "All"} className={pillClass(selectedCategory === "All")}>
                All Produce
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  className={pillClass(selectedCategory === category.id)}
                >
                  {category.name === "Cereals & Pulses" ? "Cereal & Pulses" : category.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {isSearchActive && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Searching wholesale for "{searchTerm}" in {selectedCategory}
            </p>
          </div>
        )}

        <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#f8f8fc]">
          <div
            ref={productSectionRef}
            className="mx-auto mt-4 w-full max-w-[1800px] scroll-mt-[290px] px-4 pb-6 pt-16 md:mt-0 lg:px-8"
          >
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#3E206D]"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-14 xl:grid-cols-5 xl:gap-x-8">
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
                      initialInCart={product.inCart}
                      homeCategoryStyle
                    />
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="text-gray-500">
                      {isSearchActive
                        ? `No wholesale products found for "${searchTerm}" in ${selectedCategory}.`
                        : "No wholesale products found in this category."}
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
          className="fixed inset-x-0 top-[106px] z-[60] border-b border-[#e8e7e4] bg-white px-3 py-3 shadow-sm md:top-[159px]"
        >
          <div className="mx-auto flex max-w-[1800px] gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => handleCategorySelect("All")} aria-pressed={selectedCategory === "All"} className={pillClass(selectedCategory === "All")}>
              All Produce
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={pillClass(selectedCategory === category.id)}
              >
                {category.name === "Cereals & Pulses" ? "Cereal & Pulses" : category.name}
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}