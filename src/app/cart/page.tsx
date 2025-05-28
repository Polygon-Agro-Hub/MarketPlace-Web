// 'use client';
// import React, { useState } from 'react';
// import { Plus, Minus, Trash2 } from 'lucide-react';
// import TopNavigation from '@/components/top-navigation/TopNavigation';

// interface Item {
//   id: number;
//   name: string;
//   unit: 'kg' | 'g';
//   quantity: number;
//   discount: number;
//   price: number;
//   image: string;
// }

// interface Package {
//   id: number;
//   packageName: string;
//   Items: Item[];
// }

// const Page: React.FC = () => {
//     const NavArray = [
//     { name: 'Cart', path: '/cart', status:true },
//     { name: 'Checkout', path: '/checkout', status:false },
//     { name: 'Payment', path: '/payment', status:false },
//   ]
//   const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
//   const [dataArray, setDataArray] = useState<Package[]>([
//     {
//       id: 1,
//       packageName: "Family Pack",
//       Items: [
//         {
//           id: 1,
//           name: "Tomato",
//           unit: "kg",
//           quantity: 52,
//           discount: 104,
//           price: 571.48,
//           image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
//         },
//         {
//           id: 2,
//           name: "Potato",
//           unit: "kg",
//           quantity: 56,
//           discount: 112,
//           price: 615.44,
//           image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
//         }
//       ]
//     },
//     {
//       id: 2,
//       packageName: "Additional Items",
//       Items: [
//         {
//           id: 3,
//           name: "Green chilly",
//           unit: "kg",
//           quantity: 52,
//           discount: 104,
//           price: 571.48,
//           image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
//         },
//         {
//           id: 4,
//           name: "Banana",
//           unit: "kg",
//           quantity: 56,
//           discount: 112,
//           price: 615.44,
//           image: "https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"
//         }
//       ]
//     }
//   ]);

//   const handleUnitChange = (itemId: number, unit: 'kg' | 'g') => {
//     setUnitSelection(prev => ({
//       ...prev,
//       [itemId]: unit,
//     }));
//   };

//   const handleQuantityChange = (itemId: number, delta: number) => {
//     const updatedPackages = dataArray.map(pkg => ({
//       ...pkg,
//       Items: pkg.Items.map(item => {
//         if (item.id === itemId) {
//           const newQuantity = Math.max(1, item.quantity + delta);
//           return {
//             ...item,
//             quantity: newQuantity,
//             discount: newQuantity * 2,
//             price: newQuantity * 10.99
//           };
//         }
//         return item;
//       })
//     }));
//     setDataArray(updatedPackages);
//   };

//   // Calculate total items and total price
//   const totalItems = dataArray.reduce((total, pkg) => total + pkg.Items.length, 0);
//   const totalPrice = dataArray.reduce((total, pkg) => 
//     total + pkg.Items.reduce((pkgTotal, item) => pkgTotal + item.price, 0), 0);
//   const discountAmount = 170.00;
//   const grandTotal = totalPrice - discountAmount;

//   return (
//     <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
//       <TopNavigation NavArray={NavArray}/>

//       <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
//         {/* Left Section */}
//         <div className='w-full lg:w-2/3'>
//           {dataArray.map((pkg) => (
//             <div key={pkg.id} className='my-4 sm:my-6 lg:my-8'>
//               <p className='text-sm sm:text-base font-semibold mb-2'>Your Selected Package: {pkg.packageName}</p>
//               <hr className='border-[#3E206D80] mb-2 sm:mb-3' />

//               <div className="overflow-x-auto w-full">
//                 <div className="min-w-[700px]"> {/* Set minimum width to ensure horizontal scroll */}
//                   <table className="w-full text-xs sm:text-sm text-left">
//                     <thead className="text-xs bg-gray-100">
//                       <tr>
//                         <th className="p-3 sm:p-4 w-8"></th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 min-w-[180px]">ITEM</th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">UNIT</th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[120px]">QTY</th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">DISCOUNT</th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 text-center min-w-[100px]">PRICE</th>
//                         <th className="px-3 sm:px-4 py-3 sm:py-4 text-center w-10"></th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {pkg.Items.map((item) => {
//                         const selectedUnit = unitSelection[item.id] || item.unit;

