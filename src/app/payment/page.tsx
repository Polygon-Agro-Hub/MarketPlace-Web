"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopNavigation from "@/components/top-navigation/TopNavigation";
import Visa from "../../../public/images/Visa.png";
import MasterCard from "../../../public/images/Mastercard.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  submitOrderToBackend,
  validateOrderData,
  OrderPayload,
  formatValidationErrors,
  validateCoupon,
} from "@/services/cart-service";
import summary from "../../../public/summary.png";
import { updateCartInfo } from "@/store/slices/authSlice";
import { getCartInfo } from "@/services/auth-service";
import { WalletMinimal, ReceiptText } from "lucide-react";
import creditWalletImage from "../../../public/credit-wallet.png";
import cardPaymentIcon from "../../../public/pay-now-illustration.png";
import cashPaymentIcon from "../../../public/cashicon.png";

const Page: React.FC = () => {
  const router = useRouter();
  const NavArray = [
    { name: "Cart", path: "/cart", status: true },
    { name: "Checkout", path: "/checkout", status: false },
    { name: "Payment", path: "/payment", status: true },
  ];

  // Redux state selectors
  const cartItems = useSelector((state: RootState) => state.cartItems);
  const checkoutDetails = useSelector((state: RootState) => state.checkout);
  const token = useSelector((state: RootState) => state.auth?.token) || null;
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const authCart = useSelector((state: RootState) => state.auth.cart);

  // Local state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    nameOnCard: "",
    expirationDate: "",
    cvv: "",
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValidationLoading, setCouponValidationLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [couponType, setCouponType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const isFinalizeImdt = checkoutDetails?.isFinalizeImdt === 1;


  const getHomeUrl = () => {
    return user?.buyerType === "Wholesale" ? "/wholesale/home" : "/";
  };

  useEffect(() => {
    const savedCharge = localStorage.getItem("deliveryCharge");
    if (savedCharge) {
      setDeliveryCharge(parseFloat(savedCharge));
    }
  }, []);


  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };


  const prepareOrderPayload = (): OrderPayload => {
    const calculatedSummary = cartItems.calculatedSummary;
    const originalGrandTotal = calculatedSummary?.finalTotal || 0;
    const discountAmount = calculatedSummary?.totalDiscount || 0;

    const couponDiscountAmount = isCouponApplied ? Number(couponDiscount) || 0 : 0;
    const shouldApplyDeliveryCharge = checkoutDetails.deliveryMethod === "home";

    const isFreeDeliveryCoupon =
      isCouponApplied &&
      (couponType === "Free Delivery" || couponType === "Free Delivary");

    const effectiveDeliveryCharge = shouldApplyDeliveryCharge
      ? isFreeDeliveryCoupon
        ? 0
        : deliveryCharge
      : 0;

    const finalGrandTotal = isCouponApplied
      ? originalGrandTotal - couponDiscountAmount + effectiveDeliveryCharge
      : originalGrandTotal + effectiveDeliveryCharge;

    const creditAppliedAmount = useCredit ? Math.min(creditBalance, finalGrandTotal) : 0;
    const remainingAmount = finalGrandTotal - creditAppliedAmount;

    let finalCheckoutDetails: any = {
      deliveryMethod: checkoutDetails.deliveryMethod || "home",
      title: checkoutDetails.title || "",
      fullName: checkoutDetails.fullName || "",
      phoneCode1: checkoutDetails.phoneCode1 || "+94",
      phone1: checkoutDetails.phone1 || "",
      phoneCode2: checkoutDetails.phoneCode2 || "",
      phone2: checkoutDetails.phone2 || "",
      buildingType: "",
      deliveryDate: checkoutDetails.deliveryDate || "",
      timeSlot: checkoutDetails.timeSlot || "",
      buildingNo: "",
      buildingName: "",
      flatNumber: "",
      floorNumber: "",
      houseNo: "",
      street: "",
      cityName: "",
      scheduleType: checkoutDetails.scheduleType || "One Time",
      centerId: null as number | null,
      couponValue: isCouponApplied ? Number(couponDiscountAmount) : 0,
      isCoupon: isCouponApplied,
      couponCode: isCouponApplied ? couponCode : "",
      couponType: isCouponApplied ? couponType : "",
      geoLatitude: checkoutDetails.geoLatitude || null,
      geoLongitude: checkoutDetails.geoLongitude || null,
      companycenterId: checkoutDetails.companycenterId || null,
    };

    if (checkoutDetails.deliveryMethod === "home") {
      finalCheckoutDetails.buildingType = (checkoutDetails.buildingType || "apartment").toLowerCase();
      finalCheckoutDetails.houseNo = checkoutDetails.houseNo || "";
      finalCheckoutDetails.street = checkoutDetails.street || "";
      finalCheckoutDetails.cityName = checkoutDetails.cityName || "";
      finalCheckoutDetails.centerId = null;

      if (checkoutDetails.buildingType?.toLowerCase() === "apartment") {
        finalCheckoutDetails.buildingNo = checkoutDetails.buildingNo || "";
        finalCheckoutDetails.buildingName = checkoutDetails.buildingName || "";
        finalCheckoutDetails.flatNumber = checkoutDetails.flatNumber || "";
        finalCheckoutDetails.floorNumber = checkoutDetails.floorNumber || "";
      }
    } else if (checkoutDetails.deliveryMethod === "pickup") {
      finalCheckoutDetails.centerId = checkoutDetails.centerId || null;
    }

    return {
      cartId: cartItems.cartId || 0,
      checkoutDetails: finalCheckoutDetails,
      paymentMethod, // always send it, never null — avoids the type error
      discountAmount: Number(discountAmount) || 0,
      grandTotal: Number(finalGrandTotal) || 0,
      orderApp: "marketplace",
      deliveryCharge: effectiveDeliveryCharge,
      isCreditApplied: useCredit,
      creditPaid: Number(creditAppliedAmount) || 0,
      moneyPaid: Number(remainingAmount) || 0,
      isFinalizeImdt: checkoutDetails.isFinalizeImdt === 1 ? 1 : 0,
    };
  };

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponValidationLoading(true);
    setCouponError("");

    try {
      if (!token) {
        throw new Error("Please log in to apply coupon");
      }

      const deliveryMethod = checkoutDetails.deliveryMethod || "home";
      const response = await validateCoupon(couponCode.trim(), token, deliveryMethod);

      if (response.status) {
        setIsCouponApplied(true);
        const discountValue = parseFloat(response.discount.toString().replace(/,/g, "")) || 0;
        setCouponDiscount(discountValue);
        setCouponType(response.type || "");
      } else {
        setCouponError(response.message);
        setIsCouponApplied(false);
        setCouponDiscount(0);
        setCouponType("");
      }
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      setCouponError(error.message || "Failed to apply coupon");
      setIsCouponApplied(false);
      setCouponDiscount(0);
      setCouponType("");
    } finally {
      setCouponValidationLoading(false);
    }
  };

  const validateCartData = (): { isValid: boolean; error?: string } => {
    if (!cartItems.cartId || cartItems.cartId === 0) {
      return { isValid: false, error: "Cart ID is missing. Please refresh and try again." };
    }

    const hasPackages = cartItems.packages && cartItems.packages.length > 0;
    const hasAdditionalItems =
      cartItems.additionalItems &&
      cartItems.additionalItems.length > 0 &&
      cartItems.additionalItems.some((group: any) => group.Items && group.Items.length > 0);

    if (!hasPackages && !hasAdditionalItems) {
      return { isValid: false, error: "No items in cart. Please add items before placing order." };
    }

    if (!cartItems.calculatedSummary) {
      return { isValid: false, error: "Cart summary is missing. Please refresh and try again." };
    }

    if (!checkoutDetails) {
      return { isValid: false, error: "Checkout details are missing. Please complete the checkout process." };
    }

    const requiredFields = ["deliveryMethod", "title", "fullName", "phone1"];
    for (const field of requiredFields) {
      if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    if (checkoutDetails.deliveryMethod === "home") {
      if (checkoutDetails.buildingType?.toLowerCase() === "apartment") {
        const apartmentFields = ["buildingNo", "buildingName", "flatNumber", "floorNumber"];
        for (const field of apartmentFields) {
          if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
            return { isValid: false, error: `Missing required apartment field: ${field}` };
          }
        }
      }
      const homeDeliveryFields = ["houseNo", "street", "cityName"];
      for (const field of homeDeliveryFields) {
        if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
          return { isValid: false, error: `Missing required home delivery field: ${field}` };
        }
      }
    } else if (checkoutDetails.deliveryMethod === "pickup") {
      if (!checkoutDetails.centerId) {
        return { isValid: false, error: "Please select a pickup center." };
      }
    }

    return { isValid: true };
  };

  const handleSubmitOrder = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const cartValidation = validateCartData();
      if (!cartValidation.isValid) {
        throw new Error(cartValidation.error);
      }

      if (!isFullyCoveredByCredit && paymentMethod === "card") {
        const { cardNumber, nameOnCard, expirationDate, cvv } = cardDetails;
        if (!cardNumber || !nameOnCard || !expirationDate || !cvv) {
          throw new Error("Please fill in all card details.");
        }
      }

      const payload = prepareOrderPayload();
      const validation = validateOrderData(payload);
      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors);
        setErrorMessage(formatValidationErrors(validation.errors));
        setShowErrorPopup(true);
        return;
      }

      const result = await submitOrderToBackend(payload, token);

      if (result.status && result.processOrderId) {
        setOrderId(result.processOrderId);
        setOrderSubmitted(true);
        localStorage.removeItem("deliveryCharge");

        setIsError(false);
        setModalMessage("Your order has been placed.");
        setIsModalOpen(true);

        try {
          const cartInfo = await getCartInfo(token);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error("Error fetching cart info:", cartError);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      const errorMsg = error.message || "Order submission failed. Please try again.";
      setIsError(true);
      setModalMessage(errorMsg);
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (!isError) {
      router.push(getHomeUrl());
    }
  };

  const handleViewInvoice = () => {
    setIsModalOpen(false);
    if (orderId) {
      router.push(`/history/invoice/?orderId=${orderId}`);
    } else {
      setIsError(true);
      setModalMessage("Order ID not available. Please try again.");
      setIsModalOpen(true);
    }
  };

  const getDisplayValues = () => {
    const calculatedSummary = cartItems.calculatedSummary;
    const originalGrandTotal = calculatedSummary?.finalTotal || 0;
    const shouldShowDeliveryCharge = checkoutDetails.deliveryMethod === "home";
    const shouldApplyDeliveryCharge = checkoutDetails.deliveryMethod === "home";

    const isFreeDeliveryCoupon =
      isCouponApplied &&
      (couponType === "Free Delivery" || couponType === "Free Delivary");

    const effectiveDeliveryCharge = shouldApplyDeliveryCharge
      ? isFreeDeliveryCoupon
        ? 0
        : deliveryCharge
      : 0;
    const couponDiscountAmount = isCouponApplied ? Number(couponDiscount) || 0 : 0;
    const finalGrandTotal = isCouponApplied
      ? originalGrandTotal - couponDiscountAmount + effectiveDeliveryCharge
      : originalGrandTotal + effectiveDeliveryCharge;

    return {
      totalItems: calculatedSummary?.totalItems || 0,
      totalPrice: calculatedSummary?.grandTotal || 0,
      discountAmount: calculatedSummary?.totalDiscount || 0,
      originalGrandTotal: originalGrandTotal,
      couponDiscount: couponDiscountAmount,
      grandTotal: finalGrandTotal,
      deliveryCharges: effectiveDeliveryCharge,
      isFreeDelivery: isFreeDeliveryCoupon && shouldShowDeliveryCharge,
      showDeliveryCharges: shouldShowDeliveryCharge,
    };
  };

  const displayValues = getDisplayValues();

  const creditBalance = Number(authCart?.creditBalance) || 0;

  console.log('creditbalance ', creditBalance)

  // Toggle state for "Use My Credit Balance"
  const [useCredit, setUseCredit] = useState(false);
  const creditApplied = useCredit ? Math.min(creditBalance, displayValues.grandTotal) : 0;
  const remainingAfterCredit = displayValues.grandTotal - creditApplied;
  const isFullyCoveredByCredit = useCredit && remainingAfterCredit === 0;
  const showCashOption = displayValues.grandTotal <= 2000 && !isFinalizeImdt;

  useEffect(() => {
    if (!showCashOption && paymentMethod === "cash") {
      setPaymentMethod("card");
    }
  }, [showCashOption]);

  useEffect(() => {
    dispatch(
      updateCartInfo({
        price: parseFloat(displayValues.grandTotal.toFixed(2)),
        count: authCart.count,
      })
    );
  }, [displayValues.grandTotal, isCouponApplied, couponDiscount, deliveryCharge]);

  const canConfirmOrder = (): boolean => {
    if (isSubmitting || orderSubmitted) return false;
    if (isFullyCoveredByCredit) return true; // credit alone covers everything

    if (paymentMethod === "card") {
      const { cardNumber, nameOnCard, expirationDate, cvv } = cardDetails;
      return Boolean(cardNumber && nameOnCard && expirationDate && cvv);
    }
    return paymentMethod === "cash" && showCashOption;
  };

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5">
      {/* Modal - same as original */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center w-[90%] max-w-md shadow-xl">
            {isError ? (
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out scale-100 opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 scale-100 opacity-100 transition-all duration-700 ease-out" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-14 h-14 text-[#8746ff]" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              {isError ? "Error" : "Thank you for ordering!"}
            </h2>
            <p className="text-gray-500 mb-6">{modalMessage}</p>
            {isError ? (
              <button onClick={handleModalClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium">
                Close
              </button>
            ) : (
              <div className="flex gap-3 justify-center">
                <button onClick={handleModalClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium">
                  Go Back
                </button>
                <button
                  onClick={handleViewInvoice}
                  disabled={!orderId}
                  className={`px-6 py-2 rounded-lg transition cursor-pointer font-medium ${!orderId ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-[#3E206D] text-white hover:bg-[#3E206D]"
                    }`}
                >
                  View Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <TopNavigation NavArray={NavArray} />

      {/* Two Column Layout - Matches the image exactly */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 lg:mt-8">
        {/* Left Column - Payment Methods */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
            {creditBalance > 0 && (
              <div className="mb-5 p-4 sm:p-5 bg-white">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={creditWalletImage}
                        alt="Credit balance"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-[#252525] font-bold">Pay using your Credit Balance</p>
                      <p className="text-sm text-gray-500">Apply credit to reduce payment.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseCredit((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${useCredit ? "bg-[#34C759]" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useCredit ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-[#1B7331]">Use My Credit Balance</span>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-2 gap-4 rounded-[10px] border p-4 ${useCredit
                    ? "bg-[#F6FCF5] border-[#AEC9AB]"
                    : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <WalletMinimal className="w-6 h-6" style={{ color: "#27AA48" }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Credit Applied</p>
                      <p className={`font-semibold ${useCredit ? "text-green-600" : "text-gray-700"}`}>
                        {useCredit ? `- Rs. ${formatPrice(creditApplied)}` : "0.00"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <ReceiptText className="w-6 h-6 text-[#354052]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining to Pay</p>
                      <p className="font-semibold text-gray-900">Rs. {formatPrice(remainingAfterCredit)}</p>
                    </div>
                  </div>
                </div>

                {useCredit && remainingAfterCredit > 0 && (
                  <div className="mt-4">
                    <p className="font-bold text-sm text-[#252525]">Choose a payment method for the remaining amount.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You need to pay{" "}
                      <span className="font-semibold text-[#3E206D]">Rs. {formatPrice(remainingAfterCredit)}</span> to
                      complete your order.
                    </p>
                  </div>
                )}
                {isFullyCoveredByCredit && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    <div className="flex items-center gap-3 bg-[#F5FBF5] border border-[#6DD087] rounded-[10px] p-4">
                      <div className="w-7 h-7 rounded-full bg-[#1C8732] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#252525]">Your Credit Balance is enough to pay for this order.</p>
                        <p className="text-xs text-[#5A6B5D]">
                          {creditBalance - creditApplied > 0 ? (
                            <>
                              You will save{" "}
                              <span className="font-semibold text-[#1C8732]">
                                Rs. {formatPrice(creditBalance - creditApplied)}
                              </span>{" "}
                              in your credit balance.
                            </>
                          ) : (
                            "No additional payment is required."
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {creditBalance > 0 && !isFullyCoveredByCredit && (
              <div className="border-t border-[#CBCFD5] my-5 sm:my-6" />
            )}

            {!isFullyCoveredByCredit && (
              <>
                <h1 className="text-medium sm:text-lg font-semibold mb-4 sm:mb-6">
                  Select Payment Method
                </h1>

                {/* Credit/Debit Card */}
                <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer bg-white hover:bg-gray-50 transition"
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full ${paymentMethod === "card"
                          ? "bg-[#3E206D] border-2 border-[#3E206D] ring-2 ring-purple-100"
                          : "border border-gray-400"
                          }`}
                      />
                      <span className="ml-3 text-base font-medium">Credit / Debit Card</span>
                    </div>
                    <div className="flex space-x-2">
                      <Image src={Visa} alt="Visa" className="w-auto h-6 object-cover" />
                      <Image src={MasterCard} alt="MasterCard" className="w-auto h-6 object-cover" />
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="p-5 border-t border-gray-200 bg-gray-50/30">
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Enter Card Number"
                          value={cardDetails.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                            if (value.length <= 16) handleCardInputChange("cardNumber", formattedValue);
                          }}
                          maxLength={19}
                          className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                        <input
                          type="text"
                          placeholder="Enter Name on Card"
                          value={cardDetails.nameOnCard}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value.startsWith(" ")) value = value.trimStart();
                            value = value.replace(/[^a-zA-Z\s]/g, "");
                            value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                            handleCardInputChange("nameOnCard", value);
                          }}
                          className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                        <div className="flex gap-4">
                          <input
                            type="text"
                            placeholder="Enter Expiration Date (MM/YY)"
                            value={cardDetails.expirationDate}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9/]/g, "");
                              let formattedValue = value;
                              if (value.length === 2 && !value.includes("/") && e.target.value.length > cardDetails.expirationDate.length) {
                                formattedValue = value + "/";
                              }
                              if (formattedValue.length <= 5) handleCardInputChange("expirationDate", formattedValue);
                            }}
                            maxLength={5}
                            className="w-2/3 p-3 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                          />
                          <input
                            type="text"
                            placeholder="Enter CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length <= 3) handleCardInputChange("cvv", value);
                            }}
                            maxLength={3}
                            className="w-1/3 p-3 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pay by Cash */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className={`p-4 flex items-center transition ${showCashOption ? "cursor-pointer bg-white hover:bg-gray-50" : "bg-gray-50 cursor-not-allowed"
                      }`}
                    onClick={() => showCashOption && setPaymentMethod("cash")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full ${paymentMethod === "cash" && showCashOption
                          ? "bg-[#3E206D] border-2 border-[#3E206D] ring-2 ring-purple-100"
                          : "border border-gray-400"
                          }`}
                      />
                      <span className={`ml-3 text-base font-medium ${!showCashOption ? "text-gray-400" : ""}`}>
                        Pay by Cash
                      </span>
                      {!showCashOption && (
                        <span className="ml-3 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>

                  {!showCashOption && (
                    <div className="px-4 pb-4">
                      <div className="flex items-start gap-2 bg-[#F5F8FD] border border-[#E1E8F8] rounded-lg p-3 text-sm text-[#41519E]">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 8v.01M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>
                          {isFinalizeImdt
                            ? "Pay by cash is not available for immediate package finalization."
                            : "Pay By Cash is available only for orders equal to or less than Rs. 2,000.00."}
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && showCashOption && (
                    <div className="p-5 border-t border-gray-200 bg-gray-50/30">
                      <div className="text-gray-700 space-y-3">
                        <div className="flex gap-2">
                          <span className="flex-shrink-0">-</span>
                          <span>You may pay in cash to our courier upon receiving your parcel at the doorstep.</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0">-</span>
                          <span>Before agreeing to receive the parcel, check if your delivery status has been updated to "Out of Delivery".</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0">-</span>
                          <span>Before receiving, confirm that the airway bill shows that the parcel from Polygon Holdings.</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0">-</span>
                          <span>Before you make the payment to the courier, confirm your order number, sender information, and tracking number on the parcel.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Your Order</h2>

            {/* Items count with icon */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image src={summary} alt="Shopping bag" width={28} height={28} className="object-contain" />
                </div>
                <p className="text-gray-700">
                  {displayValues.totalItems} {displayValues.totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <p className="font-semibold">Rs. {formatPrice(displayValues.totalPrice)}</p>
            </div>

            {/* Coupon Code Section */}
            <div className="mb-5">
              <h3 className="font-semibold text-sm mb-2">Coupon Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  disabled={isCouponApplied || couponValidationLoading}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isCouponApplied || couponValidationLoading}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer  ${isCouponApplied
                    ? "bg-[#3E206D] text-white cursor-not-allowed"
                    : couponValidationLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#3E206D] text-white hover:bg-[#2f1854]"
                    }`}
                >
                  {couponValidationLoading ? "Verifying..." : isCouponApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {isCouponApplied && <p className="text-[#3E206D] text-sm mt-2">✓ Coupon applied successfully</p>}
              {couponError && <p className="text-red-600 text-sm mt-2">{couponError}</p>}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">Rs. {formatPrice(displayValues.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-[#BE2A45]">Rs. {formatPrice(displayValues.discountAmount)}</span>
              </div>
              {isCouponApplied && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon Discount</span>
                  <span className="font-medium text-green-600">- Rs. {formatPrice(displayValues.couponDiscount)}</span>
                </div>
              )}
              {displayValues.showDeliveryCharges && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery Charges
                    {displayValues.isFreeDelivery && <span className="font-semibold ml-1">(Free)</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {displayValues.isFreeDelivery && (
                      <span className="text-gray-400 line-through">Rs. {formatPrice(deliveryCharge)}</span>
                    )}
                    <span className="font-medium">Rs. {formatPrice(displayValues.deliveryCharges)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Grand Total */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-lg">Grand Total</span>
              <span className="font-bold text-xl text-[#3E206D]">Rs. {formatPrice(displayValues.grandTotal)}</span>
            </div>

            {/* Confirm Order Button */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className={useCredit ? "text-[#1C8732]" : "text-gray-500"}>Credit Applied</span>
              <span className={`font-medium ${useCredit ? "text-green-600" : "text-gray-500"}`}>
                {useCredit ? `- Rs. ${formatPrice(creditApplied)}` : "Rs. 0.00"}
              </span>
            </div>

            {/* Remaining Amount - always visible */}
            <div className="flex justify-between items-center border border-[#E8E5F7] bg-[#F5F3FD] rounded-lg px-3 py-2 mb-3">
              <span className="text-sm text-[#3E206D]">Remaining Amount</span>
              <span className="font-semibold text-[#3E206D]">Rs. {formatPrice(remainingAfterCredit)}</span>
            </div>

            {/* Card Payment box - only when there's a remaining balance to pay */}
            {remainingAfterCredit > 0 && (
              <>
                {paymentMethod === "cash" && showCashOption ? (
                  <div className="border border-[#E8E5F7] bg-[#F5F3FD] rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#3E206D]">
                        You pay on {checkoutDetails.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                      </span>
                      <span className="font-bold text-[#3E206D]">Rs. {formatPrice(remainingAfterCredit)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Image
                        src={cashPaymentIcon}
                        alt="Cash payment"
                        width={20}
                        height={20}
                        className="object-contain flex-shrink-0"
                      />
                      <p className="text-xs text-[#47484C]">
                        Pay the remaining amount in cash when your order is{" "}
                        {checkoutDetails.deliveryMethod === "pickup" ? "picked up." : "delivered."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[#E8E5F7] bg-[#F5F3FD] rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#3E206D]">Card Payment</span>
                      <span className="font-bold text-[#3E206D]">Rs. {formatPrice(remainingAfterCredit)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Image
                        src={cardPaymentIcon}
                        alt="Card payment"
                        width={20}
                        height={20}
                        className="object-contain flex-shrink-0"
                      />
                      <p className="text-xs text-[#47484C]">You can pay this remaining amount with your card.</p>
                    </div>
                  </div>
                )}
              </>
            )}
            {!useCredit && <div className="mb-6" />}

            {/* Confirm Order Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!canConfirmOrder()}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition ${canConfirmOrder() ? "bg-[#3E206D] hover:bg-[#2f1854] cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {orderSubmitted ? "Order Submitted" : isSubmitting ? "Processing Order..." : "Confirm Order"}
            </button>

            {creditBalance > 0 && (
              <p
                className="flex items-center justify-center gap-1 mt-3"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#676767",
                }}
              >
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Your payment is secure and encrypted.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;