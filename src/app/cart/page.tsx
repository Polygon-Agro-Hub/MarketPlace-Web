'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import OrderSummary from '@/components/cart-right-cart/right-cart';
import { getRetailCart } from '@/services/retail-order-service';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  qty: string; // Note: API returns string for decimal values
  unit: 'kg' | 'g';
  createdAt: string;
  displayName: string;
  totalDiscount: string;
  totalPrice: string;
  image: string; // Assuming the API returns an image URL
}

interface PackageFinalItem {
  id: number;
  mpItemId: number;
  displayName: string;
  image: string; // Assuming the API returns an image URL
  quantity: string;
  discount: string;
  price: string;
  discountedPrice: string;
}

interface Package {
  packageId: number;
  finalItems: PackageFinalItem[];
}

interface CartResponse {
  cartId: number;
  additionalItems: CartItem[];
  packageItems: Package[];
}


const NavArray = [
  { name: 'Cart', path: '/cart', status: true },
  { name: 'Checkout', path: '/checkout', status: false },
  { name: 'Payment', path: '/payment', status: false },
];

const Page: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
  const [cartData, setCartData] = useState<CartResponse>({
    cartId: 0,
    additionalItems: [],
    packageItems: []
  });
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      if (typeof userId !== 'number') {
        throw new Error('User ID is undefined');
      }
      const data = await getRetailCart(token, userId);
      setCartData(data);
      
      // Initialize unit selection state
      const initialUnits: Record<number, 'kg' | 'g'> = {};
      data.additionalItems.forEach((item: CartItem) => {
        initialUnits[item.id] = item.unit as 'kg' | 'g';
      });
      data.packageItems.forEach((pkg: Package) => {
        pkg.finalItems.forEach(item => {
          initialUnits[item.id] = 'kg'; // Default to kg for package items
        });
      });
      setUnitSelection(initialUnits);
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

  const handleQuantityChange = (itemId: number, delta: number, isAdditional: boolean) => {
    if (isAdditional) {
      setCartData(prev => ({
        ...prev,
        additionalItems: prev.additionalItems.map(item => {
          if (item.id === itemId) {
            const currentQty = parseFloat(item.qty);
            const newQty = Math.max(0.01, currentQty + delta).toFixed(2);
            return {
              ...item,
              qty: newQty,
              totalPrice: (parseFloat(newQty) * (parseFloat(item.totalPrice) / currentQty)).toFixed(2),
              totalDiscount: (parseFloat(newQty) * (parseFloat(item.totalDiscount) / currentQty)).toFixed(2)
            };
          }
          return item;
        })
      }));
    } else {
      setCartData(prev => ({
        ...prev,
        packageItems: prev.packageItems.map(pkg => ({
          ...pkg,
          finalItems: pkg.finalItems.map(item => {
            if (item.id === itemId) {
              const currentQty = parseFloat(item.quantity);
              const newQty = Math.max(0.01, currentQty + delta).toFixed(2);
              return {
                ...item,
                quantity: newQty,
                price: (parseFloat(newQty) * (parseFloat(item.price) / currentQty)).toFixed(2),
                discount: (parseFloat(newQty) * (parseFloat(item.discount) / currentQty)).toFixed(2),
                discountedPrice: (parseFloat(newQty) * (parseFloat(item.discountedPrice) / currentQty)).toFixed(2)
              };
            }
            return item;
          })
        }))
      }));
    }
  };

  // Calculate totals
  const totalAdditionalItems = cartData.additionalItems.length;
  const totalPackageItems = cartData.packageItems.reduce((sum, pkg) => sum + pkg.finalItems.length, 0);
  const totalItems = totalAdditionalItems + totalPackageItems;

  const totalPrice = [
    ...cartData.additionalItems.map(item => parseFloat(item.totalPrice)),
    ...cartData.packageItems.flatMap(pkg => pkg.finalItems.map(item => parseFloat(item.price)))
  ].reduce((sum, price) => sum + price, 0);

  const discountAmount = [
    ...cartData.additionalItems.map(item => parseFloat(item.totalDiscount)),
    ...cartData.packageItems.flatMap(pkg => pkg.finalItems.map(item => parseFloat(item.discount)))
  ].reduce((sum, discount) => sum + discount, 0);

  const grandTotal = totalPrice - discountAmount;

  return (
    <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>

      
      <TopNavigation NavArray={NavArray} />

      <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
        {/* Left Section */}
        <div className='w-full lg:w-2/3'>
          {/* Additional Items Section */}
          {cartData.additionalItems.length > 0 && (
            <div className='my-4 sm:my-6 lg:my-8'>
              <p className='text-sm sm:text-base font-semibold mb-2'>Your Additional Items</p>
              <hr className='border-[#3E206D80] mb-2 sm:mb-3' />

              <div className="overflow-x-auto w-full">
                <div className="min-w-[700px]">
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
                      {cartData.additionalItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 sm:p-4">
                            <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" />
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              {/* Assuming you'll add images to your API response */}
                              <div className='w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gray-200 rounded'>
                                <img
                                  src={item.image} // <-- Replace with the correct property
                                  alt={item.displayName}
                                  className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded object-cover bg-gray-200"
                                />
                              </div>
                              <p className="text-sm sm:text-base whitespace-nowrap">{item.displayName}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className='flex gap-2 justify-center'>
                              {(['kg', 'g'] as const).map(unit => (
                                <button
                                  key={unit}
                                  onClick={() => handleUnitChange(item.id, unit)}
                                  className={`text-sm px-3 py-1 rounded border ${unitSelection[item.id] === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'}`}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className='flex items-center gap-2 border rounded px-2 py-2 justify-between w-24 sm:w-28 md:w-32 mx-auto'>
                              <button
                                onClick={() => handleQuantityChange(item.id, -1, true)}
                                className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm sm:text-base">{item.qty}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1, true)}
                                className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                            Rs.{parseFloat(item.totalDiscount).toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                            Rs.{parseFloat(item.totalPrice).toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                            <button className="hover:text-red-500 transition-colors p-1 flex items-center justify-center mx-auto">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Package Items Section */}
          {cartData.packageItems.map((pkg) => (
            <div key={pkg.packageId} className='my-4 sm:my-6 lg:my-8'>
              <p className='text-sm sm:text-base font-semibold mb-2'>Your Selected Package</p>
              <hr className='border-[#3E206D80] mb-2 sm:mb-3' />

              <div className="overflow-x-auto w-full">
                <div className="min-w-[700px]">
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
                      {pkg.finalItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 sm:p-4">
                            <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" />
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              {/* Assuming you'll add images to your API response */}
                              <div className='w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gray-200 rounded'>
                                <img
                                  src={item.image} // <-- Replace with the correct property
                                  alt={item.displayName}
                                  className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded object-cover bg-gray-200"
                                />
                              </div>
                              <p className="text-sm sm:text-base whitespace-nowrap">{item.displayName}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className='flex gap-2 justify-center'>
                              {['kg', 'g'].map(unit => (
                                <button
                                  key={unit}
                                  onClick={() => handleUnitChange(item.id, unit as 'kg' | 'g')}
                                  className={`text-sm px-3 py-1 rounded border ${unitSelection[item.id] === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'}`}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className='flex items-center gap-2 border rounded px-2 py-2 justify-between w-24 sm:w-28 md:w-32 mx-auto'>
                              <button
                                onClick={() => handleQuantityChange(item.id, -1, false)}
                                className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm sm:text-base">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1, false)}
                                className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                            Rs.{item.discount}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                            Rs.{item.price}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                            <button className="hover:text-red-500 transition-colors p-1 flex items-center justify-center mx-auto">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
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
            cartData={cartData}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;