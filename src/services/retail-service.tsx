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
  addressKey: string; // e.g. "apartment_12" or "house_5"
  buildingType: "Apartment" | "House";
  saveAs: string; // "Home", "Office", "Girlfriend's House", etc.
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

export const getRecentOrderAddress = async (token: string | null) => {
  try {
    const response = await axios.get("/retail-order/fetch-recent-order-address", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch recent order address." };
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
    throw error.response?.data || { message: "Failed to fetch saved addresses." };
  }
};