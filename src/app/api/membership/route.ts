import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, recordAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const plans = await db.membershipPlan.findMany({
      where: { active: true },
      orderBy: { priceAnnual: "asc" },
    });

    const parsed = plans.map((p) => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      description: p.description,
      priceAnnual: p.priceAnnual,
      benefits: JSON.parse(p.benefitsJson || "[]"),
      durationMonths: p.durationMonths,
    }));

    return NextResponse.json({ plans: parsed });
  } catch (err: unknown) {
    console.error("Get membership plans error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to apply for membership" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, vehicleRegNumber } = body;

    const plan = await db.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Invalid membership plan" }, { status: 400 });
    }

    const count = await db.membership.count();
    const memberNumber = `BMC-MEM-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const membership = await db.membership.create({
      data: {
        memberNumber,
        userId: user.id,
        planId: plan.id,
        status: "ACTIVE",
        startDate,
        endDate,
        vehicleRegNumber: vehicleRegNumber || "",
      },
      include: { plan: true },
    });

    await recordAuditEvent({
      actorId: user.id,
      actorRole: "CUSTOMER",
      action: "MEMBERSHIP_ENROLLED",
      entityName: "Membership",
      entityId: membership.id,
      after: { memberNumber, planName: plan.name, endDate },
    });

    return NextResponse.json({ success: true, membership }, { status: 201 });
  } catch (err: unknown) {
    console.error("Enroll membership error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

