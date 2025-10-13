
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash, ShoppingCart, X } from 'lucide-react';
import TopNavigation from '@/components/top-navigation/TopNavigation';
import {
  getUserCart,
  updateCartProductQuantity,
  removeCartProduct,
  removeCartPackage,
  bulkRemoveCartProducts
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
import empty from '../../../public/empty.jpg'
import pickup from '../../../public/IP.png'
import delivery from '../../../public/HMI.png'
import summary from '../../../public/summary.png'
import Image from 'next/image'
import { updateCartInfo } from '@/store/slices/authSlice';
import { getCartInfo } from '@/services/auth-service';


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
  startValue: number; // Added from API response
  changeby: number;   // Added from API response
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
  maxQuantity?: number;

}

interface AdditionalItems {
  id: number;
  packageName: string;
  Items: CartItem[];
}

// Update the showConfirmModal interface
interface ConfirmModal {
  type: 'product' | 'package' | 'bulk';
  id: number;
  selectedIds?: number[];
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


  const [unitSelection, setUnitSelection] = useState<Record<number, 'kg' | 'g'>>({});
  const [pendingUpdates, setPendingUpdates] = useState<{ productId: number; newQuantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set()); // Track items being removed
  const [showConfirmModal, setShowConfirmModal] = useState<ConfirmModal | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<'pickup' | 'delivery' | null>(null);
  const [tooltipStates, setTooltipStates] = useState<Record<number, 'min' | 'max' | boolean>>({});
  const buyerType = useSelector((state: RootState) => state.auth.user?.buyerType);


  const dispatch = useDispatch();
  const router = useRouter();

  const calculateDiscount = (baseDiscount: number, unit: 'kg' | 'g', quantity: number): number => {
    const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
    return parseFloat((baseDiscount * quantityInKg).toFixed(3));
  };

  const calculatePrice = (basePrice: number, unit: 'kg' | 'g', quantity: number): number => {
    const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
    return parseFloat((basePrice * quantityInKg).toFixed(3));
  };


  const getDisplayDiscount = (item: CartItem): number => {
    const selectedUnit = unitSelection[item.id] || item.unit.toLowerCase() as ('kg' | 'g');
    return calculateDiscount(item.discount, selectedUnit, item.quantity);
  };

