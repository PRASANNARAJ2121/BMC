import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { executeAgent } from "@/lib/services/ai";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { agentType = "public_customer_assistant", query, caseId, vehicleStockNumber } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await executeAgent({
      user,
      agentType,
      query,
      caseId,
      vehicleStockNumber,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}

