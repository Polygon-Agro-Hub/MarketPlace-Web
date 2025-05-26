import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPaymentMethod } from '../../store/slices/cartSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const PaymentMethodPopup = ({ closePopup }: { closePopup: () => void }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [paymentMethod, setPaymentMethodState] = useState<string | null>(null);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethodState(method);
    dispatch(setPaymentMethod(method)); // Save the payment method in the Redux store
    closePopup();
    router.push('/checkout'); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#000000CC] bg-opacity-50 z-50 px-4">
      <div className="bg-[#3E206D] p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-white text-center">Select a Method</h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handlePaymentMethodSelect('pickup')}
            className="flex flex-col items-center bg-white text-black p-4 rounded-lg shadow-md w-1/2"
          >
            <Image src="/images/instorePickup.png" alt="In-store" width={80} height={80} />
            <p className="mt-2">In-store Pickup</p>
          </button>
          <button
            onClick={() => handlePaymentMethodSelect('home')}
            className="flex flex-col items-center bg-white text-black p-4 rounded-lg shadow-md w-1/2"
          >
            <Image src="/images/homeDelivery.png" alt="Home Delivery" width={80} height={80} />
            <p className="mt-2">Home Delivery</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPopup;
