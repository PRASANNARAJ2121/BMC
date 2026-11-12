import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRoles(["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "ACQUISITION_EXECUTIVE", "COMPLIANCE_OFFICER", "FINANCE_OFFICER"]);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const cases = await db.acquisitionCase.findMany({
      where,
      include: {
        sellerProfile: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vehicleDetails: true,
        verificationTasks: true,
        inspections: true,
        purchaseOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        ownershipTransferCase: true,
        purchaseTransaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Acquisition staff permissions required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Admin acquisition list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

