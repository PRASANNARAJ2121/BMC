import { describe, it, expect } from "vitest";
import { createPaymentOrder, verifyPaymentSignature } from "../src/lib/services/payments";

describe("Phase C: Customer Checkout & Digital Glovebox", () => {
  it("initiates a verified reservation token order of ₹10,000", async () => {
    const order = await createPaymentOrder({
      amount: 10000,
      purpose: "VEHICLE_RESERVATION",
      referenceId: "veh-test-cpo-101",
      customerName: "Vikram Malhotra",
      customerPhone: "+91 98765 43210",
      customerEmail: "vikram@example.com",
    });

    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(10000);
    expect(order.currency).toBe("INR");
    expect(order.purpose).toBe("VEHICLE_RESERVATION");
    expect(order.referenceId).toBe("veh-test-cpo-101");
  });

  it("verifies payment signature for reservation confirmation", () => {
    const isValid = verifyPaymentSignature({
      orderId: "order_test_res_001",
      paymentId: "pay_test_001",
      signature: "sandbox_sig_order_test_res_001_pay_test_001",
    });

    expect(isValid).toBe(true);
  });
});

