import { db } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";

export const ACQUISITION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "DOCUMENT_REVIEW",
  "NEEDS_CLARIFICATION",
  "INSPECTION_PENDING",
  "INSPECTION_SCHEDULED",
  "INSPECTION_COMPLETE",
  "VALUATION_PENDING",
  "OFFER_ISSUED",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "OFFER_EXPIRED",
  "PURCHASE_DOCUMENTS_PENDING",
  "PAYMENT_PENDING",
  "OWNERSHIP_TRANSFER_PENDING",
  "ACQUIRED",
  "REJECTED",
  "WITHDRAWN",
  "CANCELLED",
  "BLOCKED",
] as const;

export type AcquisitionStatus = (typeof ACQUISITION_STATUSES)[number];

// Permitted state transitions
const VALID_TRANSITIONS: Record<AcquisitionStatus, AcquisitionStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["DOCUMENT_REVIEW", "NEEDS_CLARIFICATION", "REJECTED", "WITHDRAWN"],
  DOCUMENT_REVIEW: ["INSPECTION_PENDING", "NEEDS_CLARIFICATION", "REJECTED", "BLOCKED"],
  NEEDS_CLARIFICATION: ["DOCUMENT_REVIEW", "WITHDRAWN", "REJECTED"],
  INSPECTION_PENDING: ["INSPECTION_SCHEDULED", "NEEDS_CLARIFICATION", "REJECTED"],
  INSPECTION_SCHEDULED: ["INSPECTION_COMPLETE", "INSPECTION_PENDING", "CANCELLED"],
  INSPECTION_COMPLETE: ["VALUATION_PENDING", "NEEDS_CLARIFICATION", "REJECTED"],
  VALUATION_PENDING: ["OFFER_ISSUED", "REJECTED", "BLOCKED"],
  OFFER_ISSUED: ["OFFER_ACCEPTED", "OFFER_DECLINED", "OFFER_EXPIRED", "VALUATION_PENDING", "WITHDRAWN"],
  OFFER_DECLINED: ["VALUATION_PENDING", "WITHDRAWN", "REJECTED"],
  OFFER_EXPIRED: ["VALUATION_PENDING", "WITHDRAWN", "REJECTED"],
  OFFER_ACCEPTED: ["PURCHASE_DOCUMENTS_PENDING", "WITHDRAWN", "CANCELLED"],
  PURCHASE_DOCUMENTS_PENDING: ["PAYMENT_PENDING", "CANCELLED", "BLOCKED"],
  PAYMENT_PENDING: ["OWNERSHIP_TRANSFER_PENDING", "CANCELLED", "BLOCKED"],
  OWNERSHIP_TRANSFER_PENDING: ["ACQUIRED", "BLOCKED", "REJECTED"],
  ACQUIRED: [], // Final acquisition terminal state
  REJECTED: [],
  WITHDRAWN: [],
  CANCELLED: [],
  BLOCKED: ["DOCUMENT_REVIEW", "PURCHASE_DOCUMENTS_PENDING", "OWNERSHIP_TRANSFER_PENDING", "REJECTED"],
};

export async function transitionAcquisitionStatus(params: {
  caseId: string;
  nextStatus: AcquisitionStatus;
  actorId: string;
  actorRole: string;
  reason?: string;
}) {
  const { caseId, nextStatus, actorId, actorRole, reason } = params;

  const currentCase = await db.acquisitionCase.findUnique({
    where: { id: caseId },
    include: {
      vehicleDetails: true,
      ownershipTransferCase: true,
      purchaseTransaction: true,
      purchaseAgreement: true,
      verificationTasks: true,
    },
  });

  if (!currentCase) {
    throw new Error("ACQUISITION_CASE_NOT_FOUND");
  }

  const currentStatus = currentCase.status as AcquisitionStatus;

  // Check valid transition
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new Error(
      `INVALID_TRANSITION: Cannot transition from ${currentStatus} to ${nextStatus}`
    );
  }

  // Business gate checks
  if (nextStatus === "ACQUIRED") {
    // HARD GATE: Company acquisition requires:
    // 1. Purchase Agreement executed
    // 2. Payment confirmed settled
    // 3. Ownership transfer verified or RTO form executed
    if (!currentCase.purchaseAgreement) {
      throw new Error("GATE_FAILED: Purchase agreement must be signed before acquisition");
    }
    if (!currentCase.purchaseTransaction || currentCase.purchaseTransaction.status !== "SETTLED") {
      throw new Error("GATE_FAILED: Purchase payment must be settled before acquisition");
    }
    if (
      !currentCase.ownershipTransferCase ||
      !currentCase.ownershipTransferCase.form29Signed ||
      !currentCase.ownershipTransferCase.form30Signed
    ) {
      throw new Error("GATE_FAILED: RTO transfer forms (Form 29 & 30) must be executed");
    }
  }

  const updated = await db.acquisitionCase.update({
    where: { id: caseId },
    data: {
      status: nextStatus,
    },
  });

  await recordAuditEvent({
    actorId,
    actorRole,
    action: `ACQUISITION_STATE_${nextStatus}`,
    entityName: "AcquisitionCase",
    entityId: caseId,
    before: { status: currentStatus },
    after: { status: nextStatus, reason },
  });

  // If status is ACQUIRED, create the CompanyVehicle asset record!
  if (nextStatus === "ACQUIRED") {
    await createCompanyVehicleFromAcquisition(currentCase.id, actorId);
  }

  return updated;
}

export async function createCompanyVehicleFromAcquisition(
  acquisitionCaseId: string,
  actorId: string
) {
  const acqCase = await db.acquisitionCase.findUnique({
    where: { id: acquisitionCaseId },
    include: { vehicleDetails: true },
  });

  if (!acqCase || !acqCase.vehicleDetails) {
    throw new Error("Cannot create company vehicle: details missing");
  }

  // Count existing stock to generate stockNumber
  const count = await db.companyVehicle.count();
  const stockNumber = `BMC-STK-${String(count + 1).padStart(4, "0")}`;

  const vehicle = await db.companyVehicle.create({
    data: {
      stockNumber,
      acquisitionCaseId: acqCase.id,
      make: acqCase.vehicleDetails.make,
      model: acqCase.vehicleDetails.model,
      variant: acqCase.vehicleDetails.variant,
      year: acqCase.vehicleDetails.year,
      fuelType: acqCase.vehicleDetails.fuelType,
      transmission: acqCase.vehicleDetails.transmission,
      odometerKm: acqCase.vehicleDetails.odometerKm,
      exteriorColor: acqCase.vehicleDetails.exteriorColor,
      acquisitionCost: acqCase.agreedPurchasePrice || acqCase.sellerAskingPrice,
      totalCostBasis: acqCase.agreedPurchasePrice || acqCase.sellerAskingPrice,
      custodyBranchId: acqCase.branchId,
      status: "ACQUIRED",
      legalSaleEligibilityApproved: false, // Must be explicitly approved after RTO transfer completes
      qcApproved: false, // Must pass QC before public resale
    },
  });

  await recordAuditEvent({
    actorId,
    actorRole: "SYSTEM",
    action: "COMPANY_VEHICLE_CREATED",
    entityName: "CompanyVehicle",
    entityId: vehicle.id,
    after: { stockNumber, acquisitionCost: vehicle.acquisitionCost },
  });

  return vehicle;
}

