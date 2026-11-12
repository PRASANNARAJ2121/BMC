import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { parseOBDScanData, ingestOBDScanToJobCard } from "@/lib/services/obd";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { rawInput, jobCardId } = body;

    if (!rawInput) {
      return NextResponse.json({ error: "No diagnostic input or DTC codes provided" }, { status: 400 });
    }

    // If job card ID is provided, ingest directly into workshop work order
    if (jobCardId) {
      const isStaff = user?.roles?.some((r) =>
        ["SUPER_ADMIN", "BUSINESS_OWNER", "WORKSHOP_MANAGER", "TECHNICIAN", "SERVICE_ADVISOR"].includes(r)
      );

      if (!isStaff) {
        return NextResponse.json({ error: "Forbidden: Technician credentials required to ingest to job card" }, { status: 403 });
      }

      const result = await ingestOBDScanToJobCard({
        jobCardId,
        rawInput,
        technicianId: user?.id,
      });

      return NextResponse.json(result);
    }

    // Otherwise, parse and return diagnostic report
    const faults = parseOBDScanData(rawInput);
    return NextResponse.json({
      success: true,
      faultCount: faults.length,
      faults,
    });
  } catch (err: unknown) {
    console.error("OBD scan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error parsing diagnostic data" },
      { status: 400 }
    );
  }
}

