import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItemDetails {
  id: number;
  cartItemId: number;
  productId?: number; // For additional items
  mpItemId?: number; // For package items
  name: string;
  displayName?: string;
  quantity: number; // Fixed: Changed from function to number
  qty: number;
  unit: 'kg' | 'g' | 'unit' | 'package'; // Added more unit types
  unitPrice: number; // Fixed: Added missing unitPrice property
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
  cartItemId: number;
  summary: any;
  cartId: number;
  items: CartItemDetails[];
  packages: any[]; // Store complete package data
  additionalItems: any[]; // Store complete additional items data
}

const initialState: CartItemsState = {
  cartItemId: 0,
  cartId: 0, // Fixed: Added missing initial value
  items: [],
  packages: [],
  additionalItems: [],
  summary: null, // Add this line (or use {} or another appropriate value)
};

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {
    setCartItems: (
      state,
      action: PayloadAction<{
        cartId?: number; // Added cartId to payload
        packages: any[];
        additionalItems: any[];
        summary?: any; // Added summary to payload
      }>
    ) => {
      const { cartId, packages, additionalItems, summary } = action.payload;
      const allItems: CartItemDetails[] = [];

      // Store raw data
      state.packages = packages;
      state.additionalItems = additionalItems;
      
      // Set cartId if provided
      if (cartId !== undefined) {
        state.cartId = cartId;
      }
      
      // Set summary if provided
      if (summary !== undefined) {
        state.summary = summary;
      }

      // Process additional items
      additionalItems.forEach((itemGroup) => {
        itemGroup.Items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.id, // Use item ID as productId for additional items
            name: item.name,
            displayName: item.name,
            quantity: item.quantity, // Fixed: Added quantity property
            qty: item.quantity,
            unit: item.unit || 'unit',
            unitPrice: item.price || 0, // Fixed: Added unitPrice property
            totalPrice: (item.price || 0) * (item.quantity || 1), // Calculate total price
            totalDiscount: (item.discount || 0) * (item.quantity || 1), // Calculate total discount
            originalPrice: item.price || 0,
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
            quantity: item.quantity || 1, // Fixed: Added quantity property
            qty: item.quantity || 1,
            unit: 'package', // Default unit for package items
            unitPrice: pkg.price || 0, // Fixed: Added unitPrice property
            totalPrice: pkg.price || 0, // Package price
            totalDiscount: 0, // Packages might not have individual discounts
            originalPrice: pkg.price || 0,
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

    setCartId: (state, action: PayloadAction<number>) => {
      state.cartId = action.payload;
    },

    // New action to set cart data including cartId
    setCartData: (
      state,
      action: PayloadAction<{
        cartId: number;
        packages: any[];
        additionalItems: any[];
        summary: any;
      }>
    ) => {
      const { cartId, packages, additionalItems, summary } = action.payload;
      
      // Set all cart data
      state.cartId = cartId;
      state.packages = packages;
      state.additionalItems = additionalItems;
      state.summary = summary;
      
      // Process items using the existing logic
      const allItems: CartItemDetails[] = [];

      // Process additional items
      additionalItems.forEach((itemGroup) => {
        itemGroup.Items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.id,
            name: item.name,
            displayName: item.name,
            quantity: item.quantity,
            qty: item.quantity,
            unit: item.unit || 'unit',
            unitPrice: item.price || 0,
            totalPrice: (item.price || 0) * (item.quantity || 1),
            totalDiscount: (item.discount || 0) * (item.quantity || 1),
            originalPrice: item.price || 0,
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
            id: pkg.id,
            cartItemId: pkg.cartItemId,
            mpItemId: pkg.id,
            name: item.name,
            displayName: item.name,
            quantity: item.quantity || 1,
            qty: item.quantity || 1,
            unit: 'package',
            unitPrice: pkg.price || 0,
            totalPrice: pkg.price || 0,
            totalDiscount: 0,
            originalPrice: pkg.price || 0,
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
        quantity: number;
        qty: number;
        totalPrice: number;
        totalDiscount: number;
        discountedPrice?: number;
      }>
    ) => {
      const { id, quantity, qty, totalPrice, totalDiscount, discountedPrice } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        state.items[itemIndex].quantity = quantity;
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
        state.items[itemIndex].quantity = newQuantity;
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
      state.cartId = 0;
      state.items = [];
      state.packages = [];
      state.additionalItems = [];
      state.summary = null;
    },
  },
});

export const { 
  setCartItems,
  setCartId,
  setCartData, // Export the new action
  updateCartItem, 
  removeCartItem, 
  removePackageItems,
  updateAdditionalItemQuantity,
  clearCartItems 
} = cartItemsSlice.actions;

export default cartItemsSlice.reducer;