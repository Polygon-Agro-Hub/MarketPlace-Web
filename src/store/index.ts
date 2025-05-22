// store.ts or slices/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import formReducer from './slices/formSlice';
import checkoutReducer from './slices/checkoutSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'form', 'checkout'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  form: formReducer,  
  checkout: checkoutReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Needed for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
