import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItemDetails {
  id: number;
  productId: number; // This will be either productId or mpItemId
  displayName: string;
  qty: string;
  unit: 'kg' | 'g';
  totalPrice: string;
  totalDiscount: string;
  discountedPrice?: string; // Optional, mainly for package items
  itemType: 'additional' | 'package';
  packageId?: number; // Optional, only for package items
}

interface CartItemsState {
  items: CartItemDetails[];
  cartId: number;
}

const initialState: CartItemsState = {
  items: [],
  cartId: 0,
};

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {
    setCartItems: (
      state,
      action: PayloadAction<{
        cartId: number;
        additionalItems: any[];
        packageItems: any[];
      }>
    ) => {
      const { cartId, additionalItems, packageItems } = action.payload;
      const allItems: CartItemDetails[] = [];

      // Process additional items
      additionalItems.forEach((item) => {
        allItems.push({
          id: item.id,
          productId: item.productId,
          displayName: item.displayName,
          qty: item.qty,
          unit: item.unit,
          totalPrice: item.totalPrice,
          totalDiscount: item.totalDiscount,
          itemType: 'additional',
        });
      });

      // Process package items
      packageItems.forEach((pkg) => {
        pkg.finalItems.forEach((item: any) => {
          allItems.push({
            id: item.id,
            productId: item.mpItemId, // mpItemId becomes productId
            displayName: item.displayName,
            qty: item.quantity,
            unit: 'kg', // Default unit for package items, you can modify this logic
            totalPrice: item.price,
            totalDiscount: item.discount,
            discountedPrice: item.discountedPrice,
            itemType: 'package',
            packageId: pkg.packageId,
          });
        });
      });

      state.items = allItems;
      state.cartId = cartId;
    },
    updateCartItem: (
      state,
      action: PayloadAction<{
        id: number;
        qty: string;
        totalPrice: string;
        totalDiscount: string;
        discountedPrice?: string;
      }>
    ) => {
      const { id, qty, totalPrice, totalDiscount, discountedPrice } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        state.items[itemIndex].qty = qty;
        state.items[itemIndex].totalPrice = totalPrice;
        state.items[itemIndex].totalDiscount = totalDiscount;
        if (discountedPrice !== undefined) {
          state.items[itemIndex].discountedPrice = discountedPrice;
        }
      }
    },
    removeCartItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCartItems: (state) => {
      state.items = [];
      state.cartId = 0;
    },
  },
});

export const { 
  setCartItems, 
  updateCartItem, 
  removeCartItem, 
  clearCartItems 
} = cartItemsSlice.actions;

export default cartItemsSlice.reducer;