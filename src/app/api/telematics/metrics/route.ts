import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Simple telemetry endpoint providing basic usage stats for the telematics services.
 * Returns counts of OBD scans processed and FASTag gate events recorded in AuditEvent.
 */
export async function GET() {
  try {
    const obdScanCount = await db.auditEvent.count({
      where: { action: "OBD_SCAN_INGESTED" },
    });
    const fastagEventCount = await db.auditEvent.count({
      where: { action: { in: ["VEHICLE_GATE_ENTRY_AUTOMATED", "VEHICLE_GATE_EXIT_AUTHORIZED"] } },
    });

    const payload = {
      obdScansProcessed: obdScanCount ?? 0,
      fastagGateEvents: fastagEventCount ?? 0,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Telemetry endpoint error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}

