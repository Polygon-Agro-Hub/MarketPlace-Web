import { useRouter } from 'next/navigation'; // Changed from 'next/router'
import Image from 'next/image';

interface OrderSummaryProps {
    totalItems: number;
    totalPrice: number;
    discountAmount: number;
    grandTotal: number;
}

const OrderSummary = ({
    totalItems,
    totalPrice,
    discountAmount,
    grandTotal
}: OrderSummaryProps) => {
    const router = useRouter();

    return (
        <div className='border border-[#171717] rounded-lg shadow-md p-4 sm:p-5 md:p-6 md:mx-10 sm:mr-10'>
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
                onClick={() => router.push('/test')}
                className='w-full bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-3 text-sm sm:text-base hover:bg-[#2d174f] transition-colors'
            >
                Checkout now
            </button>
        </div>
    );
};

export default OrderSummary;