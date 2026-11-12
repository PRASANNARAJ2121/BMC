import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth";
import { verifyVehicleRegistry } from "@/lib/services/registry";

export async function POST(req: Request) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "ACQUISITION_MANAGER",
      "ACQUISITION_EXECUTIVE",
      "INSPECTOR",
      "COMPLIANCE_OFFICER",
    ]);

    const body = await req.json();
    const { registrationNumber, caseId } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Vehicle registration number is required (e.g. DL-01-AB-1234)" },
        { status: 400 }
      );
    }

    const report = await verifyVehicleRegistry(registrationNumber, {
      caseId,
      actorId: user.id,
    });

    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    console.error("Vahan registry verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to verify registration with government registry" },
      { status: 400 }
    );
  }
}

