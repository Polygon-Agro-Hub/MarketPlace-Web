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
  // Remove items array - backend gets it from cartId
  cartId: number;
  checkoutDetails: {
    deliveryMethod: string;
    title: string;
    fullName: string;
    phoneCode1: string;
    phone1: string;
    phoneCode2?: string;
    phone2?: string;
    buildingType: string;
    deliveryDate: string;
    timeSlot: string;
    buildingNo?: string;
    buildingName?: string;
    flatNumber?: string;  // Maps to unitNo in backend
    floorNumber?: string; // Maps to floorNo in backend
    houseNo?: string;
    street?: string;      // Maps to streetName in backend
    cityName: string;     // Maps to city in backend
    scheduleType: string;
    centerId?: number | null;
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
    console.log('Submitting order payload:', payload);
    
    const response = await axios.post('/cart/create-order', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Order submission response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Order service error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message;
      throw new Error(`Order submission failed: ${errorMessage}`);
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

  // Validate cartId (backend will get items from this)
  if (!payload.cartId || payload.cartId <= 0) {
    errors.push('Valid cart ID is required');
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

  if (!deliveryMethod) {
    errors.push('Delivery method is required');
  }

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Valid full name is required (minimum 2 characters)');
  }

  if (!phoneCode1 || phoneCode1.trim().length === 0) {
    errors.push('Phone code 1 is required');
  }

  if (!phone1 || phone1.trim().length < 9) {
    errors.push('Valid phone number 1 is required (minimum 9 digits)');
  }

  if (!deliveryDate || deliveryDate.trim().length === 0) {
    errors.push('Delivery date is required');
  }

  if (!timeSlot || timeSlot.trim().length === 0) {
    errors.push('Time slot is required');
  }

  // Validate delivery method specific requirements
  if (deliveryMethod === 'home') {
    if (!cityName || cityName.trim().length < 2) {
      errors.push('City name is required for home delivery');
    }

    if (!buildingType || !['apartment', 'house'].includes(buildingType.toLowerCase())) {
      errors.push('Valid building type is required (apartment or house)');
    }

    if (buildingType && buildingType.toLowerCase() === 'apartment') {
      if (!buildingNo || buildingNo.trim().length === 0) {
        errors.push('Building number is required for apartment delivery');
      }
      if (!buildingName || buildingName.trim().length === 0) {
        errors.push('Building name is required for apartment delivery');
      }
      if (!flatNumber || flatNumber.trim().length === 0) {
        errors.push('Flat number is required for apartment delivery');
      }
      if (!floorNumber || floorNumber.trim().length === 0) {
        errors.push('Floor number is required for apartment delivery');
      }
    } else if (buildingType && buildingType.toLowerCase() === 'house') {
      if (!houseNo || houseNo.trim().length === 0) {
        errors.push('House number is required for house delivery');
      }
      if (!street || street.trim().length === 0) {
        errors.push('Street name is required for house delivery');
      }
    }
  } else if (deliveryMethod === 'pickup') {
    if (!payload.checkoutDetails.centerId) {
      errors.push('Center ID is required for pickup delivery');
    }
  }

  // Validate financial details
  if (!payload.grandTotal || payload.grandTotal <= 0) {
    errors.push('Valid grand total is required (must be greater than 0)');
  }

  if (payload.discountAmount == null || payload.discountAmount < 0) {
    errors.push('Valid discount amount is required (must be 0 or greater)');
  }

  // Validate coupon details consistency
  if (payload.checkoutDetails.isCoupon && payload.checkoutDetails.couponValue <= 0) {
    errors.push('Coupon value must be greater than 0 when coupon is applied');
  }

  if (!payload.checkoutDetails.isCoupon && payload.checkoutDetails.couponValue > 0) {
    errors.push('Coupon value should be 0 when no coupon is applied');
  }

  // Validate order app
  if (!payload.orderApp || payload.orderApp.trim().length === 0) {
    errors.push('Order app is required');
  }

  // Validate schedule type
  if (!payload.checkoutDetails.scheduleType || payload.checkoutDetails.scheduleType.trim().length === 0) {
    errors.push('Schedule type is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to format validation errors for display
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

// Helper function to validate cart exists (can be used before order submission)
export const validateCartExists = async (cartId: number, token: string): Promise<boolean> => {
  try {
    const response = await axios.get(`/cart/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data && response.data.cartId === cartId;
  } catch (error) {
    console.error('Cart validation error:', error);
    return false;
  }
};

// // Helper function to get cart summary for validation
// export const getCartSummary = async (cartId: number, token: string): Promise<any> => {
//   try {
//     const response = await axios.get(`/cart/${cartId}/summary`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Cart summary error:', error);
//     throw new Error('Failed to get cart summary');
//   }
// };