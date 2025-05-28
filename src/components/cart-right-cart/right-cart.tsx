import { useRouter } from 'next/navigation'; // Changed from 'next/router'
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { setCartDetails } from '@/store/slices/cartSlice';
import { useState } from 'react';
import PaymentMethodPopup from '../payment-popup/paymentMethodPopup';
import { setCartItems } from '@/store/slices/cartItemsSlice';
import { RootState } from '@/store';
import { submitPayment } from '@/services/retail-order-service';
import SuccessPopup from '@/components/toast-messages/success-message-with-button';
import ErrorPopup from '@/components/toast-messages/error-message-with-button';

interface OrderSummaryProps {
    totalItems: number;
    totalPrice: number;
    discountAmount: number;
    grandTotal: number;
     cartData?: any;
     fromPayment?: any;
     paymentMethod?: any;
}

const OrderSummary = ({
    totalItems,
    totalPrice,
    discountAmount,
    grandTotal,
    cartData,
    fromPayment,
    paymentMethod
}: OrderSummaryProps) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const { items, cartId } = useSelector((state: RootState) => state.cartItems);
    const storedFormData = useSelector((state: RootState) => state.checkout);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmitPayment = async () => {
        setIsLoading(true);
        const payload = {
            grandTotal,
            discountAmount,
            paymentMethod,
            cartId: String(cartId),
            items,
            checkoutDetails: storedFormData,
        };
    
        try {
            const result = await submitPayment(payload);
            console.log('Payment submitted successfully:', result);
            setIsLoading(false);
            setShowSuccessPopup(true);
            // router.push('/');
            
            // Optional: Redirect or display success
        } catch (error: any) {
            setIsLoading(false);
            setShowErrorPopup(true);
            // router.push('/');
            console.error('Error submitting payment:', error.message);
            // Optional: show error toast
        }
    };

    const handleCheckout = () => {

        if (fromPayment  == true && paymentMethod) {
            handleSubmitPayment();
            // Redirect to checkout page after payment submission
        }else{
            
            dispatch(setCartDetails({ totalItems, totalPrice, discountAmount, grandTotal }));

            
            if (cartData) {
                console.log(cartData);
                dispatch(setCartItems({
                    cartId: cartData.cartId,
                    additionalItems: cartData.additionalItems,
                    packageItems: cartData.packageItems
                }));
            }

            setShowPopup(true)}
        
        };

    const closePopup = () => {
        setShowPopup(false); // Close the popup
    };

    return (
        <div className='border border-[#171717] rounded-lg shadow-md p-4 sm:p-5 md:p-6 md:mx-10 sm:mr-10'>


       <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Thank you for ordering!"
        description="Your order has been placed."
        path='/'
      />
      <ErrorPopup
        isVisible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Oops!"
        description="Something happen, Please try again!"
      />

            <h2 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Your Order</h2>

            <div className='flex justify-between items-center mb-3 sm:mb-4'>
                <div className='flex items-center gap-2 sm:gap-3'>
                    <Image
                        className='w-12 sm:w-14 md:w-16 h-auto'
                        src="/assets/images/order.png"
                        alt="Order"
                        width={64}
                        height={64}
                    />
                    <p className="text-sm sm:text-base">{totalItems} items</p>
                </div>
                <p className='font-semibold text-sm sm:text-base'>Rs.{totalPrice.toFixed(2)}</p>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3' />

            <p className='font-semibold text-sm sm:text-base mb-2'>Coupon Code</p>

            <div className='flex flex-row gap-3 w-full mt-2 sm:mt-3'>
                <input
                    type="text"
                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base w-3/4'
                    placeholder='Add coupon code'
                />
                <button className='bg-[#3E206D] text-white font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-1/4'>
                    Apply
                </button>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

            <div className='flex justify-between text-sm sm:text-base'>
                <p className='text-gray-600'>Total</p>
                <p className='font-semibold'>Rs.{totalPrice.toFixed(2)}</p>
            </div>

            <div className='flex justify-between text-sm sm:text-base mt-2'>
                <p className='text-gray-600'>Discount</p>
                <p className='text-gray-600'>Rs.{discountAmount.toFixed(2)}</p>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

            <div className='flex justify-between mb-4 sm:mb-5 text-sm sm:text-base'>
                <p className='font-semibold'>Grand Total</p>
                <p className='font-semibold'>Rs.{grandTotal.toFixed(2)}</p>
            </div>

            <button
                onClick={handleCheckout}
                className='w-full bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-3 text-sm sm:text-base hover:bg-[#2d174f] transition-colors'
            >
               {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ordering...
              </span>
            ) : 'Checkout now'}
            </button>

            {showPopup && <PaymentMethodPopup closePopup={closePopup} />}

            
        </div>
    );
};

export default OrderSummary;