"use client";

import Image, { StaticImageData } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  productAddToCart,
} from "@/services/product-service";
import { useSelector, useDispatch } from "react-redux";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";
import { ArrowLeftRight, Check, CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import {
  getUserCart,
  removeCartProduct,
  updateCartProductQuantity,
} from "@/services/cart-service";
import { removeProduct, setCartData } from "@/store/slices/cartItemsSlice";

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
  initialInCart?: boolean; // NEW
  homeCategoryStyle?: boolean;
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
  initialInCart = false, // NEW
  homeCategoryStyle = false,
}: ItemCardProps) => {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const buyerType = useAppSelector((state) => state.auth.user?.buyerType);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMinQuantityTooltip, setShowMinQuantityTooltip] = useState(false);
  const [cartToast, setCartToast] = useState<"added" | "removed" | "updated" | null>(null);
  const cartToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsInCart(initialInCart);
  }, [initialInCart, id]);

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

  const showCartToast = (message: "added" | "removed" | "updated") => {
    if (cartToastTimeout.current) clearTimeout(cartToastTimeout.current);
    setCartToast(message);
    cartToastTimeout.current = setTimeout(() => setCartToast(null), 3000);
  };

  const syncCartState = async () => {
    if (!token) return;

    try {
      const cartData = await getUserCart(token);
      dispatch(
        setCartData({
          cart: cartData.cart,
          packages: cartData.packages,
          additionalItems: cartData.additionalItems,
          summary: cartData.summary,
        }),
      );
    } catch (cartError) {
      console.error("Error refreshing cart data:", cartError);
    }

    try {
      dispatch(updateCartInfo(await getCartInfo(token)));
    } catch (cartError) {
      console.error("Error fetching cart info:", cartError);
    }
  };

  useEffect(
    () => () => {
      if (cartToastTimeout.current) clearTimeout(cartToastTimeout.current);
    },
    [],
  );

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

  const persistCartQuantity = async (nextQuantity: number, nextUnit: "kg" | "g") => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const apiQuantity = nextUnit === "kg" ? nextQuantity / 1000 : nextQuantity;
      await updateCartProductQuantity(id, apiQuantity, token, nextUnit);
      setQuantity(nextQuantity);
      setUnit(nextUnit);
      showCartToast("updated");
      await syncCartState();
    } catch (err: any) {
      setError(err.message || "Failed to update cart product.");
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    const nextQuantity = quantity + getIncrementValue();
    if (homeCategoryStyle && isInCart) {
      void persistCartQuantity(nextQuantity, unit);
      return;
    }
    setQuantity(nextQuantity);
  };

  const decrementQuantity = () => {
    const nextQuantity = quantity - getIncrementValue();
    if (nextQuantity < getMinQuantity()) return;

    if (homeCategoryStyle && isInCart) {
      void persistCartQuantity(nextQuantity, unit);
      return;
    }
    setQuantity(nextQuantity);
  };

  const handleRemoveFromCart = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await removeCartProduct(id, token);
      dispatch(removeProduct(id));
      setIsInCart(false);
      setShowQuantitySelector(false);
      setQuantity(getInitialQuantity());
      setUnit(unitType?.toLowerCase() === "kg" ? "kg" : "g");
      showCartToast("removed");
      await syncCartState();
    } catch (err: any) {
      setError(err.message || "Failed to remove product from cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityRemoveOrDecrement = async () => {
    if (quantity > getMinQuantity()) {
      decrementQuantity();
      return;
    }

    if (!homeCategoryStyle) return;

    if (!isInCart) {
      setShowQuantitySelector(false);
      setQuantity(getInitialQuantity());
      setUnit(unitType?.toLowerCase() === "kg" ? "kg" : "g");
      return;
    }

    await handleRemoveFromCart();
  };

  const handleAddToCartClick = async () => {
    if (!token || !user) {
      setShowLoginPopup(true);
      return;
    }

    if (isInCart && !(homeCategoryStyle && buyerType !== "Wholesale")) {
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

    if (isInCart && homeCategoryStyle) {
      if (!showQuantitySelector) {
        try {
          setIsLoading(true);
          setError(null);
          const cartData = await getUserCart(token);
          const cartItem = (cartData.additionalItems ?? [])
            .flatMap((group) => group.Items)
            .find((item) => item.id === id);

          if (!cartItem) {
            throw new Error("Could not find this product in your cart.");
          }

          const cartUnit = cartItem.unit.toLowerCase() === "kg" ? "kg" : "g";
          setQuantity(cartUnit === "kg" ? cartItem.quantity * 1000 : cartItem.quantity);
          setUnit(cartUnit);
          setCartData({
            cart: cartData.cart,
            packages: cartData.packages,
            additionalItems: cartData.additionalItems,
            summary: cartData.summary,
          });
          setShowQuantitySelector(true);
        } catch (err: any) {
          setError(err.message || "Failed to load cart product.");
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    if (homeCategoryStyle) {
      try {
        setIsLoading(true);
        setError(null);
        const apiQuantity = unit === "kg" ? quantity / 1000 : quantity;
        await productAddToCart(
          {
            mpItemId: id,
            quantityType: unit,
            quantity: apiQuantity,
          },
          token,
        );
        setIsInCart(true);
        setShowQuantitySelector(true);
        showCartToast("added");
        await syncCartState();
      } catch (err: any) {
        setError(err.message || "Failed to add product to cart.");
      } finally {
        setIsLoading(false);
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
      setShowQuantitySelector(false);
      setIsInCart(true);
      try {
        const cartInfo = await getCartInfo(token);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error("Error fetching cart info:", cartError);
      }
      setAddedToCart(true);
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

  const handleUnitChange = (selectedUnit: "kg" | "g") => {
    if (selectedUnit === unit) return;
    if (homeCategoryStyle && isInCart) {
      void persistCartQuantity(quantity, selectedUnit);
      return;
    }
    setUnit(selectedUnit);
  };

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
    <div className={`relative w-full h-full flex flex-col items-center transition-all duration-300 cursor-default ${
      homeCategoryStyle
        ? "min-h-[300px] rounded-t-[50%] rounded-b-[42px] border border-transparent bg-white shadow-sm hover:shadow-md sm:min-h-[340px] lg:min-h-[380px]"
        : "rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md md:rounded-3xl"
    }`}>
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
      {homeCategoryStyle && showBadge && discount && discount > 0 && (
        <div className="absolute left-3 top-3 z-20 flex h-9 min-w-9 items-center justify-center rounded-full bg-[#ff3657] px-1.5 text-xs font-bold text-white sm:h-11 sm:min-w-11 sm:text-sm">
          {discount}%
        </div>
      )}

      {!homeCategoryStyle && showBadge && discount && discount > 0 && (
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
      <div className={`w-full flex-1 flex flex-col items-center ${
        homeCategoryStyle
          ? "justify-start gap-2 px-2 pb-7 pt-5 sm:pt-6 lg:pt-7"
          : "justify-center gap-3 p-2 pb-4 pt-3"
      }`}>

        {/* Product image */}
        {!addedToCart && (!showQuantitySelector || homeCategoryStyle) && (
          <div className={`w-full flex items-center justify-center ${
            homeCategoryStyle ? "mt-0" : showBadge && discount ? "mt-5" : "mt-1"
          }`}>
            <div className={homeCategoryStyle
              ? "flex h-[118px] w-[118px] items-center justify-center rounded-full bg-[#f0f3ff] sm:h-[148px] sm:w-[148px] lg:h-[178px] lg:w-[178px]"
              : ""
            }>
              <Image
                src={image}
                alt={name}
                width={120}
                height={120}
                className={homeCategoryStyle
                  ? "h-[88px] w-[88px] object-contain sm:h-[112px] sm:w-[112px] lg:h-[136px] lg:w-[136px]"
                  : "h-14 w-14 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28"
                }
              />
            </div>
          </div>
        )}

        {/* Product name */}
        <div className="w-full px-1 text-center">
          <h3 className={`line-clamp-2 leading-snug text-gray-800 ${
            homeCategoryStyle
              ? "text-base font-semibold sm:text-lg lg:text-2xl"
              : "text-xs font-medium md:text-sm lg:text-base"
          }`}>
            {name}
          </h3>
        </div>

        {/* Card face price + quantity display */}
        {!showQuantitySelector && (
          <div className={`w-full flex flex-col items-center ${homeCategoryStyle ? "gap-0.5" : "gap-1"}`}>
            <div className="w-full text-center">
              <span className={homeCategoryStyle
                ? "text-sm font-medium text-[#596579] sm:text-base lg:text-lg"
                : "text-xs font-medium text-purple-600"
              }>
                {getStartValueDisplay()}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              {showStrikethrough && originalPrice && cardFaceOriginalPrice > cardFaceCurrentPrice ? (
                <>
                  {homeCategoryStyle ? (
                    <>
                      <span className="text-[11px] text-[#777] line-through sm:text-xs lg:text-sm">
                        Rs. {formatPrice(cardFaceOriginalPrice)}
                      </span>
                      <span className="text-base font-bold text-[#171d27] sm:text-lg lg:text-xl">
                        Rs. {formatPrice(cardFaceCurrentPrice)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-purple-900 text-xs font-semibold md:text-sm">
                        Rs. {formatPrice(cardFaceCurrentPrice)}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        Rs. {formatPrice(cardFaceOriginalPrice)}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className={homeCategoryStyle
                  ? "text-base font-bold text-[#171d27] sm:text-lg lg:text-xl"
                  : "text-xs font-semibold text-purple-900 md:text-sm"
                }>
                  Rs. {formatPrice(cardFaceOriginalPrice)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quantity selector + Add to Cart — grouped and centered */}
        <div className="w-full flex flex-col items-center gap-2">

          {/* Quantity selector */}
          {token && user && showQuantitySelector && buyerType !== "Wholesale" && (!isInCart || homeCategoryStyle) && (
            <div className="w-full flex flex-col items-center gap-2">

              {/* Inline discount pill — mobile only, replaces corner badge when selector is open */}
              {showBadge && discount && discount > 0 && (
                <span className="md:hidden inline-block bg-[#EDE1FF] text-[#3E206D] text-xs  px-1 ">
                  {discount}% Off
                </span>
              )}

              {!homeCategoryStyle && (
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
              )}

              <div className={homeCategoryStyle ? "flex items-center gap-3" : "flex gap-2"}>
                <button
                  onClick={() => handleUnitChange("kg")}
                  className={`cursor-pointer ${
                    homeCategoryStyle
                      ? `min-w-12 rounded-full px-4 py-1 text-sm font-semibold text-white ${
                          unit === "kg" ? "bg-[#ff7900]" : "bg-[#ffb763]"
                        }`
                      : `w-8 text-xs py-1 border rounded-md cursor-pointer ${
                          unit === "kg" ? "bg-purple-100 text-purple-900 border-purple-300" : "bg-gray-100 text-gray-500 border-gray-200"
                        }`
                  }`}
                >
                  kg
                </button>
                {homeCategoryStyle && (
                  <ArrowLeftRight size={20} className="text-[#171d27]" />
                )}
                <button
                  onClick={() => handleUnitChange("g")}
                  className={`cursor-pointer ${
                    homeCategoryStyle
                      ? `min-w-12 rounded-full px-4 py-1 text-sm font-semibold text-white ${
                          unit === "g" ? "bg-[#ff7900]" : "bg-[#ffb763]"
                        }`
                      : `w-8 text-xs py-1 border cursor-pointer rounded-md ${
                          unit === "g" ? "bg-purple-100 text-purple-900 border-purple-300" : "bg-gray-100 text-gray-500 border-gray-200"
                        }`
                  }`}
                >
                  g
                </button>
              </div>

              <div className="flex w-full items-center justify-center">
                <div className={`relative ${
                  homeCategoryStyle
                    ? "flex h-10 w-full max-w-[220px] items-center rounded-full border border-[#b8bbc5] bg-white shadow-sm"
                    : "flex w-full max-w-28 rounded-lg border border-[#3E206D] bg-white"
                }`}>
                  <MinQuantityTooltip />
                  <button
                    onClick={handleQuantityRemoveOrDecrement}
                    onMouseEnter={() => {
                      if (!homeCategoryStyle && quantity <= getMinQuantity()) {
                        setShowMinQuantityTooltip(true);
                      }
                    }}
                    onMouseLeave={() => setShowMinQuantityTooltip(false)}
                    aria-label={
                      homeCategoryStyle
                        ? quantity > getMinQuantity()
                          ? "Decrease quantity"
                          : isInCart
                            ? "Remove from cart"
                            : "Close quantity selector"
                        : "Decrease quantity"
                    }
                    className={homeCategoryStyle
                      ? `flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#171d27] text-white hover:bg-[#303946] ${
                          quantity <= getMinQuantity() ? "opacity-100" : ""
                        }`
                      : `flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-l-md hover:bg-purple-800 cursor-pointer ${
                          quantity <= getMinQuantity() ? "opacity-50" : ""
                        }`
                    }
                  >
                    {homeCategoryStyle
                      ? quantity > getMinQuantity()
                        ? <Minus size={18} />
                        : <Trash2 size={17} />
                      : "−"}
                  </button>
                  <div className={`flex-grow text-center ${
                    homeCategoryStyle ? "px-2 text-base font-semibold text-[#171d27]" : "py-1 text-sm"
                  }`}>
                    {getDisplayQuantity()}{homeCategoryStyle ? ` ${unit}` : ""}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    aria-label="Increase quantity"
                    className={homeCategoryStyle
                      ? "flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#171d27] text-white hover:bg-[#303946]"
                      : "flex-none px-2 py-1 bg-[#3E206D] text-white font-bold rounded-r-md hover:bg-purple-800 cursor-pointer"
                    }
                  >
                    {homeCategoryStyle ? <Plus size={19} /> : "+"}
                  </button>
                </div>
              </div>

              {homeCategoryStyle && (
                <div className="flex flex-col items-center gap-0.5">
                  {showStrikethrough && originalPrice && selectorOriginalPrice > selectorCurrentPrice ? (
                  <>
                    <span className="text-sm text-[#777] line-through">
                      Rs. {formatPrice(selectorOriginalPrice)}
                    </span>
                    <span className="text-xl font-bold text-[#171d27]">
                      Rs. {formatPrice(selectorCurrentPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-[#171d27]">
                    Rs. {formatPrice(selectorOriginalPrice)}
                  </span>
                )}
                </div>
              )}
            </div>
          )}

          {/* Add to Cart button */}
          <div className={homeCategoryStyle ? "static" : "relative flex w-full justify-center"}>
            {!(homeCategoryStyle && isInCart && showQuantitySelector) && (
              <>
                {addedToCart ? (
              <button
                type="button"
                aria-label="Added to cart"
                className={homeCategoryStyle
                  ? "absolute -bottom-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#171d27] text-white shadow-md sm:-bottom-6 sm:h-12 sm:w-12 lg:-bottom-7 lg:h-14 lg:w-14"
                  : "w-full hover:shadow-md transition-shadow duration-300 cursor-pointer max-w-[180px] sm:max-w-[200px] md:max-w-[220px] py-2 px-1.5 rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm bg-[#EDE1FF] text-purple-900 border border-[#3E206D]"
                }
              >
                {homeCategoryStyle ? (
                  <Check size={18} />
                ) : (
                  <>
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
                  </>
                )}
              </button>
                ) : (
              <button
                onClick={handleAddToCartClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                disabled={isLoading || (isInCart && !homeCategoryStyle)}
                aria-label={homeCategoryStyle && !showQuantitySelector ? `Add ${name} to cart` : undefined}
                className={homeCategoryStyle
                  ? showQuantitySelector
                    ? "absolute -bottom-4 left-1/2 flex min-h-9 min-w-24 -translate-x-1/2 items-center justify-center rounded-full bg-[#171d27] px-3 text-xs font-medium text-white shadow-md disabled:opacity-50"
                    : "absolute -bottom-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#171d27] text-white shadow-md transition-colors hover:bg-[#303946] disabled:cursor-not-allowed disabled:opacity-60 sm:-bottom-6 sm:h-12 sm:w-12 lg:-bottom-7 lg:h-14 lg:w-14"
                  : `whitespace-nowrap w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] py-2 px-1.5 rounded-lg md:rounded-xl flex items-center justify-center gap-1 text-xs md:text-sm transition-all duration-200 ${isInCart
                    ? "bg-[#EDE1FF] text-gray-500 cursor-not-allowed"
                    : token && user && showQuantitySelector && buyerType !== "Wholesale"
                      ? "bg-purple-900 text-white hover:bg-purple-800 cursor-pointer hover:shadow-md hover:shadow-purple-300"
                      : "bg-white border border-[#D7D7D7] text-gray-400 hover:bg-[#3E206D] hover:text-white cursor-pointer shadow-[0px_1px_0px_0px_#D7D7D7] hover:shadow-md hover:shadow-purple-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`
                }
              >
                {homeCategoryStyle && !showQuantitySelector ? (
                  <Plus size={22} />
                ) : !homeCategoryStyle && !showQuantitySelector && !isInCart ? (
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
                ) : null}
                {homeCategoryStyle
                  ? showQuantitySelector
                    ? isInCart ? "Update Cart" : "Add to Cart"
                    : null
                  : isInCart
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
              </>
            )}
          </div>

        </div>
      </div>

      {homeCategoryStyle && cartToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[#171d27] px-5 py-2.5 text-sm font-semibold text-white shadow-lg sm:text-base"
        >
          <CheckCircle2 size={17} className="shrink-0 fill-white text-[#171d27]" />
          <span>
            {cartToast === "added"
              ? "Added to Cart"
              : cartToast === "removed"
                ? "Removed from Cart"
                : "Cart Updated"}
          </span>
          {cartToast !== "removed" && (
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="font-semibold text-[#ff8c00] hover:text-[#ffad33]"
            >
              View Cart
            </button>
          )}
        </div>
      )}

      <LoginPopup />
    </div>
  );
};

export default ItemCard;