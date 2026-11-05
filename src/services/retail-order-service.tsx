import axios from "@/lib/axios";

export interface PaymentPayload {
  paymentMethod: "card" | "cash";
  cartId: string;
  items: any[];
  checkoutDetails: any;
}

export const getRetailCart = async (
  token: string | null,
  userId: number,
): Promise<any> => {
  try {
    const response = await axios.get(`/cart/cart/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch cart details");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Failed with status ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error("No response received from server");
    } else {
      throw new Error(error.message || "An error occurred");
    }
  }
};

export const submitPayment = async (payload: PaymentPayload) => {
  try {
    const response = await axios.post("/cart/create-order", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120000,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to submit payment";
    throw new Error(message);
  }
};

export const getOrderHistory = async (
  token: string | null,
  filter: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  try {
    const response = await axios.get(
      `/retail-order/order-history?filter=${filter}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(response.data?.message || "Failed to fetch order history");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch order history"
    );
  }
};

export const getOrderDetails = async (
  token: string | null,
  orderId: string,
): Promise<any> => {
  try {
    const orderResponse = await axios.get(`/retail-order/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (orderResponse.status !== 200) {
      throw new Error(
        orderResponse.data?.message || "Failed to fetch order details",
      );
    }

    const packagesResponse = await axios.get(
      `/retail-order/order/packages/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (packagesResponse.status !== 200) {
      throw new Error(
        packagesResponse?.data?.message || "Failed to fetch package details",
      );
    }

    const additionalItemsResponse = await axios.get(
      `/retail-order/order/additional-items/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (additionalItemsResponse.status !== 200) {
      throw new Error(
        additionalItemsResponse?.data?.message ||
        "Failed to fetch additional items",
      );
    }

    return {
      order: orderResponse.data,
      packages: packagesResponse.data,
      additionalItems: additionalItemsResponse.data,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch order details",
    );
  }
};

export const getInvoice = async (
  token: string | null,
  orderId: string,
): Promise<any> => {
  try {
    const response = await axios.get(`/retail-order/invoice/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch invoice");
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to fetch invoice",
    );
  }
};

export interface OrderComplaint {
  id: number;
  refId: string;
  category: string;
  description: string;
  reply: string | null;
  status: string;
  replyTime: string | null;
  createdAt: string;
  images: { id: number; url: string }[];
}

export const getOrderComplaint = async (token: string, orderId: string): Promise<OrderComplaint> => {
  const response = await axios.get(`/retail-order/complaint/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.data?.status) {
    throw new Error(response.data?.message || "Failed to load complaint.");
  }
  return response.data.data;
};
