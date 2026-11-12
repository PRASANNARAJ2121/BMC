import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INVENTORY_MANAGER",
      "SALES_MANAGER",
      "SALES_EXECUTIVE",
      "WORKSHOP_MANAGER",
    ]);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const vehicles = await db.companyVehicle.findMany({
      where,
      include: {
        custodyBranch: true,
        refurbishmentJobs: {
          include: {
            tasks: true,
            partConsumptions: {
              include: { product: true },
            },
          },
        },
        expenses: true,
        qcChecks: {
          orderBy: { inspectedAt: "desc" },
          take: 1,
        },
        publicListing: true,
        saleTransactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vehicles });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Staff permissions required" }, { status: 403 });
    }
    console.error("Admin vehicles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

