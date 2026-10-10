/**
 * Payment Gateway Adapter Interfaces & Types (Frontend)
 * Implements the Adapter & Factory Pattern.
 */

export interface PaymentCustomer {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
}

export interface PaymentRequestData {
  orderPayload: any; // Order payload matching OrderPayload structure
  token: string;
}

export interface UnifiedCheckoutSession {
  gateway: string;
  checkoutUrl: string;
  sessionId: string;
  reference: string;
  amount: number;
  currency: string;
}

export interface IPaymentGatewayAdapter {
  readonly gatewayName: string;

  /**
   * Initiates payment checkout session on the server.
   */
  initiatePayment(request: PaymentRequestData): Promise<UnifiedCheckoutSession>;

  /**
   * Checks order status after return from hosted checkout.
   */
  checkOrderStatus(
    reference: string,
    token: string,
    checkoutId?: string
  ): Promise<{
    isCompleted: boolean;
    orderId?: number;
    invoiceNumber?: string;
    amount?: number;
    sessionStatus?: string;
  }>;
}