  // Updated getDisplayPrice function  
  const getDisplayPrice = (item: CartItem): number => {
    const selectedUnit = unitSelection[item.id] || item.unit.toLowerCase() as ('kg' | 'g');
    // Use normalPrice instead of price for calculations
    return calculatePrice(item.normalPrice, selectedUnit, item.quantity);
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

        // Initialize unit selection for all items
        const initialUnitSelection: Record<number, 'kg' | 'g'> = {};
        if (response.additionalItems) {
          response.additionalItems.forEach((itemGroup: AdditionalItems) => {
            itemGroup.Items.forEach((item: CartItem) => {
              // Normalize the unit from API (handle both "Kg" and "kg", "G" and "g")
              const normalizedUnit = item.unit.toLowerCase() === 'kg' ? 'kg' : 'g';
              initialUnitSelection[item.id] = normalizedUnit;
            });
          });
        }
        setUnitSelection(initialUnitSelection);

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



  // Updated formatPrice function to handle decimal precision
  const formatPrice = (price: number): string => {
    // Ensure proper decimal precision before formatting
    const fixedPrice = parseFloat(price.toFixed(2));
    const [integerPart, decimalPart] = fixedPrice.toFixed(2).split('.');

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimalPart}`;
  };


  // Updated handleUnitChange function
  const handleUnitChange = (itemId: number, newUnit: 'kg' | 'g') => {
    let currentItem: CartItem | null = null;
    for (const itemGroup of cartData.additionalItems) {
      const item = itemGroup.Items.find(item => item.id === itemId);
      if (item) {
        currentItem = item;
        break;
      }
    }

    if (!currentItem) return;

    const currentUnit = unitSelection[itemId] || currentItem.unit.toLowerCase() as ('kg' | 'g');

    // Only proceed if the unit is actually changing
    if (currentUnit === newUnit) {
      return;
    }

    let newQuantity = currentItem.quantity;

    // Convert quantity based on unit change
    if (currentUnit === 'kg' && newUnit === 'g') {
      // Convert kg to g: multiply by 1000
      newQuantity = parseFloat((currentItem.quantity * 1000).toFixed(3));
    } else if (currentUnit === 'g' && newUnit === 'kg') {
      // Convert g to kg: divide by 1000
      newQuantity = parseFloat((currentItem.quantity / 1000).toFixed(3));
    }

    // Update unit selection FIRST
    setUnitSelection(prev => ({
      ...prev,
      [itemId]: newUnit,
    }));

    // Then update quantity in Redux store
    dispatch(updateProductQuantity({ productId: itemId, newQuantity }));

    // Store pending update for API call with converted quantity
    setPendingUpdates(prev => {
      // Remove any existing pending update for this item first
      const filtered = prev.filter(update => update.productId !== itemId);
      // Add new pending update with converted quantity
      return [...filtered, { productId: itemId, newQuantity }];
    });
  };


  // Updated handleProductQuantityChange function
  const handleProductQuantityChange = (productId: number, delta: number) => {
    let currentItem: CartItem | null = null;

    // Find the current item to get changeby value
    for (const itemGroup of cartData.additionalItems) {
      const item = itemGroup.Items.find(item => item.id === productId);
      if (item) {
        currentItem = item;
        break;
      }
    }

    if (!currentItem) return;

    const currentQuantity = currentItem.quantity;
    const selectedUnit = unitSelection[productId] || currentItem.unit.toLowerCase() as ('kg' | 'g');
    const originalUnit = currentItem.unit.toLowerCase() as ('kg' | 'g');

    // Get base changeby and startValue from the item
    let changeBy = currentItem.changeby || 1;
    let startValue = currentItem.startValue || 1;

    // Only convert changeby and startValue if the selected unit differs from original unit
    if (selectedUnit !== originalUnit) {
      if (selectedUnit === 'g' && originalUnit === 'kg') {
        // If displaying in grams but item is originally stored in kg, convert to grams
        changeBy = parseFloat((changeBy * 1000).toFixed(3));
        startValue = parseFloat((startValue * 1000).toFixed(3));
      } else if (selectedUnit === 'kg' && originalUnit === 'g') {
        // If displaying in kg but item is originally stored in grams, convert to kg
        changeBy = parseFloat((changeBy / 1000).toFixed(3));
        startValue = parseFloat((startValue / 1000).toFixed(3));
      }
    }

    // Get maxQuantity and convert if needed
    let maxQuantity = currentItem.maxQuantity || Infinity;
    if (selectedUnit !== originalUnit) {
      if (selectedUnit === 'g' && originalUnit === 'kg') {
        maxQuantity = parseFloat((maxQuantity * 1000).toFixed(3));
      } else if (selectedUnit === 'kg' && originalUnit === 'g') {
        maxQuantity = parseFloat((maxQuantity / 1000).toFixed(3));
      }
    }

    // Calculate new quantity using changeby value with 3 decimal precision
    let newQuantity: number;
    if (delta > 0) {
      // Increment by changeby value
      const potentialNewQuantity = parseFloat((currentQuantity + (changeBy * delta)).toFixed(3));

      if (potentialNewQuantity > maxQuantity) {
        // Show MAX tooltip when trying to go above maximum
        setTooltipStates(prev => ({ ...prev, [productId]: 'max' }));

        // Hide tooltip after 2 seconds
        setTimeout(() => {
          setTooltipStates(prev => ({ ...prev, [productId]: false }));
        }, 2000);

        return; // Don't update quantity
      }

      newQuantity = potentialNewQuantity;
    } else {
      // Check if decrement would go below startValue
      const potentialNewQuantity = parseFloat((currentQuantity + (changeBy * delta)).toFixed(3));

      if (potentialNewQuantity < startValue) {
        // Show MIN tooltip when trying to go below minimum
        setTooltipStates(prev => ({ ...prev, [productId]: 'min' }));

        // Hide tooltip after 2 seconds
        setTimeout(() => {
          setTooltipStates(prev => ({ ...prev, [productId]: false }));
        }, 2000);

        return; // Don't update quantity
      }

      newQuantity = potentialNewQuantity;
    }

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
  const handleRemoveProduct = async (productId: number) => {
    const itemKey = `product-${productId}`;

    // Prevent multiple simultaneous removals
    if (removingItems.has(itemKey)) return;

    try {
      setRemovingItems(prev => new Set(prev).add(itemKey));


      await removeCartProduct(productId, token);

      dispatch(removeProduct(productId));

      try {
        const cartInfo = await getCartInfo(token);
        console.log("Updated cart info:", cartInfo);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error('Error fetching cart info:', cartError);
        // Don't fail the whole operation if cart info fetch fails
      }

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

  // Show confirmation modal for package removal
  const handleRemovePackage = (packageId: number) => {
    setShowConfirmModal({ type: 'package', id: packageId });
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

      // Fetch updated cart info after successful removal
      try {
        const cartInfo = await getCartInfo(token);
        console.log("Updated cart info:", cartInfo);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error('Error fetching cart info:', cartError);
        // Don't fail the whole operation if cart info fetch fails
      }

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

  // Add this helper function to get all product IDs
  const getAllProductIds = (): number[] => {
    const productIds: number[] = [];
    cartData.additionalItems.forEach(itemGroup => {
      itemGroup.Items.forEach(item => {
        productIds.push(item.id);
      });
    });
    return productIds;
  };

  // Add these handler functions
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }

      // Update select all state
      const allProductIds = getAllProductIds();
      setSelectAll(allProductIds.length > 0 && allProductIds.every(id => newSet.has(id)));

      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allProductIds = getAllProductIds();

    if (selectAll) {
      // Deselect all
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      // Select all
      setSelectedProducts(new Set(allProductIds));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      alert('Please select products to delete');
      return;
    }

    setShowConfirmModal({
      type: 'bulk',
      id: 0,
      selectedIds: Array.from(selectedProducts)
    });
  };

  const confirmBulkDelete = async (productIds: any) => {
    try {
      setBulkDeleteLoading(true);

      // Debug logs
      console.log('=== BULK DELETE DEBUG ===');
      console.log('productIds received:', productIds);
      console.log('productIds type:', typeof productIds);
      console.log('productIds is array:', Array.isArray(productIds));
      console.log('productIds length:', productIds?.length);
      console.log('productIds content:', JSON.stringify(productIds));

      // Ensure productIds is an array of numbers
      let validProductIds: number[] = [];

      if (Array.isArray(productIds)) {
        validProductIds = productIds
          .map(id => parseInt(String(id), 10))
          .filter(id => !isNaN(id) && id > 0);
      } else {
        throw new Error('ProductIds must be an array');
      }

      console.log('validProductIds after processing:', validProductIds);

      if (validProductIds.length === 0) {
        throw new Error('No valid product IDs to delete');
      }

      // Call bulk delete API with validated array
      await bulkRemoveCartProducts(validProductIds, token);

      // Update Redux store
      validProductIds.forEach(productId => {
        dispatch(removeProduct(productId));
      });

      // Fetch updated cart info after successful removal
      try {
        const cartInfo = await getCartInfo(token);
        console.log("Updated cart info:", cartInfo);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error('Error fetching cart info:', cartError);
        // Don't fail the whole operation if cart info fetch fails
      }

      // Refresh cart data to ensure consistency
      const updatedCartData = await getUserCart(token);
      dispatch(setCartData({
        cart: updatedCartData.cart,
        packages: updatedCartData.packages,
        additionalItems: updatedCartData.additionalItems,
        summary: updatedCartData.summary,
      }));

      // Clear selections
      setSelectedProducts(new Set());
      setSelectAll(false);

      // // Show success message
      // alert(`Successfully removed ${validProductIds.length} items from cart`);

    } catch (error: any) {
      console.error('Error bulk deleting products:', error);
      alert(error.message || 'Failed to remove selected items. Please try again.');
    } finally {
      setBulkDeleteLoading(false);
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
      try {
        const cartInfo = await getCartInfo(token);
        console.log("Updated cart info:", cartInfo);
        dispatch(updateCartInfo(cartInfo));
      } catch (cartError) {
        console.error('Error fetching cart info:', cartError);

      }
      setShowDeliveryModal(true);

    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleContinueShopping = () => {
    if (buyerType === 'Wholesale') {
      router.push('/wholesale/home');
    } else {
      router.push('/');
    }
  };

  const handleDeliveryMethodSelect = (method: any) => {
    console.log('Selected delivery method:', method);
    setSelectedDeliveryMethod(method);
    setShowDeliveryModal(false);


    router.push(`/checkout?deliveryMethod=${method}`);
  };

  useEffect(() => {
    console.log('showDeliveryModal state:', showDeliveryModal);
  }, [showDeliveryModal]);

  // Add this helper function to calculate products total for a specific item group
  const calculateItemGroupTotal = (itemGroup: AdditionalItems): number => {
    return itemGroup.Items.reduce((total, item) => {
      const selectedUnit = unitSelection[item.id] || item.unit;
      // Use normalPrice instead of price for calculations
      const itemTotal = calculatePrice(item.normalPrice, selectedUnit, item.quantity);
      return total + itemTotal;
    }, 0);
  };

  useEffect(() => {
    console.log('showDeliveryModal changed:', showDeliveryModal);
  }, [showDeliveryModal]);

  // Updated selector for cart summary with proper unit calculations
  const getUpdatedCartSummary = () => {
    let totalItems = 0;
    let productTotal = 0;
    let totalDiscount = 0;
    let packageTotal = 0;

    // Calculate package totals
    if (cartData.packages) {
      cartData.packages.forEach(pkg => {
        packageTotal += pkg.price * pkg.quantity;
        totalItems += pkg.quantity;
      });
    }

    // Calculate product totals with unit conversions using normalPrice
    if (cartData.additionalItems) {
      cartData.additionalItems.forEach(itemGroup => {
        itemGroup.Items.forEach(item => {
          const selectedUnit = unitSelection[item.id] || item.unit;
          // Use normalPrice instead of price for calculations
          const itemPrice = calculatePrice(item.normalPrice, selectedUnit, item.quantity);
          const itemDiscount = calculateDiscount(item.discount, selectedUnit, item.quantity);

          productTotal += itemPrice;
          totalDiscount += itemDiscount;
          totalItems += 1; // Count each item as 1 regardless of quantity
        });
      });
    }

    const grandTotal = packageTotal + productTotal;
    const finalTotal = grandTotal - totalDiscount;

    return {
      totalItems,
      packageTotal,
      productTotal,
      totalDiscount,
      grandTotal,
      finalTotal
    };
  };

  const dynamicSummary = getUpdatedCartSummary();





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
        <div className="flex flex-col items-center justify-center py-8 px-4">
          {/* Empty Cart Image/Icon */}
          <div className="mb-6">
            <Image
              src={empty}
              alt="Empty Cart"
              width={256}
              height={256}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain"
              priority
            />
            <ShoppingCart
              size={80}
              className="text-gray-400 hidden"
            />
          </div>

          {/* Empty Cart Text */}
          <div className="text-center max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6">
              Looks like you haven't added any items to your cart yet.
              Start shopping to fill it up!
            </p>

            {/* Continue Shopping Button */}
            <button
              onClick={handleContinueShopping}
              className="bg-[#3E206D] text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-[#2F1A5B] transition-colors shadow-lg cursor-pointer"
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
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <p className="text-lg font-medium mb-6">
              {showConfirmModal.type === 'bulk'
                ? `Are you sure you want to remove ${showConfirmModal.selectedIds?.length} selected products?`
                : `Are you sure you want to remove this package?`
              }
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
                  if (showConfirmModal.type === 'bulk') {
                    confirmBulkDelete(showConfirmModal.selectedIds || []);
                  } else {
                    confirmRemovePackage(showConfirmModal.id);
                  }
                  setShowConfirmModal(null);
                }}
                disabled={showConfirmModal.type === 'bulk' && bulkDeleteLoading}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {showConfirmModal.type === 'bulk' && bulkDeleteLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#3E206D] p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setShowDeliveryModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 border border-white  p-1 hover:border-gray-300 cursor-pointer"
            >
              <X size={15} />
            </button>
            <h2 className="text-white text-2xl font-semibold text-center mb-8">
              Select a method
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* In-store Pickup Option */}
              <button
                onClick={() => handleDeliveryMethodSelect('pickup')}
                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <div className="mb-4">
                  <Image
                    src={pickup}
                    alt="Store Pickup"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-lg">INSTORE</p>
                  <p className="font-semibold text-gray-800 text-lg">PICKUP</p>
                </div>
              </button>

              {/* Home Delivery Option */}
              <button
                onClick={() => handleDeliveryMethodSelect('delivery')}
                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <div className="mb-4">
                  <Image
                    src={delivery}
                    alt="Home Delivery"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-lg">HOME</p>
                  <p className="font-semibold text-gray-800 text-lg">DELIVERY</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-5'>
        <TopNavigation NavArray={NavArray} />

        <div className='flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 items-start'>
          <div className='w-full lg:w-2/3'>
            {cartData.additionalItems.map((itemGroup: AdditionalItems) => (
              <div key={itemGroup.id} className='my-4 sm:my-6 lg:my-8'>
                {/* Header section with package name on left, total on right */}
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center gap-2'>
                    <p className='text-[20px] font-normal text-gray-700'>
                      Your {itemGroup.packageName}
                    </p>
                  </div>

                  {/* Total price in right corner */}
                  <span className='text-lg font-bold text-[#3E206D]'>
                    Rs. {formatPrice(calculateItemGroupTotal(itemGroup))}
                  </span>
                </div>

                {/* Full width horizontal line */}
                <div className='w-full h-0.5 bg-[#9E8FB5] mb-2'></div>

                {/* Bulk Delete Button - Only show when items are selected */}
                {selectedProducts.size > 0 && (
                  <div className='flex justify-end mb-4 '>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteLoading}
                      className='flex items-center gap-2 text-[#FF000D] px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
                    >
                      <Trash size={20} fill="red" strokeWidth={2} />
                      <span className='text-sm underline'>
                        Delete Selected Items
                      </span>
                    </button>
                  </div>
                )}


                {/* Updated table design to match UI */}
                <div className="bg-white rounded-xl border border-[#CFCFCF] overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <table className="w-full">
                        <thead className=" border-b border-gray-200 font-bold">
                          <tr>
                            <th className="p-4 text-left">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                checked={selectAll}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ITEM
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              UNIT
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              QUANTITY
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              DISCOUNT
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PRICE
                            </th>
                            <th className="px-4 py-3 text-center w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {itemGroup.Items.map((item) => {
                            const selectedUnit = unitSelection[item.id] || item.unit;
                            const isRemoving = removingItems.has(`product-${item.id}`);
                            const isSelected = selectedProducts.has(item.id);

                            return (
                              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isRemoving ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}>
                                <td className="p-4">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                    checked={isSelected}
                                    onChange={() => handleSelectProduct(item.id)}
                                    disabled={isRemoving}
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.src = '/placeholder-image.jpg'; // Add a fallback image
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex gap-1 justify-center">
                                    {(['kg', 'g'] as const).map(unit => (
                                      <button
                                        key={unit}
                                        onClick={() => handleUnitChange(item.id, unit)}
                                        disabled={isRemoving}
                                        className={`px-3 py-1 text-sm rounded-md border transition-colors cursor-pointer ${selectedUnit === unit
                                          ? 'bg-purple-100 text-purple-700 border-purple-300 font-medium'
                                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        {unit}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-4 relative">
                                  <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-32 mx-auto bg-white'>
                                    <div className="relative">
                                      <button
                                        onClick={() => handleProductQuantityChange(item.id, -1)}
                                        disabled={isRemoving}
                                        className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                      >
                                        <Minus size={14} />
                                      </button>

                                      {/* Tooltip */}
                                      {tooltipStates[item.id] && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                                          <div className="bg-[#191D28] text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                            {tooltipStates[item.id] === 'min' ? (
                                              <>
                                                Minimum quantity is {(() => {
                                                  const selectedUnit = unitSelection[item.id] || item.unit;
                                                  let startValue = item.startValue || 1;

                                                  if (selectedUnit === 'g' && item.unit === 'kg') {
                                                    startValue = parseFloat((startValue * 1000).toFixed(3));
                                                  } else if (selectedUnit === 'kg' && item.unit === 'g') {
                                                    startValue = parseFloat((startValue / 1000).toFixed(3));
                                                  }

                                                  return parseFloat(startValue.toFixed(3));
                                                })()} {unitSelection[item.id] || item.unit}
                                              </>
                                            ) : (
                                              <>
                                                Maximum quantity is {(() => {
                                                  const selectedUnit = unitSelection[item.id] || item.unit;
                                                  let maxValue = item.maxQuantity || Infinity;

                                                  if (maxValue !== Infinity && selectedUnit !== item.unit) {
                                                    if (selectedUnit === 'g' && item.unit === 'kg') {
                                                      maxValue = parseFloat((maxValue * 1000).toFixed(3));
                                                    } else if (selectedUnit === 'kg' && item.unit === 'g') {
                                                      maxValue = parseFloat((maxValue / 1000).toFixed(3));
                                                    }
                                                  }

                                                  return parseFloat(maxValue.toFixed(3));
                                                })()} {unitSelection[item.id] || item.unit}
                                              </>
                                            )}

                                            {/* Tooltip arrow */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <span className="text-sm font-medium flex-1 text-center">
                                      {parseFloat(item.quantity.toFixed(3))}
                                    </span>

                                    <button
                                      onClick={() => handleProductQuantityChange(item.id, 1)}
                                      disabled={isRemoving}
                                      className="hover:bg-gray-100 p-1 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-sm font-medium text-[#3E206D]">
                                    Rs.{formatPrice(getDisplayDiscount(item))}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-sm font-bold text-[#212121]">
                                    Rs.{formatPrice(getDisplayPrice(item))}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <button
                                    onClick={() => handleRemoveProduct(item.id)}
                                    disabled={isRemoving}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    title={isRemoving ? 'Removing...' : 'Remove item'}
                                  >
                                    <Trash size={20} fill="red" strokeWidth={2} />
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
              </div>
            ))}


