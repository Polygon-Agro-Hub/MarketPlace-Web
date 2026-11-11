// Gate for the order success page.
//
// Whoever places an order calls markOrderSuccess() right before navigating to
// SUCCESS_ROUTE. The success page only shows while that mark is fresh, and
// consumes it when the user leaves. Reaching the page any other way (Back
// button, typed URL) finds no mark, so it redirects to order history at once.

const KEY = "orderSuccessPending";
const TTL_MS = 15_000;

export const SUCCESS_ROUTE = "/payment/success";

export const markOrderSuccess = (): void => {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // storage unavailable: the success page will simply redirect to history
  }
};

export const hasPendingOrderSuccess = (): boolean => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return false;
    const markedAt = Number(raw);
    return Number.isFinite(markedAt) && Date.now() - markedAt < TTL_MS;
  } catch {
    return false;
  }
};

export const consumeOrderSuccess = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};