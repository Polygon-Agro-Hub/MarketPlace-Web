import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

interface CartItem {
  id: number;
  cartItemId: number;
  name: string;
  unit: 'kg' | 'g';
  quantity: number;
  discount: number; // Per kg discount
  price: number; // Per kg price
  normalPrice: number;
  discountedPrice: number | null;
  startValue: number; // Added from API response
  changeby: number;   // Added from API response
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
}

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

interface AdditionalItems {
  id: number;
  packageName: string;
  Items: CartItem[];
}

interface CartSummary {
  totalPackages: number;
  totalProducts: number;
  packageTotal: number;
  productTotal: number;
  couponDiscount: number;
  grandTotal?: number;
  totalDiscount?: number;
  finalTotal?: number;
  totalItems?: number;
}

interface Cart {
  cartId: number;
  userId: number;
  buyerType: string;
  isCoupon: number;
  couponValue: string;
  createdAt: string;
}

interface CartItemsState {
  cartId: number;
  cart: Cart | null;
  packages: CartPackage[];
  additionalItems: AdditionalItems[];
  summary: CartSummary | null;
  // Calculated values for order creation
  calculatedSummary: {
    grandTotal: number;
    totalDiscount: number;
    finalTotal: number;
    totalItems: number;
  } | null;
}

// Define RootState type for the selector
interface RootState {
  cartItems: CartItemsState;
}

const initialState: CartItemsState = {
  cartId: 0,
  cart: null,
  packages: [],
  additionalItems: [],
  summary: null,
  calculatedSummary: null,
};

// Helper function to calculate price based on unit and quantity
const calculatePrice = (basePrice: number, unit: 'kg' | 'g', quantity: number): number => {
  const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
  return basePrice * quantityInKg;
};

// Helper function to calculate discount based on unit and quantity
const calculateDiscount = (baseDiscount: number, unit: 'kg' | 'g', quantity: number): number => {
  const quantityInKg = unit === 'g' ? quantity / 1000 : quantity;
  return baseDiscount * quantityInKg;
};