//                         return (
//                           <tr key={item.id} className=" hover:bg-gray-50">
//                             <td className="p-3 sm:p-4">
//                               <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" />
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4">
//                               <div className="flex items-center gap-3 sm:gap-4">
//                                 <img className='w-10 sm:w-12 md:w-14 h-auto object-contain' src={item.image} alt={item.name} />
//                                 <p className="text-sm sm:text-base whitespace-nowrap">{item.name}</p>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4">
//                               <div className='flex gap-2 justify-center'>
//                                 {(['kg', 'g'] as const).map(unit => (
//                                   <button
//                                     key={unit}
//                                     onClick={() => handleUnitChange(item.id, unit)}
//                                     className={`text-sm px-3 py-1 rounded border ${selectedUnit === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'}`}
//                                   >
//                                     {unit}
//                                   </button>
//                                 ))}
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4">
//                               <div className='flex items-center gap-2 border rounded px-2 py-2 justify-between w-24 sm:w-28 md:w-32 mx-auto'>
//                                 <button 
//                                   onClick={() => handleQuantityChange(item.id, -1)} 
//                                   className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
//                                 >
//                                   <Minus size={14} />
//                                 </button>
//                                 <span className="text-sm sm:text-base">{item.quantity}</span>
//                                 <button 
//                                   onClick={() => handleQuantityChange(item.id, 1)} 
//                                   className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center"
//                                 >
//                                   <Plus size={14} />
//                                 </button>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
//                               {item.discount.toFixed(2)}
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
//                               Rs.{item.price.toFixed(2)}
//                             </td>
//                             <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
//                               <button className="hover:text-red-500 transition-colors p-1 flex items-center justify-center mx-auto">
//                                 <Trash2 size={18} />
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Right Section - Order Summary */}
//         <div className='w-full lg:w-1/3 mt-6 lg:mt-0 pt-14'>
//           <div className='border border-[#171717] rounded-lg shadow-md p-4 sm:p-5 md:p-6 md:mx-10 sm:mr-10'>
//             <h2 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Your Order</h2>

//             <div className='flex justify-between items-center mb-3 sm:mb-4'>
//               <div className='flex items-center gap-2 sm:gap-3'>
//                 <img className='w-12 sm:w-14 md:w-16 h-auto' src={"https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png"} alt="Order" />
//                 <p className="text-sm sm:text-base">{totalItems} items</p>
//               </div>
//               <p className='font-semibold text-sm sm:text-base'>Rs.{totalPrice.toFixed(2)}</p>
//             </div>

//             <div className='border-t border-dotted border-gray-300 my-3' />

//             <p className='font-semibold text-sm sm:text-base mb-2'>Coupon Code</p>

//             <div className='flex flex-row gap-3 w-full mt-2 sm:mt-3'>
//               <input
//                 type="text"
//                 className='border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base w-3/4'
//                 placeholder='Add coupon code'
//               />
//               <button className='bg-[#3E206D] text-white font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-1/4'>
//                 Apply
//               </button>
//             </div>

//             <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

//             <div className='flex justify-between text-sm sm:text-base'>
//               <p className='text-gray-600'>Total</p>
//               <p className='font-semibold'>Rs.{totalPrice.toFixed(2)}</p>
//             </div>

//             <div className='flex justify-between text-sm sm:text-base mt-2'>
//               <p className='text-gray-600'>Discount</p>
//               <p className='text-gray-600'>Rs.{discountAmount.toFixed(2)}</p>
//             </div>

//             <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

//             <div className='flex justify-between mb-4 sm:mb-5 text-sm sm:text-base'>
//               <p className='font-semibold'>Grand Total</p>
//               <p className='font-semibold'>Rs.{grandTotal.toFixed(2)}</p>
//             </div>

//             <button className='w-full bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-3 text-sm sm:text-base hover:bg-[#2d174f] transition-colors'>
//               Checkout now
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;


'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';

