
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import { 
  getUserCart, 
  updateCartProductQuantity,
  removeCartProduct,
  removeCartPackage,
} from '@/services/cart-service';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { 
  setCartData, 
  updateProductQuantity, 
  removeProduct, 
  removePackage,
  applyCoupon,
  selectCartSummary,
  selectCartForOrder
} from '@/store/slices/cartItemsSlice';
import { useRouter } from 'next/navigation';

interface PackageItem {
  name: string;
  quantity: number;
  hasSpecialBadge: boolean;
}

interface CartPackage {
  id: number;
  cartItemId: number;
  packageName: string;
  totalItems: number;
  price: number;
  quantity: number;
  image: string;
  description: string;
  items: PackageItem[];
}

interface CartItem {
  id: number;
  cartItemId: number;
  name: string;
  unit: 'kg' | 'g';
  quantity: number;
  discount: number;
  price: number;
  normalPrice: number;
  discountedPrice: number | null;
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
}

interface AdditionalItems {
  id: number;
  packageName: string;
  Items: CartItem[];
}

const Page: React.FC = () => {
  const NavArray = [
    { name: 'Cart', path: '/cart', status: true },
    { name: 'Checkout', path: '/checkout', status: false },
    { name: 'Payment', path: '/payment', status: false },
  ];

  const token = useSelector((state: RootState) => state.auth.token) as string | null;
  const cartData = useSelector((state: RootState) => state.cartItems);
  const calculatedSummary = useSelector(selectCartSummary);
  
  // Safe selector for order data with proper error handling
  const orderData = useSelector((state: RootState) => {
    try {
      return selectCartForOrder(state);
    } catch (error) {
      console.warn('Error in selectCartForOrder selector:', error);
      return null;
    }
  });
  
  const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
  const [pendingUpdates, setPendingUpdates] = useState<{ productId: number; newQuantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set()); // Track items being removed
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'product' | 'package', id: number } | null>(null);
  
  const dispatch = useDispatch();
  const router = useRouter();

  // Helper functions for unit calculations
  const calculateDiscount = (baseDiscount: number, unit: 'kg' | 'g', quantity: number): number => {
    const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
    return baseDiscount * quantityInKg;
  };

  const calculatePrice = (basePrice: number, unit: 'kg' | 'g', quantity: number): number => {
    const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
    return basePrice * quantityInKg;
  };

  const getDisplayDiscount = (item: CartItem): number => {
    const selectedUnit = unitSelection[item.id] || item.unit;
    return calculateDiscount(item.discount, selectedUnit, item.quantity);
  };

  const getDisplayPrice = (item: CartItem): number => {
    const selectedUnit = unitSelection[item.id] || item.unit;
    return calculatePrice(item.price, selectedUnit, item.quantity);
  };

  // Helper function to check if cart is empty
  const isCartEmpty = (): boolean => {
    // Check if no cart exists
    if (!cartData.cart) return true;
    
    // Check if no items in both packages and additional items
    const hasPackages = cartData.packages && cartData.packages.length > 0;
    const hasAdditionalItems = cartData.additionalItems && 
      cartData.additionalItems.length > 0 && 
      cartData.additionalItems.some(group => group.Items && group.Items.length > 0);
    
    return !hasPackages && !hasAdditionalItems;
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const response = await getUserCart(token);
        
        dispatch(setCartData({
          cart: response.cart,
          packages: response.packages,
          additionalItems: response.additionalItems,
          summary: response.summary,
        }));
        
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCartData();
    }
  }, [token, dispatch]);

  const handleUnitChange = (itemId: number, unit: 'kg' | 'g') => {
    setUnitSelection(prev => ({
      ...prev,
      [itemId]: unit,
    }));
  };

  const handleProductQuantityChange = (productId: number, delta: number) => {
    let currentQuantity = 1;
    for (const itemGroup of cartData.additionalItems) {
      const item = itemGroup.Items.find(item => item.id === productId);
      if (item) {
        currentQuantity = item.quantity;
        break;
      }
    }

    const newQuantity = Math.max(1, currentQuantity + delta);

    // Update Redux store
    dispatch(updateProductQuantity({ productId, newQuantity }));

    // Store pending update for API call
    setPendingUpdates(prev => {
      const existing = prev.find(update => update.productId === productId);
      if (existing) {
        return prev.map(update =>
          update.productId === productId ? { ...update, newQuantity } : update
        );
      }
      return [...prev, { productId, newQuantity }];
    });
  };

  // Show confirmation modal for product removal
  const handleRemoveProduct = (productId: number) => {
    setShowConfirmModal({ type: 'product', id: productId });
  };

  // Show confirmation modal for package removal
  const handleRemovePackage = (packageId: number) => {
    setShowConfirmModal({ type: 'package', id: packageId });
  };

  // Actual product removal after confirmation
  const confirmRemoveProduct = async (productId: number) => {
    const itemKey = `product-${productId}`;
    
    // Prevent multiple simultaneous removals
    if (removingItems.has(itemKey)) return;
    
    try {
      // Add to removing set
      setRemovingItems(prev => new Set(prev).add(itemKey));
      
      // Make direct API call
      await removeCartProduct(productId, token);
      
      // Update Redux store after successful API call
      dispatch(removeProduct(productId));
      
      // Optionally refresh cart data to ensure consistency
      const updatedCartData = await getUserCart(token);
      dispatch(setCartData({
        cart: updatedCartData.cart,
        packages: updatedCartData.packages,
        additionalItems: updatedCartData.additionalItems,
        summary: updatedCartData.summary,
      }));
      
    } catch (error: any) {
      console.error('Error removing product:', error);
      // Show error message to user
      alert('Failed to remove item. Please try again.');
    } finally {
      // Remove from removing set
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Actual package removal after confirmation
  const confirmRemovePackage = async (packageId: number) => {
    const itemKey = `package-${packageId}`;
    
    // Prevent multiple simultaneous removals
    if (removingItems.has(itemKey)) return;
    
    try {
      // Add to removing set
      setRemovingItems(prev => new Set(prev).add(itemKey));
      
      // Make direct API call
      await removeCartPackage(packageId, token);
      
      // Update Redux store after successful API call
      dispatch(removePackage(packageId));
      
      // Optionally refresh cart data to ensure consistency
      const updatedCartData = await getUserCart(token);
      dispatch(setCartData({
        cart: updatedCartData.cart,
        packages: updatedCartData.packages,
        additionalItems: updatedCartData.additionalItems,
        summary: updatedCartData.summary,
      }));
      
    } catch (error: any) {
      console.error('Error removing package:', error);
      // Show error message to user
      alert('Failed to remove package. Please try again.');
    } finally {
      // Remove from removing set
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    if (isCartEmpty() || !calculatedSummary || calculatedSummary.totalItems === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      setCheckoutLoading(true);
      
      // Process all pending quantity updates only
      for (const update of pendingUpdates) {
        await updateCartProductQuantity(update.productId, update.newQuantity, token);
      }

      // Clear pending updates
      setPendingUpdates([]);

      // Fetch updated cart data to ensure consistency
      const updatedCartData = await getUserCart(token);
      dispatch(setCartData({
        cart: updatedCartData.cart,
        packages: updatedCartData.packages,
        additionalItems: updatedCartData.additionalItems,
        summary: updatedCartData.summary,
      }));

      // Safe access to orderData with detailed logging
      console.log('Cart data before checkout:', {
        hasCart: !!cartData.cart,
        cartId: cartData.cart?.cartId, // Fixed: use cartId instead of id
        hasOrderData: !!orderData,
        orderData: orderData
      });

      // Navigate to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/'); // Adjust the path as needed
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5">
        <TopNavigation NavArray={NavArray} />
        <div className="text-red-500 text-center py-10">{error}</div>
      </div>
    );
  }

  // Empty cart state - improved logic
if (isCartEmpty()) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5">
        <TopNavigation NavArray={NavArray} />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {/* Empty Cart Image/Icon */}
          <div className="mb-8">
            <img 
              src="/images/empty.jpg" // Replace with your actual image path
              alt="Empty Cart"
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
              onError={(e) => {
                // Fallback to icon if image doesn't load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <ShoppingCart 
              size={80} 
              className="text-gray-400 hidden" 
            />
          </div>
          
          {/* Empty Cart Text */}
          <div className="text-center max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            
            {/* Continue Shopping Button */}
            <button
              onClick={handleContinueShopping}
              className="bg-[#3E206D] text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-[#2F1A5B] transition-colors shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation Modal - Moved to top level */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <p className="text-lg font-medium mb-6">
              Are you sure you want to remove this{' '}
              {showConfirmModal.type === 'package' ? 'package' : 'product'}?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirmModal.type === 'package') {
                    confirmRemovePackage(showConfirmModal.id);
                  } else {
                    confirmRemoveProduct(showConfirmModal.id);
                  }
                  setShowConfirmModal(null);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
      <TopNavigation NavArray={NavArray} />

      <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
        <div className='w-full lg:w-2/3'>
          {cartData.additionalItems.map((itemGroup) => (
            <div key={itemGroup.id} className='my-4 sm:my-6 lg:my-8'>
              <p className='text-sm sm:text-base font-semibold mb-2'>Your Selected Package: {itemGroup.packageName}</p>
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
                      {itemGroup.Items.map((item) => {
                        const selectedUnit = unitSelection[item.id] || item.unit;
                        const isRemoving = removingItems.has(`product-${item.id}`);

                        return (
                          <tr key={item.id} className={`hover:bg-gray-50 ${isRemoving ? 'opacity-50' : ''}`}>
                            <td className="p-3 sm:p-4">
                              <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" />
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 sm:w-12 md:w-14 h-auto object-contain"
                                />
                                <p className="text-sm sm:text-base whitespace-nowrap">{item.name}</p>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className="flex gap-2 justify-center">
                                {(['kg', 'g'] as const).map(unit => (
                                  <button
                                    key={unit}
                                    onClick={() => handleUnitChange(item.id, unit)}
                                    disabled={isRemoving}
                                    className={`text-sm px-3 py-1 rounded border ${selectedUnit === unit ? 'bg-[#EDE1FF] font-semibold' : 'text-gray-500'} disabled:opacity-50`}
                                  >
                                    {unit}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className='flex items-center gap-2 border rounded px-2 py-2 justify-between w-24 sm:w-28 md:w-32 mx-auto'>
                                <button 
                                  onClick={() => handleProductQuantityChange(item.id, -1)} 
                                  disabled={isRemoving}
                                  className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center disabled:opacity-50"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm sm:text-base">{item.quantity}</span>
                                <button 
                                  onClick={() => handleProductQuantityChange(item.id, 1)} 
                                  disabled={isRemoving}
                                  className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center disabled:opacity-50"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                              Rs.{getDisplayDiscount(item).toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm whitespace-nowrap">
                              Rs.{getDisplayPrice(item).toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                              <button 
                                onClick={() => handleRemoveProduct(item.id)}
                                disabled={isRemoving}
                                className="hover:text-red-500 transition-colors p-1 flex items-center justify-center mx-auto disabled:opacity-50"
                                title={isRemoving ? 'Removing...' : 'Remove item'}
                              >
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

          <div className='space-y-4 sm:space-y-6 mt-6 sm:mt-8'>
            {cartData.packages.map((pkg) => {
              const isRemoving = removingItems.has(`package-${pkg.id}`);
              
              return (
                <div key={pkg.id} className={`w-full ${isRemoving ? 'opacity-50' : ''}`}>
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 pb-2 border-b border-gray-300 gap-2 sm:gap-0'>
                    <h3 className='text-sm sm:text-base font-normal text-gray-800 leading-relaxed'>
                      Your Selected Package : <span className='font-semibold'>{pkg.packageName}</span> ({pkg.totalItems} Items)
                    </h3>
                    <div className='flex items-center justify-between sm:justify-end gap-3 sm:gap-4'>
                      <button 
                        onClick={() => handleRemovePackage(pkg.id)}
                        disabled={isRemoving}
                        className='text-red-500 hover:scale-105 transition-transform disabled:opacity-50'
                        title={isRemoving ? 'Removing...' : 'Remove package'}
                      >
                        <Trash2 size={18} className='sm:w-5 sm:h-5' />
                      </button>
                      <span className='text-base sm:text-lg font-bold text-gray-900'>Rs. {(pkg.price * pkg.quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className='bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm'>
                    <div className='grid grid-cols-2 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-gray-200'>
                      <span className='text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide'>ITEMS</span>
                      <span className='text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide text-right'>QUANTITY</span>
                    </div>

                    <div className='space-y-3 sm:space-y-4'>
                      {pkg.items.map((item, index) => (
                        <div key={index} className='grid grid-cols-2 items-center gap-2'>
                          <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                            <span className='text-sm sm:text-base text-gray-900 font-medium truncate pr-1'>
                              {item.name}
                            </span>
                          </div>
                          <div className='text-right'>
                            <span className='text-sm sm:text-base text-gray-900 font-medium'>
                              {String(item.quantity).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='w-full lg:w-1/3 mt-6 lg:mt-0 pt-14'>
          <div className='border border-[#171717] rounded-lg shadow-md p-4 sm:p-5 md:p-6 md:mx-10 sm:mr-10'>
            <h2 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Your Order</h2>

            <div className='flex justify-between items-center mb-3 sm:mb-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <p className="text-sm sm:text-base">{calculatedSummary?.totalItems || 0} items</p>
              </div>
              <p className='font-semibold text-sm sm:text-base'>Rs.{calculatedSummary?.grandTotal?.toFixed(2) || '0.00'}</p>
            </div>

            <div className='border-t border-dotted border-gray-300 my-3' />

            <p className='font-semibold text-sm sm:text-base mb-2'>Coupon Code</p>

            {cartData.cart?.isCoupon === 1 ? (
              <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-3'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-sm text-green-800 font-medium'>Coupon Applied</p>
                    <p className='text-xs text-green-600'>You saved Rs.{calculatedSummary?.totalDiscount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <button
                    // onClick={handleRemoveCoupon}
                    disabled={couponLoading}
                    className='text-red-500 hover:text-red-700 text-sm font-medium'
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-row gap-3 w-full mt-2 sm:mt-3'>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  // onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className='border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base w-3/4'
                  placeholder='Add coupon code'
                  disabled={couponLoading}
                />
                <button 
                  // onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className='bg-[#3E206D] text-white font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-1/4 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}

            {couponMessage && (
              <div className={`mt-2 text-sm p-2 rounded ${
                couponMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {couponMessage.text}
              </div>
            )}

            <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

            <div className='space-y-2 mb-4'>
              <div className='flex justify-between text-sm sm:text-base'>
                <p className='text-gray-600'>Subtotal</p>
                <p>Rs.{calculatedSummary?.grandTotal?.toFixed(2) || '0.00'}</p>
              </div>
              
              {(calculatedSummary?.totalDiscount || 0) > 0 && (
                <div className='flex justify-between text-sm sm:text-base'>
                  <p className='text-green-600'>Discount</p>
                  <p className='text-green-600'>-Rs.{calculatedSummary?.totalDiscount?.toFixed(2) || '0.00'}</p>
                </div>
              )}
              
              <div className='border-t border-gray-200 pt-2'>
                <div className='flex justify-between text-sm sm:text-base font-semibold'>
                  <p>Total</p>
                  <p>Rs.{calculatedSummary?.finalTotal?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || isCartEmpty() || (calculatedSummary?.totalItems || 0) === 0}
              className='w-full bg-[#3E206D] text-white font-semibold rounded-lg py-3 text-sm sm:text-base hover:bg-[#2F1A5B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Page;