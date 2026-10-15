import { OrderSummaryData } from "@/components/order-confirmation-components/UpdatedOrderSummary";
import { OrderDetailsData } from "@/components/order-confirmation-components/ViewOrderComponent";
import axios from "@/lib/axios";

interface fetchedFormData {
  deliveryMethod: string;
  title: string;
  fullName: string;
  phone1: string;
  phone2: string;
  buildingType: string;
  deliveryDate: string;
  timeSlot: string;
  phoneCode1: string;
  phoneCode2: string;
  buildingNo: string;
  buildingName: string;
  flatNo: string;
  floorNo: string;
  houseNo: string;
  streetName: string;
  city: string;
  scheduleType: string;
}

export interface SavedAddress {
  id: number;
  addressKey: string;
  buildingType: "Apartment" | "House";
  saveAs: string;
  title: string;
  fullName: string;
  phonecode1: string;
  phone1: string;
  phonecode2: string;
  phone2: string;
  longitude: number | null;
  latitude: number | null;
  buildingNo: string | null;
  buildingName: string | null;
  unitNo: string | null;
  floorNo: string | null;
  houseNo: string | null;
  streetName: string | null;
  city: string | null;
}

// export interface OrderConfirmationData {
//   invoiceNumber: string;
//   placedAt: string;
//   statusLabel: string;
//   confirmBefore: string;
//   schedule: { date: string; timeSlot: string };
//   summary: OrderSummaryData;
//   details: OrderDetailsData;
// }

export interface OrderConfirmationData {
  invoiceNumber: string;
  placedAt: string;
  statusLabel: string;
  confirmBefore: string;
  schedule: { date: string; timeSlot: string };
  summary: OrderSummaryData;
  details: OrderDetailsData;
  isConfirmed: boolean;
}

export interface PendingConfirmationOrder {
  processOrderId: number;
  invoiceNumber: string;
  visibleSince: string;
  status: string;
  updatedAt: string;
  msUntilClose: number;
}

export interface ConfirmOrderResult {
  paymentUrl?: string; // card payment: payments.lk page eka
  confirmed?: boolean; // cash / fully credit: direct confirm una
}

export const getRecentOrderAddress = async (token: string | null) => {
  try {
    const response = await axios.get(
      "/retail-order/fetch-recent-order-address",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || {
        message: "Failed to fetch recent order address.",
      }
    );
  }
};

export const getSavedAddresses = async (token: string | null) => {
  try {
    const response = await axios.get("/retail-order/fetch-saved-addresses", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to fetch saved addresses." }
    );
  }
};

export const getOrderConfirmation = async (
  token: string,
  processedOrderId: string,
): Promise<OrderConfirmationData> => {
  const res = await axios.get(
    `/retail-order/order-confirmation/${processedOrderId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data.data;
};

export const getPendingConfirmationOrder = async (
  token: string,
): Promise<PendingConfirmationOrder | null> => {
  const res = await axios.get(`/retail-order/pending-confirmation`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data ?? null;
};

export const confirmOrder = async (
  token: string,
  processedOrderId: string,
): Promise<ConfirmOrderResult> => {
  try {
    const res = await axios.post(
      `/retail-order/order-confirmation/${processedOrderId}/confirm`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to confirm order." };
  }
};

export const cancelOrder = async (token: string, processedOrderId: string) => {
  try {
    const res = await axios.post(
      `/retail-order/order-confirmation/${processedOrderId}/cancel`,
      {},
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to cancel order." };
  }
};
