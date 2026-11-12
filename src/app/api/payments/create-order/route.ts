import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createPaymentOrder, PaymentPurpose } from "@/lib/services/payments";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { purpose, referenceId, amount, customerName, customerPhone, customerEmail } = body;

    if (!purpose || !referenceId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: purpose, referenceId, and amount are required" },
        { status: 400 }
      );
    }

    const order = await createPaymentOrder({
      amount: Number(amount),
      purpose: purpose as PaymentPurpose,
      referenceId,
      customerName: customerName || user?.fullName || "Guest Customer",
      customerPhone: customerPhone || user?.phone || "+91 99999 99999",
      customerEmail: customerEmail || user?.email || undefined,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    console.error("Create payment order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initiate payment order" },
      { status: 400 }
    );
  }
}