            <div className='space-y-4 sm:space-y-6 mt-6 sm:mt-8'>
              {cartData.packages.map((pkg) => {
                const isRemoving = removingItems.has(`package-${pkg.id}`);

                return (
                  <div key={pkg.id} className={`w-full ${isRemoving ? 'opacity-50' : ''}`}>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 pb-2 border-b border-gray-300 gap-2 sm:gap-0'>
                      <div className='flex items-center gap-3'>
                        <h3 className='text-[20px] font-normal text-[#252525] leading-relaxed'>
                          Your Selected Package : <span className='font-semibold'>{pkg.packageName}</span> ({pkg.totalItems} Items)
                        </h3>
                        <button
                          onClick={() => handleRemovePackage(pkg.id)}
                          disabled={isRemoving}
                          className='text-red-500 hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
                          title={isRemoving ? 'Removing...' : 'Remove package'}
                        >
                          <Trash size={20} fill="red" strokeWidth={2} />
                        </button>
                      </div>
                      <div className='flex items-center justify-end'>
                        <span className='text-base sm:text-lg font-bold text-[#3E206D]'>Rs. {formatPrice(pkg.price * pkg.quantity)}</span>
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
                  <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 border border-[gray] rounded-lg flex items-center justify-center">
                    <Image
                      src={summary}
                      alt="Shopping bag"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm sm:text-base">{dynamicSummary.totalItems} items</p>
                </div>
                <p className='font-semibold text-sm sm:text-base'>Rs.{formatPrice(dynamicSummary.grandTotal)}</p>
              </div>

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
                </div>
              )}

              {couponMessage && (
                <div className={`mt-2 text-sm p-2 rounded ${couponMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {couponMessage.text}
                </div>
              )}

              <div className='border-t border-dotted border-gray-300 my-3 sm:my-4' />

              <div className='space-y-2 mb-4'>
                <div className='flex justify-between text-sm sm:text-base'>
                  <p className='text-gray-600'>Total</p>
                  <p>Rs.{formatPrice(dynamicSummary.grandTotal)}</p>
                </div>

                {dynamicSummary.totalDiscount > 0 && (
                  <div className='flex justify-between text-sm sm:text-base'>
                    <p className='text-gray-600'>Discount</p>
                    <p className='text-gray-600'>Rs.{formatPrice(dynamicSummary.totalDiscount)}</p>
                  </div>
                )}

                <div className='border-t border-gray-200 pt-2'>
                  <div className='flex justify-between text-[20px] text-[#414347] font-semibold'>
                    <p>Grand Total</p>
                    <p>Rs.{formatPrice(dynamicSummary.finalTotal)}</p>
                  </div>
                </div>
              </div>


              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || isCartEmpty() || dynamicSummary.totalItems === 0}
                className='w-full bg-[#3E206D] text-white font-semibold rounded-lg py-3 text-sm sm:text-base hover:bg-[#2F1A5B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              >
                {checkoutLoading ? 'Processing...' : 'Checkout Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;