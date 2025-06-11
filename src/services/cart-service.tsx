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

// Get user's complete cart data
export const getUserCart = async (token: string | null): Promise<CartData> => {
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

// Update product quantity in cart
export const updateCartProductQuantity = async (
  productId: number,
  quantity: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.put(
      '/product/quantity',
      { productId, quantity },
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
    throw new Error(response.data?.message || 'Failed to update product quantity');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to update product quantity'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to update product quantity');
    }
  }
};

// Update package quantity in cart
export const updateCartPackageQuantity = async (
  packageId: number,
  quantity: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.put(
      '/product/package/quantity',
      { packageId, quantity },
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
    throw new Error(response.data?.message || 'Failed to update package quantity');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to update package quantity'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to update package quantity');
    }
  }
};

// Remove product from cart
export const removeCartProduct = async (
  productId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.delete(`/product/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(response.data?.message || 'Failed to remove product from cart');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to remove product from cart'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to remove product from cart');
    }
  }
};

// Remove package from cart
export const removeCartPackage = async (
  packageId: number,
  token: string | null
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.delete(`/product/package/${packageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(response.data?.message || 'Failed to remove package from cart');
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        'Failed to remove package from cart'
      );
    } else if (error.request) {
      throw new Error('No response from server. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to remove package from cart');
    }
  }
};