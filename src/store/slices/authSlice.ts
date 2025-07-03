import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  buyerType: string;
  image: string | null;
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  cart: CartInfo;
}

interface CartInfo {
  price: number;
  count: number;
}

const initialStateCart: CartInfo = {
  price: 0.00,
  count: 0
}

const initialState: AuthState = {
  token: null,
  user: null,
  cart: initialStateCart
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: UserData, cart: CartInfo }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.cart = action.payload.cart || initialStateCart;
    },
    updateCartInfo: (state, action: PayloadAction<CartInfo>) => {
      state.cart = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.cart = initialStateCart;
    },
  },
});

export const { setCredentials, updateCartInfo, logout } = authSlice.actions;

export default authSlice.reducer;