import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface CartItem {
  id: number;
  cartItemId: number;
  productId?: number;
  name: string;
  unit: 'kg' | 'g' | 'unit' | 'package';
  quantity: number;
  discount: number;
  price: number;
  normalPrice: number;
  discountedPrice: number | null; // Changed from 'number | undefined' to 'number | null'
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
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
  grandTotal: number;
  totalItems: number;
  couponDiscount: number;
  finalTotal: number;
}

interface CartItemDetails {
  id: number;
  cartItemId: number;
  productId?: number;
  mpItemId?: number;
  name: string;
  displayName?: string;
  quantity: number;
  qty: number;
  unit: 'kg' | 'g' | 'unit' | 'package';
  unitPrice: number;
  totalPrice: number;
  totalDiscount: number;
  originalPrice: number;
  discountedPrice?: number | null; // Changed from 'number | undefined' to 'number | null'
  normalPrice?: number;
  itemType: 'additional' | 'package';
  packageId?: number;
  packageName?: string;
  image?: string;
  varietyNameEnglish?: string;
  category?: string;
  createdAt?: string;
  hasSpecialBadge?: boolean;
}

interface CartState {
  cartId: number;
  packages: CartPackage[];
  additionalItems: AdditionalItems[];
  summary: CartSummary | null;
  items: CartItemDetails[];
}

const initialState: CartState = {
  cartId: 0,
  packages: [],
  additionalItems: [],
  summary: null,
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartData: (
      state,
      action: PayloadAction<{
        cartId?: number;
        packages: CartPackage[];
        additionalItems: AdditionalItems[];
        summary: CartSummary;
      }>
    ) => {
      const { cartId, packages, additionalItems, summary } = action.payload;
      
      if (cartId) state.cartId = cartId;
      state.packages = packages;
      state.additionalItems = additionalItems;
      state.summary = summary;

      const allItems: CartItemDetails[] = [];

      additionalItems.forEach((itemGroup) => {
        itemGroup.Items.forEach((item) => {
          const unitPrice = item.unit === 'g' ? item.price / 1000 : item.price;
          const totalPrice = unitPrice * item.quantity;
          const totalDiscount = item.discount ? 
            (item.unit === 'g' ? (item.discount / 1000) * item.quantity : item.discount * item.quantity) : 0;

          allItems.push({
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.id,
            name: item.name,
            displayName: item.name,
            quantity: item.quantity,
            qty: item.quantity,
            unit: item.unit,
            unitPrice,
            totalPrice,
            totalDiscount,
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

      packages.forEach((pkg) => {
        pkg.items.forEach((item) => {
          allItems.push({
            id: pkg.id,
            cartItemId: pkg.cartItemId,
            mpItemId: pkg.id,
            name: item.name,
            displayName: item.name,
            quantity: item.quantity,
            qty: item.quantity,
            unit: 'package',
            unitPrice: pkg.price,
            totalPrice: pkg.price,
            totalDiscount: 0,
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

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{
        itemId: number;
        newQuantity: number;
        itemType: 'additional' | 'package';
      }>
    ) => {
      const { itemId, newQuantity, itemType } = action.payload;

      if (itemType === 'additional') {
        // Update items array
        const itemIndex = state.items.findIndex(
          (item) => item.id === itemId && item.itemType === 'additional'
        );
        if (itemIndex !== -1) {
          const item = state.items[itemIndex];
          const unitPrice = item.unit === 'g' ? item.originalPrice / 1000 : item.originalPrice;

          // Find the corresponding CartItem to get the discount
          let discount = 0;
          state.additionalItems.forEach((itemGroup) => {
            const cartItem = itemGroup.Items.find((i: CartItem) => i.id === itemId);
            if (cartItem) {
              discount = cartItem.discount;
            }
          });

          item.quantity = newQuantity;
          item.qty = newQuantity;
          item.totalPrice = unitPrice * newQuantity;
          item.totalDiscount = discount ? 
            (item.unit === 'g' ? (discount / 1000) * newQuantity : discount * newQuantity) : 0;
        }

        // Update additionalItems array
        state.additionalItems.forEach((itemGroup) => {
          const item = itemGroup.Items.find((i: CartItem) => i.id === itemId);
          if (item) {
            item.quantity = newQuantity;
          }
        });
      }
    },

    removeCartItem: (
      state,
      action: PayloadAction<{
        itemId: number;
        itemType: 'additional' | 'package';
      }>
    ) => {
      const { itemId, itemType } = action.payload;

      if (itemType === 'additional') {
        state.items = state.items.filter(
          (item) => !(item.id === itemId && item.itemType === 'additional')
        );
        state.additionalItems = state.additionalItems
          .map((group) => ({
            ...group,
            Items: group.Items.filter((i: CartItem) => i.id !== itemId),
          }))
          .filter((group) => group.Items.length > 0);
      } else {
        state.items = state.items.filter(
          (item) => !(item.packageId === itemId && item.itemType === 'package')
        );
        state.packages = state.packages.filter((pkg) => pkg.id !== itemId);
      }
    },

    updateSummary: (
      state,
      action: PayloadAction<Partial<CartSummary>>
    ) => {
      if (state.summary) {
        state.summary = { ...state.summary, ...action.payload };
      }
    },

    clearCart: (state) => {
      return initialState;
    },
  },
});

export const {
  setCartData,
  updateCartItemQuantity,
  removeCartItem,
  updateSummary,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;