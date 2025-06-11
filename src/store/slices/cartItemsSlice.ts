import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItemDetails {
  id: number;
  cartItemId: number;
  productId?: number; // For additional items
  mpItemId?: number; // For package items
  name: string;
  displayName?: string;
  qty: number;
  unit: 'kg' | 'g';
  totalPrice: number;
  totalDiscount: number;
  originalPrice: number; // Base price per unit
  discountedPrice?: number;
  normalPrice?: number;
  itemType: 'additional' | 'package';
  packageId?: number;
  packageName?: string;
  image?: string;
  varietyNameEnglish?: string;
  category?: string;
  createdAt?: string;
  // For package items
  hasSpecialBadge?: boolean;
}

interface CartItemsState {
  items: CartItemDetails[];
  packages: any[]; // Store complete package data
  additionalItems: any[]; // Store complete additional items data
}

const initialState: CartItemsState = {
  items: [],
  packages: [],
  additionalItems: [],
};

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {
    setCartItems: (
      state,
      action: PayloadAction<{
        packages: any[];
        additionalItems: any[];
      }>
    ) => {
      const { packages, additionalItems } = action.payload;
      const allItems: CartItemDetails[] = [];

      // Store raw data
      state.packages = packages;
      state.additionalItems = additionalItems;

      // Process additional items
      additionalItems.forEach((itemGroup) => {
        itemGroup.Items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.id, // Use item ID as productId for additional items
            name: item.name,
            displayName: item.name,
            qty: item.quantity,
            unit: item.unit,
            totalPrice: item.price * item.quantity, // Calculate total price
            totalDiscount: item.discount * item.quantity, // Calculate total discount
            originalPrice: item.price,
            discountedPrice: item.discountedPrice,
            normalPrice: item.normalPrice,
            itemType: 'additional',
            image: item.image,
            varietyNameEnglish: item.varietyNameEnglish,
            category: item.category,
            createdAt: item.createdAt,
          });
        });
      });

      // Process package items
      packages.forEach((pkg) => {
        pkg.items.forEach((item: any) => {
          allItems.push({
            id: pkg.id, // Use package ID for package items
            cartItemId: pkg.cartItemId,
            mpItemId: pkg.id, // Package ID as mpItemId
            name: item.name,
            displayName: item.name,
            qty: item.quantity,
            unit: 'kg', // Default unit for package items
            totalPrice: pkg.price, // Package price
            totalDiscount: 0, // Packages might not have individual discounts
            originalPrice: pkg.price,
            itemType: 'package',
            packageId: pkg.id,
            packageName: pkg.packageName,
            image: pkg.image,
            hasSpecialBadge: item.hasSpecialBadge,
          });
        });
      });

      state.items = allItems;
    },

    updateCartItem: (
      state,
      action: PayloadAction<{
        id: number;
        qty: number;
        totalPrice: number;
        totalDiscount: number;
        discountedPrice?: number;
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

    removePackageItems: (state, action: PayloadAction<number>) => {
      // Remove all items belonging to a specific package
      state.items = state.items.filter(item => item.packageId !== action.payload);
      state.packages = state.packages.filter(pkg => pkg.id !== action.payload);
    },

    updateAdditionalItemQuantity: (
      state,
      action: PayloadAction<{
        itemId: number;
        newQuantity: number;
        newTotalPrice: number;
        newTotalDiscount: number;
      }>
    ) => {
      const { itemId, newQuantity, newTotalPrice, newTotalDiscount } = action.payload;
      
      // Update in items array
      const itemIndex = state.items.findIndex(item => item.id === itemId && item.itemType === 'additional');
      if (itemIndex !== -1) {
        state.items[itemIndex].qty = newQuantity;
        state.items[itemIndex].totalPrice = newTotalPrice;
        state.items[itemIndex].totalDiscount = newTotalDiscount;
      }

      // Update in additionalItems array
      state.additionalItems.forEach(itemGroup => {
        const item = itemGroup.Items.find((item: any) => item.id === itemId);
        if (item) {
          item.quantity = newQuantity;
        }
      });
    },

    clearCartItems: (state) => {
      state.items = [];
      state.packages = [];
      state.additionalItems = [];
    },
  },
});

export const { 
  setCartItems, 
  updateCartItem, 
  removeCartItem, 
  removePackageItems,
  updateAdditionalItemQuantity,
  clearCartItems 
} = cartItemsSlice.actions;

export default cartItemsSlice.reducer;