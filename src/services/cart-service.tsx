import axios from '@/lib/axios';

interface CartItem {
  id: number;
  cartItemId: number;
  name: string;
  unit: 'kg' | 'g';
  quantity: number;
  discount: number;
  price: number;
  normalPrice: number;
  discountedPrice: number | null;
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
}

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

interface CartData {
  cart: {
    cartId: number;
    userId: number;
    buyerType: string;
    isCoupon: number;
    couponValue: string;
    createdAt: string;
  } | null;
  packages: CartPackage[];
  additionalItems: {
    id: number;
    packageName: string;
    Items: CartItem[];
  }[];
  summary: CartSummary;
}

export const getCartData = async (token: string | null): Promise<CartData> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.get('/product/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch cart data');
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Please login to view your cart');
      }
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to fetch cart data'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to fetch cart data');
    }
  }
};

export const updateCartItemQuantity = async (
  cartItemId: number,
  quantity: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.put(
      '/product/update-cart-item-quantity',
      { cartItemId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(response.data?.message || 'Failed to update cart item quantity');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to update cart item quantity'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to update cart item quantity');
    }
  }
};

export const removeCartItem = async (cartItemId: number, token: string | null): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.delete('/product/remove-cart-item', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { cartItemId },
    });

    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(response.data?.message || 'Failed to remove cart item');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to remove cart item'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to remove cart item');
    }
  }
};