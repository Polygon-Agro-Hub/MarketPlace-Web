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
  tokenExpiration: number | null; // Unix timestamp
  user: UserData | null;
  cart: CartInfo;
}

interface CartInfo {
  price: number;
  count: number | null;
}

const initialStateCart: CartInfo = {
  price: 0.00,
  count: 0
}

const initialState: AuthState = {
  token: null,
  tokenExpiration: null,
  user: null,
  cart: initialStateCart
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: UserData, cart: CartInfo, tokenExpiration?: number }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.cart = action.payload.cart || initialStateCart;
      state.tokenExpiration = action.payload.tokenExpiration || null;
    },
    updateCartInfo: (state, action: PayloadAction<CartInfo>) => {
      state.cart = {
        price: action.payload.price || 0,
        count: action.payload.count === null ? 0 : action.payload.count
      };
    },
    logout: (state) => {
      state.token = null;
      state.tokenExpiration = null;
      state.user = null;
      state.cart = initialStateCart;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, updateCartInfo, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;