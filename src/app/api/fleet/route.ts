import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, contactName, email, phone, fleetSize = 5, notes } = body;

    if (!companyName || !contactName || !phone) {
      return NextResponse.json({ error: "Company name, contact name and phone are required" }, { status: 400 });
    }

    const count = await db.fleetAccount.count();
    const accountCode = `FLT-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const fleetAccount = await db.fleetAccount.create({
      data: {
        accountCode,
        companyName,
        contactName,
        email: email || "",
        phone,
        status: "ACTIVE",
      },
    });

    // Also record in CRM Lead Inbox
    const leadCount = await db.cRMLead.count();
    await db.cRMLead.create({
      data: {
        leadNumber: `LEAD-${new Date().getFullYear()}-${String(leadCount + 1).padStart(4, "0")}`,
        source: "WEBSITE",
        department: "FLEET",
        contactName,
        email: email || "",
        phone,
        vehicleOfInterest: `Fleet of ${fleetSize} vehicles (${companyName})`,
        notes: notes || "Corporate fleet solutions enquiry",
      },
    });

    await recordAuditEvent({
      action: "FLEET_ACCOUNT_ONBOARDED",
      entityName: "FleetAccount",
      entityId: fleetAccount.id,
      after: { accountCode, companyName },
    });

    return NextResponse.json({ success: true, account: fleetAccount }, { status: 201 });
  } catch (err: unknown) {
    console.error("Fleet onboarding error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

