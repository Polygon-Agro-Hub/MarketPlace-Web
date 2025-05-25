import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  grandTotal: number;
}

const initialState: CartState = {
  totalItems: 0,
  totalPrice: 0,
  discountAmount: 0,
  grandTotal: 0,
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
      }>
    ) => {
      const { totalItems, totalPrice, discountAmount, grandTotal } = action.payload;
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.discountAmount = discountAmount;
      state.grandTotal = grandTotal;
    },
    clearCart: (state) => {
      state.totalItems = 0;
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.grandTotal = 0;
    },
  },
});

export const { setCartDetails, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
