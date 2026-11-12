import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generatePurchaseAgreementHtml } from "@/lib/services/documents";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Sign in required to view agreement" }, { status: 401 });
    }

    const { id } = await params;

    // Security check: only authorized staff or the seller can view the purchase agreement
    const agreement = await db.purchaseAgreement.findUnique({
      where: { id },
      include: {
        acquisitionCase: {
          include: { sellerProfile: true },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const isStaff = user.roles.some((r) =>
      ["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "COMPLIANCE_OFFICER", "FINANCE_OFFICER"].includes(r)
    );
    const isOwner = agreement.acquisitionCase.sellerProfile.userId === user.id;

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to view this legal agreement" }, { status: 403 });
    }

    const html = await generatePurchaseAgreementHtml(id);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: unknown) {
    console.error("View agreement error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generating agreement" },
      { status: 404 }
    );
  }
}

