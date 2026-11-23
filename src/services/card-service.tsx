import axios from "@/lib/axios";

export type SavedCard = {
  cardId: string;
  scheme: string;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  holderName: string;
};

const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getSavedCard = async (token: string): Promise<SavedCard | null> => {
  const res = await axios.get("/payment/card", auth(token));
  return res.data?.data ?? null;
};

// Returns the Payments.lk hosted checkout URL where the customer pays and ticks "keep card"
export const startAddCard = async (token: string): Promise<string> => {
  const res = await axios.post(
    "/payment/card/add",
    { returnPath: window.location.pathname },
    auth(token)
  );
  return res.data.data.checkoutUrl;
};

export const removeSavedCard = async (token: string): Promise<void> => {
  await axios.delete("/payment/card", auth(token));
};