interface Item {
  id: number;
  name: string;
  unit: 'kg' | 'g';
  quantity: number;
  discount: number;
  price: number;
  image: string;
  productId?: number;
  packageItemId?: number;
  itemType?: string;
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
  ];
  const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
  const [dataArray, setDataArray] = useState<Package[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/order-history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Adjust authentication as needed
        });
        if (!response.ok) {
          throw new Error('Failed to fetch order history');
        }
        const result = await response.json();
        console.log('API Response:', result);

        if (result.status && Array.isArray(result.data)) {
          console.log('Is orderHistory an array?', Array.isArray(result.data));
          console.log('orderHistory contents:', result.data);

          // Use the latest order with items (filter out orders with no items)
          const latestOrderWithItems = result.data
            .filter(order => (order.packages && order.packages.length > 0) || (order.additionalItems && order.additionalItems.length > 0))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          if (!latestOrderWithItems) {
            console.log('No orders with items found');
            setDataArray([]);
            setOrderDetails(null);
            setLoading(false);
            return;
          }

          setOrderDetails(latestOrderWithItems);

          // Map backend data to frontend structure
          const mappedPackages: Package[] = [
            ...(latestOrderWithItems.packages && latestOrderWithItems.packages.length > 0
              ? latestOrderWithItems.packages.map(pkg => ({
                  id: pkg.packageId,
                  packageName: 'Family Pack', // Adjust if packageName comes from backend
                  Items: pkg.items.map(item => ({
                    id: item.id,
                    name: item.itemDetails?.displayName || `Item ${item.productId}`,
                    unit: pkg.unitType || 'kg', // Use package-level unitType if available
                    quantity: 1, // Default; adjust if backend provides quantity
                    discount: 2, // Default; adjust based on backend logic
                    price: parseFloat(item.price) || 10.99, // Use item price if available
                    image: item.itemDetails?.image || 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png',
                    productId: item.productId,
                    packageItemId: item.packageItemId,
                    itemType: item.itemType,
                  })),
                }))
              : []),
            ...(latestOrderWithItems.additionalItems && latestOrderWithItems.additionalItems.length > 0
              ? [{
                  id: latestOrderWithItems.id + 1000, // Unique ID for additional items package
                  packageName: 'Additional Items',
                  Items: latestOrderWithItems.additionalItems.map(item => ({
                    id: item.id,
                    name: item.itemDetails?.displayName || `Item ${item.productId}`,
                    unit: 'kg', // Default; adjust if unitType is available
                    quantity: 1, // Default; adjust if backend provides quantity
                    discount: 2, // Default; adjust based on backend logic
                    price: parseFloat(item.price) || 10.99, // Use item price if available
                    image: item.itemDetails?.image || 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png',
                    productId: item.productId,
                    packageItemId: item.packageItemId,
                    itemType: item.itemType,
                  })),
                }]
              : []),
          ];

          console.log('Normalized Orders:', mappedPackages);
          setDataArray(mappedPackages);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderHistory();
  }, []);

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
            price: newQuantity * 10.99,
          };
        }
        return item;
      }),
    }));
    setDataArray(updatedPackages);
  };

  // Calculate totals
  const totalItems = dataArray.reduce((total, pkg) => total + pkg.Items.length, 0);
  const totalPrice = dataArray.reduce((total, pkg) => 
    total + pkg.Items.reduce((pkgTotal, item) => pkgTotal + item.price, 0), 0);
  const discountAmount = parseFloat(orderDetails?.couponValue) || 170.00; // Use backend couponValue if available
  const grandTotal = totalPrice - discountAmount;

  if (loading) {
    return <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>Loading...</div>;
  }

  if (error) {
    return <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>Error: {error}</div>;
  }

  return (
    <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
      <TopNavigation NavArray={NavArray} />

      <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
        {/* Left Section */}
        <div className='w-full lg:w-2/3'>
          {orderDetails ? (
            <div className='mb-4 sm:mb-6 lg:mb-8'>
              <p className='text-sm sm:text-base font-semibold mb-2'>Order ID: #{orderDetails.id}</p>
              <p className='text-sm sm:text-base mb-2'>
                Order Placed: {new Date(orderDetails.createdAt).toLocaleDateString()} | 
                Scheduled Date: {orderDetails.sheduleDate ? new Date(orderDetails.sheduleDate).toLocaleDateString() : 'N/A'} | 
                Scheduled Time: {orderDetails.sheduleTime || 'Between 8AM-12PM'} | 
                Delivery/Pickup: {orderDetails.deliveryType}
              </p>
              {orderDetails.deliveryType === 'PICKUP' && orderDetails.pickupLocation && (
                <div className='text-sm sm:text-base mb-2'>
                  <p>Pickup Information</p>
                  <p>{orderDetails.pickupLocation.centerName}</p>
                  <p>{orderDetails.pickupLocation.street}, {orderDetails.pickupLocation.city}</p>
                  <p>Contact: {orderDetails.pickupLocation.contact01}</p>
                </div>
              )}
              <p className='text-sm sm:text-base font-semibold'>Status: {orderDetails.sheduleType || 'Ordered'}</p>
            </div>
          ) : (
            <p className='text-sm sm:text-base'>No order details available.</p>
          )}
          {dataArray.length > 0 ? (
            dataArray.map((pkg) => (
              <div key={pkg.id} className='my-4 sm:my-6 lg:my-8'>
                <p className='text-sm sm:text-base font-semibold mb-2'>Your Selected Package: {pkg.packageName}</p>
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
                        {pkg.Items.map((item) => {
                          const selectedUnit = unitSelection[item.id] || item.unit;

                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
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
            ))
          ) : (
            <p className='text-sm sm:text-base'>No items in this order.</p>
          )}
        </div>

        {/* Right Section - Order Summary */}
        <div className='w-full lg:w-1/3 mt-6 lg:mt-0 pt-14'>
          <div className='border border-[#171717] rounded-lg shadow-md p-4 sm:p-5 md:p-6 md:mx-10 sm:mr-10'>
            <h2 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Your Order</h2>

            <div className='flex justify-between items-center mb-3 sm:mb-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <img className='w-12 sm:w-14 md:w-16 h-auto' src={'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/cropgroup/image/92953533-462a-49f7-ba6d-7ef20a035a4f.png'} alt="Order" />
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

            <button className='w-full bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-3 text-sm sm:text-base hover:bg-[#2d174f] transition-colors'>
              Checkout now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;