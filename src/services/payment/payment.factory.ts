import { IPaymentGatewayAdapter } from "./payment.types";
import { PaymentsLkAdapter } from "./payments-lk.adapter";

export type SupportedGateway = "payments_lk" | "default";

/**
 * Payment Gateway Factory (Frontend)
 * Instantiates and returns the configured payment gateway adapter.
 */
export class PaymentGatewayFactory {
  private static adapters: Map<string, IPaymentGatewayAdapter> = new Map();

  public static getAdapter(
    gateway: SupportedGateway | string = "payments_lk"
  ): IPaymentGatewayAdapter {
    const key = (gateway || "payments_lk").toLowerCase();

    if (!this.adapters.has(key)) {
      switch (key) {
        case "payments_lk":
        default:
          this.adapters.set(key, new PaymentsLkAdapter());
          break;
      }
    }

    return this.adapters.get(key)!;
  }
}
