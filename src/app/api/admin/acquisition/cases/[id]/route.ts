import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";
import { transitionAcquisitionStatus, AcquisitionStatus } from "@/lib/services/acquisition";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "ACQUISITION_MANAGER",
      "ACQUISITION_EXECUTIVE",
      "COMPLIANCE_OFFICER",
      "FINANCE_OFFICER",
      "INSPECTOR",
    ]);

    const { id } = await params;

    const acqCase = await db.acquisitionCase.findUnique({
      where: { id },
      include: {
        sellerProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vehicleDetails: true,
        documents: true,
        communications: { orderBy: { createdAt: "asc" } },
        verificationTasks: true,
        inspections: {
          include: {
            sections: {
              include: { findings: true },
            },
          },
        },
        valuations: true,
        purchaseOffers: {
          include: { versions: true },
          orderBy: { createdAt: "desc" },
        },
        purchaseAgreement: true,
        ownershipTransferCase: true,
        purchaseTransaction: true,
        companyVehicle: true,
      },
    });

    if (!acqCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ case: acqCase });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "ACQUISITION_MANAGER",
      "ACQUISITION_EXECUTIVE",
      "COMPLIANCE_OFFICER",
      "FINANCE_OFFICER",
      "INSPECTOR",
    ]);

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const acqCase = await db.acquisitionCase.findUnique({
      where: { id },
      include: {
        vehicleDetails: true,
        ownershipTransferCase: true,
      },
    });

    if (!acqCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // 1. VERIFY TASK
    if (action === "VERIFY_TASK") {
      const { taskType, status, evidenceReference, sourceMethod, reviewNotes } = body;
      const task = await db.verificationTask.create({
        data: {
          caseId: acqCase.id,
          taskType,
          status, // PASSED, FAILED, IN_PROGRESS, WAIVED
          evidenceReference: evidenceReference || "",
          sourceMethod: sourceMethod || "Direct Manual Verification",
          reviewNotes: reviewNotes || "",
          assignedToId: user.id,
          completedAt: status === "PASSED" || status === "FAILED" ? new Date() : null,
        },
      });

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "VERIFICATION_TASK_RECORDED",
        entityName: "VerificationTask",
        entityId: task.id,
        after: { taskType, status, evidenceReference },
      });

      return NextResponse.json({ success: true, task });
    }

    // 2. CREATE / ISSUE PURCHASE OFFER (WITH VERSIONING)
    if (action === "ISSUE_OFFER") {
      const { offeredPrice, termsAndConditions, breakdown } = body;
      if (!offeredPrice || offeredPrice <= 0) {
        return NextResponse.json({ error: "Valid offer price required" }, { status: 400 });
      }

      let offer = await db.purchaseOffer.findFirst({
        where: { caseId: acqCase.id },
      });

      let nextVersion = 1;
      if (!offer) {
        offer = await db.purchaseOffer.create({
          data: {
            caseId: acqCase.id,
            offeredPrice,
            termsAndConditions: termsAndConditions || "Standard Bharat Motor Club purchase terms apply.",
            status: "ISSUED",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
          },
        });
      } else {
        nextVersion = offer.currentVersionNumber + 1;
        offer = await db.purchaseOffer.update({
          where: { id: offer.id },
          data: {
            currentVersionNumber: nextVersion,
            offeredPrice,
            termsAndConditions: termsAndConditions || offer.termsAndConditions,
            status: "ISSUED",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Record immutable version record
      await db.purchaseOfferVersion.create({
        data: {
          offerId: offer.id,
          versionNumber: nextVersion,
          offeredAmount: offeredPrice,
          breakdownJson: JSON.stringify(breakdown || {}),
          terms: termsAndConditions || "Standard BMC terms",
          issuedById: user.id,
        },
      });

      // Update case state to OFFER_ISSUED
      await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "OFFER_ISSUED",
        actorId: user.id,
        actorRole: user.roles[0],
        reason: `Offer v${nextVersion} of ₹${offeredPrice.toLocaleString("en-IN")} issued`,
      });

      return NextResponse.json({ success: true, offer });
    }

    // 3. EXECUTE PURCHASE AGREEMENT
    if (action === "EXECUTE_AGREEMENT") {
      const { agreedPrice } = body;
      const count = await db.purchaseAgreement.count();
      const agreementNumber = `AGR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      const agreement = await db.purchaseAgreement.upsert({
        where: { caseId: acqCase.id },
        update: {
          agreedPrice: agreedPrice || acqCase.agreedPurchasePrice,
          sellerDeclarationSigned: true,
          bmcAuthorizedById: user.id,
          signedDate: new Date(),
          status: "EXECUTED",
        },
        create: {
          caseId: acqCase.id,
          agreementNumber,
          agreedPrice: agreedPrice || acqCase.agreedPurchasePrice,
          sellerDeclarationSigned: true,
          bmcAuthorizedById: user.id,
          signedDate: new Date(),
          status: "EXECUTED",
        },
      });

      await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "PURCHASE_DOCUMENTS_PENDING",
        actorId: user.id,
        actorRole: user.roles[0],
        reason: `Purchase agreement ${agreementNumber} executed`,
      });

      return NextResponse.json({ success: true, agreement });
    }

    // 4. RECORD PURCHASE PAYMENT (SETTLEMENT)
    if (action === "RECORD_PAYMENT") {
      const { amount, paymentMethod, transactionReference } = body;
      if (!transactionReference) {
        return NextResponse.json({ error: "Transaction reference / UTR is required" }, { status: 400 });
      }

      const payment = await db.purchaseTransaction.upsert({
        where: { caseId: acqCase.id },
        update: {
          amount: Number(amount) || acqCase.agreedPurchasePrice,
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          transactionReference,
          status: "SETTLED",
          settledAt: new Date(),
          reconciledById: user.id,
        },
        create: {
          caseId: acqCase.id,
          amount: Number(amount) || acqCase.agreedPurchasePrice,
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          transactionReference,
          status: "SETTLED",
          settledAt: new Date(),
          reconciledById: user.id,
        },
      });

      await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "PAYMENT_PENDING",
        actorId: user.id,
        actorRole: user.roles[0],
        reason: `Payment of ₹${payment.amount.toLocaleString("en-IN")} settled (UTR: ${transactionReference})`,
      });

      return NextResponse.json({ success: true, payment });
    }

    // 5. RECORD RTO OWNERSHIP TRANSFER CASE
    if (action === "RECORD_RTO_TRANSFER") {
      const { rtoState, rtoCode, applicationNumber, form29Signed, form30Signed, status } = body;

      const transfer = await db.ownershipTransferCase.upsert({
        where: { caseId: acqCase.id },
        update: {
          rtoState: rtoState || "",
          rtoCode: rtoCode || "",
          applicationNumber: applicationNumber || "",
          form29Signed: !!form29Signed,
          form30Signed: !!form30Signed,
          status: status || "RC_TRANSFERRED_TO_BMC",
          approvedById: user.id,
          transferCompletedDate: status === "RC_TRANSFERRED_TO_BMC" ? new Date() : null,
        },
        create: {
          caseId: acqCase.id,
          rtoState: rtoState || "",
          rtoCode: rtoCode || "",
          applicationNumber: applicationNumber || "",
          form29Signed: !!form29Signed,
          form30Signed: !!form30Signed,
          status: status || "RC_TRANSFERRED_TO_BMC",
          approvedById: user.id,
          transferCompletedDate: status === "RC_TRANSFERRED_TO_BMC" ? new Date() : null,
        },
      });

      await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: "OWNERSHIP_TRANSFER_PENDING",
        actorId: user.id,
        actorRole: user.roles[0],
        reason: `RTO transfer record updated: status ${transfer.status}`,
      });

      return NextResponse.json({ success: true, transfer });
    }

    // 6. CONTROLLED TRANSITION (e.g. TO ACQUIRED)
    if (action === "TRANSITION") {
      const { nextStatus, reason } = body;
      const updated = await transitionAcquisitionStatus({
        caseId: acqCase.id,
        nextStatus: nextStatus as AcquisitionStatus,
        actorId: user.id,
        actorRole: user.roles[0],
        reason: reason || "Staff transition",
      });
      return NextResponse.json({ success: true, case: updated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin acquisition action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}

