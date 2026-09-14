import axios from "@/lib/axios";
import { AxiosError } from "axios";

interface CartItem {
  id: number;
  cartItemId: number;
  name: string;
  unit: "kg" | "g";
  quantity: number;
  discount: number;
  price: number;
  normalPrice: number;
  discountedPrice: number | null;
  startValue: number;
  changeby: number;
  image: string;
  varietyNameEnglish: string;
  category: string;
  createdAt: string;
  isEnable?: number;
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
  status?: string;
  isValid?: number;
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
    creditBalance?: number;
  };
  packages: CartPackage[];
  additionalItems: {
    id: number;
    packageName: string;
    Items: CartItem[];
  }[];
  summary: CartSummary;
}

export const getUserCart = async (token: string | null): Promise<CartData> => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.get("/product/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    throw new Error("Failed to fetch cart data");
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error("Please login to view your cart");
      }
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to fetch cart data",
      );
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to fetch cart data");
    }
  }
};

export const updateCartProductQuantity = async (
  productId: number,
  quantity: number,
  token: string | null,
  unit?: string,
): Promise<void> => {
  if (!token) throw new Error("Authentication required");

  try {
    const response = await axios.put(
      "/product/quantity",
      { productId, quantity, unit },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status >= 200 && response.status < 300) return;
    throw new Error(response.data?.message || "Failed to update product quantity");
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || error.response.data?.error || "Failed to update product quantity");
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to update product quantity");
    }
  }
};

export const bulkRemoveCartProducts = async (
  productIds: number[],
  token: string | null,
): Promise<void> => {
  if (!token) {
    throw new Error("Authentication required");
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("Invalid product IDs provided");
  }

  const validIds = productIds
    .map((id) => parseInt(String(id), 10))
    .filter((id) => !isNaN(id) && id > 0);

  if (validIds.length === 0) {
    throw new Error("No valid product IDs provided");
  }

  try {
    const response = await axios.post(
      "/product/bulk-remove-products",
      { productIds: validIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status >= 200 && response.status < 300) {
      return;
    }

    throw new Error(
      response.data?.message || "Failed to remove products from cart",
    );
  } catch (error: any) {
    console.error("=== API ERROR DEBUG ===");
    console.error("Error object:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    } else {
      throw new Error(error.message || "Failed to remove products from cart");
    }
  }
};

export const updateCartPackageQuantity = async (
  packageId: number,
  quantity: number,
  token: string | null,
): Promise<void> => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.put(
      "/product/package/quantity",
      { packageId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(
      response.data?.message || "Failed to update package quantity",
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to update package quantity",
      );
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to update package quantity");
    }
  }
};

export const removeCartProduct = async (
  productId: number,
  token: string | null,
): Promise<void> => {
  if (!token) {
    throw new Error("Authentication required");
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
    throw new Error(
      response.data?.message || "Failed to remove product from cart",
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to remove product from cart",
      );
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to remove product from cart");
    }
  }
};

export const removeCartPackage = async (
  packageId: number,
  token: string | null,
): Promise<void> => {
  if (!token) {
    throw new Error("Authentication required");
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
    throw new Error(
      response.data?.message || "Failed to remove package from cart",
    );
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to remove package from cart",
      );
    } else if (error.request) {
      throw new Error("No response from server. Please try again.");
    } else {
      throw new Error(error.message || "Failed to remove package from cart");
    }
  }
};

export interface OrderPayload {
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
    flatNumber?: string;
    floorNumber?: string;
    houseNo?: string;
    street?: string;
    cityName: string;
    scheduleType: string;
    centerId?: number | null;
    couponValue: number;
    isCoupon: boolean;
    couponCode?: string;
    couponType?: string;
    geoLatitude?: number | null;
    geoLongitude?: number | null;
    saveAs?: string;
  };
  paymentMethod: "card" | "cash";
  discountAmount: number;
  grandTotal: number;
  orderApp: string;
  deliveryCharge?: number;
  isCreditApplied?: boolean;
  creditPaid: number;
  moneyPaid: number;
  isFinalizeImdt?: number;
}

export const submitOrderToBackend = async (
  payload: OrderPayload,
  token: string | null,
): Promise<any> => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.post("/cart/create-order", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Order service error:",
        error.response?.data || error.message,
      );

      const responseData = error.response?.data;
      if (responseData?.code === "ITEMS_UNAVAILABLE") {
        const codedError: any = new Error(responseData.error || "Some Items No Longer Available!");
        codedError.code = "ITEMS_UNAVAILABLE";
        throw codedError;
      }

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      throw new Error(`Order submission failed: ${errorMessage}`);
    }
    console.error("Order service error:", error);
    throw error;
  }
};

