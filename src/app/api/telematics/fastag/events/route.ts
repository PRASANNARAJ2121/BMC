import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/**
 * Admin endpoint: returns recent FASTag gate events from AuditEvent.
 * Only users with ADMIN / staff role can access.
 */
export async function GET() {
  const user = await getSessionUser();
  const isStaff = user?.roles?.some((r) =>
    ["SUPER_ADMIN", "BUSINESS_OWNER", "WORKSHOP_MANAGER", "ADMIN"].includes(r)
  );

  if (!isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const auditEvents = await db.auditEvent.findMany({
      where: {
        action: { in: ["VEHICLE_GATE_ENTRY_AUTOMATED", "VEHICLE_GATE_EXIT_AUTHORIZED"] },
      },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    const events = auditEvents.map((a) => {
      let parsedAfter: any = {};
      try {
        parsedAfter = a.afterJson ? JSON.parse(a.afterJson) : {};
      } catch {}

      return {
        id: a.id,
        tagId: parsedAfter.tagId || "TAG-NETC",
        vehicleRegNumber: parsedAfter.vehicleRegNumber || a.entityId || "UNKNOWN",
        gateType: parsedAfter.gateType || (a.action.includes("ENTRY") ? "ENTRY" : "EXIT"),
        timestamp: a.timestamp.toISOString(),
        authorized: true,
        actionTaken: a.action,
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error("FASTag events fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

