import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { verifyPaymentSignature, reconcilePaymentSettlement, PaymentPurpose } from "@/lib/services/payments";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { orderId, paymentId, signature, purpose, referenceId, amount, paymentMethod } = body;

    if (!orderId || !paymentId || !signature || !purpose || !referenceId) {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 400 }
      );
    }

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Cryptographic payment signature verification failed" }, { status: 400 });
    }

    const reconciliation = await reconcilePaymentSettlement({
      orderId,
      paymentId,
      purpose: purpose as PaymentPurpose,
      referenceId,
      amount: Number(amount),
      actorId: user?.id,
      paymentMethod: paymentMethod || "UPI",
    });

    return NextResponse.json({ success: true, reconciliation });
  } catch (err: unknown) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment settlement failed" },
      { status: 400 }
    );
  }
}

