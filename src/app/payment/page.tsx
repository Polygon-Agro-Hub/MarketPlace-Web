'use client';
import React, { useEffect, useState, MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopNavigation from '@/components/top-navigation/TopNavigation';
// import OrderSummary from '@/components/cart-right-cart/right-cart';
import SuccessPopup from '@/components/toast-messages/success-message-with-button';
import ErrorPopup from '@/components/toast-messages/error-message';
import Visa from '../../../public/images/Visa.png';
import MasterCard from '../../../public/images/Mastercard.png';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { submitOrderToBackend, validateOrderData, OrderPayload, formatValidationErrors } from '@/services/cart-service';

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

  useEffect(() => {
    console.log('Cart Items:', cartItems);
    console.log('Checkout Details:', checkoutDetails);
    console.log('Calculated Summary:', cartItems.calculatedSummary);
  }, [cartItems, checkoutDetails]);

  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const prepareOrderPayload = (): OrderPayload => {
  // Use calculatedSummary instead of summary
  const calculatedSummary = cartItems.calculatedSummary;
  const summary = cartItems.summary;
  
  // Get totals from calculated summary
  const grandTotal = calculatedSummary?.finalTotal || 0;
  const discountAmount = calculatedSummary?.totalDiscount || 0;
  const couponDiscount = summary?.couponDiscount || 0;

  // Initialize all required fields first
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
    couponValue: Number(couponDiscount) || 0,
    isCoupon: (couponDiscount || 0) > 0,
  };

  // Set values based on delivery method and building type
  if (checkoutDetails.deliveryMethod === 'home') {
    // Add address fields for home delivery
    finalCheckoutDetails.buildingType = (checkoutDetails.buildingType || 'apartment').toLowerCase();
    finalCheckoutDetails.houseNo = checkoutDetails.houseNo || '';
    finalCheckoutDetails.street = checkoutDetails.street || '';
    finalCheckoutDetails.cityName = checkoutDetails.cityName || '';
    finalCheckoutDetails.centerId = null;

    // Add apartment-specific fields only if building type is apartment
    if (checkoutDetails.buildingType?.toLowerCase() === 'apartment') {
      finalCheckoutDetails.buildingNo = checkoutDetails.buildingNo || '';
      finalCheckoutDetails.buildingName = checkoutDetails.buildingName || '';
      finalCheckoutDetails.flatNumber = checkoutDetails.flatNumber || '';
      finalCheckoutDetails.floorNumber = checkoutDetails.floorNumber || '';
    }
  } else if (checkoutDetails.deliveryMethod === 'pickup') {
    // For pickup delivery, keep address fields empty and set centerId
    finalCheckoutDetails.centerId = checkoutDetails.centerId || null;
  }

  return {
    cartId: cartItems.cartId || 0,
    checkoutDetails: finalCheckoutDetails,
    paymentMethod,
    discountAmount: Number(discountAmount) || 0,
    grandTotal: Number(grandTotal) || 0,
    orderApp: 'marketplace',
  };
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

      // Submit to backend with token from Redux
      const result = await submitOrderToBackend(payload, token);
      console.log('Order submitted successfully:', result);

      // Check if the response has the expected structure
      if (result.status && result.orderId) {
        setOrderId(result.orderId);
        setShowSuccessPopup(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      const errorMsg = error.message || 'Order submission failed. Please try again.';
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate display values for OrderSummary
  const getDisplayValues = () => {
    const calculatedSummary = cartItems.calculatedSummary;
    const summary = cartItems.summary;
    
    return {
      totalItems: calculatedSummary?.totalItems || 0,
      totalPrice: calculatedSummary?.grandTotal || 0,
      discountAmount: calculatedSummary?.totalDiscount || 0,
      grandTotal: calculatedSummary?.finalTotal || 0,
    };
  };

  const displayValues = getDisplayValues();

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5">
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          router.push(`/order-confirmation?orderId=${orderId}`);
        }}
        title="Order Placed Successfully!"
        description="Your order has been confirmed. View details in your order history."
        path={`/order-confirmation?orderId=${orderId}`}
      />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        description={errorMessage}
      />
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
                    className={`w-5 h-5 rounded-full ${
                      paymentMethod === 'card'
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
                <div className="mb-5 rounded-b-lg p-10 border-t border-gray-200">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter Card Number"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter Name on Card"
                      value={cardDetails.nameOnCard}
                      onChange={(e) => handleCardInputChange('nameOnCard', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter Expiration Date (MM/YY)"
                      value={cardDetails.expirationDate}
                      onChange={(e) => handleCardInputChange('expirationDate', e.target.value)}
                      className="w-3/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Enter CVV"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      className="w-2/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
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
                    className={`w-5 h-5 rounded-full ${
                      paymentMethod === 'cash'
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

            {/* Submit Order Button */}
            <div className="mt-8">
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-800 hover:bg-indigo-900'
                } transition-colors`}
              >
                {isSubmitting ? 'Processing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3 mt-6 lg:mt-0 pt-14">
          {/* <OrderSummary
            totalItems={displayValues.totalItems}
            totalPrice={displayValues.totalPrice}
            discountAmount={displayValues.discountAmount}
            grandTotal={displayValues.grandTotal}
            fromPayment={true}
            paymentMethod={paymentMethod}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Page;