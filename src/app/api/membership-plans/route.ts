import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

