'use client';
import React, { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

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

  return (
    <div className='px-4 md:px-8 py-5'>
      <div className='flex flex-col md:flex-row md:items-start gap-6'>
        {/* Left Section */}
        <div className='w-full md:w-2/3'>
          {dataArray.map((pkg) => (
            <div key={pkg.id} className='my-8'>
              <p className='text-base font-semibold mb-2'>Your Selected Package: {pkg.packageName}</p>
              <hr className='border-[#3E206D80] mb-3' />

              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-xs bg-gray-100">
                    <tr>
                      <th className="p-3"></th>
                      <th className="px-2 py-3">ITEM</th>
                      <th className="px-1 py-3 text-center">UNIT</th>
                      <th className="px-4 py-3 text-center">QUANTITY</th>
                      <th className="px-4 py-3 text-center">DISCOUNT</th>
                      <th className="px-4 py-3 text-center">PRICE</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.Items.map((item) => {
                      const selectedUnit = unitSelection[item.id] || item.unit;

                      return (
                        <tr key={item.id}>
                          <td className="p-3">
                            <input type="checkbox" className="w-4 h-4" />
                          </td>
                          <td className="px-1 py-3">
                            <div className="flex items-center gap-2">
                              <img className='w-14 h-auto' src={item.image} alt={item.name} />
                              <p>{item.name}</p>
                            </div>
                          </td>
                          <td className="px-1 py-3">
                            <div className='flex gap-2 justify-center'>
                              {(['kg', 'g'] as const).map(unit => (
                                <button
                                  key={unit}
                                  onClick={() => handleUnitChange(item.id, unit)}
                                  className={`text-sm px-3 py-1 rounded-md border ${selectedUnit === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'}`}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className='flex items-center gap-2 border rounded px-2 py-1 justify-between w-24 mx-auto'>
                              <button onClick={() => handleQuantityChange(item.id, -1)}><Minus size={14} /></button>
                              <span>{item.quantity}</span>
                              <button onClick={() => handleQuantityChange(item.id, 1)}><Plus size={14} /></button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{item.discount}</td>
                          <td className="px-4 py-3 text-center">Rs.{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section - Order Summary */}
        <div className='w-full md:w-1/3'>
          <div className='border border-[#171717] rounded-lg shadow-md p-5'>
            <h2 className='font-semibold text-lg mb-3'>Your Order</h2>

            <div className='flex justify-between items-center mb-3'>
              <div className='flex items-center gap-2'>
                <img className='w-14 h-auto' src={"https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"} alt="Order" />
                <p>18 items</p>
              </div>
              <p className='font-semibold'>Rs.3685.00</p>
            </div>

            <div className='border-t border-dotted border-gray-300 my-2' />

            <p className='font-semibold'>Coupon Code</p>

            <div className='flex flex-col sm:flex-row gap-2 w-full mt-2'>
              <input
                type="text"
                className='border border-gray-300 rounded-lg px-2 py-2 w-full sm:w-4/5'
                placeholder='Add coupon code'
              />
              <button className='bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-2 w-full sm:w-1/5'>
                Apply
              </button>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3' />

            <div className='flex justify-between'>
              <p className='text-gray-600'>Total</p>
              <p className='font-semibold'>Rs.3685.00</p>
            </div>

            <div className='flex justify-between'>
              <p className='text-gray-600'>Discount</p>
              <p className='text-gray-600'>Rs.170.00</p>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3' />

            <div className='flex justify-between mb-4'>
              <p className='font-semibold'>Grand Total</p>
              <p className='font-semibold'>Rs.3685.00</p>
            </div>

            <button className='w-full bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-2'>
              Checkout now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
