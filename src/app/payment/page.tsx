'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import OrderSummary from '@/components/cart-right-cart/right-cart';
import Visa from "../../../public/images/Visa.png";
import MasterCard from "../../../public/images/Mastercard.png";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { submitPayment } from '@/services/retail-order-service';

const Page: React.FC = () => {
    const NavArray = [
        { name: 'Cart', path: '/cart', status: true },
        { name: 'Checkout', path: '/checkout', status: false },
        { name: 'Payment', path: '/payment', status: true },
    ];

    const cartPrices = useSelector((state: RootState) => state.cart) || null;

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
    const { items, cartId } = useSelector((state: RootState) => state.cartItems);
    const storedFormData = useSelector((state: RootState) => state.checkout);


       useEffect(() => {
          console.log('useEffect called with cart items by chalana:', items);
          console.log('data from store', storedFormData);
        }, []);




const handleSubmitPayment = async () => {
    const payload = {
        paymentMethod,
        cartId: String(cartId),
        items,
        checkoutDetails: storedFormData,
    };

    try {
        const result = await submitPayment(payload);
        console.log('Payment submitted successfully:', result);

        // Optional: Redirect or display success
    } catch (error: any) {
        console.error('Error submitting payment:', error.message);
        // Optional: show error toast
    }
};



    return (
        <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
            <TopNavigation NavArray={NavArray} />

            <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
                <div className='w-full lg:w-2/3 mt-6 pt-8'>
                    <div className='bg-white rounded-3xl border border-gray-200 p-8'>
                        <h1 className='text-2xl font-semibold mb-6'>Select Payment Method</h1>

                        {/* Credit/Debit Card Option */}
                        <div className='mb-5 border border-gray-200 rounded-lg overflow-hidden'>
                            <div
                                className='rounded-t-lg p-4 flex justify-between items-center cursor-pointer'
                                onClick={() => setPaymentMethod('card')}
                            >
                                <div className='flex items-center'>
                                    <div className={`w-5 h-5 rounded-full ${paymentMethod === 'card' ? 'bg-indigo-800 border-2 border-indigo-800 ring-2 ring-indigo-100' : 'border border-gray-400'}`}></div>
                                    <span className='ml-3 text-base'>Credit / Debit Card</span>
                                </div>
                                <div className='flex space-x-2 lg:mr-8'>
                                    <Image src={Visa} alt="Visa" className='w-auto h-6 object-cover mr-2' />
                                    <Image src={MasterCard} alt="MasterCard" className='w-auto h-6 object-cover' />
                                </div>
                            </div>
                            {paymentMethod === 'card' && (
                                <div className='mb-5 rounded-b-lg p-10 border-t border-gray-200'>
                                    <div className='mb-4'>
                                        <input
                                            type="text"
                                            placeholder="Enter Card Number"
                                            className='w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm'
                                        />
                                    </div>
                                    <div className='mb-4'>
                                        <input
                                            type="text"
                                            placeholder="Enter Name on Card"
                                            className='w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm'
                                        />
                                    </div>
                                    <div className='flex gap-4'>
                                        <input
                                            type="text"
                                            placeholder="Enter Expiration Date (MM/YY)"
                                            className='w-3/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm'
                                        />
                                        <input
                                            type="text"
                                            placeholder="Enter CVV"
                                            className='w-2/5 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm'
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='mb-5 border border-gray-200 rounded-lg'>
                            <div
                                className='rounded-lg p-4 flex justify-between items-center cursor-pointer'
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <div className='flex items-center'>
                                    <div className={`w-5 h-5 rounded-full ${paymentMethod === 'cash' ? 'bg-indigo-800 border-2 border-indigo-800 ring-2 ring-indigo-100' : 'border border-gray-400'}`}></div>
                                    <span className='ml-3 text-base'>Pay by Cash</span>
                                </div>
                            </div>

                            {/* Cash Payment Instructions - Only shown when cash payment is selected */}
                            {paymentMethod === 'cash' && (
                                <div className='p-10 border-t border-gray-200'>
                                    <div className='text-gray-700 space-y-6'>
                                        <p>- You may pay in cash to our courier upon receiving your parcel at the doorstep.</p>
                                        <p>- Before agreeing to receive the parcel, check if your delivery status has been updated to "Out of Delivery".</p>
                                        <p>- Before receiving, confirm that the airway bill shows that the parcel fro, Agro World.</p>
                                        <p>- Before you make the payment to the courier, confirm your order number, sender information and tracking number on the parcel.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='w-full lg:w-1/3 mt-6 lg:mt-0 pt-14'>
                    <OrderSummary
                        totalItems={cartPrices.totalItems}
                        totalPrice={cartPrices.totalPrice}
                        discountAmount={cartPrices.discountAmount}
                        grandTotal={cartPrices.grandTotal}
                        fromPayment={true}
                        paymentMethod={paymentMethod}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;