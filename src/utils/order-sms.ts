// utils/order-sms.ts
import { parseDateStr, formatOrderDate } from "@/utils/schedule";

// ASSUMPTION (confirm with your team): Processing Date = delivery date - 3 days.
// Derived from the 2-day gap rule and the "review 2 days before delivery" copy
// (Processing Date + 1 = delivery date - 2). Change this one constant if it differs.
export const PROCESSING_OFFSET_DAYS = 3;

export type PayMode = "cash" | "card" | "credit"; // cash = Cash or Cash+Credit, card = Card or Card+Credit, credit = Full Credit

export interface OrderSmsContext {
  scheduleType: string;            // only "One Time" is covered by the flowchart
  deliveryDate: string | null;     // "YYYY-MM-DD" chosen by the customer
  earliestDate: string | null;     // "YYYY-MM-DD" EPSD from getCheckoutScheduleInfo
  isReviewPackage: boolean;        // pre-made package(s) + "Review before delivery"
  payMode: PayMode;
  invNo?: string | number | null;  // needed for "confirmed" messages
}

const shift = (dateStr: string, days: number): Date => {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return d;
};

const requestIntro = (date: Date): string =>
  `Dear Customer, You'll receive an order confirmation request via the Polygon Platform by 8:00 AM on ${formatOrderDate(date)}.`;

// "Order confirmed" SMS. Also use this after payment succeeds / the customer accepts.
export const buildConfirmedSms = (invNo: string | number): string =>
  `Dear Customer, your order : ${invNo} is confirmed. Thank you for ordering with Polygon!`;

// SMS to send right after the order is placed.
// Returns null when no SMS should be sent at this moment.
export const buildOrderPlacedSms = (ctx: OrderSmsContext): string | null => {
  if (ctx.scheduleType !== "One Time" || !ctx.deliveryDate) return null;

  // Pre-made package + Review Before Delivery -> request goes out on Processing Date + 1
  if (ctx.isReviewPackage) {
    const requestDate = shift(ctx.deliveryDate, -PROCESSING_OFFSET_DAYS + 1);
    return `${requestIntro(requestDate)} Please pay by 6:00 PM to confirm your order, or it will be canceled.`;
  }

  // A la carte, or package + Finalize Immediately
  if (!ctx.earliestDate) return null; // can't tell EPSD, so don't guess

  // Delivery date = EPSD
  if (ctx.deliveryDate <= ctx.earliestDate) {
    if (ctx.payMode === "card") return null; // "confirmed" SMS is sent after the card payment succeeds
    if (!ctx.invNo) return null;
    return buildConfirmedSms(ctx.invNo);
  }

  // Delivery date after EPSD -> request goes out on Processing Date
  const requestDate = shift(ctx.deliveryDate, -PROCESSING_OFFSET_DAYS);
  if (ctx.payMode === "card") {
    return `${requestIntro(requestDate)} Please pay by 6:00 PM to confirm your order, or it will be canceled.`;
  }
  // cash / cash+credit / full credit
  return `${requestIntro(requestDate)} Please confirm your order by 6:00 PM or it will be canceled.`;
};