// Helper function to calculate summary
const calculateSummary = (
  packages: CartPackage[],
  additionalItems: AdditionalItems[],
  couponDiscount: number = 0
) => {
  // Calculate package total
  const packageTotal = packages.reduce((sum, pkg) => sum + (pkg.price * pkg.quantity), 0);
  
  // Calculate product total and discount
  let productTotal = 0;
  let productDiscount = 0;
  let totalProducts = 0;

  additionalItems.forEach(group => {
    group.Items.forEach(item => {
      // Use normalPrice instead of price for calculations
      const itemPrice = calculatePrice(item.normalPrice, item.unit, item.quantity);
      const itemDiscount = calculateDiscount(item.discount, item.unit, item.quantity);
      
      productTotal += itemPrice;
      productDiscount += itemDiscount;
      totalProducts += 1;
    });
  });

  const grandTotal = packageTotal + productTotal;
  const totalDiscount = productDiscount + couponDiscount;
  const finalTotal = grandTotal - totalDiscount;
  const totalItems = packages.length + totalProducts;

  return {
    packageTotal,
    productTotal,
    grandTotal,
    totalDiscount,
    finalTotal,
    totalItems,
    couponDiscount,
    totalPackages: packages.length,
    totalProducts,
  };
};

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {
    setCartData: (
      state,
      action: PayloadAction<{
        cart: Cart;
        packages: CartPackage[];
        additionalItems: AdditionalItems[];
        summary: CartSummary;
      }>
    ) => {
      const { cart, packages, additionalItems, summary } = action.payload;
      
      state.cartId = cart.cartId;
      state.cart = cart;
      state.packages = packages;
      state.additionalItems = additionalItems;
      state.summary = summary;
      
      // Calculate the summary for order creation
      const calculated = calculateSummary(packages, additionalItems, summary.couponDiscount);
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    updateProductQuantity: (
      state,
      action: PayloadAction<{
        productId: number;
        newQuantity: number;
      }>
    ) => {
      const { productId, newQuantity } = action.payload;
      
      // Update in additionalItems array
      state.additionalItems = state.additionalItems.map(group => ({
        ...group,
        Items: group.Items.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ),
      }));

      // Recalculate summary
      const calculated = calculateSummary(
        state.packages, 
        state.additionalItems, 
        state.summary?.couponDiscount || 0
      );
      
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    // New reducer to handle unit change with quantity conversion
    updateProductUnit: (
      state,
      action: PayloadAction<{
        productId: number;
        newUnit: 'kg' | 'g';
        newQuantity: number;
      }>
    ) => {
      const { productId, newUnit, newQuantity } = action.payload;
      
      // Update both unit and quantity in additionalItems array
      state.additionalItems = state.additionalItems.map(group => ({
        ...group,
        Items: group.Items.map(item =>
          item.id === productId 
            ? { ...item, unit: newUnit, quantity: newQuantity } 
            : item
        ),
      }));

      // Recalculate summary
      const calculated = calculateSummary(
        state.packages, 
        state.additionalItems, 
        state.summary?.couponDiscount || 0
      );
      
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    removeProduct: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      
      // Remove from additionalItems array
      state.additionalItems = state.additionalItems
        .map(group => ({
          ...group,
          Items: group.Items.filter(item => item.id !== productId),
        }))
        .filter(group => group.Items.length > 0);

      // Recalculate summary
      const calculated = calculateSummary(
        state.packages, 
        state.additionalItems, 
        state.summary?.couponDiscount || 0
      );
      
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    removePackage: (state, action: PayloadAction<number>) => {
      const packageId = action.payload;
      
      // Remove from packages array
      state.packages = state.packages.filter(pkg => pkg.id !== packageId);

      // Recalculate summary
      const calculated = calculateSummary(
        state.packages, 
        state.additionalItems, 
        state.summary?.couponDiscount || 0
      );
      
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    applyCoupon: (
      state,
      action: PayloadAction<{
        couponValue: number;
        isCoupon: boolean;
      }>
    ) => {
      const { couponValue, isCoupon } = action.payload;
      
      if (state.summary) {
        state.summary.couponDiscount = isCoupon ? couponValue : 0;
      }
      
      if (state.cart) {
        state.cart.isCoupon = isCoupon ? 1 : 0;
        state.cart.couponValue = couponValue.toString();
      }

      // Recalculate summary
      const calculated = calculateSummary(
        state.packages, 
        state.additionalItems, 
        isCoupon ? couponValue : 0
      );
      
      state.calculatedSummary = {
        grandTotal: calculated.grandTotal,
        totalDiscount: calculated.totalDiscount,
        finalTotal: calculated.finalTotal,
        totalItems: calculated.totalItems,
      };
    },

    clearCart: (state) => {
      state.cartId = 0;
      state.cart = null;
      state.packages = [];
      state.additionalItems = [];
      state.summary = null;
      state.calculatedSummary = null;
    },
  },
});

export const { 
  setCartData,
  updateProductQuantity,
  updateProductUnit, // New export
  removeProduct,
  removePackage,
  applyCoupon,
  clearCart
} = cartItemsSlice.actions;

export default cartItemsSlice.reducer;

// Selectors for easy access to calculated values
export const selectCartSummary = (state: { cartItems: CartItemsState }) => state.cartItems.calculatedSummary;

export const selectCartForOrder = createSelector(
  [(state: RootState) => state.cartItems],
  (cartItems) => {
    // Return null if no cart or cart ID
    if (!cartItems?.cart?.cartId) {
      return null;
    }

    // Return null if no items
    const hasItems = (cartItems.additionalItems && cartItems.additionalItems.length > 0) ||
                    (cartItems.packages && cartItems.packages.length > 0);
         
    if (!hasItems) {
      return null;
    }

    // Use calculated summary if available (preferred)
    if (cartItems.calculatedSummary) {
      return {
        cartId: cartItems.cart.cartId,
        grandTotal: cartItems.calculatedSummary.grandTotal || 0,
        discountAmount: cartItems.calculatedSummary.totalDiscount || 0,
        totalItems: cartItems.calculatedSummary.totalItems || 0,
        finalTotal: cartItems.calculatedSummary.finalTotal || 0
      };
    }

    // Use summary data if available (fallback)
    if (cartItems.summary) {
      return {
        cartId: cartItems.cart.cartId,
        grandTotal: cartItems.summary.grandTotal || 0,
        discountAmount: cartItems.summary.totalDiscount || 0,
        totalItems: cartItems.summary.totalItems || 0,
        finalTotal: cartItems.summary.finalTotal || cartItems.summary.grandTotal || 0
      };
    }

    // Final fallback calculation if no summary is available
    return {
      cartId: cartItems.cart.cartId,
      grandTotal: 0,
      discountAmount: 0,
      totalItems: 0,
      finalTotal: 0
    };
  }
);