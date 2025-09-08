'use client';
import React, { useEffect, useState, MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopNavigation from '@/components/top-navigation/TopNavigation';
// import OrderSummary from '@/components/cart-right-cart/right-cart';
import Visa from '../../../public/images/Visa.png';
import MasterCard from '../../../public/images/Mastercard.png';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { submitOrderToBackend, validateOrderData, OrderPayload, formatValidationErrors, validateCoupon } from '@/services/cart-service';
import summary from '../../../public/summary.png'
import { updateCartInfo } from '@/store/slices/authSlice';
import { getCartInfo } from '@/services/auth-service';
import wrongImg from '../../../public/images/wrong.png'
import correct from '../../../public/images/correct.png'


const Page: React.FC = () => {
  const router = useRouter();
  const NavArray = [
    { name: 'Cart', path: '/cart', status: true },
    { name: 'Checkout', path: '/checkout', status: false },
    { name: 'Payment', path: '/payment', status: true },
  ];

  // Redux state selectors
  const cartItems = useSelector((state: RootState) => state.cartItems);
  const checkoutDetails = useSelector((state: RootState) => state.checkout);
  const token = useSelector((state: RootState) => state.auth?.token) || null;

  // Local state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    nameOnCard: '',
    expirationDate: '',
    cvv: '',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValidationLoading, setCouponValidationLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [couponType, setCouponType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const getHomeUrl = () => {
    return user?.buyerType === 'Wholesale' ? '/wholesale/home' : '/';
  };


  useEffect(() => {
    console.log('Cart Items:', cartItems);
    console.log('Checkout Details:', checkoutDetails);
    console.log('Calculated Summary:', cartItems.calculatedSummary);
  }, [cartItems, checkoutDetails]);

  useEffect(() => {
    // Load delivery charge from localStorage if available
    const savedCharge = localStorage.getItem('deliveryCharge');
    console.log('delivery charge', savedCharge);
    if (savedCharge) {
      setDeliveryCharge(parseFloat(savedCharge));
    }
  }, []);

  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Updated prepareOrderPayload function
  const prepareOrderPayload = (): OrderPayload => {
    const calculatedSummary = cartItems.calculatedSummary;
    const originalGrandTotal = calculatedSummary?.finalTotal || 0;
    const discountAmount = calculatedSummary?.totalDiscount || 0;

    const couponDiscountAmount = isCouponApplied ? couponDiscount : 0;

    // Handle Free Delivery coupon type
    const effectiveDeliveryCharge = (isCouponApplied && couponType === 'Free Delivary') ? 0 : deliveryCharge;

    const finalGrandTotal = isCouponApplied ?
      (originalGrandTotal - couponDiscount + effectiveDeliveryCharge) :
      (originalGrandTotal + deliveryCharge);

    let finalCheckoutDetails = {
      deliveryMethod: checkoutDetails.deliveryMethod || 'home',
      title: checkoutDetails.title || '',
      fullName: checkoutDetails.fullName || '',
      phoneCode1: checkoutDetails.phoneCode1 || '+94',
      phone1: checkoutDetails.phone1 || '',
      phoneCode2: checkoutDetails.phoneCode2 || '',
      phone2: checkoutDetails.phone2 || '',
      buildingType: '',
      deliveryDate: checkoutDetails.deliveryDate || '',
      timeSlot: checkoutDetails.timeSlot || '',
      buildingNo: '',
      buildingName: '',
      flatNumber: '',
      floorNumber: '',
      houseNo: '',
      street: '',
      cityName: '',
      scheduleType: checkoutDetails.scheduleType || 'One Time',
      centerId: null as number | null,
      // Updated coupon fields - send coupon value for ALL coupon types, not just free delivery
      couponValue: isCouponApplied ? Number(couponDiscountAmount) : 0,
      isCoupon: isCouponApplied,
      couponCode: isCouponApplied ? couponCode : '',
    };

    // ... rest of the address handling code remains the same
    if (checkoutDetails.deliveryMethod === 'home') {
      finalCheckoutDetails.buildingType = (checkoutDetails.buildingType || 'apartment').toLowerCase();
      finalCheckoutDetails.houseNo = checkoutDetails.houseNo || '';
      finalCheckoutDetails.street = checkoutDetails.street || '';
      finalCheckoutDetails.cityName = checkoutDetails.cityName || '';
      finalCheckoutDetails.centerId = null;

      if (checkoutDetails.buildingType?.toLowerCase() === 'apartment') {
        finalCheckoutDetails.buildingNo = checkoutDetails.buildingNo || '';
        finalCheckoutDetails.buildingName = checkoutDetails.buildingName || '';
        finalCheckoutDetails.flatNumber = checkoutDetails.flatNumber || '';
        finalCheckoutDetails.floorNumber = checkoutDetails.floorNumber || '';
      }
    } else if (checkoutDetails.deliveryMethod === 'pickup') {
      finalCheckoutDetails.centerId = checkoutDetails.centerId || null;
    }

    return {
      cartId: cartItems.cartId || 0,
      checkoutDetails: finalCheckoutDetails,
      paymentMethod,
      discountAmount: Number(discountAmount) || 0,
      grandTotal: Number(finalGrandTotal) || 0,
      orderApp: 'marketplace',
    };
  };

  const formatPrice = (price: number): string => {
    // Convert to fixed decimal first, then add commas
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split('.');

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimalPart}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponValidationLoading(true);
    setCouponError('');

    try {
      if (!token) {
        throw new Error('Please log in to apply coupon');
      }

      // Get deliveryMethod from Redux state
      const deliveryMethod = checkoutDetails.deliveryMethod || 'home';

      const response = await validateCoupon(couponCode.trim(), token, deliveryMethod);

      if (response.status) {
        setIsCouponApplied(true);
        setCouponDiscount(response.discount);
        setCouponType(response.type || ''); // Store coupon type from response
        console.log('Coupon applied successfully:', response);
      } else {
        setCouponError(response.message);
        setIsCouponApplied(false);
        setCouponDiscount(0);
        setCouponType('');
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message || 'Failed to apply coupon');
      setIsCouponApplied(false);
      setCouponDiscount(0);
      setCouponType('');
    } finally {
      setCouponValidationLoading(false);
    }
  };


  const validateCartData = (): { isValid: boolean; error?: string } => {
    // Check if cart exists and has valid ID
    if (!cartItems.cartId || cartItems.cartId === 0) {
      return { isValid: false, error: 'Cart ID is missing. Please refresh and try again.' };
    }

    // Check if cart has items (packages or additional items)
    const hasPackages = cartItems.packages && cartItems.packages.length > 0;
    const hasAdditionalItems = cartItems.additionalItems &&
      cartItems.additionalItems.length > 0 &&
      cartItems.additionalItems.some(group => group.Items && group.Items.length > 0);

    if (!hasPackages && !hasAdditionalItems) {
      return { isValid: false, error: 'No items in cart. Please add items before placing order.' };
    }

    // Check if calculated summary exists
    if (!cartItems.calculatedSummary) {
      return { isValid: false, error: 'Cart summary is missing. Please refresh and try again.' };
    }

    // Check if checkout details are complete
    if (!checkoutDetails) {
      return { isValid: false, error: 'Checkout details are missing. Please complete the checkout process.' };
    }

    // Validate required checkout fields
    const requiredFields = ['deliveryMethod', 'title', 'fullName', 'phone1'];
    for (const field of requiredFields) {
      if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate delivery method specific fields
    if (checkoutDetails.deliveryMethod === 'home') {
      // Validate building type specific fields for home delivery
      if (checkoutDetails.buildingType?.toLowerCase() === 'apartment') {
        const apartmentFields = ['buildingNo', 'buildingName', 'flatNumber', 'floorNumber'];
        for (const field of apartmentFields) {
          if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
            return { isValid: false, error: `Missing required apartment field: ${field}` };
          }
        }
      }

      // Common home delivery fields (required for both house and apartment)
      const homeDeliveryFields = ['houseNo', 'street', 'cityName'];
      for (const field of homeDeliveryFields) {
        if (!checkoutDetails[field as keyof typeof checkoutDetails]) {
          return { isValid: false, error: `Missing required home delivery field: ${field}` };
        }
      }
    } else if (checkoutDetails.deliveryMethod === 'pickup') {
      // Validate pickup center selection
      if (!checkoutDetails.centerId) {
        return { isValid: false, error: 'Please select a pickup center.' };
      }
    }

    return { isValid: true };
  };

  console.log('cartId', cartItems.cartId);
  console.log('Total items:', cartItems.calculatedSummary?.totalItems);
  console.log('Grand total:', cartItems.calculatedSummary?.finalTotal);

  const handleSubmitOrder = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate authentication
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate cart data
      const cartValidation = validateCartData();
      if (!cartValidation.isValid) {
        throw new Error(cartValidation.error);
      }

      // Additional validation for card payment
      if (paymentMethod === 'card') {
        const { cardNumber, nameOnCard, expirationDate, cvv } = cardDetails;
        if (!cardNumber || !nameOnCard || !expirationDate || !cvv) {
          throw new Error('Please fill in all card details.');
        }
      }

      const payload = prepareOrderPayload();

      // Validate the payload
      const validation = validateOrderData(payload);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        setErrorMessage(formatValidationErrors(validation.errors));
        setShowErrorPopup(true);
        return;
      }

      console.log('Prepared Order Payload:', payload);

      const result = await submitOrderToBackend(payload, token);
      console.log('Order submitted successfully:', result);

      // Check if the response has the expected structure
      if (result.status && result.processOrderId) {
        setOrderId(result.processOrderId);
        localStorage.removeItem('deliveryCharge');

        // Show success modal
        setIsError(false);
        setModalMessage('Your order has been placed.');
        setIsModalOpen(true);

        // Fetch updated cart info after successful order creation
        try {
          const cartInfo = await getCartInfo(token);
          console.log("Updated cart info:", cartInfo);
          dispatch(updateCartInfo(cartInfo));
        } catch (cartError) {
          console.error('Error fetching cart info:', cartError);
          // Don't fail the whole operation if cart info fetch fails
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      const errorMsg = error.message || 'Order submission failed. Please try again.';

      // Show error modal
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
      // If success, redirect to home
      router.push(getHomeUrl());
    }
  };

  // Handle view invoice
  const handleViewInvoice = () => {
    setIsModalOpen(false);
    console.log('Navigating to invoice with orderId:', orderId); // Debug log

    if (orderId) {
      router.push(`/history/invoice/?orderId=${orderId}`);
    } else {
      console.error('Order ID is not available');
      // Handle case where orderId is not available
      setIsError(true);
      setModalMessage('Order ID not available. Please try again.');
      setIsModalOpen(true);
    }
  };
  // Calculate display values for OrderSummary
  const getDisplayValues = () => {
    const calculatedSummary = cartItems.calculatedSummary;
    const originalGrandTotal = calculatedSummary?.finalTotal || 0;

    // Handle Free Delivery coupon type
    const effectiveDeliveryCharge = (isCouponApplied && couponType === 'Free Delivary') ? 0 : deliveryCharge;

    const couponDiscountAmount = isCouponApplied ? couponDiscount : 0;

    const finalGrandTotal = isCouponApplied
      ? (originalGrandTotal - couponDiscount + effectiveDeliveryCharge)
      : (originalGrandTotal + deliveryCharge);

    return {
      totalItems: calculatedSummary?.totalItems || 0,
      totalPrice: calculatedSummary?.grandTotal || 0,
      discountAmount: calculatedSummary?.totalDiscount || 0,
      originalGrandTotal: originalGrandTotal,
      couponDiscount: couponDiscountAmount,
      grandTotal: finalGrandTotal,
      deliveryCharges: effectiveDeliveryCharge, // Use effective delivery charge
      isFreeDelivery: isCouponApplied && couponType === 'Free Delivary', // Flag for UI display
    };
  };

  const displayValues = getDisplayValues();



  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center w-[90%] max-w-md shadow-xl">
            {isError ? (
              /* Error Icon with Animation */
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  {/* Animated Circle Background */}
                  <div
                    className="absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out scale-100 opacity-100"
                    style={{
                      transformOrigin: 'center',
                      animationDelay: '0.2s'
                    }}
                  />

                  {/* Animated X Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        className="opacity-100 transition-all duration-700 ease-out"
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: '24',
                          strokeDashoffset: '0',
                          transitionDelay: '0.6s'
                        }}
                      />
                    </svg>
                  </div>

                  {/* Pulse Animation */}
                  <div
                    className="absolute inset-0 rounded-full bg-red-500 scale-125 opacity-0 transition-all duration-1000"
                    style={{
                      animationDelay: '0.8s'
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Success Icon with Animation */
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  {/* Animated Circle */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-purple-500 scale-100 opacity-100 transition-all duration-700 ease-out"
                    style={{
                      transformOrigin: 'center',
                      animationDelay: '0.2s'
                    }}
                  />

                  {/* Animated Checkmark */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-[#8746ff]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        className="opacity-100 transition-all duration-700 ease-out"
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: '20',
                          strokeDashoffset: '0',
                          transitionDelay: '0.6s'
                        }}
                      />
                    </svg>
                  </div>

                  {/* Pulse Animation */}
                  <div
                    className="absolute inset-0 rounded-full bg-[#8746ff] scale-125 opacity-0 transition-all duration-1000"
                    style={{
                      animationDelay: '0.8s'
                    }}
                  />
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-2 text-gray-900">
              {isError ? 'Error' : 'Thank you for ordering!'}
            </h2>
            <p className="text-gray-500 mb-6">{modalMessage}</p>

            {isError ? (
              <button
                onClick={handleModalClose}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium"
              >
                Close
              </button>
            ) : (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleModalClose}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleViewInvoice}
                  disabled={!orderId}
                  className={`px-6 py-2 rounded-lg transition cursor-pointer font-medium ${!orderId
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#3E206D] text-white hover:bg-[#3E206D]'
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

      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start">
        <div className="w-full lg:w-2/3 mt-6 pt-8">
          <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <h1 className="text-2xl font-semibold mb-6">Select Payment Method</h1>

            {/* Credit/Debit Card Option */}
            <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="rounded-t-lg p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full ${paymentMethod === 'card'
                      ? 'bg-indigo-800 border-2 border-indigo-800 ring-2 ring-indigo-100'
                      : 'border border-gray-400'
                      }`}
                  ></div>
                  <span className="ml-3 text-base">Credit / Debit Card</span>
                </div>
                <div className="flex space-x-2 lg:mr-8">
                  <Image src={Visa} alt="Visa" className="w-auto h-6 object-cover mr-2" />
                  <Image src={MasterCard} alt="MasterCard" className="w-auto h-6 object-cover" />
                </div>
              </div>
              {paymentMethod === 'card' && (
                <div className="mb-5 rounded-b-lg p-4 sm:p-6 md:p-8 lg:p-10 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Card Number"
                        value={cardDetails.cardNumber}
                        onChange={(e) => {
                          // Only allow digits and format with spaces every 4 digits
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                          if (value.length <= 16) {
                            handleCardInputChange('cardNumber', formattedValue);
                          }
                        }}
                        maxLength={19} // 16 digits + 3 spaces
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Name on Card"
                        value={cardDetails.nameOnCard}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Block leading spaces
                          if (value.startsWith(' ')) {
                            value = value.trimStart();
                          }

                          // Only allow letters and spaces (no numbers or special characters)
                          value = value.replace(/[^a-zA-Z\s]/g, '');

                          // Capitalize first letter and first letter after each space
                          value = value.replace(/\b\w/g, (char) => char.toUpperCase());

                          handleCardInputChange('nameOnCard', value);
                        }}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        placeholder="Enter Expiration Date (MM/YY)"
                        value={cardDetails.expirationDate}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const value = inputValue.replace(/[^0-9/]/g, '');
                          let formattedValue = value;

                          if (value.length === 2 && !value.includes('/') && inputValue.length > cardDetails.expirationDate.length) {
                            formattedValue = value + '/';
                          }

                          else if (value.length >= 2 && !value.includes('/') && value.length <= 4) {

                            formattedValue = value;
                          }

                          if (formattedValue.length <= 5) {
                            handleCardInputChange('expirationDate', formattedValue);
                          }
                        }}
                        maxLength={5}
                        className="w-full sm:w-3/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                      />

                      <input
                        type="text"
                        placeholder="Enter CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          // Remove all non-numeric characters and limit to exactly 3 digits
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 3) {
                            handleCardInputChange('cvv', value);
                          }
                        }}
                        maxLength={3}
                        className="w-full sm:w-2/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cash Payment Option */}
            <div className="mb-5 border border-gray-200 rounded-lg">
              <div
                className="rounded-lg p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full ${paymentMethod === 'cash'
                      ? 'bg-indigo-800 border-2 border-indigo-800 ring-2 ring-indigo-100'
                      : 'border border-gray-400'
                      }`}
                  ></div>
                  <span className="ml-3 text-base">Pay by Cash</span>
                </div>
              </div>
              {paymentMethod === 'cash' && (
                <div className="p-10 border-t border-gray-200">
                  <div className="text-gray-700 space-y-6">
                    <p>- You may pay in cash to our courier upon receiving your parcel at the doorstep.</p>
                    <p>- Before agreeing to receive the parcel, check if your delivery status has been updated to "Out of Delivery".</p>
                    <p>- Before receiving, confirm that the airway bill shows that the parcel from Agro World.</p>
                    <p>- Before you make the payment to the courier, confirm your order number, sender information, and tracking number on the parcel.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3 mt-6 lg:mt-0 pt-14">
          <div className='border border-gray-300 rounded-lg shadow-md p-4 sm:p-5 md:p-6'>
            <h2 className='font-semibold text-lg mb-4'>Your Order</h2>

            <div className='flex justify-between items-center mb-3 sm:mb-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 border border-[gray] rounded-lg flex items-center justify-center">
                  <Image
                    src={summary}
                    alt="Shopping bag"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-600">{displayValues.totalItems || 0} items</p>
              </div>
              <p className='font-semibold'>Rs.{formatPrice(displayValues.totalPrice || 0)}</p>
            </div>

            <div className='mb-4'>
              <h3 className='font-semibold text-base mb-3'>Coupon Code</h3>
              <div className='flex gap-2'>
                <input
                  type="text"
                  placeholder="Add Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  disabled={isCouponApplied || couponValidationLoading}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isCouponApplied || couponValidationLoading}
                  className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-medium ${isCouponApplied
                    ? 'bg-[#3E206D] text-white cursor-not-allowed'
                    : couponValidationLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#3E206D] text-white hover:bg-[#2f1854] disabled:bg-gray-300 disabled:cursor-not-allowed'
                    }`}
                >
                  {couponValidationLoading ? 'Validating...' : isCouponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {isCouponApplied && (
                <p className='text-[#3E206D] text-sm mt-2'>✓ Coupon applied successfully</p>
              )}
              {couponError && (
                <p className='text-red-600 text-sm mt-2'>{couponError}!</p>
              )}
            </div>

            <div className='border-t border-gray-300 my-4' />

            <div className='flex justify-between text-sm mb-2'>
              <p className='text-gray-600'>Total</p>
              <p className='font-semibold'>Rs.{formatPrice(displayValues.totalPrice || 0)}</p>
            </div>

            <div className='flex justify-between text-sm mb-2'>
              <p className='text-gray-600'>Discount</p>
              <p className='text-gray-600'>Rs.{formatPrice(displayValues.discountAmount || 0)}</p>
            </div>

            {isCouponApplied && (
              <div className='flex justify-between text-sm mb-2'>
                <p className='text-gray-600'>Coupon Discount</p>
                <p className='text-gray-600'>Rs.{formatPrice(displayValues.couponDiscount || 0)}</p>
              </div>
            )}
            <div className='flex justify-between text-sm mb-2'>
              <p className='text-gray-600'>
                Delivery Charges
                {displayValues.isFreeDelivery && (
                  <span className='font-semibold ml-1'>(Free)</span>
                )}
              </p>
              <p className={`text-gray-600 ${displayValues.isFreeDelivery ? 'line-through' : ''}`}>
                Rs.{formatPrice(deliveryCharge || 0)}
              </p>
              {displayValues.isFreeDelivery && (
                <p className='text-gray-600 font-semibold'>Rs.0.00</p>
              )}
            </div>


            <div className='border-t border-gray-300 my-4' />

            <div className='flex justify-between mb-4 text-[20px] text-[#414347]'>
              <p className='font-semibold'>Grand Total</p>
              <p className='font-semibold'>Rs.{formatPrice(displayValues.grandTotal || 0)}</p>
            </div>
            <div className="mt-8">
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg cursor-pointer text-white font-semibold ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3E206D] hover:bg-[#3E206D]'
                  } transition-colors`}
              >
                {isSubmitting ? 'Processing Order...' : 'Confirm Order'}
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;