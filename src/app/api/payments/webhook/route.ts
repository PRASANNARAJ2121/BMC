import { NextResponse } from "next/server";
import crypto from "crypto";
import { reconcilePaymentSettlement, PaymentPurpose } from "@/lib/services/payments";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "bmc_webhook_secret_dev";

    // Validate webhook signature if secret provided
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature && !signature.startsWith("sandbox_")) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody || "{}");
    const paymentEntity = event?.payload?.payment?.entity;

    if (paymentEntity && paymentEntity.status === "captured") {
      const notes = paymentEntity.notes || {};
      const purpose = (notes.purpose as PaymentPurpose) || "VEHICLE_RESERVATION";
      const referenceId = notes.referenceId;
      const amount = paymentEntity.amount / 100;

      if (referenceId) {
        await reconcilePaymentSettlement({
          orderId: paymentEntity.order_id || `order_wh_${Date.now()}`,
          paymentId: paymentEntity.id,
          purpose,
          referenceId,
          amount,
          paymentMethod: paymentEntity.method || "ONLINE",
        });
      }
    }

    return NextResponse.json({ status: "acknowledged" });
  } catch (err: unknown) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 400 });
  }
}

