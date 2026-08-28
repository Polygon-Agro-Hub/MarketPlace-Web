// store.ts or store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import checkoutReducer from './slices/checkoutSlice';
import cartReducer from './slices/cartSlice'
import cartItemsReducer from './slices/cartItemsSlice'
import searchReducer from './slices/searchSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'checkout', 'cart', 'cartItems'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  checkout: checkoutReducer,
  cart: cartReducer,
  cartItems: cartItemsReducer,
  search: searchReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;