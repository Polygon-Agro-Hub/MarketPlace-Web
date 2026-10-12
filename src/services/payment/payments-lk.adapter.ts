import axios from "@/lib/axios";
import {
  IPaymentGatewayAdapter,
  PaymentRequestData,
  UnifiedCheckoutSession,
} from "./payment.types";

/**
 * Payments.lk Adapter Implementation
 * Communicates with backend to generate hosted checkouts and verify statuses.
 */
export class PaymentsLkAdapter implements IPaymentGatewayAdapter {
  readonly gatewayName = "payments_lk";

  async initiatePayment(
    request: PaymentRequestData
  ): Promise<UnifiedCheckoutSession> {
    const { orderPayload, token } = request;

    if (!token) {
      throw new Error("Authentication required to initiate payment");
    }

    try {
      const response = await axios.post("/payment/initiate", orderPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.status && response.data.data) {
        const { checkoutUrl, sessionId, reference, amount, currency } =
          response.data.data;
        return {
          gateway: this.gatewayName,
          checkoutUrl,
          sessionId,
          reference,
          amount,
          currency: currency || "LKR",
        };
      }

      throw new Error(
        response.data?.message || "Failed to initiate Payments.lk checkout"
      );
    } catch (error: any) {
      const responseData = error.response?.data;
      if (responseData?.code === "ITEMS_UNAVAILABLE") {
        const customErr: any = new Error(
          responseData.message || "Some items are no longer available"
        );
        customErr.code = "ITEMS_UNAVAILABLE";
        throw customErr;
      }
      const message =
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Payment initiation failed";
      throw new Error(message);
    }
  }

  async checkOrderStatus(
    reference: string,
    token: string,
    checkoutId?: string
  ): Promise<{
    isCompleted: boolean;
    orderId?: number;
    invoiceNumber?: string;
    amount?: number;
    sessionStatus?: string;
  }> {
    if (!token) {
      throw new Error("Authentication required to check order status");
    }

    try {
      const url = checkoutId
        ? `/payment/order-status/${encodeURIComponent(reference)}?checkout=${encodeURIComponent(checkoutId)}`
        : `/payment/order-status/${encodeURIComponent(reference)}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.status) {
        return {
          isCompleted: Boolean(response.data.isCompleted),
          orderId: response.data.orderId,
          invoiceNumber: response.data.invoiceNumber,
          amount: response.data.amount,
          sessionStatus: response.data.sessionStatus,
        };
      }

      return { isCompleted: false };
    } catch (error: any) {
      console.error("[PaymentsLkAdapter] Error checking order status:", error);
      return { isCompleted: false };
    }
  }
}
