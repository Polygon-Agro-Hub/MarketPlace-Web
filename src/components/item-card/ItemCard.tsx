"use client";

import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  productAddToCart,
  checkProductInCart,
} from "@/services/product-service";
import { useSelector, useDispatch } from "react-redux";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";

function useAppSelector<TSelected>(
  selector: (state: any) => TSelected,
): TSelected {
  return useSelector(selector);
}

type ItemCardProps = {
  id: number;
  name: string;
  originalPrice: number | null;
  currentPrice: number;
  image: string | StaticImageData;
  discount?: number | null;
  unitType?: string;
  startValue?: string | number;
  changeby?: string | number;
  displayType?: string | null;
};

const ItemCard = ({
  id,
  name,
  originalPrice,
  currentPrice,
  image,
  discount = null,
  unitType = "g",
  startValue = "1000",
  changeby = "1000",
  displayType = "",
}: ItemCardProps) => {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const buyerType = useAppSelector((state) => state.auth.user?.buyerType);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMinQuantityTooltip, setShowMinQuantityTooltip] = useState(false);

  // ─── displayType helpers ───────────────────────────────────────────────────
  const dt = (displayType ?? "").toUpperCase();
  const showBadge = dt === "D&AP" || dt === "AP&SP&D";
  const showStrikethrough = dt === "AP&SP" || dt === "AP&SP&D";
  // ──────────────────────────────────────────────────────────────────────────

  // ─── Quantity helpers ──────────────────────────────────────────────────────
  // NOTE: The API always sends startValue and changeby in KG regardless of
  // unitType. So we always multiply by 1000 to convert to grams internally.
  // ──────────────────────────────────────────────────────────────────────────

  const getInitialQuantity = () => {
    const parsedStartValue =
      typeof startValue === "string" ? parseFloat(startValue) : startValue;
    // API always sends startValue in kg — convert to grams
    return parsedStartValue * 1000;
  };

  const getMinQuantity = () => {
    const parsedStartValue =
      typeof startValue === "string" ? parseFloat(startValue) : startValue;
    // API always sends startValue in kg — convert to grams
    return parsedStartValue * 1000;
  };

  const getIncrementValue = () => {
    const parsedChangeby =
      typeof changeby === "string" ? parseFloat(changeby) : changeby;
    // API always sends changeby in kg — convert to grams
    return parsedChangeby * 1000;
  };

  const getStartValueDisplay = (): string => {
    const parsedStartValue =
      typeof startValue === "string" ? parseFloat(startValue) : startValue;
    // API always sends startValue in kg — convert to grams first
    const grams = parsedStartValue * 1000;
    if (unitType?.toLowerCase() === "kg") return `${grams / 1000} kg`;
    return `${grams} g`;
  };
  // ──────────────────────────────────────────────────────────────────────────

  const [quantity, setQuantity] = useState(getInitialQuantity());
  const [unit, setUnit] = useState<"kg" | "g">(
    unitType?.toLowerCase() === "kg" ? "kg" : "g"
  );

  useEffect(() => {
    setQuantity(getInitialQuantity());
    setUnit(unitType?.toLowerCase() === "kg" ? "kg" : "g");
  }, [unitType, startValue, changeby]);

  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkIfInCart = async () => {
      if (token && user) {
        try {
          const response = await checkProductInCart(id, token);
          setIsInCart(response.inCart);
        } catch (error) {
          console.error("Error checking if product is in cart:", error);
        }
      } else {
        setIsInCart(false);
      }
    };
    checkIfInCart();
  }, [id, token, user]);

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const getPriceForQuantityGrams = (
    grams: number,
    perKgPrice: number,
  ): number => {
    return (grams / 1000) * perKgPrice;
  };

  const perKgOriginalPrice = originalPrice ?? currentPrice;
  const perKgCurrentPrice = currentPrice;

  const startValueGrams = getInitialQuantity();
  const cardFaceOriginalPrice = getPriceForQuantityGrams(
    startValueGrams,
    perKgOriginalPrice,
  );
  const cardFaceCurrentPrice = getPriceForQuantityGrams(
    startValueGrams,
    perKgCurrentPrice,
  );

  const selectorCurrentPrice = getPriceForQuantityGrams(
    quantity,
    perKgCurrentPrice,
  );
  const selectorOriginalPrice = getPriceForQuantityGrams(
    quantity,
    perKgOriginalPrice,
  );

  const getDisplayQuantity = () => {
    if (unit === "kg") {
      const kgValue = quantity / 1000;
      if (kgValue < 0.001) return kgValue.toFixed(4).replace(/\.?0+$/, "");
      return kgValue.toFixed(3).replace(/\.?0+$/, "");
    }
    if (unit === "g") {
      if (quantity < 1) return quantity.toFixed(3).replace(/\.?0+$/, "");
      if (quantity % 1 !== 0) return quantity.toFixed(3).replace(/\.?0+$/, "");
      return Math.round(quantity).toString();
    }
    return quantity.toFixed(3).replace(/\.?0+$/, "");
  };

  const incrementQuantity = () => {
    setQuantity((prev: number) => prev + getIncrementValue());
  };

  const decrementQuantity = () => {
    const minQty = getMinQuantity();
    const newQuantity = quantity - getIncrementValue();
    if (newQuantity >= minQty) setQuantity(newQuantity);
  };

  const handleAddToCartClick = async () => {
    if (!token || !user) {
      setShowLoginPopup(true);
      return;
    }

    if (isInCart) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }

    if (buyerType === "Wholesale") {
      try {
        setIsLoading(true);
        setError(null);

        const parsedStartValue =
          typeof startValue === "string" ? parseFloat(startValue) : startValue;

        let apiQuantity: number;
        let apiUnit: "kg" | "g";

        if (unitType?.toLowerCase() === "kg") {
          // Send as kg directly
          apiQuantity = parsedStartValue;
          apiUnit = "kg";
        } else {
          // Convert kg to grams (API always sends startValue in kg)
          apiQuantity = parsedStartValue * 1000;
          apiUnit = "g";
        }

        const productData = {
          mpItemId: id,
          quantityType: apiUnit,
          quantity: apiQuantity,
        };

        await productAddToCart(productData, token);
        try {
          const cartInfo = await getCartInfo(token);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error("Error fetching cart info:", cartError);
        }
        setAddedToCart(true);
        setIsInCart(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setTimeout(() => setAddedToCart(false), 2000);
      }
      return;
    }

    if (!showQuantitySelector) {
      setShowQuantitySelector(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let apiQuantity: number;
      let apiUnit: "kg" | "g";
      if (unit === "kg") {
        apiQuantity = quantity / 1000;
        apiUnit = "kg";
      } else {
        apiQuantity = quantity;
        apiUnit = "g";
      }
      const productData = {
        mpItemId: id,
        quantityType: apiUnit,
        quantity: apiQuantity,
      };
      await productAddToCart(productData, token);
      try {
        const cartInfo = await getCartInfo(token);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error("Error fetching cart info:", cartError);
      }
      setShowQuantitySelector(false);
      setAddedToCart(true);
      setIsInCart(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setAddedToCart(false);
        setQuantity(getInitialQuantity());
        setUnit(unitType?.toLowerCase() === "kg" ? "kg" : "g");
      }, 2000);
    }
  };

  const handleUnitChange = (selectedUnit: "kg" | "g") => setUnit(selectedUnit);

  const handleLoginClick = () => {
    setShowLoginPopup(false);
    router.push("/signin");
  };

  const handleRegisterClick = () => {
    setShowLoginPopup(false);
    router.push("/signup");
  };

  const LoginPopup = () => {
    if (!showLoginPopup) return null;
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
          <button
            onClick={() => setShowLoginPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#000000] mb-4">
              Welcome, Guest! <span className="text-3xl">👋</span>
            </h2>
            <p className="text-[#8492A3] text-base leading-relaxed">
              We're excited to have you here!
              <br />
              To unlock the best experience,
              <br />
              please log in or create a new account.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRegisterClick}
              className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#EDE1FF] text-[#3E206D] text-sm sm:text-base font-semibold hover:bg-[#DCC7FF] transition-colors cursor-pointer"
            >
              Register
            </button>
            <button
              onClick={handleLoginClick}
              className="py-3 px-6 max-w-32 flex-1 rounded-2xl bg-[#3E206D] text-white font-semibold hover:bg-[#2D1A4F] text-sm sm:text-base transition-colors cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Tooltip = () => {
    if ((!showTooltip && !isHovering) || !isInCart) return null;
    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 whitespace-nowrap">
        Item is already added to cart
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    );
  };

  const MinQuantityTooltip = () => {
    if (!showMinQuantityTooltip) return null;
    const minQty = getMinQuantity();
    const displayMinQty = unit === "kg" ? minQty / 1000 : minQty;
    return (
      <div className="absolute bottom-full left-0 transform -translate-y-1 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg z-30 whitespace-nowrap">
        Minimum quantity is {displayMinQty} {unit}
        <div className="absolute top-full left-4 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    );
  };

return (
  <div className="relative bg-white rounded-xl md:rounded-3xl shadow-sm border border-gray-200 w-full h-full flex flex-col items-center transition-all duration-300 hover:shadow-md cursor-default">
    {error && (
      <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-1 text-center z-30 rounded-t-xl md:rounded-t-3xl">
        {error}
      </div>
    )}

    {isLoading && (
      <div className="absolute inset-0 bg-white rounded-xl md:rounded-3xl bg-opacity-80 flex items-center justify-center z-40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )}

    {/* Discount badge — on mobile: hidden when quantity selector is open. On desktop: always visible */}
    {showBadge && discount && discount > 0 && (
      <div className={`absolute top-0 left-0 z-20 ${showQuantitySelector ? "hidden md:block" : "block"}`}>
        <div
          className="w-15 h-15 rounded-tl-xl md:rounded-tl-3xl sm:w-14 sm:h-14 md:w-20 md:h-20 bg-purple-900 flex flex-col items-center justify-center text-white"
          style={{ clipPath: "polygon(0 0, 0 100%, 100% 0)" }}
        >
          <div className="transform -translate-y-1/3 -translate-x-1/3 text-[8px] sm:text-[9px] md:text-[10px] absolute top-4 left-4 md:top-5 md:left-6">
            <span className="text-xs">{discount}%</span>
            <br />
            <span className="text-[7px] md:text-xs">Off</span>
          </div>
        </div>
      </div>
    )}

    {/* Card body */}
    <div className="w-full flex-1 flex flex-col items-center justify-center p-2 pt-3 pb-4 gap-3">

      {/* Product image */}
      {!addedToCart && !showQuantitySelector && (
        <div className={`w-full flex items-center justify-center ${showBadge && discount ? "mt-5" : "mt-1"}`}>
          <Image
            src={image}
            alt={name}
            width={120}
            height={120}
            className="object-contain w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28"
          />
        </div>
      )}

      {/* Product name */}
      <div className="w-full text-center px-1">
        <h3 className="text-xs md:text-sm lg:text-base font-medium text-gray-800 line-clamp-2 leading-snug">
          {name}
        </h3>
      </div>

      {/* Card face price + quantity display */}
      {!showQuantitySelector && (
        <div className="w-full flex flex-col items-center gap-1">
          <div className="w-full text-center">
            <span className="text-purple-600 text-xs font-medium">
              {getStartValueDisplay()}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            {showStrikethrough && originalPrice && cardFaceOriginalPrice > cardFaceCurrentPrice ? (
              <>
                <span className="text-purple-900 text-xs md:text-sm font-semibold">
                  Rs. {formatPrice(cardFaceCurrentPrice)}
                </span>
                <span className="text-gray-500 text-xs line-through">
                  Rs. {formatPrice(cardFaceOriginalPrice)}
                </span>
              </>
            ) : (
              <span className="text-purple-900 text-xs md:text-sm font-semibold">
                Rs. {formatPrice(cardFaceOriginalPrice)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quantity selector + Add to Cart — grouped and centered */}
      <div className="w-full flex flex-col items-center gap-2">

        {/* Quantity selector */}
        {token && user && showQuantitySelector && buyerType !== "Wholesale" && !isInCart && (
          <div className="w-full flex flex-col items-center gap-2">

            {/* Inline discount pill — mobile only, replaces corner badge when selector is open */}
            {showBadge && discount && discount > 0 && (
              <span className="md:hidden inline-block bg-[#EDE1FF] text-[#3E206D] text-xs  px-1 ">
                {discount}% Off
              </span>
            )}

            <div className="flex flex-col items-center gap-0.5">
              {showStrikethrough && originalPrice && selectorOriginalPrice > selectorCurrentPrice ? (
                <>
                  <span className="text-gray-500 text-xs line-through">
                    Rs. {formatPrice(selectorOriginalPrice)}
                  </span>
                  <span className="text-purple-900 text-sm md:text-base font-semibold">
                    Rs. {formatPrice(selectorCurrentPrice)}
                  </span>
                </>
              ) : (
                <span className="text-purple-900 text-sm md:text-base font-semibold">
                  Rs. {formatPrice(selectorOriginalPrice)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUnitChange("kg")}
                className={`w-8 text-xs py-1 border rounded-md cursor-pointer ${
                  unit === "kg"
                    ? "bg-purple-100 text-purple-900 border-purple-300"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange("g")}
                className={`w-8 text-xs py-1 border cursor-pointer rounded-md ${
                  unit === "g"
                    ? "bg-purple-100 text-purple-900 border-purple-300"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                g
              </button>
            </div>

            <div className="flex items-center justify-center w-full">
              <div className="flex w-full max-w-28 rounded-lg bg-white border border-[#3E206D] relative">
                <MinQuantityTooltip />
                <button
                  onClick={() => {
                    if (quantity > getMinQuantity()) decrementQuantity();
                  }}
                  onMouseEnter={() => {
                    if (quantity <= getMinQuantity()) setShowMinQuantityTooltip(true);
                  }}
                  onMouseLeave={() => setShowMinQuantityTooltip(false)}
                  className={`flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-l-md hover:bg-purple-800 cursor-pointer ${
                    quantity <= getMinQuantity() ? "opacity-50" : ""
                  }`}
                >
                  −
                </button>
                <div className="flex-grow text-center py-1 text-sm">
                  {getDisplayQuantity()}
                </div>
                <button
                  onClick={incrementQuantity}
                  className="flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-r-md hover:bg-purple-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add to Cart button */}
        <div className="relative flex justify-center w-full">
          {/* <Tooltip /> */}
          {addedToCart ? (
            <button className="w-full hover:shadow-md transition-shadow duration-300 cursor-pointer max-w-[180px] sm:max-w-[200px] md:max-w-[220px] py-2 px-1.5 rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm bg-[#EDE1FF] text-purple-900 border border-[#3E206D]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Added to Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCartClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              disabled={isLoading || isInCart}
              className={`whitespace-nowrap w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] py-2 px-1.5 rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm transition-all duration-200 ${
                isInCart
                  ? "bg-[#EDE1FF] text-gray-500 cursor-not-allowed"
                  : token && user && showQuantitySelector && buyerType !== "Wholesale"
                  ? "bg-purple-900 text-white hover:bg-purple-800 cursor-pointer hover:shadow-md hover:shadow-purple-300"
                  : "bg-white border border-[#D7D7D7] text-gray-400 hover:bg-[#3E206D] hover:text-white cursor-pointer shadow-[0px_1px_0px_0px_#D7D7D7] hover:shadow-md hover:shadow-purple-300"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {!showQuantitySelector && !isInCart && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 md:h-4 md:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              )}
              {isInCart
                ? "Already in Cart"
                : token && user && showQuantitySelector && buyerType !== "Wholesale"
                ? "Add to Cart"
                : buyerType === "Wholesale"
                ? "Add to Cart"
                : isHovering
                ? "I want this !"
                : "Add to Cart"}
            </button>
          )}
        </div>

      </div>
    </div>

    <LoginPopup />
  </div>
);
};

export default ItemCard;