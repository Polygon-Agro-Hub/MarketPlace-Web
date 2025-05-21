'use client';
// import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import OrderSummary from '@/components/cart-right-cart/right-cart';
// import router from 'next/router';
import { getRetailCart } from '@/services/retail-order-service';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Item {
  id: number;
  name: string;
  unit: 'kg' | 'g';
  quantity: number;
  discount: number;
  price: number;
  image: string;
}

interface Package {
  id: number;
  packageName: string;
  Items: Item[];
}



const Page: React.FC = () => {
  const NavArray = [
    { name: 'Cart', path: '/cart', status: true },
    { name: 'Checkout', path: '/checkout', status: false },
    { name: 'Payment', path: '/payment', status: false },
  ]
  // const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
  const [dataArray, setDataArray] = useState<Package[]>([
    {
      id: 1,
      packageName: "Family Pack",
      Items: [
        {
          id: 1,
          name: "Tomato",
          unit: "kg",
          quantity: 52,
          discount: 104,
          price: 571.48,
          image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
        },
        {
          id: 2,
          name: "Potato",
          unit: "kg",
          quantity: 56,
          discount: 112,
          price: 615.44,
          image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
        }
      ]
    },
    {
      id: 2,
      packageName: "Additional Items",
      Items: [
        {
          id: 3,
          name: "Green chilly",
          unit: "kg",
          quantity: 52,
          discount: 104,
          price: 571.48,
          image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
        },
        {
          id: 4,
          name: "Banana",
          unit: "kg",
          quantity: 56,
          discount: 112,
          price: 615.44,
          image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
        }
      ]
    }
  ]);

  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      const data = await getRetailCart(token);
      console.log("data", data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };


  const handleUnitChange = (itemId: number, unit: 'kg' | 'g') => {
    setUnitSelection(prev => ({
      ...prev,
      [itemId]: unit,
    }));
  };

  const handleQuantityChange = (itemId: number, delta: number) => {
    const updatedPackages = dataArray.map(pkg => ({
      ...pkg,
      Items: pkg.Items.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            discount: newQuantity * 2,
            price: newQuantity * 10.99
          };
        }
        return item;
      })
    }));
    setDataArray(updatedPackages);
  };

  // Calculate total items and total price
  const totalItems = dataArray.reduce((total, pkg) => total + pkg.Items.length, 0);
  const totalPrice = dataArray.reduce((total, pkg) =>
    total + pkg.Items.reduce((pkgTotal, item) => pkgTotal + item.price, 0), 0);
  const discountAmount = 170.00;
  const grandTotal = totalPrice - discountAmount;

  return (
    <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
      <TopNavigation NavArray={NavArray} />

      <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
        {/* Left Section */}
        <div className='w-full lg:w-2/3'>
          {dataArray.map((pkg) => (
            <div key={pkg.id} className='my-4 sm:my-6 lg:my-8'>
              <p className='text-sm sm:text-base font-semibold mb-2'>Your Selected Package: {pkg.packageName}</p>
              <hr className='border-[#3E206D80] mb-2 sm:mb-3' />

              <div className="overflow-x-auto w-full">
                <div className="min-w-[700px]"> {/* Set minimum width to ensure horizontal scroll */}
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-xs bg-gray-100">
                      <tr>
                        <th className="p-3 sm:p-4 w-8"></th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 min-w-[180px]">ITEM</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">UNIT</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[120px]">QTY</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">DISCOUNT</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">PRICE</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkg.Items.map((item) => {
                        const selectedUnit = unitSelection[item.id] || item.unit;

                        return (
                          <tr key={item.id} className=" hover:bg-gray-50">
                            <td className="p-3 sm:p-4">
                              <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" />
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <img className='w-10 sm:w-12 md:w-14 h-auto object-contain' src={item.image} alt={item.name} />
                                <p className="text-sm sm:text-base whitespace-nowrap">{item.name}</p>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className='flex gap-2 justify-center'>
                                {(['kg', 'g'] as const).map(unit => (
                                  <button
                                    key={unit}
                                    onClick={() => handleUnitChange(item.id, unit)}
                                    className={`text-sm px-3 py-1 rounded border ${selectedUnit === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'}`}
                                  >
                                    {unit}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className='flex items-center gap-2 border rounded px-2 py-2 justify-between w-24 sm:w-28 md:w-32 mx-auto'>
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm sm:text-base">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                              {item.discount.toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                              Rs.{item.price.toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                              <button className="hover:text-red-500 transition-colors p-1 flex items-center justify-center mx-auto">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section - Order Summary */}
        <div className='w-full lg:w-1/3 mt-6 lg:mt-0 pt-14'>
          <OrderSummary
            totalItems={totalItems}
            totalPrice={totalPrice}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;