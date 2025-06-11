import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string | null;
  // Additional fields to match your cart summary structure
  totalPackages: number;
  totalProducts: number;
  packageTotal: number;
  productTotal: number;
  couponDiscount: number;
  finalTotal: number;
}

const initialState: CartState = {
  totalItems: 0,
  totalPrice: 0,
  discountAmount: 0,
  grandTotal: 0,
  paymentMethod: null,
  totalPackages: 0,
  totalProducts: 0,
  packageTotal: 0,
  productTotal: 0,
  couponDiscount: 0,
  finalTotal: 0,
};

const cartSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    setCartDetails: (
      state,
      action: PayloadAction<{
        totalItems: number;
        totalPrice: number;
        discountAmount: number;
        grandTotal: number;
        totalPackages?: number;
        totalProducts?: number;
        packageTotal?: number;
        productTotal?: number;
        couponDiscount?: number;
        finalTotal?: number;
      }>
    ) => {
      const { 
        totalItems, 
        totalPrice, 
        discountAmount, 
        grandTotal,
        totalPackages = 0,
        totalProducts = 0,
        packageTotal = 0,
        productTotal = 0,
        couponDiscount = 0,
        finalTotal = grandTotal
      } = action.payload;
      
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.discountAmount = discountAmount;
      state.grandTotal = grandTotal;
      state.totalPackages = totalPackages;
      state.totalProducts = totalProducts;
      state.packageTotal = packageTotal;
      state.productTotal = productTotal;
      state.couponDiscount = couponDiscount;
      state.finalTotal = finalTotal;
    },
    
    // New action to set complete cart summary
    setCartSummary: (
      state,
      action: PayloadAction<{
        totalPackages: number;
        totalProducts: number;
        packageTotal: number;
        productTotal: number;
        grandTotal: number;
        totalItems: number;
        couponDiscount: number;
        finalTotal: number;
      }>
    ) => {
      const summary = action.payload;
      state.totalPackages = summary.totalPackages;
      state.totalProducts = summary.totalProducts;
      state.packageTotal = summary.packageTotal;
      state.productTotal = summary.productTotal;
      state.grandTotal = summary.grandTotal;
      state.totalItems = summary.totalItems;
      state.couponDiscount = summary.couponDiscount;
      state.finalTotal = summary.finalTotal;
      
      // Set legacy fields for backward compatibility
      state.totalPrice = summary.grandTotal;
      state.discountAmount = summary.couponDiscount;
    },
    
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    
    clearCart: (state) => {
      state.totalItems = 0;
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.grandTotal = 0;
      state.paymentMethod = null;
      state.totalPackages = 0;
      state.totalProducts = 0;
      state.packageTotal = 0;
      state.productTotal = 0;
      state.couponDiscount = 0;
      state.finalTotal = 0;
    },
  },
});

export const { setCartDetails, setCartSummary, setPaymentMethod, clearCart } = cartSlice.actions;

export default cartSlice.reducer;