import { NextResponse } from "next/server";
import { processFastagGateEvent } from "@/lib/services/fastag";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tagId, vehicleRegNumber, gateType, scannerId } = body;

    if (!vehicleRegNumber) {
      return NextResponse.json({ error: "Vehicle registration number is required" }, { status: 400 });
    }

    const result = await processFastagGateEvent({
      tagId: tagId || `TAG-NETC-${Date.now().toString().slice(-6)}`,
      vehicleRegNumber,
      gateType: (gateType as "ENTRY" | "EXIT") || "ENTRY",
      scannerId: scannerId || "GATE-01-MAIN",
    });

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    console.error("Fastag gate event error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error processing FASTag gate scan" },
      { status: 400 }
    );
  }
}