export const validateOrderData = (
  payload: OrderPayload,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !payload.paymentMethod ||
    !["card", "cash"].includes(payload.paymentMethod)
  ) {
    errors.push("Invalid payment method");
  }

  if (!payload.cartId || payload.cartId <= 0) {
    errors.push("Valid cart ID is required");
  }

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
    errors.push("Delivery method is required");
  }

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Valid full name is required (minimum 2 characters)");
  }

  if (!phoneCode1 || phoneCode1.trim().length === 0) {
    errors.push("Phone code 1 is required");
  }

  if (!phone1 || phone1.trim().length < 9) {
    errors.push("Valid phone number 1 is required (minimum 9 digits)");
  }

  if (!deliveryDate || deliveryDate.trim().length === 0) {
    errors.push("Delivery date is required");
  }

  if (!timeSlot || timeSlot.trim().length === 0) {
    errors.push("Time slot is required");
  }

  if (deliveryMethod === "home") {
    if (!cityName || cityName.trim().length < 2) {
      errors.push("City name is required for home delivery");
    }

    if (
      !buildingType ||
      !["apartment", "house", "Apartment", "House"].includes(buildingType)
    ) {
      errors.push("Valid building type is required (apartment or house)");
    }

    if (
      buildingType &&
      (buildingType.toLowerCase() === "apartment" ||
        buildingType === "Apartment")
    ) {
      if (!buildingNo || buildingNo.trim().length === 0) {
        errors.push("Building number is required for apartment delivery");
      }
      if (!buildingName || buildingName.trim().length === 0) {
        errors.push("Building name is required for apartment delivery");
      }
      if (!flatNumber || flatNumber.trim().length === 0) {
        errors.push("Flat number is required for apartment delivery");
      }
      if (!floorNumber || floorNumber.trim().length === 0) {
        errors.push("Floor number is required for apartment delivery");
      }
    }

    if (!houseNo || houseNo.trim().length === 0) {
      errors.push("House number is required for home delivery");
    }
    if (!street || street.trim().length === 0) {
      errors.push("Street name is required for home delivery");
    }
  } else if (deliveryMethod === "pickup") {
    if (!payload.checkoutDetails.centerId) {
      errors.push("Center ID is required for pickup delivery");
    }
  }

  if (!payload.grandTotal || payload.grandTotal <= 0) {
    errors.push("Valid grand total is required (must be greater than 0)");
  }

  if (payload.discountAmount == null || payload.discountAmount < 0) {
    errors.push("Valid discount amount is required (must be 0 or greater)");
  }

  if (
    payload.checkoutDetails.isCoupon &&
    payload.checkoutDetails.couponValue < 0
  ) {
    errors.push("Coupon value must be greater than 0 when coupon is applied");
  }

  if (
    !payload.checkoutDetails.isCoupon &&
    payload.checkoutDetails.couponValue > 0
  ) {
    errors.push("Coupon value should be 0 when no coupon is applied");
  }

  if (!payload.orderApp || payload.orderApp.trim().length === 0) {
    errors.push("Order app is required");
  }

  if (
    !payload.checkoutDetails.scheduleType ||
    payload.checkoutDetails.scheduleType.trim().length === 0
  ) {
    errors.push("Schedule type is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.map((error, index) => `${index + 1}. ${error}`).join("\n");
};

export const validateCartExists = async (
  cartId: number,
  token: string,
): Promise<boolean> => {
  try {
    const response = await axios.get(`/cart/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data && response.data.cartId === cartId;
  } catch (error) {
    console.error("Cart validation error:", error);
    return false;
  }
};

export interface PickupCenter {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  city: string;
  district: string;
  province?: string;
  country?: string;
  label: string;
  value: string;
}

export interface PickupCentersResponse {
  success: boolean;
  message: string;
  data: PickupCenter[];
  count: number;
}

export const getPickupCenters = async (): Promise<PickupCentersResponse> => {
  try {
    const response =
      await axios.get<PickupCentersResponse>("/cart/get-centers");

    return response.data;
  } catch (error: any) {
    console.error("Error fetching pickup centers:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch pickup centers",
    );
  }
};

export interface CouponValidationResponse {
  status: boolean;
  message: string;
  discount: number;
  type?: string;
}

export const validateCoupon = async (
  couponCode: string,
  token: string,
  deliveryMethod: string,
): Promise<CouponValidationResponse> => {
  try {
    const response = await axios.post(
      "/retail-order/check-coupon-avalability",
      {
        coupon: couponCode,
        deliveryMethod: deliveryMethod,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error validating coupon:", error);

    const errorMessage =
      error.response?.data?.message || "Failed to validate coupon";
    throw new Error(errorMessage);
  }
};

export interface City {
  id: number;
  companycenterId: number | null;
  city: string;
  charge: string;
  createdAt: string;
}

export interface CityResponse {
  success: boolean;
  message: string;
  count: number;
  data: City[];
}

export const getCities = async (): Promise<CityResponse> => {
  try {
    const response = await axios.get<CityResponse>("/cart/get-cities");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch cities");
  }
};

export interface CashPaymentLimitResponse {
  status: boolean;
  message: string;
  data: {
    totalCompletedOrdersAmount: number;
    cashPaymentLimit: number;
  };
}

export const getCashPaymentLimit = async (
  token: string | null,
): Promise<CashPaymentLimitResponse> => {
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.get<CashPaymentLimitResponse>(
      "/cart/cash-payment-limit",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching cash payment limit:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch cash payment limit",
    );
  }
};