import axios from '@/lib/axios';
import { AxiosError } from 'axios';

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

interface Cart {
  cartId: number;
  userId: number;
  buyerType: string;
  isCoupon: number;
  couponValue: string;
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
  }; // Remove | null since it's always present
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



export interface OrderPayload {
  items: Array<{
    productId: number;
    unit: string;
    qty: number;
    totalDiscount: number;
    totalPrice: number;
    itemType: 'product' | 'package';
    packageId: number | null;
    id: number | null;
  }>;
  cartId: number;
  checkoutDetails: {
    deliveryMethod: string;
    title: string;
    fullName: string;
    phoneCode1: string;
    phone1: string;
    phoneCode2: string;
    phone2: string;
    buildingType: string;
    deliveryDate: string;
    timeSlot: string;
    buildingNo: string;
    buildingName: string;
    flatNumber: string;
    floorNumber: string;
    houseNo: string;
    street: string;
    cityName: string;
    scheduleType: string;
    centerId: number | null;
    couponValue: number;
    isCoupon: boolean;
  };
  paymentMethod: 'card' | 'cash';
  discountAmount: number;
  grandTotal: number;
  orderApp: string;
}

export const submitOrderToBackend = async (
  payload: OrderPayload,
  token: string | null
): Promise<any> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.post('/cart/create-order', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Order service error:', error.response?.data || error.message);
      throw new Error(`Order submission failed: ${error.response?.data?.error || error.message}`);
    }
    console.error('Order service error:', error);
    throw error;
  }
};

export const validateOrderData = (payload: OrderPayload): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate payment method
  if (!payload.paymentMethod || !['card', 'cash'].includes(payload.paymentMethod)) {
    errors.push('Invalid payment method');
  }

  // Validate items
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Items must be a non-empty array');
  } else {
    payload.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item at index ${index}: Product ID is required`);
      }
      if (!item.unit) {
        errors.push(`Item at index ${index}: Unit is required`);
      }
      if (!item.qty || item.qty <= 0) {
        errors.push(`Item at index ${index}: Valid quantity is required`);
      }
      if (item.totalPrice == null || item.totalPrice < 0) {
        errors.push(`Item at index ${index}: Valid total price is required`);
      }
      if (item.itemType === 'package' && !item.packageId) {
        errors.push(`Item at index ${index}: Package ID is required for package items`);
      }
    });
  }

  // Validate cartId
  if (!payload.cartId) {
    errors.push('Cart ID is required');
  }

  // Validate checkout details
  const {
    deliveryMethod,
    title,
    fullName,
    phone1,
    phoneCode1,
    deliveryDate,
    timeSlot,
    cityName,
    buildingType,
    buildingNo,
    buildingName,
    flatNumber,
    floorNumber,
    houseNo,
    street,
  } = payload.checkoutDetails;

  if (!deliveryMethod || !['home', 'pickup'].includes(deliveryMethod)) {
    errors.push('Valid delivery method is required');
  }

  if (!title) {
    errors.push('Title is required');
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Valid full name is required');
  }

  if (!phoneCode1) {
    errors.push('Phone code 1 is required');
  }

  if (!phone1 || phone1.trim().length < 9) {
    errors.push('Valid phone number 1 is required');
  }

  if (!deliveryDate) {
    errors.push('Delivery date is required');
  }

  if (!timeSlot) {
    errors.push('Time slot is required');
  }

  if (deliveryMethod === 'home') {
    if (!cityName || cityName.trim().length < 2) {
      errors.push('City name is required');
    }

    if (!buildingType || !['apartment', 'house'].includes(buildingType.toLowerCase())) {
      errors.push('Valid building type is required (apartment or house)');
    }

    if (buildingType.toLowerCase() === 'apartment') {
      if (!buildingNo) {
        errors.push('Building number is required for apartment delivery');
      }
      if (!buildingName) {
        errors.push('Building name is required for apartment delivery');
      }
      if (!flatNumber) {
        errors.push('Flat number is required for apartment delivery');
      }
      if (!floorNumber) {
        errors.push('Floor number is required for apartment delivery');
      }
    } else if (buildingType.toLowerCase() === 'house') {
      if (!houseNo) {
        errors.push('House number is required for house delivery');
      }
      if (!street) {
        errors.push('Street name is required for house delivery');
      }
    }
  }

  // Validate financial details
  if (!payload.grandTotal || payload.grandTotal <= 0) {
    errors.push('Valid grand total is required');
  }

  if (payload.discountAmount == null || payload.discountAmount < 0) {
    errors.push('Valid discount amount is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};