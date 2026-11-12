import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, recordAuditEvent } from "@/lib/auth";
import { transitionAcquisitionStatus } from "@/lib/services/acquisition";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const acqCase = await db.acquisitionCase.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
        vehicleDetails: true,
        documents: {
          select: {
            id: true,
            documentType: true,
            fileName: true,
            fileSize: true,
            verificationStatus: true,
            createdAt: true,
          },
        },
        communications: {
          where: { isInternalOnly: false },
          orderBy: { createdAt: "asc" },
        },
        purchaseOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            currentVersionNumber: true,
            status: true,
            offeredPrice: true,
            termsAndConditions: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!acqCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // STRICT PRIVACY RULE: Seller can ONLY access their own case
    if (acqCase.sellerProfile.userId !== user.id) {
      // Check if user has staff acquisition privileges
      const isStaff = user.roles.some((r) =>
        ["SUPER_ADMIN", "ACQUISITION_MANAGER", "ACQUISITION_EXECUTIVE"].includes(r)
      );
      if (!isStaff) {
        return NextResponse.json(
          { error: "Forbidden: Access denied to private case" },
          { status: 403 }
        );
      }
    }

    // Sanitized output for seller
    return NextResponse.json({
      case: {
        id: acqCase.id,
        caseNumber: acqCase.caseNumber,
        status: acqCase.status,
        sellerAskingPrice: acqCase.sellerAskingPrice,
        createdAt: acqCase.createdAt,
        updatedAt: acqCase.updatedAt,
        vehicleDetails: acqCase.vehicleDetails,
        documents: acqCase.documents,
        communications: acqCase.communications,
        activeOffer: acqCase.purchaseOffers[0] || null,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("Get seller case detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { action, declineReason } = body; // "SUBMIT", "ACCEPT_OFFER", "DECLINE_OFFER", "WITHDRAW"

    const acqCase = await db.acquisitionCase.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
        purchaseOffers: {
          where: { status: "ISSUED" },
          take: 1,
        },
      },
    });

    if (!acqCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (acqCase.sellerProfile.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "SUBMIT") {
      if (acqCase.status !== "DRAFT") {
        return NextResponse.json({ error: "Only draft cases can be submitted" }, { status: 400 });
      }
      const updated = await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "SUBMITTED",
        actorId: user.id,
        actorRole: "SELLER",
        reason: "Seller completed submission wizard",
      });
      return NextResponse.json({ success: true, case: updated });
    }

    if (action === "ACCEPT_OFFER") {
      const activeOffer = acqCase.purchaseOffers[0];
      if (!activeOffer) {
        return NextResponse.json({ error: "No active offer found to accept" }, { status: 400 });
      }

      await db.purchaseOffer.update({
        where: { id: activeOffer.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      await db.acquisitionCase.update({
        where: { id: acqCase.id },
        data: { agreedPurchasePrice: activeOffer.offeredPrice },
      });

      const updated = await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "OFFER_ACCEPTED",
        actorId: user.id,
        actorRole: "SELLER",
        reason: `Seller accepted offer of ₹${activeOffer.offeredPrice.toLocaleString("en-IN")}`,
      });

      return NextResponse.json({ success: true, case: updated });
    }

    if (action === "DECLINE_OFFER") {
      const activeOffer = acqCase.purchaseOffers[0];
      if (!activeOffer) {
        return NextResponse.json({ error: "No active offer found to decline" }, { status: 400 });
      }

      await db.purchaseOffer.update({
        where: { id: activeOffer.id },
        data: {
          status: "DECLINED",
          declinedAt: new Date(),
          declineReason: declineReason || "Seller declined terms",
        },
      });

      const updated = await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "OFFER_DECLINED",
        actorId: user.id,
        actorRole: "SELLER",
        reason: declineReason || "Seller declined offer",
      });

      return NextResponse.json({ success: true, case: updated });
    }

    if (action === "WITHDRAW") {
      const updated = await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "WITHDRAWN",
        actorId: user.id,
        actorRole: "SELLER",
        reason: body.reason || "Seller withdrew submission",
      });
      return NextResponse.json({ success: true, case: updated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("Seller case action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

